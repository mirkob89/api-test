import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
app.use(express.json());

/**
 * Stellt die Verbindung zur MongoDB her.
 * @type {MongoClient}
 */
const mongoUrl = process.env.MONGO_URL || 'mongodb://mongo:XbZnRqzcjagkHjtSMPOKqiVZhPocRlJt@mongodb.railway.internal:27017';
const dbName = process.env.MONGO_DB || 'test';
let db;

/**
 * Initialisiert die MongoDB-Verbindung.
 */
async function initMongo() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db(dbName);
  console.log('MongoDB verbunden:', mongoUrl, dbName);
}
initMongo().catch(err => {
  console.error('MongoDB-Verbindung fehlgeschlagen:', err);
  process.exit(1);
});

/**
 * POST /notification/antrag
 * Speichert Daten in der Collection "antrag". Erwartet ein Objekt mit "id" im Body.
 */
app.post('/notification/antrag', async (req, res) => {
  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: 'id erforderlich' });
  await db.collection('antrag').updateOne(
    { id },
    { $set: { ...data, id } },
    { upsert: true }
  );
  res.json({ success: true, id });
});

/**
 * POST /notification/message
 * Speichert Daten in der Collection "message". Erwartet ein Objekt mit "id" im Body.
 */
app.post('/notification/message', async (req, res) => {
  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: 'id erforderlich' });
  await db.collection('message').updateOne(
    { id },
    { $set: { ...data, id } },
    { upsert: true }
  );
  res.json({ success: true, id });
});

/**
 * POST /servicenow
 * Speichert Daten in der Collection "servicenow". Erwartet ein Objekt mit "id" im Body.
 */
app.post('/servicenow', async (req, res) => {
  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: 'id erforderlich' });
  await db.collection('servicenow').updateOne(
    { id },
    { $set: { ...data, id } },
    { upsert: true }
  );
  res.json({ success: true, id });
});

/**
 * GET /notification/antrag/:id
 * Gibt ein gespeichertes Objekt aus der Collection "antrag" anhand der ID zurück.
 */
app.get('/notification/antrag/:id', async (req, res) => {
  const doc = await db.collection('antrag').findOne({ id: req.params.id });
  if (!doc) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json(doc);
});

/**
 * GET /notification/antrag
 * Gibt alle gespeicherten Objekte aus der Collection "antrag" zurück.
 */
app.get('/notification/antrag', async (req, res) => {
  const docs = await db.collection('antrag').find({}).toArray();
  res.json(docs);
});

/**
 * GET /notification/message/:id
 * Gibt ein gespeichertes Objekt aus der Collection "message" anhand der ID zurück.
 */
app.get('/notification/message/:id', async (req, res) => {
  const doc = await db.collection('message').findOne({ id: req.params.id });
  if (!doc) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json(doc);
});

/**
 * GET /notification/message
 * Gibt alle gespeicherten Objekte aus der Collection "message" zurück.
 */
app.get('/notification/message', async (req, res) => {
  const docs = await db.collection('message').find({}).toArray();
  res.json(docs);
});

/**
 * GET /servicenow/:id
 * Gibt ein gespeichertes Objekt aus der Collection "servicenow" anhand der ID zurück.
 */
app.get('/servicenow/:id', async (req, res) => {
  const doc = await db.collection('servicenow').findOne({ id: req.params.id });
  if (!doc) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json(doc);
});

/**
 * GET /servicenow
 * Gibt alle gespeicherten Objekte aus der Collection "servicenow" zurück.
 */
app.get('/servicenow', async (req, res) => {
  const docs = await db.collection('servicenow').find({}).toArray();
  res.json(docs);
});

/**
 * DELETE /notification/antrag/:id
 * Löscht ein Objekt aus der Collection "antrag" anhand der ID.
 */
app.delete('/notification/antrag/:id', async (req, res) => {
  const result = await db.collection('antrag').deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ success: true });
});

/**
 * DELETE /notification/antrag
 * Löscht alle Objekte aus der Collection "antrag".
 */
app.delete('/notification/antrag', async (req, res) => {
  await db.collection('antrag').deleteMany({});
  res.json({ success: true });
});

/**
 * DELETE /notification/message/:id
 * Löscht ein Objekt aus der Collection "message" anhand der ID.
 */
app.delete('/notification/message/:id', async (req, res) => {
  const result = await db.collection('message').deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ success: true });
});

/**
 * DELETE /notification/message
 * Löscht alle Objekte aus der Collection "message".
 */
app.delete('/notification/message', async (req, res) => {
  await db.collection('message').deleteMany({});
  res.json({ success: true });
});

/**
 * DELETE /servicenow/:id
 * Löscht ein Objekt aus der Collection "servicenow" anhand der ID.
 */
app.delete('/servicenow/:id', async (req, res) => {
  const result = await db.collection('servicenow').deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ success: true });
});

/**
 * DELETE /servicenow
 * Löscht alle Objekte aus der Collection "servicenow".
 */
app.delete('/servicenow', async (req, res) => {
  await db.collection('servicenow').deleteMany({});
  res.json({ success: true });
});

/**
 * Startet den Server auf dem angegebenen Port.
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});