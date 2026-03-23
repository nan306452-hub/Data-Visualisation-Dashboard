import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie");

  if (!cookie || !cookie.includes("auth=true")) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ message: "Authenticated" });
}