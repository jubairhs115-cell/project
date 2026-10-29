"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, BookOpen, ArrowLeft, CheckCircle2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import config from "@/config/config.json";

export default function StudentBorrowingHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/borrowings/my");
        if (res.status === 401) {
          router.push("/login?redirect=/student/history");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setHistory(data.borrowings || []);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Borrowing History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete archive of all your past and active library checkouts
          </p>
        </div>
        <Link
          href="/student/borrowed"
          className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Active Loans Only
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-slate-200" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <History className="w-8 h-8 opacity-75" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No History Records Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You haven't borrowed any books from the library yet.
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Start Browsing Books
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Book Title</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Borrowed Date</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Return Date</th>
                  <th className="py-3.5 px-6 text-right">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <Link href={`/books/${record.bookId}`} className="hover:text-indigo-600">
                        {record.bookTitle}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge
                        status={record.status}
                        isOverdue={record.isOverdue}
                        isDueSoon={record.isDueSoon}
                        fineStatus={record.fineStatus}
                      />
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {new Date(record.borrowDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {new Date(record.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {record.returnDate ? (
                        <span className="text-emerald-700 font-medium">
                          {new Date(record.returnDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Still Borrowed</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-medium">
                      {record.fineAmount && record.fineAmount > 0 ? (
                        <span className="text-rose-600 font-bold">
                          {record.fineAmount} {config.fines.currency} ({record.fineStatus})
                        </span>
                      ) : record.isOverdue && record.liveFine > 0 ? (
                        <span className="text-rose-600 font-bold">
                          {record.liveFine} {config.fines.currency} (accumulating)
                        </span>
                      ) : (
                        <span className="text-slate-400">0 {config.fines.currency}</span>
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

