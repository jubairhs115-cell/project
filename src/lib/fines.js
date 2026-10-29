import config from "../config/config.json" with { type: "json" };

/**
 * Calculates overdue days beyond grace period.
 * overdueDays = whole days after (dueDate + graceDays) (minimum 0)
 */
export function calculateOverdueDays(dueDate, returnOrCurrentDate = new Date()) {
  if (!dueDate) return 0;
  
  const due = new Date(dueDate).getTime();
  const current = new Date(returnOrCurrentDate).getTime();
  const graceDays = config.fines.graceDays || 0;
  
  const graceMs = graceDays * 24 * 60 * 60 * 1000;
  const overdueMs = current - (due + graceMs);
  
  if (overdueMs <= 0) return 0;
  return Math.floor(overdueMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates fine amount capped by maxPerBook.
 * fineAmount = min(overdueDays * perDay, maxPerBook)
 */
export function calculateFine(dueDate, returnOrCurrentDate = new Date()) {
  const overdueDays = calculateOverdueDays(dueDate, returnOrCurrentDate);
  if (overdueDays <= 0) return 0;
  
  const perDay = config.fines.perDay || 5;
  const maxPerBook = config.fines.maxPerBook || 500;
  
  return Math.min(overdueDays * perDay, maxPerBook);
}

/**
 * Checks if a borrowing is currently overdue (dueDate < now).
 */
export function isOverdue(dueDate, currentDate = new Date()) {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < new Date(currentDate).getTime();
}

/**
 * Checks if a borrowing is due soon (remaining days <= dueSoonDays and not yet overdue).
 */
export function isDueSoon(dueDate, currentDate = new Date()) {
  if (!dueDate) return false;
  const due = new Date(dueDate).getTime();
  const now = new Date(currentDate).getTime();
  
  if (due <= now) return false; // Already overdue
  
  const diffDays = (due - now) / (1000 * 60 * 60 * 24);
  const dueSoonDays = config.ui.dueSoonDays || 3;
  return diffDays <= dueSoonDays;
}

/**
 * Formats a currency value with the configured currency code.
 */
export function formatCurrency(amount) {
  return `${amount} ${config.fines.currency || "BDT"}`;
}

