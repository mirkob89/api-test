import express from 'express';
import { MongoClient } from 'mongodb';
import xml2js from 'xml2js';

const app = express();
app.use(express.json());
app.use(express.text({ type: 'application/xml' }));

/**
 * Stellt die Verbindung zur MongoDB her.
 * @type {MongoClient}
 */
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;
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
 * POST /xsd
 * Erwartet ein XML im Body und gibt ein spezifisches XSD als Antwort zurück.
 * Das XSD wird auf Basis der Struktur und Typen des XML generiert.
 */
app.post('/xsd', async (req, res) => {
  const xml = req.body;
  if (!xml) return res.status(400).json({ error: 'XML erforderlich' });

  try {
    // XML parsen
    const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });
    // Wurzelelement extrahieren
    const rootName = Object.keys(parsed)[0];
    const rootObj = parsed[rootName];

    // Hilfsfunktion: XSD-Typ bestimmen
    function getType(val) {
      if (typeof val === 'number') return 'xs:decimal';
      if (typeof val === 'boolean') return 'xs:boolean';
      if (!isNaN(Number(val))) return 'xs:decimal';
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return 'xs:date';
      return 'xs:string';
    }

    // Hilfsfunktion: XSD für ein Objekt generieren
    function buildElements(obj) {
      let xsd = '';
      for (const key in obj) {
        const val = obj[key];
        if (typeof val === 'object' && val !== null) {
          xsd += `<xs:element name="${key}">\n<xs:complexType>\n<xs:sequence>\n${buildElements(val)}</xs:sequence>\n</xs:complexType>\n</xs:element>\n`;
        } else {
          xsd += `<xs:element name="${key}" type="${getType(val)}"/>\n`;
        }
      }
      return xsd;
    }

    // XSD-String bauen
    const xsd = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="${rootName}">
    <xs:complexType>
      <xs:sequence>
        ${buildElements(rootObj)}
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>`;

    res.type('application/xml').send(xsd);
  } catch (err) {
    res.status(400).json({ error: 'Ungültiges XML', details: err.message });
  }
});