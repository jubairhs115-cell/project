"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Calendar,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Database
} from "lucide-react";
import config from "@/config/config.json";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/books");
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage("");
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: false }),
      });
      const data = await res.json();
      setSeedMessage(data.message || "Seeding complete!");
    } catch {
      setSeedMessage("Seed request failed.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-950 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-300" /> University CSE Web Engineering Project
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-indigo-200">{config.library.name}</span>
          </h1>

          <p className="text-lg sm:text-xl text-indigo-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Instant book discovery, real-time copy tracking, seamless automated loans, and clear overdue management for students and faculty.
          </p>

          {/* Quick Search Box */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex items-center gap-2 border border-white/20"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or ISBN (e.g., Algorithms, Clean Code)..."
              className="flex-1 py-3 px-2 text-slate-800 text-sm sm:text-base outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-semibold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/books"
              className="px-6 py-3 rounded-xl bg-white text-indigo-900 font-semibold text-sm hover:bg-indigo-50 shadow-md transition flex items-center gap-2"
            >
              Browse All Books <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-sm border border-indigo-400/40 transition"
            >
              Student Registration
            </Link>
          </div>
        </div>

        {/* Decorative background blurs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Student Self-Service</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Find any required textbook in seconds, view available physical copies, borrow instantly, and return with one click.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Transparent Rules & Fines</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standard {config.borrowing.loanDays}-day loan window. Overdue fees are calculated automatically at {config.fines.perDay} {config.fines.currency}/day with a {config.fines.maxPerBook} {config.fines.currency} safety cap.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Librarian Operations</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Comprehensive inventory management, instant stock adjustments, counter returns, and real-time fine reconciliation.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Testing / Viva Demonstration Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-semibold">
              <Database className="w-3.5 h-3.5" /> Ready for Testing & Viva Demo
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Pre-Configured Demo Accounts
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              The application comes with test credentials so you can log in as both a Student and a Librarian Admin immediately:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                  Admin (Librarian)
                </span>
                <p className="text-sm font-mono mt-1 text-slate-200">admin@library.iu.edu</p>
                <p className="text-xs font-mono text-slate-400">Password: Admin@123</p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">
                  Student Account
                </span>
                <p className="text-sm font-mono mt-1 text-slate-200">student@student.iu.edu</p>
                <p className="text-xs font-mono text-slate-400">Password: Student@123 (ID: CSE-2022-001)</p>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                {seeding ? "Initializing..." : "Seed / Ensure Sample Data"}
              </button>
              {seedMessage && (
                <span className="text-xs text-emerald-400 font-medium">{seedMessage}</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
