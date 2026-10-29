"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, RotateCcw, ArrowLeft, AlertCircle, Clock } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Message from "@/components/Message";
import config from "@/config/config.json";

export default function MyBorrowedBooksPage() {
  const router = useRouter();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const fetchBorrowedBooks = async () => {
    try {
      const res = await fetch("/api/borrowings/my?status=borrowed");
      if (res.status === 401) {
        router.push("/login?redirect=/student/borrowed");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setLoans(data.borrowings || []);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load borrowed books." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const handleReturn = async (loan) => {
    setReturningId(loan._id);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch(`/api/borrowings/${loan._id}/return`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to return book." });
      } else {
        const fineNote = data.fineAmount > 0 ? ` (Overdue fine assessed: ${data.fineAmount} ${config.fines.currency})` : " on time with no fines.";
        setFeedback({
          type: "success",
          message: `Returned "${loan.bookTitle}" successfully${fineNote}`,
        });
        fetchBorrowedBooks();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while returning." });
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Borrowed Books
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Books currently checked out in your custody
          </p>
        </div>
        <Link
          href="/student/history"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          View Full Borrowing History →
        </Link>
      </div>

      {feedback.message && (
        <Message
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: "", message: "" })}
        />
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8 opacity-75" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Active Book Loans</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You do not currently have any books checked out from the library.
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
          >
            Explore Library Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {loans.map((loan) => (
            <div
              key={loan._id}
              className={`bg-white rounded-2xl p-6 border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition ${
                loan.isOverdue ? "border-rose-300 bg-rose-50/20" : "border-slate-200/80"
              }`}
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    isOverdue={loan.isOverdue}
                    isDueSoon={loan.isDueSoon}
                    status={loan.status}
                  />
                  {loan.isOverdue && (
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                      ⚠ Overdue by {loan.overdueDays} day(s) — Fine: {loan.liveFine} {config.fines.currency}
                    </span>
                  )}
                  {loan.isDueSoon && !loan.isOverdue && (
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Due within {config.ui.dueSoonDays} days
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 leading-snug">
                  <Link href={`/books/${loan.bookId}`} className="hover:text-indigo-600">
                    {loan.bookTitle}
                  </Link>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block font-medium">Borrow Date</span>
                    <span className="font-semibold">{new Date(loan.borrowDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Due Date</span>
                    <span className={`font-semibold ${loan.isOverdue ? "text-rose-600" : "text-slate-900"}`}>
                      {new Date(loan.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Loan Duration</span>
                    <span className="font-semibold">{config.borrowing.loanDays} Days</span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center justify-end gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => handleReturn(loan)}
                  disabled={returningId === loan._id}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  {returningId === loan._id ? "Processing..." : "Return This Book"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

