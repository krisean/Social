import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import { EntryPage } from "../features/entry/EntryPage";
import { AuthPage } from "../features/auth/AuthPage";
import { HostPage } from "../features/host/HostPage";
import { TeamPage } from "../features/team/TeamPage";
import { PresenterPage } from "../features/presenter/PresenterPage";
import { NotFoundPage } from "../features/404/NotFoundPage";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <EntryPage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "host", element: <HostPage /> },
      { path: "play", element: <TeamPage /> },
      { path: "presenter/:sessionId", element: <PresenterPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
