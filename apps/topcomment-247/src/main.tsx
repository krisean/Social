import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { VenuePage } from './VenuePage';
import { VenueSelector } from './VenueSelector';

const router = createBrowserRouter([
  {
    path: "/:venueKey",
    element: <VenuePage />,
  },
  {
    path: "/",
    element: <VenueSelector />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

