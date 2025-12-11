'use client';

import { useState } from 'react';

export default function Home() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

  const handleScrape = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResults(null);

        try {
                const response = await fetch('/api/scrape', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ url }),
                });

          const data = await response.json();

          if (!response.ok) {
                    throw new Error(data.error || 'Failed to scrape');
          }

          setResults(data);
        } catch (err) {
                setError(err.message);
        } finally {
                setLoading(false);
        }
  };

  return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Hotel Venue Scraper</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Extract meeting rooms, floor plans, and venue data from hotel websites
          </p>

      <form onSubmit={handleScrape} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter hotel meetings/events URL (e.g., https://www.thedrakehotel.com/meetings/)"
            required
            style={{
                            flex: 1,
                            padding: '12px 16px',
                            fontSize: '16px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
                            padding: '12px 24px',
                            fontSize: '16px',
                            backgroundColor: loading ? '#ccc' : '#0070f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
{loading ? 'Scraping...' : 'Scrape'}
</button>
  </div>
  </form>

{error && (
          <div style={{ padding: '16px', backgroundColor: '#fee', borderRadius: '8px', color: '#c00', marginBottom: '24px' }}>
{error}
</div>
      )}

{results && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Results for {results.hotel_name || 'Hotel'}</h2>

{results.meeting_rooms?.length > 0 && (
              <Section title="Meeting Rooms">
                <Table
                 headers={['Name', 'Square Footage']}
                 rows={results.meeting_rooms.map(r => [r.name, r.square_footage || 'N/A'])}
              />
                </Section>
          )}

{results.hotel_room_types?.length > 0 && (
              <Section title="Hotel Room Types">
                <Table
                 headers={['Name', 'Type', 'Square Footage']}
                 rows={results.hotel_room_types.map(r => [r.name, r.type || 'N/A', r.square_footage || 'N/A'])}
              />
                </Section>
          )}

{results.restaurants_outlets?.length > 0 && (
              <Section title="Restaurants & Outlets">
                <Table
                 headers={['Name', 'Square Footage']}
                 rows={results.restaurants_outlets.map(r => [r.name, r.square_footage || 'N/A'])}
              />
                </Section>
          )}

{results.amenities?.length > 0 && (
              <Section title="Amenities">
                <Table
                 headers={['Name', 'Indoor/Outdoor']}
                 rows={results.amenities.map(r => [r.name, r.indoor_or_outdoor || 'N/A'])}
              />
                </Section>
          )}

{results.connecting_spaces?.length > 0 && (
              <Section title="Connecting Spaces">
                <Table
                 headers={['Name', 'Square Footage', 'Indoor/Outdoor']}
                 rows={results.connecting_spaces.map(r => [r.name, r.square_footage || 'N/A', r.indoor_or_outdoor || 'N/A'])}
              />
                </Section>
          )}

          <details style={{ marginTop: '24px' }}>
            <summary style={{ cursor: 'pointer', color: '#666' }}>View Raw JSON</summary>
            <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', overflow: 'auto', marginTop: '8px' }}>
{JSON.stringify(results, null, 2)}
</pre>
  </details>
  </div>
      )}
</main>
  );
}

function Section({ title, children }) {
    return (
          <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: '#333' }}>{title}</h3>
{children}
</div>
  );
}

function Table({ headers, rows }) {
    return (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
          <tr>
{headers.map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>
             {h}
             </th>
                       ))}
</tr>
  </thead>
      <tbody>
{rows.map((row, i) => (
            <tr key={i}>
  {row.map((cell, j) => (
                  <td key={j} style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{cell}</td>
                       ))}
</tr>
        ))}
</tbody>
  </table>
  );
}
