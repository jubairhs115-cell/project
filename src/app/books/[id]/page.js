"use client";

import { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  AlertCircle,
  BookmarkPlus,
  ShieldAlert,
  Hash,
  Tag,
  Layers
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Message from "@/components/Message";
import config from "@/config/config.json";

function BookDetailsContent({ paramsPromise }) {
  const unwrappedParams = use(paramsPromise);
  const bookId = unwrappedParams.id;
  const router = useRouter();

  const [book, setBook] = useState(null);
  const [isAlreadyBorrowedByMe, setIsAlreadyBorrowedByMe] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    async function loadData() {
      try {
        const [authRes, bookRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/books/${bookId}`),
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          setUser(authData.user);
        }

        if (bookRes.ok) {
          const bookData = await bookRes.json();
          setBook(bookData.book);
          setIsAlreadyBorrowedByMe(bookData.isAlreadyBorrowedByMe);
        } else {
          setFeedback({ type: "error", message: "Book not found." });
        }
      } catch {
        setFeedback({ type: "error", message: "Failed to load book details." });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [bookId]);

  const handleBorrow = async () => {
    if (!user) {
      router.push(`/login?redirect=/books/${bookId}`);
      return;
    }

    setBorrowing(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch("/api/borrowings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Could not borrow book." });
      } else {
        setFeedback({
          type: "success",
          message: `Success! You have borrowed "${book.title}". Due date is ${new Date(
            data.borrowing.dueDate
          ).toLocaleDateString()}.`,
        });
        setIsAlreadyBorrowedByMe(true);
        setBook((prev) => ({
          ...prev,
          availableCopies: Math.max(0, (prev.availableCopies || 1) - 1),
        }));
      }
    } catch {
      setFeedback({ type: "error", message: "Network error. Please try again." });
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-10 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-32 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Book Not Found</h2>
        <p className="text-slate-500">The requested book does not exist in our library catalog.</p>
        <Link
          href="/books"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const isAvailable = (book.availableCopies || 0) > 0;
  const isStudent = user?.role === "student";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link
        href="/books"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      {feedback.message && (
        <Message
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: "", message: "" })}
        />
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 sm:p-10 relative overflow-hidden">
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs">
                {book.category}
              </span>
              <StatusBadge
                availableCopies={book.availableCopies}
                totalCopies={book.totalCopies}
              />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {book.title}
            </h1>

            <p className="text-emerald-300 text-lg font-medium">By {book.author}</p>
          </div>
          <div className="absolute right-6 -bottom-6 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        <div className="p-8 sm:p-10 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> ISBN
              </span>
              <p className="font-mono text-sm font-semibold text-slate-900">{book.isbn}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Category
              </span>
              <p className="text-sm font-semibold text-slate-900">{book.category}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Available
              </span>
              <p className="text-sm font-bold text-emerald-600">
                {book.availableCopies} / {book.totalCopies} Copies
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Standard Loan
              </span>
              <p className="text-sm font-semibold text-slate-900">
                {config.borrowing.loanDays} Days
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider text-xs">
              Book Synopsis
            </h2>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              {book.description || "No extended synopsis provided for this title."}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              {isAlreadyBorrowedByMe ? (
                <span className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                  <CheckCircle className="w-4 h-4 text-indigo-600" /> You currently hold an active loan for this book.
                </span>
              ) : !isAvailable ? (
                <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> All copies currently on loan. Check back later.
                </span>
              ) : (
                <span>Physical copies ready for collection at the central library desk.</span>
              )}
            </div>

            <div>
              {isStudent ? (
                <button
                  onClick={handleBorrow}
                  disabled={!isAvailable || isAlreadyBorrowedByMe || borrowing}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                    isAlreadyBorrowedByMe
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                      : !isAvailable
                      ? "bg-rose-100 text-rose-400 cursor-not-allowed shadow-none"
                      : "bg-emerald-700 hover:bg-emerald-800 text-white"
                  }`}
                >
                  <BookmarkPlus className="w-4 h-4" />
                  {borrowing
                    ? "Confirming Loan..."
                    : isAlreadyBorrowedByMe
                    ? "Already Borrowed"
                    : !isAvailable
                    ? "Out of Stock"
                    : "Borrow This Book"}
                </button>
              ) : !user ? (
                <Link
                  href={`/login?redirect=/books/${bookId}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-emerald-700 hover:bg-emerald-800 text-white inline-flex items-center justify-center gap-2 shadow-md transition"
                >
                  Log In to Borrow
                </Link>
              ) : (
                <div className="text-xs text-slate-500 font-medium">
                  Logged in as Librarian Admin
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookDetailsPage({ params }) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading book details...</div>}>
      <BookDetailsContent paramsPromise={params} />
    </Suspense>
  );
}
