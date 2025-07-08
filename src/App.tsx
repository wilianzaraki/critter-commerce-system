
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Layout } from "@/components/Layout";
import { Login } from "@/components/Login";
import { Dashboard } from "@/components/Dashboard";
import { ClientesPage } from "@/components/ClientesPage";
import { PetsPage } from "@/components/PetsPage";
import { ProdutosPage } from "@/components/ProdutosPage";
import { ServicosPage } from "@/components/ServicosPage";
import { AgendamentosPage } from "@/components/AgendamentosPage";
import { VendasPage } from "@/components/VendasPage";
import { RelatoriosPage } from "@/components/RelatoriosPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="clientes" element={<ClientesPage />} />
                <Route path="pets" element={<PetsPage />} />
                <Route path="produtos" element={<ProdutosPage />} />
                <Route path="servicos" element={<ServicosPage />} />
                <Route path="agendamentos" element={<AgendamentosPage />} />
                <Route path="vendas" element={<VendasPage />} />
                <Route path="relatorios" element={<RelatoriosPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
