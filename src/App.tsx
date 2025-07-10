
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { ClientesPage } from "@/components/ClientesPage";
import { PetsPage } from "@/components/PetsPage";
import { ProdutosPage } from "@/components/ProdutosPage";
import { ServicosPage } from "@/components/ServicosPage";
import { AgendamentosPage } from "@/components/AgendamentosPage";
import { VendasPage } from "@/components/VendasPage";
import { RelatoriosPage } from "@/components/RelatoriosPage";
import { AdminPage } from "@/components/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="pets" element={<PetsPage />} />
              <Route path="produtos" element={<ProdutosPage />} />
              <Route path="servicos" element={<ServicosPage />} />
              <Route path="agendamentos" element={<AgendamentosPage />} />
              <Route path="vendas" element={<VendasPage />} />
              <Route path="relatorios" element={<RelatoriosPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
