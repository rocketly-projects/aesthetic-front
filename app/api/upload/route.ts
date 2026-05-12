import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Require authentication
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "El archivo supera el límite de 2MB" }, { status: 400 });
  }

  const blob = await put(`logos/${Date.now()}-${file.name}`, file, { access: "public" });
  return NextResponse.json({ url: blob.url });
}
