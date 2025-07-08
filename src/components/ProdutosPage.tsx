
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const mockProducts = [
  {
    id: 1,
    name: 'Ração Golden Adulto 15kg',
    category: 'Alimentação',
    brand: 'Golden',
    description: 'Ração premium para cães adultos',
    sellPrice: 189.90,
    costPrice: 145.00,
    stock: 25,
    minStock: 10,
    barcode: '7891234567890',
    image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=200&h=200&fit=crop'
  },
  {
    id: 2,
    name: 'Shampoo Neutro Pet',
    category: 'Higiene',
    brand: 'Petbras',
    description: 'Shampoo neutro para todos os tipos de pelo',
    sellPrice: 24.90,
    costPrice: 18.00,
    stock: 8,
    minStock: 15,
    barcode: '7891234567891',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop'
  },
  {
    id: 3,
    name: 'Brinquedo Corda Dental',
    category: 'Brinquedos',
    brand: 'Dog Toy',
    description: 'Brinquedo de corda que ajuda na limpeza dos dentes',
    sellPrice: 15.90,
    costPrice: 8.50,
    stock: 40,
    minStock: 20,
    barcode: '7891234567892',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop'
  },
];

const categories = ['Alimentação', 'Higiene', 'Brinquedos', 'Medicamentos', 'Acessórios'];

export const ProdutosPage = () => {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const ProductForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="productName">Nome do Produto</Label>
          <Input id="productName" placeholder="Digite o nome do produto" />
        </div>
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand">Marca</Label>
          <Input id="brand" placeholder="Marca do produto" />
        </div>
        <div>
          <Label htmlFor="barcode">Código de Barras</Label>
          <Input id="barcode" placeholder="7891234567890" />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" placeholder="Descrição detalhada do produto" />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="costPrice">Preço de Custo</Label>
          <Input id="costPrice" type="number" step="0.01" placeholder="0,00" />
        </div>
        <div>
          <Label htmlFor="sellPrice">Preço de Venda</Label>
          <Input id="sellPrice" type="number" step="0.01" placeholder="0,00" />
        </div>
        <div>
          <Label htmlFor="stock">Quantidade em Estoque</Label>
          <Input id="stock" type="number" placeholder="0" />
        </div>
      </div>
      
      <div>
        <Label htmlFor="minStock">Estoque Mínimo</Label>
        <Input id="minStock" type="number" placeholder="Quantidade mínima para alerta" />
      </div>
      
      <div>
        <Label htmlFor="productImage">Imagem do Produto</Label>
        <Input id="productImage" type="file" accept="image/*" />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
          Cancelar
        </Button>
        <Button onClick={() => setIsDialogOpen(false)}>
          {editingProduct ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie seu estoque de produtos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, marca ou código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              {product.stock <= product.minStock && (
                <div className="absolute top-2 left-2">
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Estoque baixo</span>
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                  {product.category}
                </span>
              </div>
            </div>
            
            <CardContent className="pt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.brand}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Preço de venda:</span>
                    <span className="font-semibold text-green-600">
                      R$ {product.sellPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estoque:</span>
                    <span className={`font-semibold ${
                      product.stock <= product.minStock ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {product.stock} unidades
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Código:</span>
                    <span>{product.barcode}</span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
