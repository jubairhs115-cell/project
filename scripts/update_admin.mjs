import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const uri = process.env.MONGODB_URI;

async function updateAdmin() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // 1. Update Atlas MongoDB if URI is present
  if (uri) {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db("library_db");
      const usersCol = db.collection("users");

      const res = await usersCol.updateOne(
        { $or: [{ role: "admin" }, { email: "admin@library.iu.edu" }, { username: "admin" }] },
        {
          $set: {
            username: "admin",
            email: "admin@library.iu.edu",
            password: hashedPassword,
            role: "admin",
            name: "Librarian Admin",
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log("Atlas admin user updated successfully:", res);
    } catch (err) {
      console.error("Atlas update error:", err.message);
    } finally {
      await client.close();
    }
  }

  // 2. Update local fallback JSON file as well
  const fallbackFilePath = path.join(process.cwd(), ".data", "library_db.json");
  if (fs.existsSync(fallbackFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(fallbackFilePath, "utf-8"));
      const adminIdx = (data.users || []).findIndex(
        (u) => u.role === "admin" || u.email === "admin@library.iu.edu" || u.username === "admin"
      );
      if (adminIdx !== -1) {
        data.users[adminIdx].username = "admin";
        data.users[adminIdx].password = hashedPassword;
      } else {
        if (!data.users) data.users = [];
        data.users.push({
          _id: "admin-001",
          username: "admin",
          name: "Librarian Admin",
          email: "admin@library.iu.edu",
          password: hashedPassword,
          role: "admin",
          createdAt: new Date().toISOString(),
        });
      }
      fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2), "utf-8");
      console.log("Local fallback admin user updated successfully!");
    } catch (err) {
      console.error("Local fallback update error:", err.message);
    }
  }
}

updateAdmin();

