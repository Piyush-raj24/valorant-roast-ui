import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

export default function App() {
  const [region, setRegion] = useState('ap');
  const [riotId, setRiotId] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchedUser, setSearchedUser] = useState('');

  const cardRef = useRef(null);

  const handleFetchRoast = async (e) => {
    e.preventDefault();
    if (!riotId.includes('#')) {
      alert('Please enter your Riot ID in Name#Tag format (e.g., PANEER#WHIFF)');
      return;
    }

    const [name, tag] = riotId.split('#');
    setLoading(true);
    setStats(null);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:8080/api/roast/${region}/${encodeURIComponent(name.trim())}/${encodeURIComponent(tag.trim())}`
      );
      
      const data = await response.json(); 
      
      if (data.error) {
        setError(data.error);
      } else {
        setStats(data);
        setSearchedUser(riotId.trim());
      }
    } catch (err) {
      setError('Failed to connect to backend server. Make sure Spring Boot is running!');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { 
      backgroundColor: '#0f1923',
      scale: 2 // Increases image quality for the download
    });
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `${searchedUser}-roast-card.png`;
    link.click();
  };

  return (
    <>
      {/* CSS injected directly for animations and hover states */}
      <style>
        {`
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; background-color: #0f1923; }
          
          @keyframes slideUpFade {
            0% { opacity: 0; transform: translateY(50px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulseBorder {
            0% { box-shadow: 0 0 10px rgba(255, 70, 85, 0.2); }
            50% { box-shadow: 0 0 25px rgba(255, 70, 85, 0.6); }
            100% { box-shadow: 0 0 10px rgba(255, 70, 85, 0.2); }
          }

          .animated-card {
            animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .valorant-btn {
            transition: all 0.2s ease-in-out;
          }
          .valorant-btn:hover:not(:disabled) {
            background-color: #ff5866 !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(255, 70, 85, 0.4);
          }
          .valorant-btn:active:not(:disabled) {
            transform: translateY(0);
          }
          
          .download-btn {
            transition: all 0.2s ease-in-out;
          }
          .download-btn:hover {
            background-color: #00c853 !important;
            transform: translateY(-2px);
          }
        `}
      </style>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>VALORANT STATS ROAST</h1>
          <p style={styles.subtitle}>Get evaluated and publicly humiliated by your latest match stats.</p>
        </div>

        <form onSubmit={handleFetchRoast} style={styles.form}>
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value)} 
            style={styles.select}
          >
            <option value="ap">AP (Asia / India)</option>
            <option value="na">NA (North America)</option>
            <option value="eu">EU (Europe)</option>
          </select>

          <input
            type="text"
            placeholder="Name#Tag (e.g. WinSake#INDIA)"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.input}
            required
          />

          <button 
            type="submit" 
            className="valorant-btn"
            style={{...styles.button, opacity: loading ? 0.7 : 1}} 
            disabled={loading}
          >
            {loading ? 'ANALYZING...' : 'ROAST ME'}
          </button>
        </form>

        {error && <p style={styles.errorText}>{error}</p>}

        {stats && (
          <div className="animated-card" style={styles.cardWrapper}>
            {/* This is the div that gets captured by html2canvas */}
            <div ref={cardRef} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.tag}>PERFORMANCE REVIEW</span>
                <h2 style={styles.playerName}>{searchedUser.toUpperCase()}</h2>
              </div>

              <div style={styles.badgeContainer}>
                <div style={styles.badge}>
                  <span style={styles.badgeLabel}>K/D Ratio</span>
                  <span style={styles.badgeValue}>{stats.kd}</span>
                </div>
                <div style={styles.badge}>
                  <span style={styles.badgeLabel}>Agent</span>
                  <span style={styles.badgeValue}>{stats.agent}</span>
                </div>
                <div style={styles.badge}>
                  <span style={styles.badgeLabel}>Rating</span>
                  <span style={styles.badgeValueTier}>{stats.tier}</span>
                </div>
              </div>

              <div style={styles.roastBox}>
                <p style={styles.roastText}>"{stats.roast}"</p>
              </div>

              <div style={styles.cardFooter}>
                <span>REGION: {region.toUpperCase()}</span>
                <span>SYSTEM: VCT ANALYTICS ENGINE</span>
              </div>
            </div>

            <button onClick={handleDownloadImage} className="download-btn" style={styles.downloadButton}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              DOWNLOAD ROAST CARD
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% -20%, #1a2733 0%, #0f1923 80%)',
    color: '#ece8e1',
    fontFamily: '"Tungsten", "Arial Black", system-ui, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: '900',
    letterSpacing: '4px',
    color: '#ff4655',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#8b978f',
    fontSize: '1.1rem',
    margin: 0,
    fontFamily: 'system-ui, sans-serif',
  },
  form: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '40px',
    background: '#17222b',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    border: '1px solid #2b3945',
  },
  select: {
    padding: '14px 18px',
    backgroundColor: '#0f1923',
    color: '#fff',
    border: '1px solid #38464f',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    outline: 'none',
  },
  input: {
    padding: '14px 18px',
    backgroundColor: '#0f1923',
    color: '#fff',
    border: '1px solid #38464f',
    borderRadius: '4px',
    fontSize: '1rem',
    minWidth: '280px',
    outline: 'none',
  },
  button: {
    padding: '14px 32px',
    backgroundColor: '#ff4655',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '900',
    letterSpacing: '1px',
    fontSize: '1.1rem',
    cursor: 'pointer',
  },
  errorText: {
    color: '#ff4655',
    backgroundColor: 'rgba(255, 70, 85, 0.1)',
    padding: '12px 24px',
    borderRadius: '4px',
    border: '1px solid #ff4655',
    fontFamily: 'system-ui, sans-serif',
  },
  cardWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  card: {
    width: '460px',
    backgroundColor: '#17222b',
    border: '2px solid #ff4655',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
    animation: 'pulseBorder 4s infinite',
  },
  cardHeader: {
    borderBottom: '2px solid #2b3945',
    paddingBottom: '16px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  tag: {
    fontSize: '0.85rem',
    letterSpacing: '3px',
    color: '#ff4655',
    fontWeight: 'bold',
    fontFamily: 'system-ui, sans-serif',
  },
  playerName: {
    fontSize: '2.2rem',
    letterSpacing: '1px',
    margin: '8px 0 0 0',
  },
  badgeContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  badge: {
    flex: 1,
    backgroundColor: '#0f1923',
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #2b3945',
  },
  badgeLabel: {
    fontSize: '0.7rem',
    color: '#8b978f',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '6px',
    fontFamily: 'system-ui, sans-serif',
  },
  badgeValue: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#ece8e1',
  },
  badgeValueTier: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#00e676',
    textAlign: 'center',
  },
  roastBox: {
    backgroundColor: '#0f1923',
    padding: '24px',
    borderRadius: '8px',
    borderLeft: '4px solid #ff4655',
    marginBottom: '24px',
  },
  roastText: {
    fontSize: '1.15rem',
    lineHeight: '1.6',
    margin: 0,
    fontStyle: 'italic',
    fontFamily: 'system-ui, sans-serif',
    color: '#ece8e1',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#5c6b73',
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: '1px',
  },
  downloadButton: {
    padding: '14px 28px',
    backgroundColor: '#00e676',
    color: '#0f1923',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '900',
    letterSpacing: '1px',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  }
};