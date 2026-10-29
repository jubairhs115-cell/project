import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import config from "@/config/config.json";

export const metadata = {
  title: `${config.library.name} - Book Borrowing System`,
  description: "University Library Book Borrowing and Returning System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Suspense fallback={<header className="h-16 bg-white border-b border-slate-200" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 {config.library.name}. All rights reserved.</p>
            <p className="text-slate-500 font-medium">
              Schedule: Saturday – Thursday (8:00 AM – 5:00 PM) • <span className="text-amber-600 font-semibold">Friday Closed</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
