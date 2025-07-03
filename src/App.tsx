import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Páginas principais
import Index from "./pages/Index";
import Agendamentos from "./pages/Agendamentos";
import Clientes from "./pages/Clientes";
import Servicos from "./pages/Servicos";
import Unidades from "./pages/Unidades";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AgendarPublico from "./pages/AgendarPublico";
import GerenciarAgendamento from "./pages/GerenciarAgendamento";
import Analytics from "./pages/Analytics";
import Financeiro from "./pages/Financeiro";
import Profissionais from "./pages/Profissionais";
import Notificacoes from "./pages/Notificacoes";
import Configuracoes from "./pages/Configuracoes";

// Admin
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
import DashboardSaas from "./pages/admin/DashboardSaas";
import ClientesSaas from "./pages/admin/ClientesSaas";
import RelatoriosAdmin from "./pages/admin/RelatoriosAdmin";
import SistemaConfiguracoes from "./pages/admin/SistemaConfiguracoes";
import UsuariosAdmin from "./pages/admin/UsuariosAdmin";
import ConfiguracoesAdmin from "./pages/admin/ConfiguracoesAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota de login */}
            <Route path="/auth" element={<Auth />} />

            {/* Rotas protegidas principais */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/agendamentos" element={<ProtectedRoute><Agendamentos /></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
            <Route path="/servicos" element={<ProtectedRoute><Servicos /></ProtectedRoute>} />
            <Route path="/unidades" element={<ProtectedRoute><Unidades /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
            <Route path="/profissionais" element={<ProtectedRoute><Profissionais /></ProtectedRoute>} />
            <Route path="/notificacoes" element={<ProtectedRoute><Notificacoes /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />

            {/* Rotas públicas (sem autenticação) */}
            <Route path="/agendar/:slug" element={<AgendarPublico />} />
            <Route path="/agendamento/:token" element={<GerenciarAgendamento />} />

            {/* Rotas do Super Admin com layout */}
            <Route path="/admin" element={
              <ProtectedRoute requireSuperAdmin={true}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardSaas />} />
              <Route path="clientes" element={</admin/ClientesSaas />} />
              <Route path="relatorios" element={</admin/RelatoriosAdmin />} />
              <Route path="sistema" element={</admin/SistemaConfiguracoes />} />
              <Route path="usuarios" element={</admin/UsuariosAdmin />} />
              <Route path="configuracoes" element={</admin/ConfiguracoesAdmin />} /> {/* opcional */}
            </Route>

            {/* Página 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
