
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const mockClients = [
  {
    id: 1,
    name: 'Maria Silva',
    cpf: '123.456.789-00',
    phone: '(11) 99999-9999',
    email: 'maria@email.com',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    pets: ['Luna', 'Max'],
    totalSpent: 1250.00
  },
  {
    id: 2,
    name: 'João Santos',
    cpf: '987.654.321-00',
    phone: '(11) 88888-8888',
    email: 'joao@email.com',
    address: 'Av. Paulista, 456 - São Paulo, SP',
    pets: ['Bella'],
    totalSpent: 800.00
  },
];

export const ClientesPage = () => {
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf.includes(searchTerm) ||
    client.phone.includes(searchTerm)
  );

  const handleAddClient = () => {
    setEditingClient(null);
    setIsDialogOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const ClientForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome Completo</Label>
          <Input id="name" placeholder="Digite o nome completo" />
        </div>
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" placeholder="000.000.000-00" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" placeholder="(11) 99999-9999" />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="cliente@email.com" />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Endereço Completo</Label>
        <Textarea id="address" placeholder="Rua, número, bairro, cidade, estado" />
      </div>
      
      <div>
        <Label htmlFor="photo">Foto do Cliente</Label>
        <Input id="photo" type="file" accept="image/*" />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
          Cancelar
        </Button>
        <Button onClick={() => setIsDialogOpen(false)}>
          {editingClient ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClient}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <ClientForm />
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
                placeholder="Buscar por nome, CPF ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{client.name}</h3>
                      <p className="text-gray-500">CPF: {client.cpf}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{client.email}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">
                        Total gasto: R$ {client.totalSpent.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{client.address}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Pets: {client.pets.join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditClient(client)}
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
