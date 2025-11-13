'use client'; // We need interactivity, so this must be a Client Component.

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