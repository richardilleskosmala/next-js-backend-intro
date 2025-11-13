'use client'; // Marks this as a component that runs in the browser.

import { useState, useEffect } from 'react';

// A type for our API response data
type HelloResponse = {
  message: string;
  timestamp: string;
};

export default function Home() {
  const [data, setData] = useState<HelloResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  console.log('Home');
  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((apiData) => {
        setData(apiData);
        setIsLoading(false);
      });
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Connecting Frontend to Backend</h1>
      <div>
        {isLoading ? (
          <p>Loading data from the server...</p>
        ) : (
          <blockquote>
            <p>{data?.message}</p>
            <footer>- Fetched at {data?.timestamp}</footer>
          </blockquote>
        )}
      </div>
    </main>
  );
}