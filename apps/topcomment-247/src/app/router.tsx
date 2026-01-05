import { createBrowserRouter } from 'react-router-dom';
import { AppProviders } from './AppProviders';
import { RootLayout } from './RootLayout';
import { VenuePage } from '../VenuePage';
import { VenueSelector } from '../VenueSelector';

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppProviders>
        <RootLayout />
      </AppProviders>
    ),
    children: [
      { index: true, element: <VenueSelector /> },
      { path: ":venueKey", element: <VenuePage /> },
    ],
  },
]);