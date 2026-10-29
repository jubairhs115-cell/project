"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Search, Bookmark, CreditCard, ChevronRight, X, History, Mail } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Message from "@/components/Message";
import config from "@/config/config.json";

export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const loadStudents = async () => {
    try {
      const res = await fetch("/api/admin/students");
      if (res.status === 401 || res.status === 403) {
        router.push("/login?redirect=/admin/students");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load students." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const openStudentHistory = async (student) => {
    setSelectedStudent(student);
    setLoadingHistory(true);
    setStudentHistory([]);

    try {
      const res = await fetch(`/api/admin/students/${student._id}`);
      if (res.ok) {
        const data = await res.json();
        setStudentHistory(data.borrowings || []);
      }
    } catch {
      console.error("Failed to load student history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Registered Students
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Directory of enrolled students, current loan quotas, and fee balances
          </p>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Total Enrolled: <span className="font-bold text-slate-900">{students.length}</span>
        </div>
      </div>

      {feedback.message && (
        <Message
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: "", message: "" })}
        />
      )}

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, email, or Student ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No students match your query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Student Details</th>
                  <th className="py-3.5 px-6">Student ID</th>
                  <th className="py-3.5 px-6">Active Loans</th>
                  <th className="py-3.5 px-6">Unpaid Fines</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((stu) => (
                  <tr key={stu._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 leading-snug">{stu.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {stu.email}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-xs font-mono font-semibold text-slate-800">
                      {stu.studentId || "—"}
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <span className="font-semibold text-slate-900">{stu.activeBorrows}</span>{" "}
                      <span className="text-slate-400">/ {config.borrowing.maxActiveBorrowsPerStudent} limit</span>
                    </td>
                    <td className="py-4 px-6">
                      {stu.unpaidFines > 0 ? (
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          {stu.unpaidFines} {config.fines.currency} Unpaid
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openStudentHistory(stu)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        View History <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student History Modal / Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {selectedStudent.studentId || "N/A"} • {selectedStudent.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Borrowing Records
              </h4>

              {loadingHistory ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading history...</div>
              ) : studentHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  This student has no borrowing records.
                </div>
              ) : (
                <div className="space-y-3">
                  {studentHistory.map((rec) => (
                    <div
                      key={rec._id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{rec.bookTitle}</span>
                        <StatusBadge
                          status={rec.status}
                          isOverdue={rec.isOverdue}
                          fineStatus={rec.fineStatus}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                        <span>Borrowed: {new Date(rec.borrowDate).toLocaleDateString()}</span>
                        <span>Due: {new Date(rec.dueDate).toLocaleDateString()}</span>
                        {rec.returnDate && (
                          <span>Returned: {new Date(rec.returnDate).toLocaleDateString()}</span>
                        )}
                        {rec.fineAmount > 0 && (
                          <span className="text-rose-600 font-semibold">
                            Fine: {rec.fineAmount} {config.fines.currency} ({rec.fineStatus})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

