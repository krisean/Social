import { RouterProvider } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import { appRouter } from "./router";

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  );
}

export default App;
