import { connectToDatabase } from "./mongodb";
import { hashPassword } from "./auth";

export const SAMPLE_BOOKS = [
  {
    title: "Introduction to Algorithms (CLRS)",
    author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    isbn: "978-0262033848",
    category: "Computer Science",
    description: "A comprehensive update of the leading algorithms text, with new chapters on van Emde Boas trees and multithreaded algorithms.",
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Computer Science",
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
    totalCopies: 3,
    availableCopies: 3,
  },
  {
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    isbn: "978-0201633610",
    category: "Computer Science",
    description: "Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions.",
    totalCopies: 2,
    availableCopies: 2,
  },
  {
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    isbn: "978-1285741550",
    category: "Mathematics",
    description: "Success in your calculus course starts here! Stewart's Calculus texts are world-wide best-sellers for good reason: they are clear, accurate, and filled with realistic examples.",
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: "Linear Algebra and Its Applications",
    author: "Gilbert Strang",
    isbn: "978-0030105678",
    category: "Mathematics",
    description: "Renowned professor and author Gilbert Strang demonstrates that linear algebra is a fascinating subject by showing both its beauty and value.",
    totalCopies: 3,
    availableCopies: 3,
  },
  {
    title: "University Physics with Modern Physics",
    author: "Hugh D. Young, Roger A. Freedman",
    isbn: "978-0135159553",
    category: "Physics",
    description: "Since its first edition, University Physics has been revered for its emphasis on fundamental principles and how to apply them.",
    totalCopies: 2,
    availableCopies: 2,
  },
  {
    title: "The Sealed Nectar (Ar-Raheeq Al-Makhtum)",
    author: "Safiur Rahman Mubarakpuri",
    isbn: "978-9960899558",
    category: "Islamic Studies",
    description: "A complete authoritative book on the life of Prophet Muhammad (peace be upon him) by Sheikh Safi-ur-Rahman al-Mubarkpuri.",
    totalCopies: 6,
    availableCopies: 6,
  },
  {
    title: "Gitanjali (Song Offerings)",
    author: "Rabindranath Tagore",
    isbn: "978-1548489816",
    category: "Literature",
    description: "A collection of 103 poems in English, largely translations by the Bengali poet Rabindranath Tagore, for which he won the Nobel Prize in Literature.",
    totalCopies: 3,
    availableCopies: 3,
  },
];

export async function seedDatabase(force = false) {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection("users");
  const booksCollection = db.collection("books");

  const existingUsersCount = await usersCollection.countDocuments({});
  if (existingUsersCount > 0 && !force) {
    return { message: "Database already contains data.", seeded: false };
  }

  if (force) {
    // Clear collections
    await usersCollection.deleteOne({ role: "admin" });
    await booksCollection.deleteMany({});
  }

  // 1. Seed Admin
  const adminHashedPassword = await hashPassword("Admin@123");
  const adminUser = {
    name: "Librarian Admin",
    email: "admin@library.iu.edu",
    studentId: null,
    password: adminHashedPassword,
    role: "admin",
    createdAt: new Date(),
  };

  const existingAdmin = await usersCollection.findOne({ email: adminUser.email });
  if (!existingAdmin) {
    await usersCollection.insertOne(adminUser);
  }

  // 2. Seed Sample Student
  const studentHashedPassword = await hashPassword("Student@123");
  const sampleStudent = {
    name: "Ahmed Kabir",
    email: "student@student.iu.edu",
    studentId: "CSE-2022-001",
    password: studentHashedPassword,
    role: "student",
    createdAt: new Date(),
  };

  const existingStudent = await usersCollection.findOne({ email: sampleStudent.email });
  if (!existingStudent) {
    await usersCollection.insertOne(sampleStudent);
  }

  // 3. Seed Books
  let addedBooks = 0;
  for (const book of SAMPLE_BOOKS) {
    const existingBook = await booksCollection.findOne({ isbn: book.isbn });
    if (!existingBook) {
      await booksCollection.insertOne({
        ...book,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      addedBooks++;
    }
  }

  return {
    message: "Seed data initialized successfully.",
    seeded: true,
    addedBooks,
  };
}

