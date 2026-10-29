export default function StatusBadge({ availableCopies, totalCopies, status, isOverdue, isDueSoon, fineStatus }) {
  if (isOverdue) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
        ● Overdue
      </span>
    );
  }

  if (isDueSoon) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        ⏱ Due Soon
      </span>
    );
  }

  if (fineStatus) {
    if (fineStatus === "paid") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          ✓ Paid
        </span>
      );
    }
    if (fineStatus === "waived") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          Waived
        </span>
      );
    }
    if (fineStatus === "unpaid") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          ⚠ Unpaid Fine
        </span>
      );
    }
  }

  if (status === "borrowed") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
        Borrowed
      </span>
    );
  }

  if (status === "returned") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        Returned
      </span>
    );
  }

  const copies = Number(availableCopies);
  if (copies === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
        Unavailable (0 left)
      </span>
    );
  }

  if (copies === 1) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        Only 1 left!
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
      Available ({copies} left)
    </span>
  );
}

