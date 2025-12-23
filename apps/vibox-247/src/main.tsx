import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">🎵 VIBox</h1>
        <p className="text-2xl mb-2">AI-Powered Jukebox</p>
        <p className="text-lg text-purple-200 mt-4">Coming soon...</p>
        <p className="text-sm text-purple-300 mt-4">Powered by @social/game-vibox + Suno AI</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

