
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Package, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type ProductCategory = Tables<'product_categories'>;

type ProductInsert = {
  name: string;
  category_id?: string;
  brand?: string;
  description?: string;
  sell_price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock: number;
  barcode?: string;
  image_url?: string;
};

export const ProdutosPage = () => {
  const [products, setProducts] = useState<(Product & { product_categories?: ProductCategory })[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProductInsert>({
    name: '',
    category_id: '',
    brand: '',
    description: '',
    sell_price: 0,
    cost_price: 0,
    stock_quantity: 0,
    min_stock: 5,
    barcode: '',
    image_url: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado com sucesso!",
          description: "As informações do produto foram atualizadas.",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Produto cadastrado com sucesso!",
          description: "O produto foi adicionado ao sistema.",
        });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category_id: product.category_id || '',
      brand: product.brand || '',
      description: product.description || '',
      sell_price: Number(product.sell_price),
      cost_price: Number(product.cost_price),
      stock_quantity: product.stock_quantity,
      min_stock: product.min_stock,
      barcode: product.barcode || '',
      image_url: product.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Produto excluído com sucesso!",
        description: "O produto foi removido do sistema.",
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: '',
      brand: '',
      description: '',
      sell_price: 0,
      cost_price: 0,
      stock_quantity: 0,
      min_stock: 5,
      barcode: '',
      image_url: ''
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm);
    
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(product => product.stock_quantity <= product.min_stock);

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-gray-600">Gerencie seu estoque e produtos</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingProduct(null); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sell_price">Preço de Venda</Label>
                  <Input
                    id="sell_price"
                    type="number"
                    step="0.01"
                    value={formData.sell_price}
                    onChange={(e) => setFormData({ ...formData, sell_price: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost_price">Preço de Custo</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_stock">Estoque Mínimo</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Código de Barras</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : (editingProduct ? 'Atualizar' : 'Salvar')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Produtos com Estoque Baixo ({lowStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.slice(0, 5).map((product) => (
                <Badge key={product.id} variant="outline" className="text-orange-800 border-orange-300">
                  {product.name} ({product.stock_quantity})
                </Badge>
              ))}
              {lowStockProducts.length > 5 && (
                <Badge variant="outline" className="text-orange-800 border-orange-300">
                  +{lowStockProducts.length - 5} mais
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produtos por nome, marca ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className={product.stock_quantity <= product.min_stock ? 'border-orange-200' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    R$ {Number(product.sell_price).toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    {product.product_categories && (
                      <Badge variant="outline">{product.product_categories.name}</Badge>
                    )}
                    {product.stock_quantity <= product.min_stock && (
                      <Badge variant="destructive">Estoque Baixo</Badge>
                    )}
                  </div>
                </div>

                {product.brand && (
                  <p className="text-sm text-gray-600">Marca: {product.brand}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Estoque</p>
                    <p className="font-medium">{product.stock_quantity} unidades</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Custo</p>
                    <p className="font-medium">R$ {Number(product.cost_price).toFixed(2)}</p>
                  </div>
                </div>

                {product.barcode && (
                  <div>
                    <p className="text-sm text-gray-600">Código: {product.barcode}</p>
                  </div>
                )}

                {product.description && (
                  <p className="text-sm text-gray-700 line-clamp-2">{product.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece cadastrando o primeiro produto.'}
          </p>
        </div>
      )}
    </div>
  );
};
