"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Layers,
  CheckCircle2,
  Bookmark,
  Users,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  RotateCcw,
  ArrowRight
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Message from "@/components/Message";
import config from "@/config/config.json";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [overdueList, setOverdueList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const loadAdminData = async () => {
    try {
      const [statsRes, overdueRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/borrowings?overdue=true"),
      ]);

      if (statsRes.status === 401 || statsRes.status === 403) {
        router.push("/login?redirect=/admin/dashboard");
        return;
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (overdueRes.ok) {
        const overdueData = await overdueRes.json();
        setOverdueList(overdueData.borrowings || []);
      }
    } catch (err) {
      console.error("Admin dashboard data load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCounterReturn = async (borrowing) => {
    setReturningId(borrowing._id);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch(`/api/borrowings/${borrowing._id}/return`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to process return." });
      } else {
        const fineNote = data.fineAmount > 0 ? ` (Overdue fine assessed: ${data.fineAmount} ${config.fines.currency})` : "";
        setFeedback({
          type: "success",
          message: `Counter return processed for "${borrowing.bookTitle}" (Student: ${borrowing.studentName})${fineNote}`,
        });
        loadAdminData();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while processing return." });
    } finally {
      setReturningId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Librarian Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System overview and circulation metrics for {config.library.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/books"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Manage Catalog
          </Link>
          <Link
            href="/admin/borrowings"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            All Borrowings
          </Link>
        </div>
      </div>

      {feedback.message && (
        <Message
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: "", message: "" })}
        />
      )}

      {/* 8 Statistics Cards (PRD Section 7.7) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Total Books <BookOpen className="w-4 h-4 text-indigo-500" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{stats?.totalBooks ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Total Copies <Layers className="w-4 h-4 text-cyan-500" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{stats?.totalCopies ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Available Copies <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">{stats?.availableBooks ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Active Loans <Bookmark className="w-4 h-4 text-blue-500" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-2">{stats?.borrowedBooks ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Total Students <Users className="w-4 h-4 text-purple-500" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{stats?.totalStudents ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Overdue Loans <AlertTriangle className="w-4 h-4 text-rose-500" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">{stats?.overdueBooks ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Unpaid Fines <CreditCard className="w-4 h-4 text-rose-500" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">
            {stats?.unpaidFineTotal ?? 0} <span className="text-xs text-slate-400 font-semibold">{config.fines.currency}</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Collected Fines <TrendingUp className="w-4 h-4 text-emerald-500" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
            {stats?.collectedFineTotal ?? 0} <span className="text-xs text-slate-400 font-semibold">{config.fines.currency}</span>
          </p>
        </div>
      </div>

      {/* Priority Action Area: Overdue Books List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-lg font-bold text-slate-900">Urgent Overdue Books</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active loans that have exceeded the {config.borrowing.loanDays}-day limit and are accruing fines
            </p>
          </div>
          <Link
            href="/admin/borrowings?overdue=true"
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
          >
            View All Overdue ({overdueList.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {overdueList.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Zero Overdue Books Right Now</p>
            <p className="text-xs text-slate-500">All student loans are currently within their permitted grace periods.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Book Title</th>
                  <th className="py-3 px-6">Student</th>
                  <th className="py-3 px-6">Due Date</th>
                  <th className="py-3 px-6">Overdue By</th>
                  <th className="py-3 px-6">Live Fine</th>
                  <th className="py-3 px-6 text-right">Counter Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueList.map((loan) => (
                  <tr key={loan._id} className="hover:bg-rose-50/40 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">{loan.bookTitle}</td>
                    <td className="py-4 px-6 text-xs">
                      <p className="font-semibold text-slate-800">{loan.studentName}</p>
                      <p className="text-slate-400 font-mono">ID: {loan.studentId || "N/A"}</p>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {new Date(loan.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                        {loan.overdueDays} days late
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-rose-700">
                      {loan.liveFine} {config.fines.currency}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleCounterReturn(loan)}
                        disabled={returningId === loan._id}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {returningId === loan._id ? "Processing..." : "Return"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

