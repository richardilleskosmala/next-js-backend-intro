import { NextResponse } from 'next/server';

// This function handles GET requests to /api/hello
export async function GET() {
  const responseData = {
    message: 'Hello from our Server! 👋',
    timestamp: new Date().toLocaleTimeString('sv-SE'),
  };

  // Send back a JSON response
  return NextResponse.json(responseData);
}