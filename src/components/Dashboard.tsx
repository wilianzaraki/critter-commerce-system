import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStats {
  totalRevenue: number;
  totalClients: number;
  todayAppointments: number;
  lowStockCount: number;
  recentSales: any[];
  upcomingAppointments: any[];
  salesData: any[];
  lowStockProducts: any[];
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalClients: 0,
    todayAppointments: 0,
    lowStockCount: 0,
    recentSales: [],
    upcomingAppointments: [],
    salesData: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = startOfDay(new Date());
      const sevenDaysAgo = subDays(today, 7);

      // Fetch total revenue from last 30 days
      const { data: revenueData } = await supabase
        .from('sales')
        .select('final_amount')
        .gte('sale_date', subDays(today, 30).toISOString());

      const totalRevenue = revenueData?.reduce((sum, sale) => sum + Number(sale.final_amount), 0) || 0;

      // Fetch total clients count
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Fetch today's appointments
      const { count: todayAppointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', format(today, 'yyyy-MM-dd'));

      // Fetch low stock products
      const { data: lowStockData } = await supabase
        .from('products')
        .select('*')
        .lt('stock_quantity', 'min_stock');

      // Fetch recent sales with client info
      const { data: recentSalesData } = await supabase
        .from('sales')
        .select(`
          *,
          clients (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch upcoming appointments with pet and client info
      const { data: upcomingData } = await supabase
        .from('appointments')
        .select(`
          *,
          pets (name, clients (full_name)),
          services (name)
        `)
        .gte('appointment_date', format(today, 'yyyy-MM-dd'))
        .order('appointment_date')
        .order('appointment_time')
        .limit(5);

      // Fetch sales data for chart (last 7 days)
      const { data: salesChartData } = await supabase
        .from('sales')
        .select('sale_date, final_amount')
        .gte('sale_date', sevenDaysAgo.toISOString())
        .order('sale_date');

      // Group sales by day for chart
      const salesMap = new Map();
      for (let i = 0; i < 7; i++) {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'dd/MM', { locale: ptBR });
        salesMap.set(dateStr, 0);
      }

      salesChartData?.forEach(sale => {
        const dateStr = format(new Date(sale.sale_date), 'dd/MM', { locale: ptBR });
        if (salesMap.has(dateStr)) {
          salesMap.set(dateStr, salesMap.get(dateStr) + Number(sale.final_amount));
        }
      });

      const chartData = Array.from(salesMap.entries()).map(([date, amount]) => ({
        date,
        amount
      }));

      setStats({
        totalRevenue,
        totalClients: clientsCount || 0,
        todayAppointments: todayAppointmentsCount || 0,
        lowStockCount: lowStockData?.length || 0,
        recentSales: recentSalesData || [],
        upcomingAppointments: upcomingData || [],
        salesData: chartData,
        lowStockProducts: lowStockData || []
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu petshop</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita (30 dias)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Total de clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Serviços marcados para hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Produtos precisando reposição
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vendas dos Últimos 7 Dias
            </CardTitle>
            <CardDescription>
              Receita diária do petshop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Vendas']}
                />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardDescription>
              Últimas transações realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {sale.clients?.full_name || 'Cliente não identificado'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      R$ {Number(sale.final_amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sale.payment_method || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
              {stats.recentSales.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  Nenhuma venda recente
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>
              Serviços agendados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {appointment.pets?.name} - {appointment.pets?.clients?.full_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {appointment.services?.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {format(new Date(appointment.appointment_date), 'dd/MM', { locale: ptBR })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.appointment_time}
                    </div>
                  </div>
                </div>
              ))}
              {stats.upcomingAppointments.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  Nenhum agendamento próximo
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Produtos com Estoque Baixo
            </CardTitle>
            <CardDescription>
              Produtos que precisam de reposição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.brand}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {product.stock_quantity} restante{product.stock_quantity !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              ))}
              {stats.lowStockProducts.length === 0 && (
                <div className="text-center py-6 text-green-600">
                  ✓ Todos os produtos com estoque adequado
                </div>
              )}
            </div>
            {stats.lowStockProducts.length > 5 && (
              <div className="pt-3 border-t">
                <Button variant="outline" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver todos ({stats.lowStockProducts.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
