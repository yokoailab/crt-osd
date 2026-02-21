const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app    = express();
const PORT   = process.env.PORT || 3000;
const DB     = path.join(__dirname, 'db.json');

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Helpers ─────────────────────────────────────────────────────────────────
function readDB() {
  try {
    if (!fs.existsSync(DB)) return {};
    return JSON.parse(fs.readFileSync(DB, 'utf8'));
  } catch (e) {
    console.error('Error leyendo db.json:', e.message);
    return {};
  }
}

function writeDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2), 'utf8');
}

// ── Rutas API ────────────────────────────────────────────────────────────────

// GET /api/data  → devuelve toda la base de datos
app.get('/api/data', (req, res) => {
  res.json(readDB());
});

// POST /api/data  → guarda un departamento  { dept, tx, rx }
app.post('/api/data', (req, res) => {
  const { dept, tx, rx } = req.body;
  if (!dept || tx === undefined || rx === undefined) {
    return res.status(400).json({ error: 'Faltan campos: dept, tx, rx' });
  }
  const db = readDB();
  db[dept] = {
    tx: Number(tx),
    rx: Number(rx),
    ts: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    updatedAt: new Date().toISOString()
  };
  writeDB(db);
  res.json({ ok: true, dept, data: db[dept] });
});

// DELETE /api/data/:dept  → borra un departamento
app.delete('/api/data/:dept', (req, res) => {
  const dept = decodeURIComponent(req.params.dept);
  const db   = readDB();
  if (!db[dept]) return res.status(404).json({ error: 'Departamento no encontrado' });
  delete db[dept];
  writeDB(db);
  res.json({ ok: true, dept });
});

// DELETE /api/data  → reinicia toda la base de datos
app.delete('/api/data', (req, res) => {
  writeDB({});
  res.json({ ok: true, message: 'Base de datos reiniciada' });
});

// ── Inicio ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ CRT/OSD server corriendo en http://localhost:${PORT}`);
  console.log(`📁 Base de datos: ${DB}`);
});
