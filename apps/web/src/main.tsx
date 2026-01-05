import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { LandingPage } from './features/landing/LandingPage';
import { VenuePage } from './features/pub-wall/VenuePage';
import { VenueSelector } from './features/pub-wall/VenueSelector';

// Detect subdomain
const hostname = window.location.hostname;
const isPubSubdomain = hostname.startsWith('pub.');

// Create router based on subdomain
const router = createBrowserRouter([
  {
    path: "/",
    element: isPubSubdomain ? <VenueSelector /> : <LandingPage />,
  },
  {
    path: "/:venueKey",
    element: isPubSubdomain ? <VenuePage /> : <LandingPage />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

