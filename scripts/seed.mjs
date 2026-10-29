import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const fallbackFilePath = path.join(process.cwd(), ".data", "library_db.json");

const SAMPLE_BOOKS = [
  {
    _id: "book-001",
    title: "Introduction to Algorithms (CLRS)",
    author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    isbn: "978-0262033848",
    category: "Computer Science",
    description: "A comprehensive update of the leading algorithms text, with new chapters on van Emde Boas trees and multithreaded algorithms.",
    totalCopies: 5,
    availableCopies: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "book-002",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Computer Science",
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "book-003",
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    isbn: "978-0201633610",
    category: "Computer Science",
    description: "Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions.",
    totalCopies: 2,
    availableCopies: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "book-004",
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    isbn: "978-1285741550",
    category: "Mathematics",
    description: "Success in your calculus course starts here! Stewart's Calculus texts are world-wide best-sellers for good reason: they are clear, accurate, and filled with realistic examples.",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "book-005",
    title: "Linear Algebra and Its Applications",
    author: "Gilbert Strang",
    isbn: "978-0030105678",
    category: "Mathematics",
    description: "Renowned professor and author Gilbert Strang demonstrates that linear algebra is a fascinating subject by showing both its beauty and value.",
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "book-006",
    title: "University Physics with Modern Physics",
    author: "Hugh D. Young, Roger A. Freedman",
    isbn: "978-0135159553",
    category: "Physics",
    description: "Since its first edition, University Physics has been revered for its emphasis on fundamental principles and how to apply them.",
    totalCopies: 2,
    availableCopies: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "book-007",
    title: "The Sealed Nectar (Ar-Raheeq Al-Makhtum)",
    author: "Safiur Rahman Mubarakpuri",
    isbn: "978-9960899558",
    category: "Islamic Studies",
    description: "A complete authoritative book on the life of Prophet Muhammad (peace be upon him) by Sheikh Safi-ur-Rahman al-Mubarkpuri.",
    totalCopies: 6,
    availableCopies: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "book-008",
    title: "Gitanjali (Song Offerings)",
    author: "Rabindranath Tagore",
    isbn: "978-1548489816",
    category: "Literature",
    description: "A collection of 103 poems in English, largely translations by the Bengali poet Rabindranath Tagore, for which he won the Nobel Prize in Literature.",
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function seed() {
  const dir = path.dirname(fallbackFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const adminPass = await bcrypt.hash("Admin@123", 10);
  const studentPass = await bcrypt.hash("Student@123", 10);

  const initialData = {
    users: [
      {
        _id: "admin-001",
        name: "Librarian Admin",
        email: "admin@library.iu.edu",
        studentId: null,
        password: adminPass,
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "student-001",
        name: "Ahmed Kabir",
        email: "student@student.iu.edu",
        studentId: "CSE-2022-001",
        password: studentPass,
        role: "student",
        createdAt: new Date().toISOString(),
      },
    ],
    books: SAMPLE_BOOKS,
    borrowings: [
      {
        _id: "borrow-demo-001",
        userId: "student-001",
        studentName: "Ahmed Kabir",
        studentId: "CSE-2022-001",
        bookId: "book-003",
        bookTitle: "Design Patterns: Elements of Reusable Object-Oriented Software",
        borrowDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        returnDate: null,
        status: "borrowed",
        fineAmount: 0,
        fineStatus: "none",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };

  // Adjust availableCopies for book-003 because of demo borrowing
  initialData.books.find(b => b._id === "book-003").availableCopies = 1;

  fs.writeFileSync(fallbackFilePath, JSON.stringify(initialData, null, 2), "utf-8");
  console.log("Database seeded successfully with users, books, and sample borrowings!");
}

seed();

