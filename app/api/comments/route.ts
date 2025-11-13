import { NextResponse } from 'next/server';

// This is our temporary "in-memory database".
// It's just a simple array that will reset if the server restarts.
const comments = [
  { id: 1, text: 'This is the first comment.' },
  { id: 2, text: 'What a great series!' },
];

// Handles GET requests to /api/comments to fetch all comments.
export async function GET() {
  return NextResponse.json(comments);
}

// Handles POST requests to /api/comments to add a new comment.
export async function POST(request: Request) {
  // We read the data the user sent in the request body.
  const { text } = await request.json();

  // Basic validation.
  if (!text) {
    return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
  }

  const newComment = {
    id: comments.length + 1, // Create a new ID.
    text: text,
  };

  comments.push(newComment);

  // Return the new comment with a 201 "Created" status.
  return NextResponse.json(newComment, { status: 201 });
}