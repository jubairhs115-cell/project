import { connectToDatabase } from "../src/lib/mongodb.js";
import { calculateFine, calculateOverdueDays, isOverdue } from "../src/lib/fines.js";

async function runAcceptanceChecks() {
  console.log("=== RUNNING PRD ACCEPTANCE CHECKS ===");

  // 1. Database Connection check
  const { db, isFallback } = await connectToDatabase();
  console.log(`[Check 1] Database connection active. (Using ${isFallback ? "embedded storage" : "MongoDB server"})`);

  // 2. Books Collection Check
  const books = await (await db.collection("books").find({})).toArray();
  console.log(`[Check 2] Seeded books count: ${books.length}`);
  if (books.length === 0) throw new Error("No books found!");

  // 3. User check
  const admin = await db.collection("users").findOne({ role: "admin" });
  const student = await db.collection("users").findOne({ role: "student" });
  console.log(`[Check 3] Admin found: ${admin?.email}, Student found: ${student?.email}`);
  if (!admin || !student) throw new Error("Required users missing!");

  // 4. Overdue and Fine Formula Check (PRD Section 7.6 / T9, T10)
  const now = new Date();
  const dueDatePast4Days = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const overdueDays = calculateOverdueDays(dueDatePast4Days, now);
  const fine = calculateFine(dueDatePast4Days, now);
  console.log(`[Check 4] 4 days overdue: days=${overdueDays}, fine=${fine} BDT (Expected: 20 BDT)`);
  if (fine !== 20) throw new Error(`Fine calculation mismatch: expected 20, got ${fine}`);

  // 5. Capped fine check (200 days late, max 500 BDT)
  const dueDatePast200Days = new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000);
  const cappedFine = calculateFine(dueDatePast200Days, now);
  console.log(`[Check 5] 200 days overdue: fine=${cappedFine} BDT (Expected: 500 BDT cap)`);
  if (cappedFine !== 500) throw new Error(`Fine cap failed: expected 500, got ${cappedFine}`);

  console.log("\n>>> ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY! <<<");
}

runAcceptanceChecks().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});

