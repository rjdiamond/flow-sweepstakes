import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import './App.css';

function formatNumber(num) {
  return num.toLocaleString();
}

const SWEEPSTAKES_DESCRIPTION =
  "Turn digital history into a centerpiece. This CryptoSlab showcases Caitlin Clark’s WNBA Top Shot rookie moment — her official debut from May 14, 2024 — in a stunning physical display. Limited to just 1,250 minted, it’s a rare and iconic collectible for any true fan.\nYou’ll receive both the physical CryptoSlab and the official Top Shot moment — ready to display, flex, and own forever.\nEnter now for a shot at owning this landmark moment in basketball history.";

// Set your sweepstakes end date/time here (PDT)
const SWEEPSTAKES_END = new Date('2025-07-17T22:00:00-07:00'); // July 18, 2025, 10:00:00 PM PDT

function useCountdown(endTime) {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, endTime - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);
  const d = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const h = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const m = Math.floor((timeLeft / (1000 * 60)) % 60);
  const s = Math.floor((timeLeft / 1000) % 60);
  return { d, h, m, s, expired: timeLeft <= 0 };
}

function App() {
  const [data, setData] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [topEntrant, setTopEntrant] = useState(0);
  const [uniqueWallets, setUniqueWallets] = useState(0);

  // Tooltip state for info icon
  const [showTooltip, setShowTooltip] = useState(false);

  // MS-DOS style loading animation state
  const [loadingStep, setLoadingStep] = useState(0);
  const [minLoading, setMinLoading] = useState(true);
  useEffect(() => {
    if (loading) {
      setLoadingStep(0);
      setMinLoading(true);
      const steps = [
        'Loading sweepstakes...',
        'Loading entries...',
        'Almost there...'
      ];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % steps.length;
        setLoadingStep(i);
      }, 900);
      // Minimum loading time
      const minTimer = setTimeout(() => setMinLoading(false), 3500);
      return () => {
        clearInterval(interval);
        clearTimeout(minTimer);
      };
    } else {
      setMinLoading(false);
    }
  }, [loading]);

  const countdown = useCountdown(SWEEPSTAKES_END);

  useEffect(() => {
    fetch('https://flow-sweepstakes-backend.onrender.com/')
      .then((res) => res.json())
      .then((rows) => {
        // rows is an array of arrays: [[address, tokenId, quantity], ...]
        const parsed = rows.map(([wallet, , quantity]) => ({
          wallet,
          shortWallet: wallet.slice(0, 6) + '...' + wallet.slice(-4),
          tickets: Number(quantity),
        }));
        // Sort descending by tickets
        parsed.sort((a, b) => b.tickets - a.tickets);
        // Calculate totals
        const total = parsed.reduce((sum, row) => sum + row.tickets, 0);
        setTotalEntries(total);
        setTopEntrant(parsed.length > 0 ? parsed[0].tickets : 0);
        setUniqueWallets(parsed.length);
        // Limit to top 10 for the chart
        setData(parsed.slice(0, 10));
        setAllEntries(parsed);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  // For even Y-axis grid: calculate max tickets in top 10, round up to nearest nice number
  const maxTickets = data.length > 0 ? Math.max(...data.map(d => d.tickets)) : 0;
  // Find a nice round number for the Y-axis max
  function niceMax(num) {
    if (num === 0) return 10;
    const exponent = Math.floor(Math.log10(num));
    const factor = Math.pow(10, exponent);
    return Math.ceil(num / factor) * factor;
  }
  const yMax = niceMax(maxTickets);

  return (
    <div className="app-container">
      <h1 style={{ color: '#00EF8B' }}>Flow Rewards Sweepstakes #11</h1>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginBottom: '0.5rem', marginTop: '.5rem' }}>
        <a
          className="subtitle"
          href="https://store.flow.com/minting/contracts/4726f599-2383-48c8-b368-9ae55d5f2724/sweepstakes/373e9b19-db45-4b6d-ad71-861a61cc7a67"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#BFFFE6', textDecoration: 'underline', fontSize: '1.1rem', display: 'inline-block', marginBottom: 0 }}
        >
          Caitlin Clark Debut Moment & CryptoSlab
        </a>
        <span
          style={{ color: '#BFFFE6', fontSize: '1rem', cursor: 'pointer', position: 'relative', marginTop: 0 }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          tabIndex={0}
        >
          Description (Hover For Details)
          {showTooltip && (
            <span
              style={{
                position: 'absolute',
                left: '50%',
                top: '1.7rem',
                transform: 'translateX(-50%)',
                background: '#181F26',
                color: '#BFFFE6',
                border: '1px solid #222',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '1rem',
                minWidth: '260px',
                maxWidth: '340px',
                zIndex: 10,
                boxShadow: '0 4px 24px 0 rgba(0,239,139,0.13)',
                whiteSpace: 'pre-line',
              }}
              role="tooltip"
            >
              {SWEEPSTAKES_DESCRIPTION}
            </span>
          )}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#BFFFE6', fontSize: '1.1rem', letterSpacing: '0.5px' }}>Total Entries</div>
          <div style={{ color: '#00EF8B', fontSize: '2.2rem', fontWeight: 600 }}>{formatNumber(totalEntries)}</div>
        </div>
        <div>
          <div style={{ color: '#BFFFE6', fontSize: '1.1rem', letterSpacing: '0.5px' }}>Top Entrant</div>
          <div style={{ color: '#00EF8B', fontSize: '2.2rem', fontWeight: 600 }}>{formatNumber(topEntrant)}</div>
        </div>
        <div>
          <div style={{ color: '#BFFFE6', fontSize: '1.1rem', letterSpacing: '0.5px' }}>Unique Wallets</div>
          <div style={{ color: '#00EF8B', fontSize: '2.2rem', fontWeight: 600 }}>{formatNumber(uniqueWallets)}</div>
        </div>
        <div>
          <div style={{ color: '#BFFFE6', fontSize: '1.1rem', letterSpacing: '0.5px' }}>Time Left</div>
          <div style={{ color: countdown.expired ? 'red' : '#00EF8B', fontSize: '2.2rem', fontWeight: 700 }}>
            {countdown.expired
              ? 'Ended'
              : `${String(countdown.d).padStart(2, '0')}d ${String(countdown.h).padStart(2, '0')}h ${String(countdown.m).padStart(2, '0')}m ${String(countdown.s).padStart(2, '0')}s`}
          </div>
        </div>
      </div>
      {loading || minLoading ? (
        <div style={{
          background: 'linear-gradient(135deg, #10141A 0%, #00EF8B 100%)',
          color: '#00EF8B',
          fontFamily: 'monospace',
          fontSize: '1.5rem',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          boxShadow: '0 0 24px 0 rgba(0,239,139,0.13)',
          border: '2px solid #00EF8B',
          margin: '2rem',
          letterSpacing: '1px',
          position: 'relative',
        }}>
          <div style={{
            background: '#181F26',
            border: '2px solid #00CFFF',
            borderRadius: '8px',
            padding: '2.5rem 2.5rem 2rem 2.5rem',
            minWidth: 320,
            maxWidth: 420,
            boxShadow: '0 0 16px 0 #00CFFF44',
            textAlign: 'left',
          }}>
            <div style={{ color: '#00CFFF', marginBottom: '1.5rem', fontWeight: 700, fontSize: '2rem', textShadow: '0 0 8px #00EF8B' }}>&gt;_</div>
            <div style={{ color: '#BFFFE6', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Flow Rewards Sweepstakes</div>
            <div style={{ color: '#00EF8B', fontSize: '1.1rem', minHeight: '2.2em' }}>
              {['Loading sweepstakes...', 'Loading entries...', 'Almost there...'][loadingStep]}
            </div>
            <div style={{ color: '#00CFFF', fontSize: '0.95rem', marginTop: '2.5rem', opacity: 0.7 }}>
              Please wait
            </div>
          </div>
        </div>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <ResponsiveContainer width="95%" height={600}>
              <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#BFFFE6" strokeDasharray="3 3" />
                <XAxis dataKey={d => '0x..' + d.wallet.slice(-4)} tick={{ fontSize: 14, fill: '#00976C' }} />
                <YAxis tick={{ fontSize: 14, fill: '#00976C' }} domain={[0, yMax]} tickCount={8} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#00EF8B', color: '#00976C' }} cursor={{ fill: '#BFFFE6' }} />
                <Legend wrapperStyle={{ color: '#00976C' }} />
                <Bar dataKey="tickets" name=" Tickets" fill="#00EF8B" radius={[8, 8, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '2.5rem' }}>
            <h2 style={{ color: '#BFFFE6', fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 500 }}>All Entries</h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '90%', minWidth: 320, maxWidth: 1200 }}>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ maxHeight: '210px', overflowY: 'auto', borderRadius: '10px', border: '1px solid #222' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(16,20,26,0.95)' }}>
                      <thead>
                        <tr>
                          <th style={{ color: '#BFFFE6', fontWeight: 600, padding: '0.3rem 0.5rem', textAlign: 'center', borderBottom: '1px solid #222' }}>#</th>
                          <th style={{ color: '#BFFFE6', fontWeight: 600, padding: '0.3rem 0.5rem', textAlign: 'center', borderBottom: '1px solid #222' }}>Wallet</th>
                          <th style={{ color: '#BFFFE6', fontWeight: 600, padding: '0.3rem 0.5rem', textAlign: 'center', borderBottom: '1px solid #222' }}>Tickets</th>
                          <th style={{ color: '#BFFFE6', fontWeight: 600, padding: '0.3rem 0.5rem', textAlign: 'center', borderBottom: '1px solid #222' }}>% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allEntries.map((row, i) => (
                          <tr key={row.wallet} style={{ borderBottom: '1px solid #222' }}>
                            <td style={{ color: '#00CFFF', padding: '0.3rem 0.5rem', textAlign: 'center', fontWeight: 700 }}>{i + 1}</td>
                            <td style={{ color: '#00EF8B', padding: '0.3rem 0.5rem', fontFamily: 'monospace', fontSize: '1rem', textAlign: 'center' }}>{row.wallet}</td>
                            <td style={{ color: '#BFFFE6', padding: '0.3rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>{formatNumber(row.tickets)}</td>
                            <td style={{ color: '#BFFFE6', padding: '0.3rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>
                              {totalEntries > 0 ? ((row.tickets / totalEntries) * 100).toFixed(2) + '%' : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
