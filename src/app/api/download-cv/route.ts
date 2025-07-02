import { head } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { CV_FILE_NAME } from '@/constants';

export default async function handler() {
  try {
    const blob = await head(CV_FILE_NAME, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return NextResponse.redirect(blob.url);
  } catch (error) {
    console.error('Error fetching PDF:', error);
    return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
  }
}