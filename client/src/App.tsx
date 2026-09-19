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

import MaintenancePage from "./pages/MaintenancePage";

function Router() {
  return (
    <Switch>
      {/* Active Illustrated Doodle Tools - External static pages */}
      <Route path="/live">
        {() => {
          window.location.replace("/tool/live/");
          return null;
        }}
      </Route>
      <Route path="/fees">
        {() => {
          window.location.replace("/tool/fee-calculator/");
          return null;
        }}
      </Route>

      {/* Main Tools Workspace */}
      <Route path="/" component={ToolHub} />
      
      {/* Legacy /tool route redirects to root */}
      <Route path="/tool">
        {() => <Redirect to="/" />}
      </Route>

      {/* Admin/workflow/login routes - currently hidden/maintenance */}
      <Route path="/admin" component={MaintenancePage} />
      <Route path="/admin/settings" component={MaintenancePage} />
      <Route path="/admin/analytics" component={MaintenancePage} />
      <Route path="/flow" component={MaintenancePage} />
      <Route path="/login" component={MaintenancePage} />

      {/* Fallback */}
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
