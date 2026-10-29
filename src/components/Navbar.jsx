"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bookmark,
  History,
  CreditCard,
  LayoutDashboard,
  ExternalLink
} from "lucide-react";
import config from "@/config/config.json";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const navLinkClass = (href) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
    return `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
        : "text-slate-700 hover:text-emerald-700 hover:bg-slate-50"
    }`;
  };

  const mobileNavLinkClass = (href) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
    return `flex items-center gap-2.5 px-4 py-2.5 text-base font-medium rounded-lg ${
      isActive
        ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
        : "text-slate-700 hover:bg-slate-100"
    }`;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-emerald-900/10 shadow-xs backdrop-blur-md">
      {/* Top Green Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-xl bg-white border border-emerald-200 p-0.5 shadow-sm group-hover:shadow-md transition shrink-0 flex items-center justify-center overflow-hidden">
                <Image
                  src="/iu-logo.png"
                  alt="Islamic University Logo"
                  width={44}
                  height={44}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-tight group-hover:text-emerald-800 transition">
                  {config.library.name}
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  {config.library.university}
                  <span className="hidden sm:inline text-slate-400 font-normal">• Kushtia</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/books" className={navLinkClass("/books")}>
              Browse Catalog
            </Link>

            {user?.role === "student" && (
              <>
                <Link href="/student/dashboard" className={navLinkClass("/student/dashboard")}>
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Dashboard
                </Link>
                <Link href="/student/borrowed" className={navLinkClass("/student/borrowed")}>
                  <Bookmark className="w-4 h-4 text-emerald-600" /> My Books
                </Link>
                <Link href="/student/history" className={navLinkClass("/student/history")}>
                  <History className="w-4 h-4 text-emerald-600" /> History
                </Link>
                <Link href="/student/fines" className={navLinkClass("/student/fines")}>
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Fines
                </Link>
              </>
            )}

            {user?.role === "admin" && (
              <>
                <Link href="/admin/dashboard" className={navLinkClass("/admin/dashboard")}>
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Dashboard
                </Link>
                <Link href="/admin/books" className={navLinkClass("/admin/books")}>
                  Manage Books
                </Link>
                <Link href="/admin/students" className={navLinkClass("/admin/students")}>
                  Students
                </Link>
                <Link href="/admin/borrowings" className={navLinkClass("/admin/borrowings")}>
                  Borrowings
                </Link>
                <Link href="/admin/fines" className={navLinkClass("/admin/fines")}>
                  Fines
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Auth & External Links */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://www.iu.ac.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition border border-emerald-200"
            >
              iu.ac.bd <ExternalLink className="w-3 h-3" />
            </a>

            {!loading && user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <span className="block text-sm font-bold text-slate-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                    {user.role === "admin" ? (
                      <span className="text-amber-700 flex items-center gap-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Librarian Admin
                      </span>
                    ) : (
                      <span>ID: {user.studentId || "Student"}</span>
                    )}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : !loading ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
                >
                  Student Register
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fadeIn">
          {user && (
            <div className="px-4 py-3 bg-emerald-50/70 border border-emerald-100 rounded-xl mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {user.role}
              </span>
            </div>
          )}

          <Link
            href="/books"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass("/books")}
          >
            Browse Catalog
          </Link>

          {user?.role === "student" && (
            <>
              <Link
                href="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/student/dashboard")}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Dashboard
              </Link>
              <Link
                href="/student/borrowed"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/student/borrowed")}
              >
                <Bookmark className="w-4 h-4 text-emerald-600" /> My Borrowed Books
              </Link>
              <Link
                href="/student/history"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/student/history")}
              >
                <History className="w-4 h-4 text-emerald-600" /> Borrowing History
              </Link>
              <Link
                href="/student/fines"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/student/fines")}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" /> Overdue & Fines
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/admin/dashboard")}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Admin Dashboard
              </Link>
              <Link
                href="/admin/books"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/admin/books")}
              >
                Manage Books
              </Link>
              <Link
                href="/admin/students"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/admin/students")}
              >
                Students Directory
              </Link>
              <Link
                href="/admin/borrowings"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/admin/borrowings")}
              >
                Circulation Records
              </Link>
              <Link
                href="/admin/fines"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/admin/fines")}
              >
                Fines Management
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <a
              href="https://www.iu.ac.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl"
            >
              Visit Islamic University Portal (iu.ac.bd) <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-bold text-white bg-emerald-700 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
