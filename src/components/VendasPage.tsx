
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Client = Tables<'clients'>;
type Product = Tables<'products'>;
type Service = Tables<'services'>;

interface SaleItem {
  type: 'product' | 'service';
  item: Product | Service;
  quantity: number;
  price: number;
}

export const VendasPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, productsRes, servicesRes] = await Promise.all([
        supabase.from('clients').select('*').order('full_name'),
        supabase.from('products').select('*').order('name'),
        supabase.from('services').select('*').order('name')
      ]);

      if (clientsRes.data) setClients(clientsRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados necessários.",
        variant: "destructive",
      });
    }
  };

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Verificar se já existe no carrinho
    const existingItem = saleItems.find(item => 
      item.type === 'product' && item.item.id === productId
    );

    if (existingItem) {
      // Verificar se tem estoque suficiente
      if (existingItem.quantity >= product.stock_quantity) {
        toast({
          title: "Estoque insuficiente",
          description: `Só temos ${product.stock_quantity} unidades em estoque.`,
          variant: "destructive",
        });
        return;
      }

      setSaleItems(items => items.map(item => 
        item.type === 'product' && item.item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (product.stock_quantity <= 0) {
        toast({
          title: "Produto sem estoque",
          description: "Este produto não possui estoque disponível.",
          variant: "destructive",
        });
        return;
      }

      setSaleItems(items => [...items, {
        type: 'product',
        item: product,
        quantity: 1,
        price: product.sell_price
      }]);
    }
  };

  const addService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    setSaleItems(items => [...items, {
      type: 'service',
      item: service,
      quantity: 1,
      price: service.base_price
    }]);
  };

  const removeItem = (index: number) => {
    setSaleItems(items => items.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    
    const item = saleItems[index];
    if (item.type === 'product') {
      const product = item.item as Product;
      if (quantity > product.stock_quantity) {
        toast({
          title: "Estoque insuficiente",
          description: `Só temos ${product.stock_quantity} unidades em estoque.`,
          variant: "destructive",
        });
        return;
      }
    }

    setSaleItems(items => items.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const updatePrice = (index: number, price: number) => {
    if (price < 0) return;
    setSaleItems(items => items.map((item, i) => 
      i === index ? { ...item, price } : item
    ));
  };

  const totalAmount = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalAmount = Math.max(0, totalAmount - discount);

  const handleSale = async () => {
    if (!selectedClient || saleItems.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um cliente e adicione itens à venda.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Erro",
        description: "Selecione a forma de pagamento.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          client_id: selectedClient,
          employee_id: '00000000-0000-0000-0000-000000000000', // ID fictício
          total_amount: totalAmount,
          discount_amount: discount,
          final_amount: finalAmount,
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItemsData = saleItems.map(item => ({
        sale_id: sale.id,
        product_id: item.type === 'product' ? item.item.id : null,
        service_id: item.type === 'service' ? item.item.id : null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData);

      if (itemsError) throw itemsError;

      toast({
        title: "Venda realizada!",
        description: `Venda de R$ ${finalAmount.toFixed(2)} registrada com sucesso.`,
      });

      // Reset form
      setSelectedClient('');
      setSaleItems([]);
      setDiscount(0);
      setPaymentMethod('');

    } catch (error: any) {
      console.error('Sale error:', error);
      toast({
        title: "Erro ao realizar venda",
        description: error.message || "Erro desconhecido ao processar a venda.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ShoppingCart className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Vendas</h1>
          <p className="text-gray-600">Registre vendas de produtos e serviços</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sale Form */}
        <Card>
          <CardHeader>
            <CardTitle>Nova Venda</CardTitle>
            <CardDescription>
              Selecione o cliente e adicione produtos/serviços
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="client">Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Adicionar Produto</Label>
              <Select onValueChange={addProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.filter(p => p.stock_quantity > 0).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - R$ {product.sell_price.toFixed(2)} (Estoque: {product.stock_quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Adicionar Serviço</Label>
              <Select onValueChange={addService}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {service.base_price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discount">Desconto (R$)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="payment">Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sale Items */}
        <Card>
          <CardHeader>
            <CardTitle>Itens da Venda</CardTitle>
            <CardDescription>
              Items adicionados à venda atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {saleItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.item.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.type === 'product' ? 'Produto' : 'Serviço'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(index, Number(e.target.value))}
                      className="w-16"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updatePrice(index, Number(e.target.value))}
                      className="w-20"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {saleItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum item adicionado
                </div>
              )}
            </div>

            {saleItems.length > 0 && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span>- R$ {discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>R$ {finalAmount.toFixed(2)}</span>
                </div>
                <Button 
                  onClick={handleSale} 
                  disabled={loading}
                  className="w-full mt-4"
                >
                  {loading ? 'Processando...' : 'Finalizar Venda'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
