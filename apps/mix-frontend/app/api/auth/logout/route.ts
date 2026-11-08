import { NextResponse } from "next/server";

const API = process.env.API_URL || "http://127.0.0.1:8000";

export async function POST() {
  try {
    await fetch(`${API}/api/auth/logout`, { method: "POST" });
  } catch {
    /* ignore upstream */
  }
  const res = NextResponse.json({ message: "Dilët." });
  res.cookies.set("access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
