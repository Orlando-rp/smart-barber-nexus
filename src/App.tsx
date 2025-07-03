import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Agendamentos from "./pages/Agendamentos";
import Clientes from "./pages/Clientes";
import Servicos from "./pages/Servicos";
import SuperAdmin from "./pages/SuperAdmin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AgendarPublico from "./pages/AgendarPublico";
import GerenciarAgendamento from "./pages/GerenciarAgendamento";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/agendamentos" element={
              <ProtectedRoute>
                <Agendamentos />
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute>
                <Clientes />
              </ProtectedRoute>
            } />
            <Route path="/servicos" element={
              <ProtectedRoute>
                <Servicos />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireSuperAdmin={true}>
                <SuperAdmin />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/agendar/:slug" element={<AgendarPublico />} />
            <Route path="/agendamento/:token" element={<GerenciarAgendamento />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
