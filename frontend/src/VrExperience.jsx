import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VrExperience = () => {
  const { exhibitId } = useParams();
  const [data, setData] = useState(null);
  const [lang, setLang] = useState('en');
  const [era, setEra] = useState('historical');
  const [error, setError] = useState(null);

  const API_BASE = "http://127.0.0.1:8000"; 

  useEffect(() => {
    fetch(`${API_BASE}/api/vr/${exhibitId}?lang=${lang}`)
      .then(res => {
        if (!res.ok) throw new Error("Unable to retrieve valid destination metadata manifest profile.");
        return res.json();
      })
      .then(payload => setData(payload))
      .catch(err => setError(err.message));
  }, [exhibitId, lang]);

  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error Encountered: {error}</div>;
  if (!data) return <div style={{ color: '#fff', padding: '20px' }}>Synchronizing Interstellar Spatial Matrices...</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: '20px', left: '20px', zIndex: 10,
        background: 'rgba(15, 15, 20, 0.85)', padding: '20px', 
        borderRadius: '12px', color: '#fff', maxWidth: '320px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{data.title}</h2>
        <span style={{ fontSize: '12px', background: '#4B3DA8', padding: '3px 8px', borderRadius: '20px' }}>
          Origin Era: {data.year || "Unknown Era"}
        </span>
        <p style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.4', margin: '12px 0' }}>{data.description}</p>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#aaa' }}>Language Engine</label>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            style={{ width: '100%', background: '#222', color: '#fff', border: '1px solid #444', padding: '6px', borderRadius: '4px' }}
          >
            <option value="en">English (US/UK)</option>
            <option value="es">Español (ES)</option>
            <option value="ar">العربية (AR)</option>
            <option value="fr">Français (FR)</option>
          </select>
        </div>

        {data.modern_360 && (
          <button 
            onClick={() => setEra(era === 'historical' ? 'modern' : 'historical')}
            style={{
              width: '100%', padding: '10px', background: '#00e676', color: '#000',
              fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}
          >
            Shift To: {era === 'historical' ? 'Modern View' : 'Ancient Past'}
          </button>
        )}
      </div>

      <a-scene embedded vr-mode-ui="enabled: true">
        <a-assets timeout="10000">
          <img id="hist-sky-asset" src={data.historical_360} crossOrigin="anonymous" />
          {data.modern_360 && <img id="modern-sky-asset" src={data.modern_360} crossOrigin="anonymous" />}
          {data.video_story && <video id="narrative-video" src={data.video_story} loop crossOrigin="anonymous" autoPlay playsInline></video>}
        </a-assets>

        <a-sky src={era === 'historical' ? '#hist-sky-asset' : '#modern-sky-asset'} rotation="0 -90 0"></a-sky>

        {data.video_story && (
          <a-video 
            src="#narrative-video" 
            width="16" height="9" 
            position="0 2.5 -8" 
            rotation="0 0 0"
            scale="0.6 0.6 0.6"
          ></a-video>
        )}

        <a-entity camera look-controls position="0 1.6 0">
          <a-cursor color="#00e676" fuse="false"></a-cursor>
        </a-entity>
      </a-scene>
    </div>
  );
};

export default VrExperience;