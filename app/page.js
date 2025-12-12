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

      // Helper to format currency
      const formatCurrency = (value) => {
              if (value === 'Custom') return 'Custom';
              return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
      };

      // Helper to format square footage
      const formatSqFt = (value) => {
              return new Intl.NumberFormat('en-US').format(value) + ' sq ft';
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

{/* Pricing Section */}
{results.pricing && (
                <Section title="💰 Pricing Estimate">
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '16px',
                    marginBottom: '16px'
}}>
{/* Total Square Footage Card */}
                <div style={{
                                      padding: '20px',
                                      backgroundColor: '#f0f9ff',
                                      borderRadius: '12px',
                                      border: '1px solid #bae6fd'
                }}>
                  <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '4px' }}>Total Venue Space</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c4a6e' }}>
{formatSqFt(results.pricing.total_square_footage)}
</div>
    </div>

{/* Monthly List Price Card */}
                <div style={{
                                      padding: '20px',
                                      backgroundColor: '#f0fdf4',
                                      borderRadius: '12px',
                                      border: '1px solid #bbf7d0'
                }}>
                  <div style={{ fontSize: '14px', color: '#15803d', marginBottom: '4px' }}>Monthly List Price</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#14532d' }}>
{formatCurrency(results.pricing.monthly_list)}
</div>
                  <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>/month</div>
    </div>

{/* Monthly Floor Price Card */}
                <div style={{
                                      padding: '20px',
                                      backgroundColor: '#fefce8',
                                      borderRadius: '12px',
                                      border: '1px solid #fef08a'
                }}>
                  <div style={{ fontSize: '14px', color: '#a16207', marginBottom: '4px' }}>Monthly Floor Price</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#713f12' }}>
{formatCurrency(results.pricing.monthly_floor)}
</div>
                  <div style={{ fontSize: '12px', color: '#ca8a04', marginTop: '4px' }}>/month (min $300)</div>
    </div>

{/* Setup Fee Card */}
                <div style={{
                                      padding: '20px',
                                      backgroundColor: '#fdf4ff',
                                      borderRadius: '12px',
                                      border: '1px solid #f5d0fe'
                }}>
                  <div style={{ fontSize: '14px', color: '#86198f', marginBottom: '4px' }}>One-Time Setup Fee</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#581c87' }}>
{formatCurrency(results.pricing.setup_fee.list)}
</div>
                  <div style={{ fontSize: '12px', color: '#a855f7', marginTop: '4px' }}>
                    Floor: {formatCurrency(results.pricing.setup_fee.floor)}
</div>
    </div>
    </div>

{/* Pricing Summary Table */}
              <div style={{ 
                                  backgroundColor: '#f8fafc', 
                                  padding: '16px', 
                                  borderRadius: '8px',
                                  border: '1px solid #e2e8f0'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                                      <tr>
                                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #cbd5e1' }}>Pricing Component</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '2px solid #cbd5e1' }}>List Price</th>
                      <th style={{ textAlign: 'right', padding: '8px', borderBottom: '2px solid #cbd5e1' }}>Floor Price</th>
                  </tr>
                  </thead>
                  <tbody>
                                      <tr>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Monthly Platform Fee</td>
                      <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{formatCurrency(results.pricing.monthly_list)}</td>
                      <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{formatCurrency(results.pricing.monthly_floor)}</td>
                  </tr>
                    <tr>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Setup Fee (One-Time)</td>
                      <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{formatCurrency(results.pricing.setup_fee.list)}</td>
                      <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{formatCurrency(results.pricing.setup_fee.floor)}</td>
                  </tr>
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>
                      <td style={{ padding: '8px' }}>First Year Total</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>
{typeof results.pricing.setup_fee.list === 'number' 
                           ? formatCurrency(results.pricing.monthly_list * 12 + results.pricing.setup_fee.list)
                              : 'Custom'}
</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>
{typeof results.pricing.setup_fee.floor === 'number'
                           ? formatCurrency(results.pricing.monthly_floor * 12 + results.pricing.setup_fee.floor)
                              : 'Custom'}
</td>
    </tr>
    </tbody>
    </table>
    </div>
    </Section>
          )}

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
