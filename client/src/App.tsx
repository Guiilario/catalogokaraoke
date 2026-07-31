// BarberPro — App Router
// Theme: Dark Precision — permanent dark mode
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import LoginPage from "./pages/LoginPage";
import UserPage from "./pages/UserPage";
import BarberPage from "./pages/BarberPage";
import NotFound from "./pages/NotFound";

function AppRouter() {
  const { session } = useApp();

  if (!session) return <LoginPage />;
  if (session.role === "barber") return <BarberPage />;
  if (session.role === "user") return <UserPage />;
  return <LoginPage />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AppProvider>
          <TooltipProvider>
            <Toaster
              theme="dark"
              toastOptions={{
                style: {
                  background: "oklch(0.14 0 0)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  color: "oklch(0.95 0 0)",
                },
              }}
            />
            <AppRouter />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
