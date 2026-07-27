import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(process.env.CV_FILE_URL!);
}
