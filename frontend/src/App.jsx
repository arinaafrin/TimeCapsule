import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import VrExperience from './VrExperience';

const HomePlaceholder = () => (
  <div style={{ padding: '40px', color: '#fff', textAlign: 'center', background: '#121214', minHeight: '100vh' }}>
    <h1>⏳ TimeCapsule VR Ecosystem Portal</h1>
    <p>To enter an immersive destination directly, please use a designated QR code layout link or access a valid exhibit identifier route:</p>
    <code style={{ background: '#202024', padding: '10px', display: 'inline-block', borderRadius: '5px', color: '#00e676' }}>
      /vr-experience/YOUR_EXHIBIT_UUID_HERE
    </code>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePlaceholder />} />
        <Route path="/vr-experience/:exhibitId" element={<VrExperience />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;