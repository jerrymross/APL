import { jsPDF } from 'jspdf';

const ASTAR_BLUE = [18, 63, 140];
const ASTAR_DARK = [15, 47, 103];
const ASTAR_RED = [235, 92, 82];
const TEXT = [31, 41, 55];
const MUTED = [100, 116, 139];
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const CANVAS_WIDTH = 1240;
const CANVAS_HEIGHT = 1754;
const PX_PER_MM = CANVAS_WIDTH / A4_WIDTH_MM;
const importNodeOnly = (specifier) => new Function('s', 'return import(s)')(specifier);

const px = (mm) => Math.round(mm * PX_PER_MM);
const rgb = (color) => `rgb(${color.join(', ')})`;

export async function imageToDataUrl(src) {
  if (src.startsWith('data:')) {
    return src;
  }

  const response = await fetch(src);
  if (!response.ok) {
    throw new Error('Kunde inte hämta loggan.');
  }

  const blob = await response.blob();

  if (typeof FileReader === 'undefined') {
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${blob.type};base64,${base64}`;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Kunde inte läsa loggan.'));
    reader.readAsDataURL(blob);
  });
}

async function createCanvasSurface(width, height) {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return {
      canvas,
      ctx: canvas.getContext('2d'),
    };
  }

  const canvasModule = await importNodeOnly('@napi-rs/canvas');
  const canvas = canvasModule.createCanvas(width, height);
  return {
    canvas,
    ctx: canvas.getContext('2d'),
  };
}

async function loadCanvasImage(src) {
  if (typeof document !== 'undefined') {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Kunde inte läsa loggan.'));
      image.src = src;
    });
  }

  const canvasModule = await importNodeOnly('@napi-rs/canvas');
  return canvasModule.loadImage(src);
}

function getCanvasDataUrl(canvas) {
  if (typeof canvas.toDataURL === 'function') {
    return canvas.toDataURL('image/png');
  }

  return `data:image/png;base64,${canvas.toBuffer('image/png').toString('base64')}`;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(nextLine).width <= maxWidth || !line) {
      line = nextLine;
    } else {
      lines.push(line);
      line = word;
    }
  });

  if (line) lines.push(line);

  lines.forEach((item, index) => {
    ctx.fillText(item, x, y + index * lineHeight);
  });

  return y + (lines.length - 1) * lineHeight;
}

function fitText(ctx, text, maxWidth, startSize, minSize, fontWeight = 700) {
  let size = startSize;
  do {
    ctx.font = `${fontWeight} ${size}px Arial, "Segoe UI", sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  } while (size >= minSize);

  return minSize;
}

async function createCertificateImage({ name, date, score, logoSrc }) {
  const displayName = name?.trim() || 'Namn ej angivet';
  const logo = await loadCanvasImage(logoSrc);
  const { canvas, ctx } = await createCanvasSurface(CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#f6f8fc';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.54, 'rgba(246, 248, 252, 1)');
  gradient.addColorStop(1, 'rgba(234, 241, 251, 1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const cardX = px(16);
  const cardY = px(16);
  const cardW = px(178);
  const cardH = px(265);

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = rgb(ASTAR_BLUE);
  ctx.lineWidth = px(1);
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, px(4));
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(235, 92, 82, 0.9)';
  ctx.lineWidth = px(2);
  ctx.beginPath();
  ctx.arc(px(178), px(247), px(32), 0, Math.PI * 2);
  ctx.stroke();

  ctx.drawImage(logo, px(27), px(29), px(58), px(15));

  ctx.fillStyle = rgb(ASTAR_RED);
  ctx.font = `700 ${px(3.3)}px Arial, "Segoe UI", sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText('CERTIFIKAT', px(181), px(37));

  ctx.fillStyle = rgb(ASTAR_DARK);
  ctx.textAlign = 'center';
  ctx.font = `700 ${px(8.2)}px Arial, "Segoe UI", sans-serif`;
  ctx.fillText('APL-handledare - Astar', px(105), px(80));

  ctx.fillStyle = rgb(TEXT);
  ctx.font = `400 ${px(4)}px Arial, "Segoe UI", sans-serif`;
  const lead =
    'Har genomfört Astar handledarutbildning enligt Skolverkets riktlinjer.';
  drawWrappedText(ctx, lead, px(105), px(96), px(126), px(5.7));

  ctx.fillStyle = rgb(MUTED);
  ctx.font = `700 ${px(3)}px Arial, "Segoe UI", sans-serif`;
  ctx.fillText('TILLDELAS', px(105), px(124));

  const nameSize = fitText(ctx, displayName, px(132), px(7.8), px(5.4), 700);
  ctx.fillStyle = rgb(ASTAR_DARK);
  ctx.font = `700 ${nameSize}px Arial, "Segoe UI", sans-serif`;
  ctx.fillText(displayName, px(105), px(139));

  ctx.strokeStyle = rgb(ASTAR_BLUE);
  ctx.lineWidth = px(0.45);
  ctx.beginPath();
  ctx.moveTo(px(42), px(148));
  ctx.lineTo(px(168), px(148));
  ctx.stroke();

  const rows = [
    ['DATUM', date],
    ['RESULTAT', 'Godkänd'],
    ['POÄNG', `${score} av 5`],
  ];
  let rowY = px(171);
  rows.forEach(([label, value]) => {
    ctx.strokeStyle = '#d7e3f4';
    ctx.lineWidth = px(0.2);
    ctx.beginPath();
    ctx.moveTo(px(49), rowY + px(7));
    ctx.lineTo(px(161), rowY + px(7));
    ctx.stroke();

    ctx.fillStyle = rgb(MUTED);
    ctx.font = `700 ${px(2.8)}px Arial, "Segoe UI", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(label, px(56), rowY);

    ctx.fillStyle = rgb(ASTAR_DARK);
    ctx.font = `700 ${px(4.4)}px Arial, "Segoe UI", sans-serif`;
    ctx.fillText(value, px(98), rowY);
    rowY += px(21);
  });

  ctx.fillStyle = rgb(MUTED);
  ctx.font = `400 ${px(3)}px Arial, "Segoe UI", sans-serif`;
  ctx.fillText('Astar', px(27), px(268));
  ctx.textAlign = 'right';
  ctx.fillText('APL-handledarutbildning', px(183), px(268));

  return getCanvasDataUrl(canvas);
}

export async function createCertificatePdf({
  name,
  date,
  score,
  logoSrc = '/astar-logo.jpg',
  autoPrint = true,
}) {
  const certificateImage = await createCertificateImage({
    name,
    date,
    score,
    logoSrc,
  });
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  doc.setProperties({
    title: 'APL-handledare - Astar',
    subject: 'Certifikat',
    creator: 'Astar handledarutbildning',
  });

  doc.addImage(certificateImage, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

  if (autoPrint && typeof doc.autoPrint === 'function') {
    doc.autoPrint();
  }

  return doc;
}

export async function openCertificatePdf(options) {
  const doc = await createCertificatePdf(options);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener,noreferrer');

  if (!win) {
    doc.save('apl-handledare-astar-certifikat.pdf');
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
