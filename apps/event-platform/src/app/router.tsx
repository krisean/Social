import { createBrowserRouter } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import { RootLayout } from "./RootLayout";
import { EntryPage } from "../features/entry/EntryPage";
import { AuthPage } from "../features/auth/AuthPage";
import { HostPage } from "../features/host/HostPage";
import { TeamPage } from "../features/team/TeamPage";
import { JoinFlowOrchestrator } from "../features/team/JoinFlowOrchestrator";
import { PresenterPage } from "../features/presenter/PresenterPage";
import { NotFoundPage } from "../features/404/NotFoundPage";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppProviders>
        <RootLayout />
      </AppProviders>
    ),
    children: [
      { index: true, element: <EntryPage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "venue-auth", element: <AuthPage variant="venue" /> },
      { path: "host", element: <HostPage /> },
      { path: "join", element: <JoinFlowOrchestrator /> },
      { path: "play", element: <TeamPage /> },
      { path: "team", element: <TeamPage /> },
      { path: "presenter/:sessionId", element: <PresenterPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  { 
    path: "*", 
    element: (
      <AppProviders>
        <NotFoundPage />
      </AppProviders>
    ),
  },
]);
