"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, BookOpen, ChevronLeft, ChevronRight, RefreshCw, X } from "lucide-react";
import BookCard from "@/components/BookCard";
import Message from "@/components/Message";
import config from "@/config/config.json";

function BooksList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialAvailable = searchParams.get("available") || "all";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ totalBooks: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [borrowingId, setBorrowingId] = useState(null);
  const [user, setUser] = useState(null);

  // Local filter states
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [available, setAvailable] = useState(initialAvailable);

  // Fetch current user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category && category !== "All") params.set("category", category);
      if (available === "true") params.set("available", "true");
      params.set("page", String(initialPage));

      const res = await fetch(`/api/books?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load books.");
      }

      const data = await res.json();
      setBooks(data.books || []);
      setPagination(data.pagination || { totalBooks: 0, totalPages: 1, currentPage: 1 });
    } catch (err) {
      setError(err.message || "Failed to load books. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [q, category, available, initialPage, router]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const updateFilters = (newQ, newCat, newAvail, newPage = 1) => {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newCat && newCat !== "All") params.set("category", newCat);
    if (newAvail === "true") params.set("available", "true");
    if (newPage > 1) params.set("page", String(newPage));

    router.push(`/books?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters(q, category, available, 1);
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    updateFilters(q, newCat, available, 1);
  };

  const handleAvailableChange = (e) => {
    const newAvail = e.target.value;
    setAvailable(newAvail);
    updateFilters(q, category, newAvail, 1);
  };

  const handleClearFilters = () => {
    setQ("");
    setCategory("All");
    setAvailable("all");
    router.push("/books");
  };

  const handleBorrow = async (book) => {
    if (!user) {
      router.push(`/login?redirect=/books/${book._id}`);
      return;
    }

    setBorrowingId(book._id);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch("/api/borrowings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book._id }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Could not borrow book." });
      } else {
        setFeedback({
          type: "success",
          message: `Success! You borrowed "${book.title}". Due date is ${new Date(
            data.borrowing.dueDate
          ).toLocaleDateString()}.`,
        });
        fetchBooks();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while borrowing. Please try again." });
    } finally {
      setBorrowingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Library Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, and borrow books from {config.library.name}
          </p>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{pagination.totalBooks}</span> total titles
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback.message && (
        <Message
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: "", message: "" })}
        />
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Filters:
            </span>
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={handleCategoryChange}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Categories</option>
            {config.books.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Availability Dropdown */}
          <select
            value={available}
            onChange={handleAvailableChange}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Availability</option>
            <option value="true">Available Now (Copies &gt; 0)</option>
          </select>

          {(q || category !== "All" || available !== "all") && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content State Rendering */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse p-4 space-y-4">
              <div className="h-32 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-200 rounded-md w-1/2" />
              <div className="h-8 bg-slate-200 rounded-lg mt-6" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-3">
          <p className="text-rose-600 font-semibold">{error}</p>
          <button
            onClick={fetchBooks}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 opacity-75" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No books match your search</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            We couldn't find any books matching your query or filter criteria. Try adjusting your search term or clearing filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          {/* Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                user={user}
                onBorrow={handleBorrow}
                isBorrowing={borrowingId === book._id}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                disabled={pagination.currentPage <= 1}
                onClick={() => updateFilters(q, category, available, pagination.currentPage - 1)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-sm text-slate-600 font-medium">
                Page <span className="font-bold text-slate-900">{pagination.currentPage}</span> of{" "}
                <span className="font-bold text-slate-900">{pagination.totalPages}</span>
              </span>

              <button
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => updateFilters(q, category, available, pagination.currentPage + 1)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading catalog...</div>}>
      <BooksList />
    </Suspense>
  );
}

