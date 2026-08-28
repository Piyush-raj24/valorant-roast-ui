{roastData && (
  <div className="performance-review-card">
    {/* Your existing header code here */}
    
    <div className="stats-container">
      <div className="stat-box">
        <span className="stat-label">K/D RATIO</span>
        {/* Inject the KD here */}
        <span className="stat-value">{roastData.kdRatio}</span> 
      </div>
      <div className="stat-box">
        <span className="stat-label">AGENT</span>
        {/* Inject the Agent here */}
        <span className="stat-value">{roastData.agent}</span>
      </div>
      <div className="stat-box">
        <span className="stat-label">RATING</span>
        {/* Inject the Match Score here */}
        <span className="stat-value">{roastData.rating}</span>
      </div>
    </div>

    {/* Your existing roast quote code here */}
  </div>
)}