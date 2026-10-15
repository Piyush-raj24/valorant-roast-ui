import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { AGENTS, MAPS } from './data/valorantData';
import { sound } from './utils/sound';
import './App.css';

// Automatically points to VITE_API_URL or defaults to production Render API
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://valorant-roast-api.onrender.com').replace(/\/+$/, '');

// Preserved ONLY the TenZ preset as requested
const TENZ_PRESET = { label: '⚡ INSTANT QUEUE: TenZ#SEN (Jett)', id: 'TenZ#SEN', region: 'na' };

export default function App() {
  const [mode, setMode] = useState('solo'); // 'solo' or 'duo'
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Solo State
  const [region, setRegion] = useState(() => localStorage.getItem('val_roast_region') || 'ap');
  const [riotId, setRiotId] = useState(() => localStorage.getItem('val_roast_id') || '');
  const [stats, setStats] = useState(null);

  // Duo State
  const [p1Region, setP1Region] = useState('na');
  const [p1Id, setP1Id] = useState('TenZ#SEN');
  const [p2Region, setP2Region] = useState('ap');
  const [p2Id, setP2Id] = useState('');
  const [duoStats, setDuoStats] = useState(null);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coldStartNotice, setColdStartNotice] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(null);

  const cardRef = useRef(null);
  const duoCardRef = useRef(null);
  const fileInputRef = useRef(null);
  const coldStartTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('val_roast_region', region);
  }, [region]);

  useEffect(() => {
    localStorage.setItem('val_roast_id', riotId);
  }, [riotId]);

  const toggleSound = () => {
    const newState = sound.toggle();
    setAudioEnabled(newState);
  };

  // Helper to fetch roast data for a single player
  const fetchPlayerData = async (reg, id) => {
    if (!id || !id.includes('#')) {
      throw new Error(`Riot ID "${id}" must include Name#Tag (e.g. TenZ#SEN).`);
    }
    const [name, ...rest] = id.split('#');
    const tag = rest.join('#');

    const endpoint = `${API_BASE_URL}/api/roast/${encodeURIComponent(reg)}/${encodeURIComponent(name.trim())}/${encodeURIComponent(tag.trim())}`;
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || `Server returned error (${response.status})`);
    }
    return data;
  };

  // Solo Fetch Handler
  const handleSoloSubmit = async (e) => {
    if (e) e.preventDefault();
    sound.playClick();

    setLoading(true);
    setError('');
    setStats(null);
    setColdStartNotice(false);

    coldStartTimerRef.current = setTimeout(() => {
      setColdStartNotice(true);
    }, 4000);

    try {
      const data = await fetchPlayerData(region, riotId);
      setStats(data);
      sound.playReveal();
      setTimeout(() => sound.playDink(), 250);
    } catch (err) {
      setError(err.message || 'Failed to fetch player stats. Please verify Riot ID or try again.');
    } finally {
      if (coldStartTimerRef.current) clearTimeout(coldStartTimerRef.current);
      setLoading(false);
      setColdStartNotice(false);
    }
  };

  // Duo Fetch Handler
  const handleDuoSubmit = async (e) => {
    if (e) e.preventDefault();
    sound.playClick();

    if (!p2Id.trim()) {
      setError('Please enter Player 2 Riot ID (Name#Tag) to start Duo Versus.');
      return;
    }

    setLoading(true);
    setError('');
    setDuoStats(null);
    setColdStartNotice(false);

    coldStartTimerRef.current = setTimeout(() => {
      setColdStartNotice(true);
    }, 4000);

    try {
      const [player1Data, player2Data] = await Promise.all([
        fetchPlayerData(p1Region, p1Id),
        fetchPlayerData(p2Region, p2Id),
      ]);

      const kd1 = parseFloat(player1Data.kd) || 0;
      const kd2 = parseFloat(player2Data.kd) || 0;

      const p1IsBetter = kd1 >= kd2;
      const winner = p1IsBetter ? player1Data : player2Data;
      const loser = p1IsBetter ? player2Data : player1Data;

      const duoRoast = `${winner.player} (${winner.kd} K/D) had to wear an orthopedic back-brace carrying ${loser.player} (${loser.kd} K/D on ${loser.agent}). ${loser.player} owes ${winner.player} 5000 Radianite points for emotional damage.`;

      setDuoStats({
        p1: player1Data,
        p2: player2Data,
        p1IsWinner: p1IsBetter,
        roast: duoRoast,
      });

      sound.playReveal();
      setTimeout(() => sound.playDink(), 300);
    } catch (err) {
      setError(err.message || 'Failed to fetch duo stats. Check that both Riot IDs exist.');
    } finally {
      if (coldStartTimerRef.current) clearTimeout(coldStartTimerRef.current);
      setLoading(false);
      setColdStartNotice(false);
    }
  };

  const handleSelectTenZ = () => {
    sound.playClick();
    setRegion(TENZ_PRESET.region);
    setRiotId(TENZ_PRESET.id);
    setMode('solo');
    setTimeout(() => {
      const form = document.getElementById('solo-form');
      if (form) form.requestSubmit();
    }, 50);
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomAvatar(event.target.result);
      sound.playClick();
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadCard = async (targetRef, filename) => {
    if (!targetRef.current) return;
    sound.playClick();
    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#111a22',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = filename;
      link.click();
    } catch {
      alert('Could not auto-generate download image. Please take a screenshot!');
    }
  };

  const handleCopyRoast = (text) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleShareTwitter = (text) => {
    sound.playClick();
    const tweet = encodeURIComponent(`${text}\n\nEvaluated on Valorant Roast:`);
    window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank');
  };

  const getAgentAsset = (agentName) => {
    if (!agentName) return null;
    return AGENTS[agentName.toLowerCase().trim()] || null;
  };

  const getMapAsset = (mapName) => {
    if (!mapName) return null;
    return MAPS[mapName.toLowerCase().trim()] || null;
  };

  const getRankBadgeInfo = (tier) => {
    if (!tier) return { icon: '🥪', label: 'AVERAGE ANDY', style: 'tier-average' };
    const t = tier.toLowerCase();
    if (t.includes('radiant')) return { icon: '👑', label: 'RADIANT MENACE', style: 'tier-radiant' };
    if (t.includes('smurf')) return { icon: '🟣', label: 'CERTIFIED SMURF', style: 'tier-smurf' };
    if (t.includes('tryhard')) return { icon: '⚡', label: 'SWEATY TRYHARD', style: 'tier-tryhard' };
    if (t.includes('imposter')) return { icon: '🧯', label: 'IRON IMPOSTER', style: 'tier-low' };
    if (t.includes('cardboard')) return { icon: '📦', label: 'CARDBOARD 2', style: 'tier-low' };
    if (t.includes('plastic')) return { icon: '🪣', label: 'PLASTIC 1', style: 'tier-low' };
    return { icon: '🥪', label: 'AVERAGE ANDY', style: 'tier-average' };
  };

  const getShameStamp = (playerStats) => {
    if (!playerStats) return null;
    const kd = parseFloat(playerStats.kd) || 0;
    const hs = parseFloat(playerStats.hsPercent) || 0;
    const agent = (playerStats.agent || '').toLowerCase();

    if (kd >= 2.2) return '🚿 TOUCH GRASS';
    if ((agent.includes('jett') || agent.includes('reyna') || agent.includes('raze')) && kd < 1.0) {
      return '⚠️ FAILED ENTRY';
    }
    if (hs < 12.0) return '🦿 AIMING AT TOES';
    if (kd < 0.45) return '🤖 NPC SPECTATOR';
    if (playerStats.assists === 0 && kd < 1.0) return '💀 ZERO IMPACT';
    return null;
  };

  const getTiltInfo = (playerStats) => {
    if (!playerStats) return { pct: 50, label: 'BALANCED', cls: 'tilt-med' };
    const kd = parseFloat(playerStats.kd) || 0;

    if (kd >= 2.2) return { pct: 98, label: '98% CRITICAL SWEAT // TOXIC SMURF', cls: 'tilt-high' };
    if (kd < 0.5) return { pct: 95, label: '95% HIGH RISK OF ALT+F4 // TILTED', cls: 'tilt-high' };
    if (kd < 0.8) return { pct: 72, label: '72% ELEVATED TILT // CROSSHAIR TOES', cls: 'tilt-low' };
    if (kd >= 1.3) return { pct: 60, label: '60% TRYHARD TEMPERATURE', cls: 'tilt-med' };
    return { pct: 45, label: '45% NEUTRAL // PAINFULLY AVERAGE', cls: 'tilt-med' };
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="val-top-nav">
        <div className="val-nav-left">
          <div className="val-riot-logo">
            <span>VALORANT ROAST CARD</span>
          </div>
        </div>

        <div className="val-nav-right">
          <div className="val-ping-badge">
            ● 18ms
          </div>
          <button onClick={toggleSound} className="audio-toggle-btn">
            {audioEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF'}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="app-container">
        {/* Header Title */}
        <header className="app-header">
          <div className="system-badge">
            <span className="system-dot"></span>
            PROTOCOL // LIVE COMBAT DEBRIEF
          </div>
          <h1 className="main-title">
            MATCH <span>ROAST</span>
          </h1>
          <p className="main-subtitle">
            COMMUNITY ROAST ENGINE // ENTER RIOT ID TO INITIATE SAVAGE PERFORMANCE DEBRIEF
          </p>
        </header>

        {/* Mode Switcher */}
        <div className="mode-tabs">
          <button
            className={`mode-tab ${mode === 'solo' ? 'active' : ''}`}
            onClick={() => { sound.playClick(); setMode('solo'); setError(''); }}
          >
            COMPETITIVE // SOLO
          </button>
          <button
            className={`mode-tab ${mode === 'duo' ? 'active' : ''}`}
            onClick={() => { sound.playClick(); setMode('duo'); setError(''); }}
          >
            PREMIER // DUO 1v1
          </button>
        </div>

        {/* Matchmaking Lobby Panel (Search Form) */}
        <div className="search-card">
          {mode === 'solo' ? (
            <form id="solo-form" onSubmit={handleSoloSubmit} className="search-form">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="region-select"
                aria-label="Select Game Server Region"
              >
                <option value="ap">AP // Mumbai (Asia)</option>
                <option value="na">NA // N. Virginia (North America)</option>
                <option value="eu">EU // Frankfurt (Europe)</option>
                <option value="kr">KR // Seoul (Korea)</option>
                <option value="latam">LATAM // Santiago (Latin America)</option>
                <option value="br">BR // São Paulo (Brazil)</option>
              </select>

              <div className="riot-input-wrapper">
                <input
                  type="text"
                  placeholder="Riot ID (e.g. WinSake#INDIA)"
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value)}
                  className="riot-input"
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'LOCKING IN...' : 'START ROAST >>'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleDuoSubmit}>
              <div className="duo-inputs">
                {/* Player 1 */}
                <div className="duo-player-box">
                  <span className="duo-box-label">// TEAM A (YOU)</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={p1Region}
                      onChange={(e) => setP1Region(e.target.value)}
                      className="region-select"
                      style={{ minWidth: '90px', padding: '10px' }}
                    >
                      <option value="na">NA</option>
                      <option value="ap">AP</option>
                      <option value="eu">EU</option>
                      <option value="kr">KR</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Player1#Tag"
                      value={p1Id}
                      onChange={(e) => setP1Id(e.target.value)}
                      className="riot-input"
                      required
                    />
                  </div>
                </div>

                {/* Player 2 */}
                <div className="duo-player-box">
                  <span className="duo-box-label">// TEAM B (DUO / FRIEND)</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={p2Region}
                      onChange={(e) => setP2Region(e.target.value)}
                      className="region-select"
                      style={{ minWidth: '90px', padding: '10px' }}
                    >
                      <option value="ap">AP</option>
                      <option value="na">NA</option>
                      <option value="eu">EU</option>
                      <option value="kr">KR</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Friend#Tag"
                      value={p2Id}
                      onChange={(e) => setP2Id(e.target.value)}
                      className="riot-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-btn" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'CALCULATING VERDICT...' : '⚔️ ROAST THE WORSE DUO >>'}
              </button>
            </form>
          )}

          {/* Tools: ONLY TenZ Preset + Custom Avatar Upload */}
          <div className="form-footer-tools">
            <div className="presets-container">
              <span className="presets-label">Preset:</span>
              <button
                type="button"
                className="preset-chip"
                onClick={handleSelectTenZ}
              >
                {TENZ_PRESET.label}
              </button>
            </div>

            {/* Custom Avatar Upload */}
            <div className="avatar-upload-area">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarFile}
              />
              {customAvatar ? (
                <div className="avatar-preview-badge">
                  <img src={customAvatar} alt="Custom Avatar" className="avatar-thumb" />
                  <span>Custom Card</span>
                  <button
                    type="button"
                    className="remove-pfp-btn"
                    onClick={() => { sound.playClick(); setCustomAvatar(null); }}
                    title="Remove avatar"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="upload-pfp-btn"
                  onClick={() => { sound.playClick(); fileInputRef.current.click(); }}
                >
                  📷 Upload PFP / Meme
                </button>
              )}
            </div>
          </div>

          {/* Cold Start Notice */}
          {coldStartNotice && (
            <div className="cold-start-banner">
              <span>⚡</span>
              <span>Waking up server on Render free tier (takes ~30-45s)... Thanks for your patience!</span>
            </div>
          )}
        </div>

        {/* Error Notice */}
        {error && (
          <div className="error-banner">
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* IN-GAME "MATCH REPORT" CARD (SOLO MODE)                   */}
        {/* ========================================================= */}
        {mode === 'solo' && stats && (
          <div className="card-wrapper">
            <div ref={cardRef} className="roast-card">
              {/* Map Splash Art Banner */}
              {(() => {
                const mapAsset = getMapAsset(stats.map);
                const mapBg = mapAsset && mapAsset.splash
                  ? `url(${mapAsset.splash})`
                  : 'linear-gradient(135deg, #1f2d3a 0%, #0e1720 100%)';
                return (
                  <div className="card-map-banner" style={{ backgroundImage: mapBg }}>
                    <div className="card-map-overlay"></div>
                    <div className="map-banner-content">
                      <div>
                        <div className="in-game-match-tag">PERFORMANCE DEBRIEF</div>
                        <div className="map-location-sub">
                          {mapAsset && mapAsset.icon && (
                            <img
                              src={mapAsset.icon}
                              alt={stats.map}
                              width="16"
                              height="16"
                              style={{ verticalAlign: 'middle', marginRight: '6px' }}
                              crossOrigin="anonymous"
                            />
                          )}
                          MAP: {stats.map || 'COMPETITIVE'} // {stats.region}
                        </div>
                      </div>
                      <span className="vct-protocol-badge">SYS.VER. 09.08</span>
                    </div>
                  </div>
                );
              })()}

              {/* Agent Full Portrait (Backdrop) */}
              {(() => {
                const agentAsset = getAgentAsset(stats.agent);
                return agentAsset && agentAsset.portrait ? (
                  <img
                    src={agentAsset.portrait}
                    alt={stats.agent}
                    className="agent-portrait-backdrop"
                    crossOrigin="anonymous"
                  />
                ) : null;
              })()}

              {/* Hall of Shame Military Stamp */}
              {(() => {
                const stamp = getShameStamp(stats);
                return stamp ? <div className="shame-stamp">{stamp}</div> : null;
              })()}

              {/* Card Main Body */}
              <div className="card-inner-body">
                {/* Player Identity Row */}
                <div className="player-info-section">
                  <div className="player-identity-left">
                    <div className="agent-icon-wrapper">
                      {customAvatar ? (
                        <img src={customAvatar} alt="Custom PFP" className="agent-avatar-img" />
                      ) : (() => {
                        const agentAsset = getAgentAsset(stats.agent);
                        return agentAsset && agentAsset.icon ? (
                          <img
                            src={agentAsset.icon}
                            alt={stats.agent}
                            className="agent-avatar-img"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div style={{ color: '#fff', textAlign: 'center', paddingTop: '16px', fontWeight: 'bold' }}>
                            VAL
                          </div>
                        );
                      })()}

                      {/* Role Pill */}
                      {(() => {
                        const agentAsset = getAgentAsset(stats.agent);
                        return agentAsset && agentAsset.roleIcon ? (
                          <div className="agent-role-pill" title={agentAsset.role}>
                            <img src={agentAsset.roleIcon} alt={agentAsset.role} crossOrigin="anonymous" />
                          </div>
                        ) : null;
                      })()}
                    </div>

                    <div className="player-names-col">
                      <h2 className="player-name-text">{stats.player || 'UNKNOWN'}</h2>
                      <span className="agent-name-subtext">
                        {stats.agent} // {getAgentAsset(stats.agent)?.role || 'AGENT'}
                      </span>
                    </div>
                  </div>

                  {/* Rank Emblem Badge */}
                  {(() => {
                    const badge = getRankBadgeInfo(stats.tier);
                    return (
                      <div className={`rank-emblem-badge ${badge.style}`}>
                        <span style={{ fontSize: '1.2rem' }}>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Animated Tilt-O-Meter */}
                {(() => {
                  const tilt = getTiltInfo(stats);
                  return (
                    <div className="tilt-meter-container">
                      <div className="tilt-meter-header">
                        <span className="tilt-label">☣️ TILT & TOXICITY GAUGE</span>
                        <span className="tilt-value">{tilt.label}</span>
                      </div>
                      <div className="tilt-track">
                        <div className={`tilt-fill ${tilt.cls}`} style={{ width: `${tilt.pct}%` }}></div>
                      </div>
                    </div>
                  );
                })()}

                {/* In-Game Scoreboard Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-cell">
                    <span className="stat-title">K/D Ratio</span>
                    <span className="stat-number stat-highlight">{stats.kd}</span>
                  </div>
                  <div className="stat-cell">
                    <span className="stat-title">Headshot %</span>
                    <span className="stat-number" style={{ color: '#00f0ff' }}>
                      {stats.hsPercent || '0%'}
                    </span>
                  </div>
                  <div className="stat-cell">
                    <span className="stat-title">K / D / A</span>
                    <span className="stat-number" style={{ fontSize: '1.5rem' }}>
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
                  <div className="stat-cell">
                    <span className="stat-title">Legshots</span>
                    <span className="stat-number">{stats.legshots || 0}</span>
                  </div>
                </div>

                {/* Visual Segmented Hit Accuracy Bar */}
                {(() => {
                  const hs = stats.headshots || 0;
                  const body = stats.bodyshots || 0;
                  const legs = stats.legshots || 0;
                  const total = hs + body + legs || 1;
                  const hsPct = Math.round((hs / total) * 100);
                  const bodyPct = Math.round((body / total) * 100);
                  const legsPct = Math.max(0, 100 - hsPct - bodyPct);

                  return (
                    <div className="accuracy-section">
                      <div className="accuracy-labels-row">
                        <span style={{ color: 'var(--val-red)' }}>HEAD {hsPct}% ({hs})</span>
                        <span style={{ color: 'var(--val-gold)' }}>BODY {bodyPct}% ({body})</span>
                        <span style={{ color: 'var(--val-cyan)' }}>LEGS {legsPct}% ({legs})</span>
                      </div>
                      <div className="accuracy-bar-track">
                        <div className="acc-segment-head" style={{ width: `${hsPct}%` }}></div>
                        <div className="acc-segment-body" style={{ width: `${bodyPct}%` }}></div>
                        <div className="acc-segment-legs" style={{ width: `${legsPct}%` }}></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Kingdom Terminal Roast Debrief */}
                <div className="roast-quote-box">
                  <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.72rem', color: 'var(--val-red)', letterSpacing: '1.5px', marginBottom: '6px' }}>
                    // VCT ANALYST VERDICT
                  </div>
                  <p className="roast-quote-text">"{stats.roast}"</p>
                </div>

                {/* Footer metadata */}
                <div className="card-bottom-footer">
                  <span>VCT COMBAT PROTOCOL // VALORANT API</span>
                  <span>ID: {stats.player?.replace('#', '-')}</span>
                </div>
              </div>
            </div>

            {/* In-Game Action Buttons */}
            <div className="card-actions">
              <button
                onClick={() => handleDownloadCard(cardRef, `valorant-report-${(stats.player || 'card').replace('#', '_')}.png`)}
                className="action-btn action-btn-download"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                SAVE MATCH REPORT
              </button>

              <button
                onClick={() => handleCopyRoast(`"${stats.roast}" — Valorant Roast for ${stats.player} (${stats.kd} K/D on ${stats.agent})`)}
                className="action-btn action-btn-copy"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                COPY DEBRIEF
              </button>

              <button
                onClick={() => handleShareTwitter(`"${stats.roast}"\n\nTier: ${stats.tier} | K/D: ${stats.kd} | Agent: ${stats.agent}`)}
                className="action-btn action-btn-share"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
                REPORT TO VCT // SHARE
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* IN-GAME "1v1 VERSUS SHOWDOWN" (DUO MODE)                  */}
        {/* ========================================================= */}
        {mode === 'duo' && duoStats && (
          <div className="card-wrapper">
            <div ref={duoCardRef} className="duo-card-container">
              <div className="duo-header-banner">
                <span className="duo-title-tag">⚔️ VCT 1v1 HEAD-TO-HEAD SHOWDOWN</span>
                <span className="vct-protocol-badge">WHO SOLD THE MATCH?</span>
              </div>

              <div className="duo-vs-grid">
                {/* Player 1 Column */}
                <div className={`duo-column ${duoStats.p1IsWinner ? 'duo-column-winner' : 'duo-column-loser'}`}>
                  <div className={`duo-verdict-banner ${duoStats.p1IsWinner ? 'verdict-carry' : 'verdict-anchor'}`}>
                    {duoStats.p1IsWinner ? '👑 MATCH MVP // THE CARRY' : '🪣 DEADWEIGHT // THE THROWER'}
                  </div>
                  <h3 className="player-name-text" style={{ fontSize: '1.9rem', marginBottom: '2px' }}>
                    {duoStats.p1.player}
                  </h3>
                  <span className="agent-name-subtext" style={{ marginBottom: '14px' }}>
                    {duoStats.p1.agent} // {duoStats.p1.region}
                  </span>

                  <div className="stats-grid" style={{ marginBottom: '8px' }}>
                    <div className="stat-cell">
                      <span className="stat-title">K/D</span>
                      <span className="stat-number stat-highlight">{duoStats.p1.kd}</span>
                    </div>
                    <div className="stat-cell">
                      <span className="stat-title">HS%</span>
                      <span className="stat-number">{duoStats.p1.hsPercent}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', fontSize: '0.82rem', fontFamily: 'var(--font-hud)' }}>
                    <span>KILLS: <strong>{duoStats.p1.kills}</strong></span>
                    <span>DEATHS: <strong>{duoStats.p1.deaths}</strong></span>
                    <span>ASSISTS: <strong>{duoStats.p1.assists || 0}</strong></span>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="duo-vs-divider">
                  <div className="vs-circle">VS</div>
                </div>

                {/* Player 2 Column */}
                <div className={`duo-column ${!duoStats.p1IsWinner ? 'duo-column-winner' : 'duo-column-loser'}`}>
                  <div className={`duo-verdict-banner ${!duoStats.p1IsWinner ? 'verdict-carry' : 'verdict-anchor'}`}>
                    {!duoStats.p1IsWinner ? '👑 MATCH MVP // THE CARRY' : '🪣 DEADWEIGHT // THE THROWER'}
                  </div>
                  <h3 className="player-name-text" style={{ fontSize: '1.9rem', marginBottom: '2px' }}>
                    {duoStats.p2.player}
                  </h3>
                  <span className="agent-name-subtext" style={{ marginBottom: '14px' }}>
                    {duoStats.p2.agent} // {duoStats.p2.region}
                  </span>

                  <div className="stats-grid" style={{ marginBottom: '8px' }}>
                    <div className="stat-cell">
                      <span className="stat-title">K/D</span>
                      <span className="stat-number stat-highlight">{duoStats.p2.kd}</span>
                    </div>
                    <div className="stat-cell">
                      <span className="stat-title">HS%</span>
                      <span className="stat-number">{duoStats.p2.hsPercent}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', fontSize: '0.82rem', fontFamily: 'var(--font-hud)' }}>
                    <span>KILLS: <strong>{duoStats.p2.kills}</strong></span>
                    <span>DEATHS: <strong>{duoStats.p2.deaths}</strong></span>
                    <span>ASSISTS: <strong>{duoStats.p2.assists || 0}</strong></span>
                  </div>
                </div>
              </div>

              {/* Duo Roast Verdict */}
              <div className="duo-roast-summary">
                <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.72rem', color: 'var(--val-red)', letterSpacing: '2px', marginBottom: '6px' }}>
                  // VCT 1v1 DEBRIEF
                </div>
                <p className="roast-quote-text">"{duoStats.roast}"</p>
              </div>
            </div>

            {/* Duo Action Buttons */}
            <div className="card-actions">
              <button
                onClick={() => handleDownloadCard(duoCardRef, `valorant-duo-showdown.png`)}
                className="action-btn action-btn-download"
              >
                SAVE DUO REPORT
              </button>
              <button
                onClick={() => handleCopyRoast(duoStats.roast)}
                className="action-btn action-btn-copy"
              >
                COPY DUO DEBRIEF
              </button>
            </div>
          </div>
        )}

        {/* Floating Toast */}
        {copiedToast && (
          <div className="toast-notice">
            ✓ DEBRIEF COPIED TO CLIPBOARD
          </div>
        )}

        {/* Footer */}
        <footer className="app-footer">
          <p>
            ENGINEERED BY <a href="https://github.com/Piyush-raj24" target="_blank" rel="noreferrer">PIYUSH RAJ</a> • POWERED BY VALORANT-API & HENRIKDEV
          </p>
          <p style={{ marginTop: '4px', opacity: 0.6, fontSize: '0.72rem' }}>
            NOT AFFILIATED WITH OR ENDORSED BY RIOT GAMES. VALORANT IS A TRADEMARK OF RIOT GAMES, INC.
          </p>
        </footer>
      </div>
    </>
  );
}