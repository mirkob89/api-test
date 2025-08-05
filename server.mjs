import express from 'express';

const app = express();
app.use(express.json());

// In-Memory-Caches für jede Route
const antragCache = {};
const messageCache = {};
const servicenowCache = {};

/**
 * Gibt den passenden Cache für eine Route zurück.
 * @param {string} route - Name der Route ('antrag', 'message', 'servicenow')
 * @returns {Object|null} - Der Cache als Objekt oder null
 */
function getCache(route) {
  switch (route) {
    case 'antrag': return antragCache;
    case 'message': return messageCache;
    case 'servicenow': return servicenowCache;
    default: return null;
  }
}

/**
 * POST /notification/antrag
 * Speichert Daten im antragCache. Erwartet ein Objekt mit "id" im Body.
 */
app.post('/notification/antrag', (req, res) => {
  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: 'id erforderlich' });
  antragCache[id] = data;
  res.json({ success: true, id });
});

/**
 * POST /notification/message
 * Speichert Daten im messageCache. Erwartet ein Objekt mit "id" im Body.
 */
app.post('/notification/message', (req, res) => {
  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: 'id erforderlich' });
  messageCache[id] = data;
  res.json({ success: true, id });
});

/**
 * POST /servicenow
 * Speichert Daten im servicenowCache. Erwartet ein Objekt mit "id" im Body.
 */
app.post('/servicenow', (req, res) => {
  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: 'id erforderlich' });
  servicenowCache[id] = data;
  res.json({ success: true, id });
});

/**
 * GET /notification/antrag/:id
 * Gibt ein gespeichertes Objekt aus dem antragCache anhand der ID zurück.
 */
app.get('/notification/antrag/:id', (req, res) => {
  const data = antragCache[req.params.id];
  if (!data) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ id: req.params.id, ...data });
});

/**
 * GET /notification/antrag
 * Gibt alle gespeicherten Objekte aus dem antragCache zurück.
 */
app.get('/notification/antrag', (req, res) => {
  res.json(antragCache);
});

/**
 * GET /notification/message/:id
 * Gibt ein gespeichertes Objekt aus dem messageCache anhand der ID zurück.
 */
app.get('/notification/message/:id', (req, res) => {
  const data = messageCache[req.params.id];
  if (!data) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ id: req.params.id, ...data });
});

/**
 * GET /notification/message
 * Gibt alle gespeicherten Objekte aus dem messageCache zurück.
 */
app.get('/notification/message', (req, res) => {
  res.json(messageCache);
});

/**
 * GET /servicenow/:id
 * Gibt ein gespeichertes Objekt aus dem servicenowCache anhand der ID zurück.
 */
app.get('/servicenow/:id', (req, res) => {
  const data = servicenowCache[req.params.id];
  if (!data) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ id: req.params.id, ...data });
});

/**
 * GET /servicenow
 * Gibt alle gespeicherten Objekte aus dem servicenowCache zurück.
 */
app.get('/servicenow', (req, res) => {
  res.json(servicenowCache);
});

/**
 * DELETE /notification/antrag/:id
 * Löscht ein Objekt aus dem antragCache anhand der ID.
 */
app.delete('/notification/antrag/:id', (req, res) => {
  if (!(req.params.id in antragCache)) return res.status(404).json({ error: 'Nicht gefunden' });
  delete antragCache[req.params.id];
  res.json({ success: true });
});

/**
 * DELETE /notification/antrag
 * Löscht alle Objekte aus dem antragCache.
 */
app.delete('/notification/antrag', (req, res) => {
  Object.keys(antragCache).forEach(id => delete antragCache[id]);
  res.json({ success: true });
});

/**
 * DELETE /notification/message/:id
 * Löscht ein Objekt aus dem messageCache anhand der ID.
 */
app.delete('/notification/message/:id', (req, res) => {
  if (!(req.params.id in messageCache)) return res.status(404).json({ error: 'Nicht gefunden' });
  delete messageCache[req.params.id];
  res.json({ success: true });
});

/**
 * DELETE /notification/message
 * Löscht alle Objekte aus dem messageCache.
 */
app.delete('/notification/message', (req, res) => {
  Object.keys(messageCache).forEach(id => delete messageCache[id]);
  res.json({ success: true });
});

/**
 * DELETE /servicenow/:id
 * Löscht ein Objekt aus dem servicenowCache anhand der ID.
 */
app.delete('/servicenow/:id', (req, res) => {
  if (!(req.params.id in servicenowCache)) return res.status(404).json({ error: 'Nicht gefunden' });
  delete servicenowCache[req.params.id];
  res.json({ success: true });
});

/**
 * DELETE /servicenow
 * Löscht alle Objekte aus dem servicenowCache.
 */
app.delete('/servicenow', (req, res) => {
  Object.keys(servicenowCache).forEach(id => delete servicenowCache[id]);
  res.json({ success: true });
});

/**
 * Startet den Server auf dem angegebenen Port.
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});