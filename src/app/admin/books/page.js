"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  X,
  Layers,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Message from "@/components/Message";
import config from "@/config/config.json";

export default function AdminBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: config.books.categories[0] || "Computer Science",
    description: "",
    totalCopies: 3,
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const loadBooks = async () => {
    try {
      const res = await fetch("/api/books?limit=100");
      if (res.status === 401 || res.status === 403) {
        router.push("/login?redirect=/admin/books");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load books." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: "",
      author: "",
      isbn: "",
      category: config.books.categories[0] || "Computer Science",
      description: "",
      totalCopies: 3,
    });
    setModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      description: book.description || "",
      totalCopies: book.totalCopies,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      const url = editingBook ? `/api/books/${editingBook._id}` : "/api/books";
      const method = editingBook ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Save operation failed." });
      } else {
        setFeedback({
          type: "success",
          message: editingBook ? "Book updated successfully!" : "New book added to library catalog!",
        });
        setModalOpen(false);
        loadBooks();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bookId) => {
    setFeedback({ type: "", message: "" });
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to delete book." });
      } else {
        setFeedback({ type: "success", message: "Book deleted from catalog." });
        loadBooks();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while deleting." });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const matchesQ =
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || b.category === selectedCategory;
    return matchesQ && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Catalog Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Add new acquisitions, update copies, or manage library titles
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Book
        </button>
      </div>

      {feedback.message && (
        <Message
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: "", message: "" })}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Categories</option>
          {config.books.categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Books Table */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-slate-200" />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No books found matching criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Book Details</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">ISBN</th>
                  <th className="py-3.5 px-6">Copies</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 leading-snug">{book.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">By {book.author}</p>
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-700">{book.category}</td>
                    <td className="py-4 px-6 text-xs font-mono text-slate-500">{book.isbn}</td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-900">
                      {book.availableCopies} avail / {book.totalCopies} total
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge
                        availableCopies={book.availableCopies}
                        totalCopies={book.totalCopies}
                      />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(book)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Book"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(book._id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scaleIn space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBook ? "Edit Book Details" : "Add New Acquisition"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Operating System Concepts"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Author(s) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g. Abraham Silberschatz"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="978-013..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Total Copies *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {config.books.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Synopsis
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional book synopsis or shelf notes..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingBook ? "Update Book" : "Create Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete this book? This action cannot be completed if there are any active student borrowings.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2 px-3 border border-slate-300 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

