"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, CheckCircle2, ShieldCheck, Search, Filter, Ban } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Message from "@/components/Message";
import config from "@/config/config.json";

export default function AdminFinesPage() {
  const router = useRouter();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  const loadFines = async () => {
    try {
      const res = await fetch("/api/admin/fines");
      if (res.status === 401 || res.status === 403) {
        router.push("/login?redirect=/admin/fines");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setFines(data.fines || []);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load fine records." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFines();
  }, []);

  const handleUpdateFine = async (borrowingId, newStatus) => {
    setProcessingId(borrowingId);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch(`/api/admin/fines/${borrowingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fineStatus: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to update fine." });
      } else {
        setFeedback({
          type: "success",
          message: `Fine record updated to: ${newStatus.toUpperCase()}`,
        });
        loadFines();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while updating fine." });
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = fines.filter((f) => {
    if (filterStatus === "unpaid" && f.fineStatus !== "unpaid") return false;
    if (filterStatus === "paid" && f.fineStatus !== "paid") return false;
    if (filterStatus === "waived" && f.fineStatus !== "waived") return false;
    return true;
  });

  const unpaidSum = fines
    .filter((f) => f.fineStatus === "unpaid")
    .reduce((sum, f) => sum + (Number(f.fineAmount) || 0), 0);

  const collectedSum = fines
    .filter((f) => f.fineStatus === "paid")
    .reduce((sum, f) => sum + (Number(f.fineAmount) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Fine Management & Cashier
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Reconcile student late fees, record payments, and grant waivers
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Uncollected Balance</p>
            <p className="text-3xl font-black text-rose-600 mt-1">
              {unpaidSum} <span className="text-xs text-slate-400 font-semibold">{config.fines.currency}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Collected Fines</p>
            <p className="text-3xl font-black text-emerald-700 mt-1">
              {collectedSum} <span className="text-xs text-slate-400 font-semibold">{config.fines.currency}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs font-semibold">
        <span className="text-slate-500 mr-2 uppercase tracking-wider">Status Filter:</span>
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterStatus === "all" ? "bg-indigo-600 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          All Fines ({fines.length})
        </button>
        <button
          onClick={() => setFilterStatus("unpaid")}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterStatus === "unpaid" ? "bg-rose-600 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Unpaid Only
        </button>
        <button
          onClick={() => setFilterStatus("paid")}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterStatus === "paid" ? "bg-emerald-600 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Paid
        </button>
        <button
          onClick={() => setFilterStatus("waived")}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterStatus === "waived" ? "bg-blue-600 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Waived
        </button>
      </div>

      {/* Fines Table */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <CreditCard className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No fine records found for this view.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Book Title</th>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Fine Amount</th>
                  <th className="py-3.5 px-6">Fine Status</th>
                  <th className="py-3.5 px-6 text-right">Cashier Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">{f.bookTitle}</td>
                    <td className="py-4 px-6 text-xs">
                      <p className="font-semibold text-slate-800">{f.studentName}</p>
                      <p className="text-slate-400 font-mono">ID: {f.studentId || "N/A"}</p>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900">
                      {f.fineAmount || f.currentFine} {config.fines.currency}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge fineStatus={f.fineStatus} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      {f.fineStatus === "unpaid" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateFine(f._id, "paid")}
                            disabled={processingId === f._id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {processingId === f._id ? "Saving..." : "Mark as Paid"}
                          </button>
                          <button
                            onClick={() => handleUpdateFine(f._id, "waived")}
                            disabled={processingId === f._id}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Waive
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Resolved ({f.fineStatus})
                        </span>
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

