/* Design system: Editorial Ivory / Mountain Mist — ivory paper, ink typography, cobalt actions, coral punctuation, mountain contour signature. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import ToolHub from "@/pages/ToolHub";
import { Route, Redirect, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import AdminInsights from "./pages/AdminInsights";
import SystemFlow from "./pages/SystemFlow";
import Login from "./pages/Login";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/analytics" component={AdminInsights} />
      <Route path="/flow" component={SystemFlow} />
      <Route path="/tool" component={ToolHub} />
      <Route path="/fees">
        {() => {
          window.location.replace("/tool/khumkhai/");
          return null;
        }}
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
