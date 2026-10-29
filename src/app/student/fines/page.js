"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, AlertCircle, ShieldCheck, CheckCircle2, Info } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import config from "@/config/config.json";

export default function StudentFinesPage() {
  const router = useRouter();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unpaidTotal, setUnpaidTotal] = useState(0);

  useEffect(() => {
    async function loadFines() {
      try {
        const res = await fetch("/api/borrowings/my");
        if (res.status === 401) {
          router.push("/login?redirect=/student/fines");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          const all = data.borrowings || [];
          const withFines = all.filter(
            (b) =>
              (b.fineAmount && b.fineAmount > 0) ||
              (b.isOverdue && b.liveFine > 0) ||
              (b.fineStatus && b.fineStatus !== "none")
          );
          setFines(withFines);

          const total = withFines.reduce((acc, curr) => {
            if (curr.fineStatus === "unpaid") return acc + (Number(curr.fineAmount) || 0);
            if (curr.status === "borrowed" && curr.isOverdue) return acc + (Number(curr.liveFine) || 0);
            return acc;
          }, 0);
          setUnpaidTotal(total);
        }
      } catch (err) {
        console.error("Failed to load fines", err);
      } finally {
        setLoading(false);
      }
    }
    loadFines();
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Fines & Overdue Fees
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Summary of all overdue penalties and payment status
          </p>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs md:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Unpaid Balance</p>
          <p className="text-4xl font-black text-rose-600 mt-2">
            {unpaidTotal} <span className="text-sm font-semibold text-slate-500">{config.fines.currency}</span>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {unpaidTotal > 0
              ? "Please clear overdue amounts at the library counter to maintain borrowing privileges."
              : "Your library account is in good standing with zero pending fines."}
          </p>
        </div>

        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-md md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-800 text-indigo-200 text-xs font-semibold mb-3">
              <Info className="w-3.5 h-3.5 text-amber-300" /> Library Policy Notice
            </div>
            <h3 className="font-bold text-lg text-white">How Overdue Fines Are Computed</h3>
            <p className="text-sm text-indigo-200 mt-1 leading-relaxed">
              Standard loan duration is {config.borrowing.loanDays} days. A daily late fee of{" "}
              <strong className="text-white">{config.fines.perDay} {config.fines.currency}</strong> is automatically
              assessed for each calendar day beyond the due date, capped at{" "}
              <strong className="text-white">{config.fines.maxPerBook} {config.fines.currency}</strong> per book.
            </p>
          </div>
          <p className="text-xs text-indigo-300 mt-4">
            Payment counter: Central Library Circulation Desk • Mon - Fri (8:00 AM - 5:00 PM)
          </p>
        </div>
      </div>

      {/* Fines Table */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-slate-200" />
          ))}
        </div>
      ) : fines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Fines Incurred</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Great job! You have never accrued any overdue fines on your account.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Book Title</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Return Status</th>
                  <th className="py-3.5 px-6">Fine Status</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <Link href={`/books/${f.bookId}`} className="hover:text-indigo-600">
                        {f.bookTitle}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {new Date(f.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      {f.status === "borrowed" ? (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Active Loan ({f.overdueDays}d overdue)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          Returned on {new Date(f.returnDate).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge fineStatus={f.status === "borrowed" ? "unpaid" : f.fineStatus} />
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900">
                      {f.status === "borrowed" ? f.liveFine : f.fineAmount} {config.fines.currency}
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

