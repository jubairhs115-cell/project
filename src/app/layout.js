import { Suspense } from "react";
import Image from "next/image";
import "./globals.css";
import Navbar from "@/components/Navbar";
import config from "@/config/config.json";

export const metadata = {
  title: `${config.library.name} - ${config.library.university}`,
  description: "Official Library Management Portal of Khademul Haramain King Fahad Central Library, Islamic University, Kushtia, Bangladesh.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
        <Suspense fallback={<header className="h-20 bg-white border-b border-slate-200" />}>
          <Navbar />
        </Suspense>

        <main className="flex-1">{children}</main>

        <footer className="bg-slate-900 text-slate-300 border-t border-emerald-950 pt-12 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
              {/* Brand info */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                    <Image
                      src="/iu-logo.png"
                      alt="Islamic University Logo"
                      width={44}
                      height={44}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">
                      {config.library.name}
                    </h3>
                    <p className="text-xs text-emerald-400 font-medium">
                      {config.library.university}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                  Housed in a 32,320 sq. ft. 3-storey building with a 600-seat capacity, 
                  the King Fahad Central Library holds more than 103,408 books, 30,000+ manuscripts, 
                  19,029 foreign journals, and digital access to IEEE, ACM, JSTOR, Springer, and ScienceDirect.
                </p>

                <p className="text-xs text-slate-500">
                  Campus Address: Islamic University, Kushtia - 7003, Bangladesh.
                </p>
              </div>

              {/* Operating Hours */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Library Schedule
                </h4>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex justify-between border-b border-slate-800 pb-1">
                    <span>Saturday – Thursday:</span>
                    <strong className="text-white">9:00 AM – 8:00 PM</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-800 pb-1">
                    <span>Friday (Weekly Off):</span>
                    <strong className="text-amber-400">Closed</strong>
                  </li>
                  <li className="text-[11px] text-slate-400 pt-1">
                    * Wi-Fi and Reading Halls remain open during all scheduled office hours.
                  </li>
                </ul>
              </div>

              {/* Internal Facilities & University Links */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Facilities & Portals
                </h4>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li>
                    <a
                      href="https://www.iu.ac.bd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-300 hover:text-white transition underline"
                    >
                      Official IU Website (iu.ac.bd) ↗
                    </a>
                  </li>
                  <li className="text-slate-400">UDL (UGC Digital Library)</li>
                  <li className="text-slate-400">Bangabandhu & Muktijuddho Corner</li>
                  <li className="text-slate-400">Ekushey Corner & Thesis Archive</li>
                  <li className="text-slate-400">24/7 CCTV & Automated Barcoding</li>
                </ul>
              </div>
            </div>

            {/* Bottom copyright */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
              <p>© 2026 {config.library.name}, {config.library.university}. All rights reserved.</p>
              <p className="text-slate-400">
                Department of Computer Science & Engineering (CSE) • Web Engineering
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
