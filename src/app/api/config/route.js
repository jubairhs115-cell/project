import { NextResponse } from "next/server";
import config from "@/config/config.json";

export async function GET() {
  return NextResponse.json({
    library: config.library,
    borrowing: config.borrowing,
    fines: config.fines,
    books: config.books,
    ui: config.ui,
  });
}

