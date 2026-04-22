# Astar APL-handledarutbildning

Interaktiv 30-minuters handledarutbildning for APL-handledare.

## Vercel

Projektet ar gjort for Vercel med standard-Vite:

```text
Framework Preset: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
```

`vercel.json` finns redan i projektet och skickar alla routes till `index.html`, sa appen fungerar aven efter omladdning.

## Deploy

1. Ga till Vercel.
2. Importera GitHub-repot `jerrymross/APL`.
3. Lamna install/build/output enligt Vercels forslag eller vardena ovan.
4. Klicka Deploy.

Efter deploy oppnas appen pa Vercel-adressen direkt.

## Oppna lokalt

Dubbelklicka pa:

```text
start-app.bat
```

Eller kor:

```bash
npm install
npm run dev
```

Oppna sedan:

```text
http://localhost:5173/?reset=1
```

## Bygg lokalt

```bash
npm run build
npm run preview
```
