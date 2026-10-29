import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
console.log("Testing connection to MongoDB URI:", uri ? uri.split("@")[1] : "NONE");

async function testAtlas() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB Atlas!");
    const db = client.db("library_db");
    const collections = await db.listCollections().toArray();
    console.log("Collections in library_db:", collections.map(c => c.name));
  } catch (err) {
    console.error("MongoDB Atlas connection test error:", err.message);
  } finally {
    await client.close();
  }
}

testAtlas();
