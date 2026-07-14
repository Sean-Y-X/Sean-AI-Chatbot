import { BlobNotFoundError, head } from "@vercel/blob";
import { NextResponse } from "next/server";
import { CV_FILE_NAME } from "@/constants";

export async function GET() {
  try {
    const blob = await head(CV_FILE_NAME, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.redirect(blob.url);
  } catch (error) {
    console.error("Error fetching PDF:", error);
    if (error instanceof BlobNotFoundError) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error fetching PDF" }, { status: 500 });
  }
}
