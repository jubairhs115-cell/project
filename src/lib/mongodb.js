import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";

const DB_NAME = "library_db";
const uri = process.env.MONGODB_URI;

let client;
let clientPromise;

// Embedded JSON file fallback for seamless local/demo operation when MongoDB is not running
class EmbeddedCollection {
  constructor(name, dataFile) {
    this.name = name;
    this.dataFile = dataFile;
  }

  _readData() {
    try {
      if (!fs.existsSync(this.dataFile)) {
        return { users: [], books: [], borrowings: [] };
      }
      const raw = fs.readFileSync(this.dataFile, "utf-8");
      return JSON.parse(raw);
    } catch {
      return { users: [], books: [], borrowings: [] };
    }
  }

  _writeData(data) {
    try {
      const dir = path.dirname(this.dataFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("[Embedded DB] Write error:", err);
    }
  }

  _matches(doc, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const [key, val] of Object.entries(filter)) {
      if (key === "$text" && val.$search) {
        const query = val.$search.toLowerCase();
        const text = `${doc.title || ""} ${doc.author || ""} ${doc.isbn || ""}`.toLowerCase();
        if (!text.includes(query)) return false;
        continue;
      }
      if (key === "_id") {
        const docId = doc._id?.toString();
        const targetId = val?.toString ? val.toString() : String(val);
        if (docId !== targetId) return false;
        continue;
      }
      if (val && typeof val === "object" && !Array.isArray(val)) {
        if ("$gt" in val && !(doc[key] > val.$gt)) return false;
        if ("$gte" in val && !(doc[key] >= val.$gte)) return false;
        if ("$lt" in val && !(doc[key] < val.$lt)) return false;
        if ("$lte" in val && !(doc[key] <= val.$lte)) return false;
        if ("$ne" in val && doc[key] === val.$ne) return false;
        if ("$in" in val && !val.$in.map(String).includes(String(doc[key]))) return false;
        continue;
      }
      if (String(doc[key]) !== String(val)) return false;
    }
    return true;
  }

  async find(filter = {}) {
    const data = this._readData();
    let items = (data[this.name] || []).filter((item) => this._matches(item, filter));

    const cursor = {
      _items: items,
      sort(sortObj) {
        const [field, dir] = Object.entries(sortObj)[0] || [];
        if (field) {
          cursor._items.sort((a, b) => {
            if (a[field] < b[field]) return dir === 1 ? -1 : 1;
            if (a[field] > b[field]) return dir === 1 ? 1 : -1;
            return 0;
          });
        }
        return cursor;
      },
      skip(count) {
        cursor._items = cursor._items.slice(count);
        return cursor;
      },
      limit(count) {
        cursor._items = cursor._items.slice(0, count);
        return cursor;
      },
      async toArray() {
        return cursor._items;
      },
    };
    return cursor;
  }

  async findOne(filter = {}) {
    const data = this._readData();
    const items = data[this.name] || [];
    return items.find((item) => this._matches(item, filter)) || null;
  }

  async insertOne(doc) {
    const data = this._readData();
    if (!data[this.name]) data[this.name] = [];
    const newDoc = {
      ...doc,
      _id: doc._id || new ObjectId().toString(),
      createdAt: doc.createdAt || new Date(),
    };
    data[this.name].push(newDoc);
    this._writeData(data);
    return { insertedId: newDoc._id, acknowledged: true };
  }

  async updateOne(filter, update) {
    const data = this._readData();
    const items = data[this.name] || [];
    const idx = items.findIndex((item) => this._matches(item, filter));
    if (idx === -1) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    const doc = items[idx];
    if (update.$set) {
      Object.assign(doc, update.$set);
    }
    if (update.$inc) {
      for (const [key, incVal] of Object.entries(update.$inc)) {
        doc[key] = (Number(doc[key]) || 0) + incVal;
      }
    }
    doc.updatedAt = new Date();
    items[idx] = doc;
    this._writeData(data);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(filter) {
    const data = this._readData();
    const items = data[this.name] || [];
    const initialLen = items.length;
    data[this.name] = items.filter((item) => !this._matches(item, filter));
    const deleted = initialLen - data[this.name].length;
    this._writeData(data);
    return { deletedCount: deleted };
  }

  async countDocuments(filter = {}) {
    const data = this._readData();
    const items = data[this.name] || [];
    return items.filter((item) => this._matches(item, filter)).length;
  }

  async createIndex() {
    return "index_created";
  }

  async aggregate(pipeline = []) {
    // Basic aggregation support for stats
    const data = this._readData();
    let items = data[this.name] || [];
    for (const stage of pipeline) {
      if (stage.$match) {
        items = items.filter((item) => this._matches(item, stage.$match));
      }
    }
    return {
      async toArray() {
        return items;
      },
    };
  }
}

class EmbeddedDb {
  constructor(dataFile) {
    this.dataFile = dataFile;
  }
  collection(name) {
    return new EmbeddedCollection(name, this.dataFile);
  }
}

let activeFallbackDb = null;

export async function connectToDatabase() {
  const fallbackFilePath = path.join(process.cwd(), ".data", "library_db.json");

  if (!uri) {
    if (!activeFallbackDb) {
      activeFallbackDb = new EmbeddedDb(fallbackFilePath);
    }
    return { db: activeFallbackDb, client: null, isFallback: true };
  }

  try {
    if (!clientPromise) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 2000,
      });
      clientPromise = client.connect();
    }
    const connectedClient = await clientPromise;
    const db = connectedClient.db(DB_NAME);
    return { db, client: connectedClient, isFallback: false };
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed (${err.message}). Using local embedded storage.`);
    if (!activeFallbackDb) {
      activeFallbackDb = new EmbeddedDb(fallbackFilePath);
    }
    return { db: activeFallbackDb, client: null, isFallback: true };
  }
}

export { ObjectId };

