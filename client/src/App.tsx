import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import Pricing from "./pages/Pricing";
import Tests from "./pages/Tests";
import SnellenTest from "./pages/SnellenTest";
import Exercises from "./pages/Exercises";
import EyeTrackingTest from "./pages/EyeTrackingTest";
import EyeBreakoutGame from "./pages/EyeBreakoutGame";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile/setup" component={ProfileSetup} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/tests" component={Tests} />
      <Route path="/tests/snellen" component={SnellenTest} />
      <Route path="/exercises" component={Exercises} />
      <Route path="/tests/eye-tracking" component={EyeTrackingTest} />
      <Route path="/exercises/eye-game" component={EyeBreakoutGame} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
