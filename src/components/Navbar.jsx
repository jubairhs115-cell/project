"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LogOut, Menu, X, User, ShieldCheck, Bookmark, History, CreditCard, LayoutDashboard } from "lucide-react";
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
        ? "bg-indigo-50 text-indigo-700 font-semibold"
        : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
    }`;
  };

  const mobileNavLinkClass = (href) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
    return `flex items-center gap-2.5 px-4 py-2.5 text-base font-medium rounded-lg ${
      isActive
        ? "bg-indigo-50 text-indigo-700 font-semibold"
        : "text-slate-700 hover:bg-slate-100"
    }`;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:bg-indigo-700 transition">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight block leading-tight">
                  {config.library.name}
                </span>
                <span className="text-xs text-slate-500 font-normal">Library Management</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/books" className={navLinkClass("/books")}>
              Browse Books
            </Link>

            {user?.role === "student" && (
              <>
                <Link href="/student/dashboard" className={navLinkClass("/student/dashboard")}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link href="/student/borrowed" className={navLinkClass("/student/borrowed")}>
                  <Bookmark className="w-4 h-4" /> My Books
                </Link>
                <Link href="/student/history" className={navLinkClass("/student/history")}>
                  <History className="w-4 h-4" /> History
                </Link>
                <Link href="/student/fines" className={navLinkClass("/student/fines")}>
                  <CreditCard className="w-4 h-4" /> Fines
                </Link>
              </>
            )}

            {user?.role === "admin" && (
              <>
                <Link href="/admin/dashboard" className={navLinkClass("/admin/dashboard")}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
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

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <span className="block text-sm font-medium text-slate-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                    {user.role === "admin" ? (
                      <span className="text-amber-600 flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span>ID: {user.studentId || "Student"}</span>
                    )}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : !loading ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {user && (
            <div className="px-4 py-3 bg-slate-50 rounded-xl mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {user.role}
              </span>
            </div>
          )}

          <Link
            href="/books"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass("/books")}
          >
            Browse Books
          </Link>

          {user?.role === "student" && (
            <>
              <Link
                href="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/student/dashboard")}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link
                href="/student/borrowed"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/student/borrowed")}
              >
                <Bookmark className="w-4 h-4" /> My Books
              </Link>
              <Link
                href="/student/history"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/student/history")}
              >
                <History className="w-4 h-4" /> Borrowing History
              </Link>
              <Link
                href="/student/fines"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/student/fines")}
              >
                <CreditCard className="w-4 h-4" /> Overdue & Fines
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
                <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
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
                Students
              </Link>
              <Link
                href="/admin/borrowings"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/admin/borrowings")}
              >
                Borrowing Records
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

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg"
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

