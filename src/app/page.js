"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Calendar,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Database,
  ExternalLink,
  Layers,
  FileText,
  Wifi,
  Video,
  Award,
  Users,
  Building2,
  CheckCircle2,
  Bookmark
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

  const publishers = [
    "IEEE", "ACM", "JSTOR", "Springer", "Wiley", 
    "Cambridge Univ. Press", "Oxford Univ. Press", "ScienceDirect",
    "McGraw-Hill", "Pearson Education", "SAGE", "Taylor & Francis", "Emerald"
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section with Islamic University Emerald Theme */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-400">
        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          {/* Official University Identity Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-100 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg">
            <div className="w-5 h-5 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0">
              <Image src="/iu-logo.png" alt="IU Logo" width={16} height={16} className="object-contain" />
            </div>
            <span>{config.library.university}</span>
            <span className="text-emerald-400">• Est. 1979</span>
            <a
              href="https://www.iu.ac.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-flex items-center gap-0.5 text-amber-300 hover:text-white underline font-normal"
            >
              iu.ac.bd <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {config.library.name}
            </h1>
            <p className="text-emerald-300 text-lg sm:text-xl font-medium tracking-wide">
              খাদেমুল হারামাইন বাদশাহ ফাহাদ বিন আব্দুল আজিজ কেন্দ্রীয় গ্রন্থাগার
            </p>
          </div>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-3xl mx-auto font-normal leading-relaxed">
            One of Bangladesh's premier university repositories, spanning 32,320 sq. ft. across 3 storeys.
            Instant textbook loans, live copy reservation, thesis access, and integrated research catalog.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex items-center gap-2 border-2 border-emerald-400/40"
          >
            <div className="pl-3 text-emerald-700">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog by title, author, or ISBN (e.g. Algorithms, Calculus)..."
              className="flex-1 py-3 px-2 text-slate-800 text-sm sm:text-base outline-none placeholder:text-slate-400 font-medium"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-sm sm:text-base font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/books"
              className="px-6 py-3 rounded-xl bg-white text-emerald-950 font-bold text-sm hover:bg-emerald-50 shadow-md transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-emerald-700" /> Browse Available Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm border border-emerald-500/50 transition flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-amber-300" /> Student Self-Registration
            </Link>
          </div>

          {/* Schedule Banner in Hero */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-emerald-200">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>
              Regular Hours: <strong>Saturday – Thursday: 9:00 AM – 8:00 PM</strong> •{" "}
              <span className="text-amber-300 font-bold">Friday Closed</span>
            </span>
          </div>
        </div>

        {/* Ambient Emerald Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none" />
      </section>

      {/* "At A Glance" Key Statistics Grid (Real IU Library Data) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Official Institutional Data
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Library at a Glance
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Housed in a 3-storey building opened in August 1995, serving thousands of students, researchers, and faculty.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-emerald-800">1,03,408+</p>
            <p className="text-xs font-bold text-slate-700">Physical Books</p>
            <p className="text-[11px] text-slate-400">Printed Volumes</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-emerald-800">19,029+</p>
            <p className="text-xs font-bold text-slate-700">Foreign Journals</p>
            <p className="text-[11px] text-slate-400">Current Subscriptions</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-emerald-800">34,100+</p>
            <p className="text-xs font-bold text-slate-700">E-Resources</p>
            <p className="text-[11px] text-slate-400">UDL / UGC Subscribed</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-emerald-800">30,000+</p>
            <p className="text-xs font-bold text-slate-700">Manuscripts & CDs</p>
            <p className="text-[11px] text-slate-400">Rare Historical Files</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-emerald-800">32,320</p>
            <p className="text-xs font-bold text-slate-700">Sq. Ft. Area</p>
            <p className="text-[11px] text-slate-400">3-Storey Facility</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-emerald-800">600 Seats</p>
            <p className="text-xs font-bold text-slate-700">Reading Halls</p>
            <p className="text-[11px] text-slate-400">Silent Study Spaces</p>
          </div>
        </div>
      </section>

      {/* Comprehensive Library Information Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> Comprehensive Academic Facility
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                About King Fahad-bin-Abdul Aziz Central Library
              </h2>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  The Central Library, <strong>Khademul Haramain King Fahad Bin Abdul Aziz Library</strong>, housed in an expansive three-storey building, is one of the largest academic libraries in Bangladesh. The service was established during <strong>1984–1985</strong>, and the current landmark building was officially inaugurated on <strong>25 August 1995</strong>.
                </p>
                <p>
                  The library is a member of the <strong>Bangladesh University Grants Commission (UGC) Digital Library (UDL)</strong> and multiple international consortia. Through UDL, students and faculty enjoy direct full-text access to 13 eminent global e-publishers, alongside remote access through <strong>EBSCO Discovery Service</strong> and <strong>RemoteXs</strong>.
                </p>
                <p>
                  A dedicated <strong>Digital Library Access Centre (DLAC)</strong> has been established with computer facilities, high-speed campus-wide Wi-Fi, and a latest-generation automated Barcode circulation desk.
                </p>
              </div>

              {/* Research Archive Counters */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs text-slate-500 font-medium">PhD Theses</span>
                  <p className="text-lg font-black text-emerald-900">371 Copies</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs text-slate-500 font-medium">M.Phil Theses</span>
                  <p className="text-lg font-black text-emerald-900">547 Copies</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 col-span-2 sm:col-span-1">
                  <span className="text-xs text-slate-500 font-medium">Daily Newspapers</span>
                  <p className="text-lg font-black text-emerald-900">20 Subscribed</p>
                  <p className="text-[10px] text-slate-400">14 Bangla + 6 English</p>
                </div>
              </div>
            </div>

            {/* Special Corners & Facilities */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" /> Special Corners & Facilities
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Dedicated cultural, national, and high-tech research centers
                </p>
              </div>

              <div className="space-y-3.5 text-xs text-slate-200">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Bangabandhu Corner (বঙ্গবন্ধু কর্নার)</strong>
                    <span>Extensive historical documents and literature on the Father of the Nation.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Muktijuddho Corner (মুক্তিযুদ্ধ কর্নার)</strong>
                    <span>1971 Liberation War archives, historical documents, and liberation memoirs.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Ekushey Corner (একুশে কর্নার)</strong>
                    <span>Language Movement of 1952, Bengali language heritage, and linguistic studies.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Wifi className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Campus Wi-Fi & 24/7 CCTV</strong>
                    <span>High-speed optical fiber Wi-Fi throughout office hours with round-the-clock security.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Library Staff: <strong>63 Personnel</strong> (29 Officers)</span>
                <span className="text-emerald-300 font-semibold">3-Storey Facility</span>
              </div>
            </div>
          </div>

          {/* Connected International E-Publishers Consortium */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Connected E-Publishers via UDL (University Grants Commission)
              </span>
              <span className="text-xs text-emerald-700 font-semibold">13 Global Academic Consortiums</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {publishers.map((pub) => (
                <span
                  key={pub}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-800 transition"
                >
                  {pub}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Online Lending Rules Section (Section 6 & 7 PRD) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Student Borrowing Policy</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enrolled students can borrow up to <strong>{config.borrowing.maxActiveBorrowsPerStudent} books</strong> concurrently for a standard <strong>{config.borrowing.loanDays}-day loan period</strong>.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Transparent Fines</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Automated overdue fee of <strong>{config.fines.perDay} {config.fines.currency} per day</strong> starts after the due date, safely capped at <strong>{config.fines.maxPerBook} {config.fines.currency}</strong> per book.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Librarian Circulation Desk</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Physical collections desk open <strong>Saturday to Thursday (9:00 AM – 8:00 PM)</strong> with counter services and real-time fine receipts.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-semibold">
              <Database className="w-3.5 h-3.5" /> University Viva / Evaluation Credentials
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready for Instant Demonstration
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              You can test the system right now with either of the following accounts:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                  Librarian (Admin Panel)
                </span>
                <p className="text-sm font-mono mt-1 text-slate-200">admin@library.iu.edu</p>
                <p className="text-xs font-mono text-slate-400">Password: Admin@123</p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                  Enrolled Student
                </span>
                <p className="text-sm font-mono mt-1 text-slate-200">student@student.iu.edu</p>
                <p className="text-xs font-mono text-slate-400">Password: Student@123 (ID: CSE-2022-001)</p>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Database className="w-4 h-4" />
                {seeding ? "Syncing..." : "Sync / Ensure Sample Books"}
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
