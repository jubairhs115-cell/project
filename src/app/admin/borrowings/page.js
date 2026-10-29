"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, RotateCcw, Search, CheckCircle2, AlertTriangle, Filter } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Message from "@/components/Message";
import config from "@/config/config.json";

function AdminBorrowingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOverdue = searchParams.get("overdue") === "true";

  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialOverdue ? "overdue" : "all");
  const [search, setSearch] = useState("");
  const [returningId, setReturningId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const loadBorrowings = async () => {
    try {
      const res = await fetch("/api/admin/borrowings");
      if (res.status === 401 || res.status === 403) {
        router.push("/login?redirect=/admin/borrowings");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setBorrowings(data.borrowings || []);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load borrowings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowings();
  }, []);

  const handleCounterReturn = async (b) => {
    setReturningId(b._id);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch(`/api/borrowings/${b._id}/return`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Counter return failed." });
      } else {
        const fineNote = data.fineAmount > 0 ? ` (Overdue fine assessed: ${data.fineAmount} ${config.fines.currency})` : "";
        setFeedback({
          type: "success",
          message: `Returned "${b.bookTitle}" (Student: ${b.studentName})${fineNote}`,
        });
        loadBorrowings();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error during return." });
    } finally {
      setReturningId(null);
    }
  };

  // Filter logic
  const filtered = borrowings.filter((b) => {
    if (activeTab === "borrowed" && b.status !== "borrowed") return false;
    if (activeTab === "returned" && b.status !== "returned") return false;
    if (activeTab === "overdue" && (!b.isOverdue || b.status !== "borrowed")) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchTitle = b.bookTitle?.toLowerCase().includes(q);
      const matchStudent = b.studentName?.toLowerCase().includes(q) || b.studentId?.toLowerCase().includes(q);
      return matchTitle || matchStudent;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Circulation & Borrowing Records
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Master log of all library book loans and counter returns
          </p>
        </div>
      </div>

      {feedback.message && (
        <Message
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: "", message: "" })}
        />
      )}

      {/* Tabs and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Records ({borrowings.length})
          </button>
          <button
            onClick={() => setActiveTab("borrowed")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "borrowed" ? "bg-white text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            Active Loans
          </button>
          <button
            onClick={() => setActiveTab("overdue")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "overdue" ? "bg-white text-rose-700 shadow-2xs font-bold" : "text-slate-600 hover:text-rose-600"
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setActiveTab("returned")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "returned" ? "bg-white text-emerald-700 shadow-2xs font-bold" : "text-slate-600 hover:text-emerald-600"
            }`}
          >
            Returned
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, ID, or book title..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Borrowings Table */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No records found matching criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Book Title</th>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Borrow Date</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Fine Info</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {b.bookTitle}
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <p className="font-semibold text-slate-800">{b.studentName}</p>
                      <p className="text-slate-400 font-mono">ID: {b.studentId || "N/A"}</p>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge
                        status={b.status}
                        isOverdue={b.isOverdue}
                        isDueSoon={b.isDueSoon}
                        fineStatus={b.fineStatus}
                      />
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {new Date(b.borrowDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      <span className={b.isOverdue ? "text-rose-600 font-bold" : ""}>
                        {new Date(b.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs">
                      {b.fineAmount > 0 ? (
                        <span className="font-bold text-rose-600">
                          {b.fineAmount} {config.fines.currency} ({b.fineStatus})
                        </span>
                      ) : b.isOverdue ? (
                        <span className="font-bold text-rose-600">
                          {b.liveFine} {config.fines.currency} (live)
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {b.status === "borrowed" ? (
                        <button
                          onClick={() => handleCounterReturn(b)}
                          disabled={returningId === b._id}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          {returningId === b._id ? "Processing..." : "Counter Return"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Returned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBorrowingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading records...</div>}>
      <AdminBorrowingsContent />
    </Suspense>
  );
}

