"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Clock,
  AlertTriangle,
  CreditCard,
  BookOpen,
  ArrowRight,
  RotateCcw,
  RefreshCw
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Message from "@/components/Message";
import config from "@/config/config.json";

export default function StudentDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const loadDashboardData = async () => {
    try {
      const [statsRes, loansRes] = await Promise.all([
        fetch("/api/stats/student"),
        fetch("/api/borrowings/my?status=borrowed"),
      ]);

      if (statsRes.status === 401 || loansRes.status === 401) {
        router.push("/login?redirect=/student/dashboard");
        return;
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (loansRes.ok) {
        const loansData = await loansRes.json();
        setBorrowedBooks(loansData.borrowings || []);
      }
    } catch (err) {
      console.error("Dashboard data load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleReturn = async (borrowing) => {
    setReturningId(borrowing._id);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch(`/api/borrowings/${borrowing._id}/return`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to return book." });
      } else {
        const fineNote = data.fineAmount > 0 ? ` (Overdue fine: ${data.fineAmount} ${config.fines.currency})` : "";
        setFeedback({
          type: "success",
          message: `Returned "${borrowing.bookTitle}" successfully!${fineNote}`,
        });
        loadDashboardData();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while returning book." });
    } finally {
      setReturningId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your book loans, due dates, and account standing
          </p>
        </div>
        <Link
          href="/books"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-xs transition"
        >
          <BookOpen className="w-4 h-4" /> Find Books to Borrow
        </Link>
      </div>

      {feedback.message && (
        <Message
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: "", message: "" })}
        />
      )}

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Currently Borrowed</p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              {stats?.borrowedNow ?? 0}{" "}
              <span className="text-xs text-slate-400 font-medium">/ {config.borrowing.maxActiveBorrowsPerStudent} limit</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Due Soon (≤ 3 Days)</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{stats?.dueSoon ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue Books</p>
            <p className="text-3xl font-black text-rose-600 mt-1">{stats?.overdue ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unpaid Fines Total</p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              {stats?.unpaidFineTotal ?? 0}{" "}
              <span className="text-xs text-slate-500 font-medium">{config.fines.currency}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Active Borrowings Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Active Loans</h2>
            <p className="text-xs text-slate-500 mt-0.5">Books sorted by upcoming due date and urgency</p>
          </div>
          <Link
            href="/student/borrowed"
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
          >
            Manage All ({borrowedBooks.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {borrowedBooks.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">You have no books currently checked out.</p>
            <p className="text-xs text-slate-500">Need reading material for classes? Check the catalog!</p>
            <Link
              href="/books"
              className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-xl hover:bg-indigo-100 transition"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {borrowedBooks.map((loan) => (
              <div
                key={loan._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      isOverdue={loan.isOverdue}
                      isDueSoon={loan.isDueSoon}
                      status={loan.status}
                    />
                    {loan.isOverdue && (
                      <span className="text-xs font-bold text-rose-600">
                        Overdue by {loan.overdueDays} day(s) • Live Fine: {loan.liveFine} {config.fines.currency}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    <Link href={`/books/${loan.bookId}`} className="hover:text-indigo-600">
                      {loan.bookTitle}
                    </Link>
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>Borrowed: {new Date(loan.borrowDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className={loan.isOverdue ? "text-rose-600 font-semibold" : "font-semibold text-slate-700"}>
                      Due: {new Date(loan.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleReturn(loan)}
                    disabled={returningId === loan._id}
                    className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 hover:border-emerald-700 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-bold shadow-2xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {returningId === loan._id ? "Returning..." : "Return Book"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

