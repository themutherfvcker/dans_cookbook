'use client';

import { useState } from 'react';

export default function Page() {
  const [status, setStatus] = useState<string>('Idle');
  const [time, setTime] = useState<string>('');

  async function checkServer() {
    try {
      setStatus('Contacting server…');
      const res = await fetch('/api/ping');
      const data = await res.json();
      setStatus('OK');
      setTime(data.time);
    } catch (err) {
      setStatus('Error');
      setTime('');
    }
  }

  return (
    <main style={{ maxWidth: 700, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, Arial' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
        Hello! This is my AI image app starter.
      </h1>

      <p style={{ marginBottom: 16 }}>
        Click the button to check the server endpoint we created.
      </p>

      <button
        onClick={checkServer}
        style={{
          padding: '10px 16px',
          borderRadius: 8,
          border: '1px solid #ddd',
          background: '#f6d365',
          cursor: 'pointer',
          fontWeight: 700
        }}
      >
        Check server
      </button>

      <div style={{ marginTop: 16, fontSize: 14 }}>
        <div><strong>Status:</strong> {status}</div>
        {time && <div><strong>Server time:</strong> {time}</div>}
      </div>
    </main>
  );
}

