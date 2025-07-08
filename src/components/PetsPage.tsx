
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Heart, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const mockPets = [
  {
    id: 1,
    name: 'Luna',
    species: 'Cão',
    breed: 'Golden Retriever',
    age: 3,
    size: 'Grande',
    owner: 'Maria Silva',
    ownerId: 1,
    medicalNotes: 'Alergia a frango',
    lastVisit: '2024-01-15',
    photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop&crop=faces'
  },
  {
    id: 2,
    name: 'Max',
    species: 'Cão',
    breed: 'Labrador',
    age: 5,
    size: 'Grande',
    owner: 'Maria Silva',
    ownerId: 1,
    medicalNotes: 'Nenhuma observação',
    lastVisit: '2024-01-10',
    photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop&crop=faces'
  },
  {
    id: 3,
    name: 'Bella',
    species: 'Gato',
    breed: 'Persa',
    age: 2,
    size: 'Médio',
    owner: 'João Santos',
    ownerId: 2,
    medicalNotes: 'Pelagem sensível',
    lastVisit: '2024-01-12',
    photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=faces'
  },
];

const mockClients = [
  { id: 1, name: 'Maria Silva' },
  { id: 2, name: 'João Santos' },
  { id: 3, name: 'Ana Costa' },
];

export const PetsPage = () => {
  const [pets, setPets] = useState(mockPets);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPet = () => {
    setEditingPet(null);
    setIsDialogOpen(true);
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setIsDialogOpen(true);
  };

  const PetForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="owner">Cliente (Dono)</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {mockClients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="petName">Nome do Pet</Label>
          <Input id="petName" placeholder="Digite o nome do pet" />
        </div>
        <div>
          <Label htmlFor="species">Espécie</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a espécie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">Cão</SelectItem>
              <SelectItem value="cat">Gato</SelectItem>
              <SelectItem value="bird">Pássaro</SelectItem>
              <SelectItem value="rabbit">Coelho</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="breed">Raça</Label>
          <Input id="breed" placeholder="Ex: Golden Retriever" />
        </div>
        <div>
          <Label htmlFor="age">Idade</Label>
          <Input id="age" type="number" placeholder="Em anos" />
        </div>
        <div>
          <Label htmlFor="size">Porte</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Porte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeno</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="medicalNotes">Observações Médicas</Label>
        <Textarea id="medicalNotes" placeholder="Alergias, medicações, observações especiais..." />
      </div>
      
      <div>
        <Label htmlFor="petPhoto">Foto do Pet</Label>
        <Input id="petPhoto" type="file" accept="image/*" />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
          Cancelar
        </Button>
        <Button onClick={() => setIsDialogOpen(false)}>
          {editingPet ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pets</h1>
          <p className="text-gray-600">Gerencie os pets dos seus clientes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddPet}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPet ? 'Editar Pet' : 'Novo Pet'}
              </DialogTitle>
            </DialogHeader>
            <PetForm />
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
                placeholder="Buscar por nome do pet, dono ou raça..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPets.map((pet) => (
          <Card key={pet.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={pet.photo}
                alt={pet.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                  {pet.species}
                </span>
              </div>
            </div>
            
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{pet.name}</h3>
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                
                <p className="text-sm text-gray-600">{pet.breed} • {pet.age} anos</p>
                <p className="text-sm text-gray-600">Porte: {pet.size}</p>
                <p className="text-sm font-medium">Dono: {pet.owner}</p>
                
                {pet.medicalNotes && (
                  <div className="bg-yellow-50 p-2 rounded text-xs">
                    <p className="text-yellow-800">{pet.medicalNotes}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Última visita: {pet.lastVisit}</span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditPet(pet)}
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
