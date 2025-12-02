import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MainLayout } from "./components/Layout/MainLayout";
import Home from "./pages/Home";
import Matches from "./pages/Matches";
import Teams from "./pages/Teams";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import MatchDetails from "./pages/MatchDetails";
import AutoPlacementConfirmation from "./pages/AutoPlacementConfirmation";
import CreateMatch from "./pages/CreateMatch";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/placement-confirmed" element={<ProtectedRoute><AutoPlacementConfirmation /></ProtectedRoute>} />
            
            <Route path="/" element={<ProtectedRoute><MainLayout><Home /></MainLayout></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><MainLayout><Matches /></MainLayout></ProtectedRoute>} />
            <Route path="/match/:id" element={<ProtectedRoute><MainLayout><MatchDetails /></MainLayout></ProtectedRoute>} />
            <Route path="/create-match" element={<ProtectedRoute><MainLayout><CreateMatch /></MainLayout></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute><MainLayout><Teams /></MainLayout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><MainLayout><Chat /></MainLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
