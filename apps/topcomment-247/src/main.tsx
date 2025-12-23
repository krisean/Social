import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Top Comment 24/7</h1>
        <p className="text-xl text-gray-600">Facebook-style wall coming soon...</p>
        <p className="text-sm text-gray-500 mt-4">Powered by @social/game-topcomment</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

