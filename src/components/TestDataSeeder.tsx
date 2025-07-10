import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, TestTube, Users, Package, ShoppingCart } from 'lucide-react';

export const TestDataSeeder = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const seedClients = async () => {
    setLoading(true);
    try {
      const clients = [
        {
          full_name: 'João Silva',
          cpf: '123.456.789-01',
          phone: '(11) 99999-1111',
          email: 'joao@email.com',
          address: 'Rua das Flores, 123 - São Paulo, SP'
        },
        {
          full_name: 'Maria Santos',
          cpf: '987.654.321-02',
          phone: '(11) 99999-2222', 
          email: 'maria@email.com',
          address: 'Av. Paulista, 456 - São Paulo, SP'
        },
        {
          full_name: 'Pedro Oliveira',
          cpf: '456.789.123-03',
          phone: '(11) 99999-3333',
          email: 'pedro@email.com', 
          address: 'Rua da Consolação, 789 - São Paulo, SP'
        }
      ];

      const { error } = await supabase.from('clients').insert(clients);
      if (error) throw error;

      toast({
        title: "Clientes cadastrados!",
        description: `${clients.length} clientes foram adicionados com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar clientes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const seedProducts = async () => {
    setLoading(true);
    try {
      // Primeiro, buscar categorias existentes
      const { data: categories } = await supabase
        .from('product_categories')
        .select('*');

      const alimentacaoCategory = categories?.find(c => c.name === 'Alimentação');
      const higieneCategory = categories?.find(c => c.name === 'Higiene');
      const brinquedosCategory = categories?.find(c => c.name === 'Brinquedos');

      const products = [
        {
          name: 'Ração Premium Cães Adultos 15kg',
          description: 'Ração super premium para cães adultos de todas as raças',
          brand: 'Royal Canin',
          category_id: alimentacaoCategory?.id,
          cost_price: 120.00,
          sell_price: 180.00,
          stock_quantity: 50,
          min_stock: 10,
          barcode: '7891234567890'
        },
        {
          name: 'Shampoo Neutro 500ml',
          description: 'Shampoo neutro para banho de cães e gatos',
          brand: 'Petshop Premium',
          category_id: higieneCategory?.id,
          cost_price: 15.00,
          sell_price: 25.00,
          stock_quantity: 30,
          min_stock: 5,
          barcode: '7891234567891'
        },
        {
          name: 'Bola de Borracha',
          description: 'Bola resistente para cães brincarem',
          brand: 'PetToys',
          category_id: brinquedosCategory?.id,
          cost_price: 8.00,
          sell_price: 15.00,
          stock_quantity: 25,
          min_stock: 3,
          barcode: '7891234567892'
        },
        {
          name: 'Ração Gatos Castrados 3kg',
          description: 'Ração especial para gatos castrados',
          brand: 'Whiskas',
          category_id: alimentacaoCategory?.id,
          cost_price: 35.00,
          sell_price: 55.00,
          stock_quantity: 40,
          min_stock: 8,
          barcode: '7891234567893'
        },
        {
          name: 'Escova de Dentes Pet',
          description: 'Escova especial para higiene bucal de pets',
          brand: 'DentPet',
          category_id: higieneCategory?.id,
          cost_price: 12.00,
          sell_price: 20.00,
          stock_quantity: 20,
          min_stock: 3,
          barcode: '7891234567894'
        }
      ];

      const { error } = await supabase.from('products').insert(products);
      if (error) throw error;

      toast({
        title: "Produtos cadastrados!",
        description: `${products.length} produtos foram adicionados com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar produtos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const seedServices = async () => {
    setLoading(true);
    try {
      const services = [
        {
          name: 'Banho Simples',
          service_type: 'banho' as const,
          base_price: 35.00,
          duration_minutes: 45,
          description: 'Banho com shampoo neutro e secagem'
        },
        {
          name: 'Tosa Completa',
          service_type: 'tosa' as const,
          base_price: 60.00,
          duration_minutes: 90,
          description: 'Tosa completa com acabamento profissional'
        },
        {
          name: 'Banho e Tosa Premium',
          service_type: 'banho_tosa' as const,
          base_price: 85.00,
          duration_minutes: 120,
          description: 'Serviço completo de banho e tosa com hidratação'
        }
      ];

      const { error } = await supabase.from('services').insert(services);
      if (error) throw error;

      toast({
        title: "Serviços cadastrados!",
        description: `${services.length} serviços foram adicionados com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar serviços",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestSales = async () => {
    setLoading(true);
    try {
      // Buscar clientes e produtos para criar vendas
      const { data: clients } = await supabase.from('clients').select('*').limit(3);
      const { data: products } = await supabase.from('products').select('*').limit(3);
      const { data: services } = await supabase.from('services').select('*').limit(2);

      if (!clients?.length || !products?.length) {
        toast({
          title: "Erro",
          description: "É necessário ter clientes e produtos cadastrados primeiro.",
          variant: "destructive",
        });
        return;
      }

      // Criar algumas vendas de exemplo
      const sales = [
        {
          client_id: clients[0].id,
          employee_id: '00000000-0000-0000-0000-000000000000', // ID fictício para funcionário
          total_amount: 205.00,
          discount_amount: 5.00,
          final_amount: 200.00,
          payment_method: 'cartao_credito'
        },
        {
          client_id: clients[1].id, 
          employee_id: '00000000-0000-0000-0000-000000000000',
          total_amount: 70.00,
          discount_amount: 0.00,
          final_amount: 70.00,
          payment_method: 'pix'
        }
      ];

      // Inserir vendas
      const { data: createdSales, error: salesError } = await supabase
        .from('sales')
        .insert(sales)
        .select();

      if (salesError) throw salesError;

      // Inserir itens das vendas
      if (createdSales) {
        const saleItems = [
          // Primeira venda: Ração + Shampoo + Serviço
          {
            sale_id: createdSales[0].id,
            product_id: products[0].id,
            quantity: 1,
            unit_price: 180.00,
            total_price: 180.00
          },
          {
            sale_id: createdSales[0].id,
            product_id: products[1].id,
            quantity: 1,
            unit_price: 25.00,
            total_price: 25.00
          },
          // Segunda venda: Brinquedo + Escova
          {
            sale_id: createdSales[1].id,
            product_id: products[2].id,
            quantity: 2,
            unit_price: 15.00,
            total_price: 30.00
          },
          {
            sale_id: createdSales[1].id,
            product_id: products.length > 4 ? products[4].id : products[1].id,
            quantity: 2,
            unit_price: 20.00,
            total_price: 40.00
          }
        ];

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Vendas de teste criadas!",
        description: "Vendas de exemplo foram criadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar vendas de teste",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!confirm('Tem certeza que deseja limpar TODOS os dados de teste? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    try {
      // Limpar em ordem devido às dependências
      await supabase.from('sale_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('pets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('services').delete().neq('name', 'Banho');
      await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('stock_movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      toast({
        title: "Dados limpos!",
        description: "Todos os dados de teste foram removidos.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao limpar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-6 w-6" />
          Dados de Teste do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={seedClients}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Cadastrar Clientes de Teste
          </Button>

          <Button
            onClick={seedProducts}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Cadastrar Produtos de Teste
          </Button>

          <Button
            onClick={seedServices}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Cadastrar Serviços de Teste
          </Button>

          <Button
            onClick={createTestSales}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Criar Vendas de Teste
          </Button>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={clearAllData}
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            Limpar Todos os Dados de Teste
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
