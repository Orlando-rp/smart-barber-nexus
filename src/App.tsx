import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// Layout
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UniversalLayout } from "@/components/layout/UniversalLayout";

// Admin
import DashboardSaas from "./pages/SuperAdmin";
import ClientesSaas from "./pages/admin/ClientesSaas";
import RelatoriosAdmin from "./pages/admin/RelatoriosAdmin";
import SistemaConfiguracoes from "./pages/admin/SistemaConfiguracoes";
import UsuariosAdmin from "./pages/admin/UsuariosAdmin";
import ConfiguracoesAdmin from "./pages/admin/ConfiguracoesAdmin";

// Planos
import Planos from "./pages/Planos";
import MeuPlano from "./pages/MeuPlano";

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
            
            {/* Rota pública de planos */}
            <Route path="/planos" element={<Planos />} />

            {/* Rotas protegidas principais com layout */}
            <Route path="/*" element={
              <ProtectedRoute>
                <UniversalLayout variant="default" />
              </ProtectedRoute>
            }>
              <Route index element={<Index />} />
              <Route path="agendamentos" element={<Agendamentos />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="servicos" element={<Servicos />} />
              <Route path="unidades" element={<Unidades />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="profissionais" element={<Profissionais />} />
              <Route path="notificacoes" element={<Notificacoes />} />
              <Route path="configuracoes" element={<Configuracoes />} />
              <Route path="meu-plano" element={<MeuPlano />} />
            </Route>

            {/* Rotas públicas (sem autenticação) */}
            <Route path="/agendar/:slug" element={<AgendarPublico />} />
            <Route path="/agendamento/:token" element={<GerenciarAgendamento />} />

            {/* Rotas do Super Admin com layout */}
            <Route path="/admin/*" element={
              <ProtectedRoute requireSuperAdmin={true}>
                <UniversalLayout variant="admin" />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardSaas />} />
              <Route path="clientes" element={<ClientesSaas />} />
              <Route path="relatorios" element={<RelatoriosAdmin />} />
              <Route path="sistema" element={<SistemaConfiguracoes />} />
              <Route path="usuarios" element={<UsuariosAdmin />} />
              <Route path="configuracoes" element={<ConfiguracoesAdmin />} />
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
