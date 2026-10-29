"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, BookmarkPlus } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function BookCard({ book, onBorrow, isBorrowing, user }) {
  const isAvailable = (book.availableCopies || 0) > 0;
  const isStudent = user?.role === "student";

  // Category gradients for realistic cover art feel
  const categoryGradients = {
    "Computer Science": "from-cyan-600 to-blue-700",
    "Mathematics": "from-indigo-600 to-purple-700",
    "Physics": "from-violet-600 to-fuchsia-700",
    "Literature": "from-amber-600 to-orange-700",
    "Islamic Studies": "from-emerald-600 to-teal-800",
    "General": "from-slate-600 to-slate-800",
  };

  const gradient = categoryGradients[book.category] || "from-indigo-600 to-blue-700";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Cover Header Graphic */}
      <div className={`h-36 bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between text-white relative overflow-hidden`}>
        <div className="flex items-center justify-between z-10">
          <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
            {book.category}
          </span>
          <BookOpen className="w-5 h-5 opacity-75" />
        </div>
        <div className="z-10">
          <p className="text-xs text-white/80 font-mono tracking-tight">ISBN: {book.isbn}</p>
        </div>
        {/* Subtle decorative circles */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xs pointer-events-none" />
      </div>

      {/* Book Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="mb-2">
            <StatusBadge
              availableCopies={book.availableCopies}
              totalCopies={book.totalCopies}
            />
          </div>

          <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-2 group-hover:text-indigo-600 transition">
            <Link href={`/books/${book._id}`}>{book.title}</Link>
          </h3>

          <p className="text-sm text-slate-600 mt-1 line-clamp-1 font-medium">
            By {book.author}
          </p>

          {book.description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2">
              {book.description}
            </p>
          )}
        </div>

        {/* Action Button & Details Link */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Link
            href={`/books/${book._id}`}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            View Details →
          </Link>

          {isStudent ? (
            <button
              onClick={() => onBorrow && onBorrow(book)}
              disabled={!isAvailable || isBorrowing}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                isAvailable
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              {isBorrowing ? "Processing..." : isAvailable ? "Borrow" : "Out of Stock"}
            </button>
          ) : !user ? (
            <Link
              href={`/login?redirect=/books/${book._id}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              Log in to Borrow
            </Link>
          ) : (
            <span className="text-xs text-slate-400 font-medium">
              Copies: {book.availableCopies}/{book.totalCopies}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

