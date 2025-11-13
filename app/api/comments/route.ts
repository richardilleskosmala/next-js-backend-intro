import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Handles GET requests to /api/comments to fetch all comments.
export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: `Failed to fetch comments: ${error}` }, { status: 500 });
  }
}

// Handles POST requests to /api/comments to add a new comment.
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // Basic validation.
    if (!text) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    const newComment = await prisma.comment.create({
      data: { text }
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Failed to fetch comments: ${error}` }, { status: 500 });
  }
}