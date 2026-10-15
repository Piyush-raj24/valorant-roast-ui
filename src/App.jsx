import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import './App.css';

// Automatically points to VITE_API_URL or defaults to production Render API
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://valorant-roast-api.onrender.com').replace(/\/+$/, '');

const PRESET_PLAYERS = [
  { label: 'TenZ#SEN (Jett)', id: 'TenZ#SEN', region: 'na' },
  { label: 'Whiff#BOT (Reyna)', id: 'Whiff#BOT', region: 'ap' },
  { label: 'Average#Andy (Sage)', id: 'Average#Andy', region: 'eu' },
];

export default function App() {
  const [region, setRegion] = useState(() => localStorage.getItem('val_roast_region') || 'ap');
  const [riotId, setRiotId] = useState(() => localStorage.getItem('val_roast_id') || '');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [coldStartNotice, setColdStartNotice] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const cardRef = useRef(null);
  const coldStartTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('val_roast_region', region);
  }, [region]);

  useEffect(() => {
    localStorage.setItem('val_roast_id', riotId);
  }, [riotId]);

  const executeFetch = async (targetRegion, targetId) => {
    if (!targetId || !targetId.includes('#')) {
      setError('Please enter a valid Riot ID in Name#Tag format (e.g. TenZ#SEN or WinSake#INDIA).');
      return;
    }

    const parts = targetId.split('#');
    const name = parts[0].trim();
    const tag = parts.slice(1).join('#').trim();

    if (!name || !tag) {
      setError('Riot ID must include both a Name and a Tagline separated by "#".');
      return;
    }

    setLoading(true);
    setError('');
    setStats(null);
    setColdStartNotice(false);

    // If request takes > 4s, notify user that Render free instance might be waking up
    coldStartTimerRef.current = setTimeout(() => {
      setColdStartNotice(true);
    }, 4000);

    try {
      const endpoint = `${API_BASE_URL}/api/roast/${encodeURIComponent(targetRegion)}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server. Please verify your internet or try again later.');
    } finally {
      if (coldStartTimerRef.current) clearTimeout(coldStartTimerRef.current);
      setLoading(false);
      setColdStartNotice(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeFetch(region, riotId);
  };

  const handleSelectPreset = (preset) => {
    setRegion(preset.region);
    setRiotId(preset.id);
    executeFetch(preset.region, preset.id);
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#141f29',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `valorant-roast-${(stats.player || 'card').replace('#', '_')}.png`;
      link.click();
    } catch {
      alert('Could not generate image. Please try taking a screenshot instead.');
    }
  };

  const handleCopyRoast = () => {
    if (!stats || !stats.roast) return;
    const textToCopy = `"${stats.roast}" — Valorant Roast for ${stats.player} (${stats.kd} K/D on ${stats.agent})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleShareTwitter = () => {
    if (!stats) return;
    const tweet = encodeURIComponent(
      `Just got evaluated by the Valorant Roast Engine:\n\n"${stats.roast}"\n\nTier: ${stats.tier} | K/D: ${stats.kd} | Agent: ${stats.agent}\n\nGet roasted here:`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank');
  };

  const getTierClass = (tier) => {
    if (!tier) return 'tier-average';
    const lower = tier.toLowerCase();
    if (lower.includes('radiant')) return 'tier-radiant';
    if (lower.includes('smurf')) return 'tier-smurf';
    if (lower.includes('tryhard')) return 'tier-tryhard';
    if (lower.includes('average')) return 'tier-average';
    return 'tier-low';
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="system-badge">
          <span className="system-dot"></span>
          VCT Analytics & Roast Engine
        </div>
        <h1 className="main-title">
          VALORANT <span>ROAST</span>
        </h1>
        <p className="main-subtitle">
          Enter your Riot ID. Get evaluated, analyzed, and publicly roasted based on your latest match stats.
        </p>
      </header>

      {/* Search Input Box */}
      <div className="search-card">
        <form onSubmit={handleFormSubmit} className="search-form">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="region-select"
            aria-label="Select Game Region"
          >
            <option value="ap">AP (Asia / India)</option>
            <option value="na">NA (North America)</option>
            <option value="eu">EU (Europe)</option>
            <option value="kr">KR (Korea)</option>
            <option value="latam">LATAM (Latin America)</option>
            <option value="br">BR (Brazil)</option>
          </select>

          <div className="riot-input-wrapper">
            <input
              type="text"
              placeholder="Name#Tag (e.g. WinSake#INDIA)"
              value={riotId}
              onChange={(e) => setRiotId(e.target.value)}
              className="riot-input"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'ANALYZING...' : 'ROAST ME'}
          </button>
        </form>

        {/* Demo Quick Select */}
        <div className="presets-container">
          <span className="presets-label">Instant Demos:</span>
          {PRESET_PLAYERS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="preset-chip"
              onClick={() => handleSelectPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Cold start wake up notice */}
        {coldStartNotice && (
          <div className="cold-start-banner">
            <span>⚡</span>
            <span>Server is waking up on Render free tier (takes ~30-45s)... Thanks for your patience!</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Result Performance Card */}
      {stats && (
        <div className="card-wrapper">
          <div ref={cardRef} className="roast-card">
            <div className="card-top-header">
              <span className="card-tag">PERFORMANCE REVIEW // {stats.map || 'COMPETITIVE'}</span>
              <span className="card-meta-pill">REGION: {stats.region}</span>
            </div>

            <div className="player-title-row">
              <h2 className="player-ign">{stats.player ? stats.player.toUpperCase() : 'UNKNOWN'}</h2>
              <span className={`tier-badge ${getTierClass(stats.tier)}`}>
                {stats.tier || 'UNRATED'}
              </span>
            </div>

            {/* Core Stats Grid */}
            <div className="stats-grid">
              <div className="stat-cell">
                <span className="stat-title">K/D Ratio</span>
                <span className="stat-number stat-highlight">{stats.kd}</span>
              </div>
              <div className="stat-cell">
                <span className="stat-title">Agent</span>
                <span className="stat-number" style={{ color: '#00f0ff' }}>{stats.agent}</span>
              </div>
              <div className="stat-cell">
                <span className="stat-title">Headshot %</span>
                <span className="stat-number">{stats.hsPercent || '0%'}</span>
              </div>
              <div className="stat-cell">
                <span className="stat-title">K / D / A</span>
                <span className="stat-number" style={{ fontSize: '1.4rem' }}>
                  {stats.kills} / {stats.deaths} / {stats.assists || 0}
                </span>
              </div>
              <div className="stat-cell">
                <span className="stat-title">Headshots</span>
                <span className="stat-number">{stats.headshots || 0}</span>
              </div>
              <div className="stat-cell">
                <span className="stat-title">Bodyshots</span>
                <span className="stat-number">{stats.bodyshots || 0}</span>
              </div>
            </div>

            {/* Hit Accuracy Breakdown */}
            <div className="accuracy-row">
              <span>HS Hits: <strong>{stats.headshots || 0}</strong></span>
              <span>Body Hits: <strong>{stats.bodyshots || 0}</strong></span>
              <span>Leg Hits: <strong>{stats.legshots || 0}</strong></span>
            </div>

            {/* Roast Quote Box */}
            <div className="roast-quote-box">
              <p className="roast-quote-text">"{stats.roast}"</p>
            </div>

            <div className="card-bottom-footer">
              <span>SYSTEM: VCT ROAST PROTOCOL</span>
              <span>DATA: HENRIKDEV V4 API</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="card-actions">
            <button onClick={handleDownloadCard} className="action-btn action-btn-download">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              DOWNLOAD CARD
            </button>

            <button onClick={handleCopyRoast} className="action-btn action-btn-copy">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              COPY ROAST
            </button>

            <button onClick={handleShareTwitter} className="action-btn action-btn-share">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              SHARE ON X
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {copiedToast && (
        <div className="toast-notice">
          ✓ Roast text copied to clipboard!
        </div>
      )}

      {/* App Footer */}
      <footer className="app-footer">
        <p>
          Rebuilt & Advanced by <a href="https://github.com/Piyush-raj24" target="_blank" rel="noreferrer">Piyush Raj</a> • Powered by HenrikDev API
        </p>
        <p style={{ marginTop: '4px', opacity: 0.6, fontSize: '0.72rem' }}>
          Not affiliated with or endorsed by Riot Games. VALORANT is a trademark of Riot Games, Inc.
        </p>
      </footer>
    </div>
  );
}