import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;

const SAMPLE_BOOKS = [
  {
    title: "Introduction to Algorithms (CLRS)",
    author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    isbn: "978-0262033848",
    category: "Computer Science",
    description: "A comprehensive update of the leading algorithms text, with new chapters on van Emde Boas trees and multithreaded algorithms.",
    totalCopies: 5,
    availableCopies: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Computer Science",
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    isbn: "978-0201633610",
    category: "Computer Science",
    description: "Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions.",
    totalCopies: 2,
    availableCopies: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    isbn: "978-1285741550",
    category: "Mathematics",
    description: "Success in your calculus course starts here! Stewart's Calculus texts are world-wide best-sellers for good reason: they are clear, accurate, and filled with realistic examples.",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Linear Algebra and Its Applications",
    author: "Gilbert Strang",
    isbn: "978-0030105678",
    category: "Mathematics",
    description: "Renowned professor and author Gilbert Strang demonstrates that linear algebra is a fascinating subject by showing both its beauty and value.",
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "University Physics with Modern Physics",
    author: "Hugh D. Young, Roger A. Freedman",
    isbn: "978-0135159553",
    category: "Physics",
    description: "Since its first edition, University Physics has been revered for its emphasis on fundamental principles and how to apply them.",
    totalCopies: 2,
    availableCopies: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "The Sealed Nectar (Ar-Raheeq Al-Makhtum)",
    author: "Safiur Rahman Mubarakpuri",
    isbn: "978-9960899558",
    category: "Islamic Studies",
    description: "A complete authoritative book on the life of Prophet Muhammad (peace be upon him) by Sheikh Safi-ur-Rahman al-Mubarkpuri.",
    totalCopies: 6,
    availableCopies: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Gitanjali (Song Offerings)",
    author: "Rabindranath Tagore",
    isbn: "978-1548489816",
    category: "Literature",
    description: "A collection of 103 poems in English, largely translations by the Bengali poet Rabindranath Tagore, for which he won the Nobel Prize in Literature.",
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedAtlas() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas for seeding...");
    const db = client.db("library_db");
    const usersCol = db.collection("users");
    const booksCol = db.collection("books");
    const borrowingsCol = db.collection("borrowings");

    // Create Indexes (PRD Section 8.4)
    await usersCol.createIndex({ email: 1 }, { unique: true });
    await usersCol.createIndex({ studentId: 1 }, { unique: true, sparse: true });
    await booksCol.createIndex({ isbn: 1 }, { unique: true });
    await booksCol.createIndex({ title: "text", author: "text" });
    await borrowingsCol.createIndex({ userId: 1, status: 1 });
    await borrowingsCol.createIndex({ bookId: 1, status: 1 });
    console.log("Database indexes created (unique email, unique ISBN, text index on title/author).");

    // 1. Seed Admin
    const adminPass = await bcrypt.hash("Admin@123", 10);
    const existingAdmin = await usersCol.findOne({ email: "admin@library.iu.edu" });
    if (!existingAdmin) {
      await usersCol.insertOne({
        name: "Librarian Admin",
        email: "admin@library.iu.edu",
        studentId: null,
        password: adminPass,
        role: "admin",
        createdAt: new Date(),
      });
      console.log("Admin account created: admin@library.iu.edu");
    }

    // 2. Seed Student
    const studentPass = await bcrypt.hash("Student@123", 10);
    const existingStudent = await usersCol.findOne({ email: "student@student.iu.edu" });
    let studentId;
    if (!existingStudent) {
      const stuRes = await usersCol.insertOne({
        name: "Ahmed Kabir",
        email: "student@student.iu.edu",
        studentId: "CSE-2022-001",
        password: studentPass,
        role: "student",
        createdAt: new Date(),
      });
      studentId = stuRes.insertedId;
      console.log("Student account created: student@student.iu.edu (ID: CSE-2022-001)");
    } else {
      studentId = existingStudent._id;
    }

    // 3. Seed Books
    for (const book of SAMPLE_BOOKS) {
      const existing = await booksCol.findOne({ isbn: book.isbn });
      if (!existing) {
        await booksCol.insertOne(book);
      }
    }
    console.log("Seeded catalog books into Atlas.");

    // 4. Sample active loan to showcase overdue/fines
    const targetBook = await booksCol.findOne({ isbn: "978-0201633610" }); // Design Patterns
    if (targetBook && studentId) {
      const existingBorrow = await borrowingsCol.findOne({ userId: studentId.toString(), status: "borrowed" });
      if (!existingBorrow) {
        const borrowDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
        const dueDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
        await borrowingsCol.insertOne({
          userId: studentId.toString(),
          studentName: "Ahmed Kabir",
          studentId: "CSE-2022-001",
          bookId: targetBook._id.toString(),
          bookTitle: targetBook.title,
          borrowDate,
          dueDate,
          returnDate: null,
          status: "borrowed",
          fineAmount: 0,
          fineStatus: "none",
          createdAt: borrowDate,
        });

        await booksCol.updateOne(
          { _id: targetBook._id },
          { $set: { availableCopies: Math.max(0, targetBook.availableCopies - 1) } }
        );
        console.log("Created demonstration active loan for Ahmed Kabir.");
      }
    }

    console.log("MongoDB Atlas seeding completed successfully!");
  } catch (err) {
    console.error("Atlas seed error:", err);
  } finally {
    await client.close();
  }
}

seedAtlas();
