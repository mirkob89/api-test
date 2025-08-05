import express from 'express';

const app = express();
app.use(express.json());

// In-Memory-Caches für jede Route
const antragCache = {};
const messageCache = {};
const servicenowCache = {};

// Helper-Funktion zum Zugriff auf den richtigen Cache
function getCache(route) {
  switch (route) {
    case 'antrag': return antragCache;
    case 'message': return messageCache;
    case 'servicenow': return servicenowCache;
    default: return null;
  }
}

// POST: Daten speichern (id im Body erforderlich)
app.post('/notification/antrag', (req, res) => {
  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: 'id erforderlich' });
  antragCache[id] = data;
  res.json({ success: true, id });
});

app.post('/notification/message', (req, res) => {
  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: 'id erforderlich' });
  messageCache[id] = data;
  res.json({ success: true, id });
});

app.post('/servicenow', (req, res) => {
  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: 'id erforderlich' });
  servicenowCache[id] = data;
  res.json({ success: true, id });
});

// GET: Daten holen (per id)
app.get('/notification/antrag/:id', (req, res) => {
  const data = antragCache[req.params.id];
  if (!data) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ id: req.params.id, ...data });
});

app.get('/notification/message/:id', (req, res) => {
  const data = messageCache[req.params.id];
  if (!data) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ id: req.params.id, ...data });
});

app.get('/servicenow/:id', (req, res) => {
  const data = servicenowCache[req.params.id];
  if (!data) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ id: req.params.id, ...data });
});

// DELETE: Daten löschen (per id)
app.delete('/notification/antrag/:id', (req, res) => {
  if (!(req.params.id in antragCache)) return res.status(404).json({ error: 'Nicht gefunden' });
  delete antragCache[req.params.id];
  res.json({ success: true });
});

app.delete('/notification/message/:id', (req, res) => {
  if (!(req.params.id in messageCache)) return res.status(404).json({ error: 'Nicht gefunden' });
  delete messageCache[req.params.id];
  res.json({ success: true });
});

app.delete('/servicenow/:id', (req, res) => {
  if (!(req.params.id in servicenowCache)) return res.status(404).json({ error: 'Nicht gefunden' });
  delete servicenowCache[req.params.id];
  res.json({ success: true });
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});