# XcelLearn — Next.js

A 1:1 Next.js App Router conversion of the XcelLearn React/Vite application.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo accounts

- Student: `student1` / `pass123`
- Lecturer: `lect1` / `pass123`
- Admin: `admin` / `admin123`

The demo database and session are stored in the browser's local storage, matching
the original application.

## Build

```bash
npm run build
```

The project uses Next.js static export, so the production files are written to
the `out` directory.