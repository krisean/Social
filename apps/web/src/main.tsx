import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Social.gg</h1>
          <p className="text-xl mt-2">Interactive Games for Bars & Venues</p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Top Comment</h2>
            <p className="text-gray-600">Crowd-sourced comedy game for live events</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">VIBox</h2>
            <p className="text-gray-600">AI-powered jukebox for your venue</p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-500">Admin panel coming soon...</p>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

