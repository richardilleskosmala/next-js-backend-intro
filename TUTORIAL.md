# Next.js Backend Introduction Tutorial

## Session 1: Setting Up the Project

### Step 1: Create a New Next.js Project

```bash
npx create-next-app@latest nextjs-backend-intro
```

### Step 2: Project Configuration

When prompted, answer the following questions:

1. **"Would you like to use TypeScript?"** (Yes)
   - "It's JavaScript with superpowers. It helps catch common bugs and typos as we code, before we even run the application. It's the modern standard for building reliable apps."

2. **"Would you like to use ESLint?"** (Yes)
   - "This is a code spell-checker. It automatically finds and sometimes fixes style mistakes and common errors, keeping our code clean and consistent."

3. **"Would you like to use Tailwind CSS?"** (Yes)
   - "It's a modern way to style our app. It lets us add styles directly in our HTML with helper classes. We won't focus on it, but it's great to have."

4. **"Would you like to use the src/ directory?"** (No)
   - "It's just an extra folder for organization. For our workshop, saying 'No' gives us a simpler, flatter file structure which is easier to navigate."

5. **"Would you like to use App Router?"** (Yes)
   - "This is the new and recommended way Next.js handles pages. The backend features we're learning today are built specifically for the App Router, so this is essential."

6. **"Would you like to use Turbopack for development?"** (No)
   - "This is an experimental, super-fast engine for the development server. 🚀 It's exciting but still in beta, which means it might have bugs. We'll say 'No' to stick with the stable, default engine and ensure everything runs smoothly for our workshop. Turbopack is a high-speed tool that compiles and bundles your code to prepare it for the browser."

7. **"Would you like to customize the default import alias?"** (No)
   - "This is a shortcut for file paths. The default setting is perfect for us, so we'll just hit Enter to accept it without changing anything."

   ```typescript
   import Button from '../../components/Button'; // 😬 Awkward and can break if you move files
   import Button from '@/components/Button'; // ✅ Clean, simple, and won't break easily
   ```

### Step 3: Start the Development Server

```bash
npm run dev
```

Check that our app is running as expected with NextJS default page.

### Step 4: Create Your First API Endpoint

Create an "api" folder inside "app". Create a "hello" folder inside "api".

Create `app/api/hello/route.ts`:

```typescript
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
```

### Step 5: Test Your API

Open in the browser: http://localhost:3000/api/hello

You should see your JSON data on the screen.

### Step 6: Connect Frontend to Backend

Update your homepage (`app/page.tsx`):

```tsx
'use client';

import { useState, useEffect } from 'react';

// A type for our API response data
type HelloResponse = {
  message: string;
  timestamp: string;
};

export default function Home() {
  const [data, setData] = useState<HelloResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data from our own API endpoint
    fetch('/api/hello')
      .then((res) => res.json())
      .then((apiData) => {
        setData(apiData);
        setIsLoading(false);
      });
  }, []); // The empty array ensures this runs only once.

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Connecting Frontend to Backend</h1>
      <div>
        {isLoading ? (
          <p>Loading data from the server...</p>
        ) : (
          <blockquote>
            <p>"{data?.message}"</p>
            <footer>- Fetched at {data?.timestamp}</footer>
          </blockquote>
        )}
      </div>
    </main>
  );
}
```

### Understanding Client Components

This will fail initially because by default Next.js tries to do server-side rendering of the component, which is not compatible with components that use features that need to run in the client, such as:

- React Hooks for interactivity like `useState`, `useEffect` or `useReducer`
- Event Listeners, `onClick`, `onChange`, or `onSubmit`
- Browser only APIs, like `window`, `document` or `localStorage`

**Why are Server Components the Default?**
Server Components are powerful because they can do work on the server before sending the page to the user. This means they can fetch data directly and they don't send unnecessary JavaScript to the browser, making your site load faster.

If we need any of the previously mentioned features, we just need to add this to our page/component:

```tsx
'use client'
```

Check that you are fetching correctly from the page. If you have a "This hydration error" this is probably because of some browser extension.

## Session 2: Interactive Backend

Last time, we built a simple backend that we could read data from. Today, we're going to make it interactive. We'll learn how to write data to our backend by handling user input from a form, and then we'll learn how to fetch specific pieces of data using dynamic URLs.

### Step 1: Create a Comments API

Create a new folder inside "api" called "comments". Inside this new folder, create a file `route.ts`:

```typescript
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
```

Notice we have two functions in one file. `GET` is for fetching data, and `POST` is for receiving new data. The key line in `POST` is `await request.json()`, which is how we access the information sent from the frontend.

### Step 2: Create the Guestbook Frontend

Inside the app folder, create a folder called "guestbook", and inside create a file called `page.tsx`:

```tsx
'use client'; // We need interactivity, so this must be a Client Component.

import { useState, useEffect, FormEvent } from 'react';

type Comment = {
  id: number;
  text: string;
};

export default function GuestbookPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  // Function to get the latest comments from our API.
  const fetchComments = async () => {
    const response = await fetch('/api/comments');
    const data = await response.json();
    setComments(data);
  };

  // Fetch the initial comments when the page loads.
  useEffect(() => {
    fetchComments();
  }, []);

  // This function runs when the user submits the form.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevents the page from reloading.

    // Send the new comment to our API endpoint.
    await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newComment }),
    });

    setNewComment(''); // Clear the input field.
    fetchComments(); // Reload the comments to show the new one.
  };

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>Guestbook</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          style={{ width: '80%', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px' }}>Post</button>
      </form>
      <hr style={{ margin: '1rem 0' }} />
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>{comment.text}</li>
        ))}
      </ul>
    </main>
  );
}
```

The most important part here is the `handleSubmit` function. Notice the fetch call has new options: `method: 'POST'` tells the server we're sending data, and the body contains the comment text, which we convert to a JSON string.

### Step 3: Test Your Guestbook

Go to http://localhost:3000/guestbook

You should see the initial two comments. Try typing a new comment in the form and clicking "Post". It should appear in the list! 🎉

## Session 3: Adding a Real Database

So far, we've been using an in-memory array that resets every time the server restarts. Let's add a real database to make our data persistent!

### Step 1: Install Prisma and SQLite

Prisma is a modern database toolkit that makes working with databases easy and type-safe. Instead of writing complex SQL queries, you write JavaScript that looks like your data structure.

**Example - Traditional approach vs Prisma:**

```sql
-- Traditional SQL (complex and error-prone)
SELECT c.*, u.name FROM comments c 
JOIN users u ON c.user_id = u.id 
WHERE c.created_at > '2024-01-01' 
ORDER BY c.created_at DESC 
LIMIT 10;
```

```typescript
// Prisma (simple and readable)
const comments = await prisma.comment.findMany({
  include: { user: true },
  where: { createdAt: { gt: new Date('2024-01-01') } },
  orderBy: { createdAt: 'desc' },
  take: 10
});
```

**What you get with Prisma:**
- ✅ **Auto-completion** - Your IDE knows what fields exist
- ✅ **Type safety** - TypeScript catches errors before runtime
- ✅ **Readable code** - Looks like JavaScript, not database syntax
- ✅ **Automatic types** - No need to manually define interfaces

SQLite is a lightweight database that doesn't require any setup - it's just a file on your computer (like `dev.db`). Unlike other databases that need separate servers, SQLite runs entirely within your application. It's perfect for learning because:
- **No installation required** - it's built into most systems
- **No server setup** - just a file that stores your data
- **Perfect for development** - easy to reset, backup, and share
- **Real database features** - supports all the database operations you'll need

```bash
npm install prisma @prisma/client
npm install -D prisma
```

### Step 2: Initialize Prisma

```bash
npx prisma init --datasource-provider sqlite
```

This creates a `prisma` folder with a `schema.prisma` file and a `.env` file.

**Important**: If you get a `prisma.config.ts` file, you need to add the dotenv import to load environment variables. Update the file to include:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### Step 2.1: Install dotenv dependency

```bash
npm install dotenv
```

### Step 2.2: Create .env file with DATABASE_URL

Create a new file called `.env` in your project root (same folder as `package.json`) and add this content:

```env
DATABASE_URL="file:./dev.db"
```

### Step 2.3: Update Prisma schema

Update `prisma/schema.prisma` to use the standard Prisma client and add the Comment model:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Comment {
  id        Int      @id @default(autoincrement())
  text      String
  createdAt DateTime @default(now())
}
```

### Step 2.4: Create and run initial migration

```bash
npx prisma migrate dev --name init
```

This will:
- Create the SQLite database file (`dev.db`)
- Generate the migration files
- Apply the migration to create the Comment table
- Generate the Prisma Client automatically

### Step 3: Define Your Database Schema

Update `prisma/schema.prisma`:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Comment {
  id        Int      @id @default(autoincrement())
  text      String
  createdAt DateTime @default(now())
}
```

### Step 4: Create and Run Database Migration

```bash
npx prisma migrate dev --name init
```

This creates the database file and the `Comment` table.

### Step 5: Generate Prisma Client

```bash
npx prisma generate
```

### Step 6: Update Your API to Use the Database

Replace the content of `app/api/comments/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Handles GET requests to /api/comments to fetch all comments.
export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
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
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
```

### Step 7: Seed Your Database with Initial Data

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create some initial comments
  await prisma.comment.createMany({
    data: [
      { text: 'This is the first comment.' },
      { text: 'What a great series!' },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add this to your `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Install tsx for running TypeScript files:

```bash
npm install -D tsx
```

Run the seed:

```bash
npx prisma db seed
```

### Step 8: Update Your Frontend Types

Update your guestbook page to handle the new database structure:

```tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';

type Comment = {
  id: number;
  text: string;
  createdAt: string; // Now we have timestamps!
};

export default function GuestbookPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  // Function to get the latest comments from our API.
  const fetchComments = async () => {
    const response = await fetch('/api/comments');
    const data = await response.json();
    setComments(data);
  };

  // Fetch the initial comments when the page loads.
  useEffect(() => {
    fetchComments();
  }, []);

  // This function runs when the user submits the form.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newComment }),
    });

    setNewComment('');
    fetchComments();
  };

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>Guestbook</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          style={{ width: '80%', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px' }}>Post</button>
      </form>
      <hr style={{ margin: '1rem 0' }} />
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <p>{comment.text}</p>
            <small style={{ color: '#666' }}>
              Posted at {new Date(comment.createdAt).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### Step 9: Test Your Database Integration

1. Restart your development server: `npm run dev`
2. Go to http://localhost:3000/guestbook
3. Add a new comment
4. Restart your server and refresh the page
5. **Your comments should still be there!** 🎉

### Step 10: Explore Your Database

You can view your database using Prisma Studio:

```bash
npx prisma studio
```

This opens a web interface where you can see all your comments and even edit them directly!

## Troubleshooting Common Issues

### Issue: "Missing required environment variable: DATABASE_URL"

**Solution**: Make sure your `.env` file exists in the project root and contains:
```env
DATABASE_URL="file:./dev.db"
```

If you have a `prisma.config.ts` file, add this import at the top:
```typescript
import "dotenv/config";
```

### Issue: "Prisma Client has not been generated yet"

**Solution**: Run:
```bash
npx prisma generate
```

### Issue: "Database does not exist"

**Solution**: Run:
```bash
npx prisma migrate dev --name init
```

### Issue: "Cannot find module '@prisma/client'"

**Solution**: Install the client:
```bash
npm install @prisma/client
```

### Issue: Comments disappear after server restart

**Solution**: Make sure you've completed all the database setup steps and are using the updated API routes with Prisma, not the in-memory array.

## What We've Accomplished

- ✅ **Real Database**: Your data now persists between server restarts
- ✅ **Type Safety**: Prisma gives you full TypeScript support for your database
- ✅ **Automatic Timestamps**: Comments now have creation dates
- ✅ **Database Migrations**: Easy to add new fields or tables
- ✅ **Database GUI**: Prisma Studio for easy database management

## Key Database Concepts Learned

- **Schema Definition**: How to define your data structure
- **Migrations**: How to update your database structure
- **CRUD Operations**: Create, Read, Update, Delete data
- **Type Safety**: How TypeScript works with databases
- **Data Persistence**: Why databases matter for real applications

## Summary

You've now built a complete full-stack application with:

- ✅ A Next.js project with TypeScript and modern tooling
- ✅ API routes for both reading (GET) and writing (POST) data
- ✅ A React frontend that connects to your backend
- ✅ Form handling and state management
- ✅ Real-time data updates
- ✅ **A real database with persistent data storage**
- ✅ **Type-safe database operations**
- ✅ **Database migrations and schema management**

This foundation gives you everything you need to build more complex applications with user authentication, advanced features, and production deployment!

