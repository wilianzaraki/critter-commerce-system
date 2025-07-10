
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Users, Phone, Mail, MapPin, Heart, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { ImageUpload } from './ImageUpload';

type Client = Tables<'clients'>;
type Pet = Tables<'pets'>;
type PetWithClient = Pet & { clients: Client };

type ClientInsert = {
  full_name: string;
  cpf: string;
  phone: string;
  email?: string;
  address: string;
};

type PetInsert = {
  client_id: string;
  name: string;
  species: 'cao' | 'gato' | 'passaro' | 'coelho' | 'outro';
  breed?: string;
  age?: number;
  size?: 'pequeno' | 'medio' | 'grande';
  medical_notes?: string;
  photo_url?: string;
  photo_url_2?: string;
  photo_url_3?: string;
};

export const ClientesPetsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [pets, setPets] = useState<PetWithClient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [clientFormData, setClientFormData] = useState<Partial<ClientInsert>>({
    full_name: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
  });

  const [petFormData, setPetFormData] = useState<PetInsert>({
    client_id: '',
    name: '',
    species: 'cao',
    breed: '',
    age: undefined,
    size: 'medio',
    medical_notes: '',
    photo_url: '',
    photo_url_2: '',
    photo_url_3: ''
  });

  useEffect(() => {
    fetchClients();
    fetchPets();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select(`
          *,
          clients!inner (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar pets",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(clientFormData)
          .eq('id', editingClient.id);

        if (error) throw error;

        toast({
          title: "Cliente atualizado",
          description: "Os dados do cliente foram atualizados com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('clients')
          .insert(clientFormData as ClientInsert);

        if (error) throw error;

        toast({
          title: "Cliente cadastrado",
          description: "Novo cliente foi cadastrado com sucesso.",
        });
      }

      setIsClientDialogOpen(false);
      setEditingClient(null);
      resetClientForm();
      fetchClients();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar cliente",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPet) {
        const { error } = await supabase
          .from('pets')
          .update(petFormData)
          .eq('id', editingPet.id);

        if (error) throw error;

        toast({
          title: "Pet atualizado com sucesso!",
          description: "As informações do pet foram atualizadas.",
        });
      } else {
        const { error } = await supabase
          .from('pets')
          .insert([petFormData]);

        if (error) throw error;

        toast({
          title: "Pet cadastrado com sucesso!",
          description: "O pet foi adicionado ao sistema.",
        });
      }

      setIsPetDialogOpen(false);
      setEditingPet(null);
      resetPetForm();
      fetchPets();
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

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientFormData({
      full_name: client.full_name,
      cpf: client.cpf,
      phone: client.phone,
      email: client.email,
      address: client.address,
    });
    setIsClientDialogOpen(true);
  };

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setPetFormData({
      client_id: pet.client_id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age || undefined,
      size: pet.size || 'medio',
      medical_notes: pet.medical_notes || '',
      photo_url: pet.photo_url || '',
      photo_url_2: pet.photo_url_2 || '',
      photo_url_3: pet.photo_url_3 || ''
    });
    setIsPetDialogOpen(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${client.full_name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: "Cliente excluído",
        description: "Cliente foi excluído com sucesso.",
      });
      fetchClients();
      fetchPets();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!confirm('Tem certeza que deseja excluir este pet?')) return;

    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) throw error;

      toast({
        title: "Pet excluído com sucesso!",
        description: "O pet foi removido do sistema.",
      });

      fetchPets();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir pet",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetClientForm = () => {
    setClientFormData({
      full_name: '',
      cpf: '',
      phone: '',
      email: '',
      address: '',
    });
  };

  const resetPetForm = () => {
    setPetFormData({
      client_id: '',
      name: '',
      species: 'cao',
      breed: '',
      age: undefined,
      size: 'medio',
      medical_notes: '',
      photo_url: '',
      photo_url_2: '',
      photo_url_3: ''
    });
  };

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf.includes(searchTerm) ||
    client.phone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.clients.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientPets = (clientId: string) => {
    return pets.filter(pet => pet.client_id === clientId);
  };

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'cao': return '🐕';
      case 'gato': return '🐱';
      case 'passaro': return '🐦';
      case 'coelho': return '🐰';
      default: return '🐾';
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'pequeno': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'grande': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Clientes & Pets</h1>
            <p className="text-gray-600">Gerencie clientes e seus pets em um só lugar</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="clientes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="pets" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Pets
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar clientes ou pets..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="clientes" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetClientForm(); setEditingClient(null); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingClient ? 'Edite as informações do cliente' : 'Preencha os dados do novo cliente'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleClientSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={clientFormData.full_name || ''}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={clientFormData.cpf || ''}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, cpf: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={clientFormData.phone || ''}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientFormData.email || ''}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={clientFormData.address || ''}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, address: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsClientDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const clientPets = getClientPets(client.id);
              return (
                <Card key={client.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{client.full_name}</CardTitle>
                        <CardDescription>CPF: {client.cpf}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClient(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {client.email}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {client.address}
                    </div>
                    
                    {clientPets.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Pets ({clientPets.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {clientPets.map((pet) => (
                            <Badge key={pet.id} variant="outline" className="text-xs">
                              {getSpeciesIcon(pet.species)} {pet.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {client.total_spent && (
                      <div className="pt-2 border-t">
                        <Badge variant="outline">
                          Total gasto: R$ {Number(client.total_spent).toFixed(2)}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="pets" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetPetForm(); setEditingPet(null); }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo Pet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPet ? 'Editar Pet' : 'Novo Pet'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handlePetSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ImageUpload
                      value={petFormData.photo_url}
                      onChange={(url) => setPetFormData({ ...petFormData, photo_url: url })}
                      bucket="pet-photos"
                      label="Foto Principal"
                    />
                    <ImageUpload
                      value={petFormData.photo_url_2}
                      onChange={(url) => setPetFormData({ ...petFormData, photo_url_2: url })}
                      bucket="pet-photos"
                      label="Foto 2 (Opcional)"
                    />
                    <ImageUpload
                      value={petFormData.photo_url_3}
                      onChange={(url) => setPetFormData({ ...petFormData, photo_url_3: url })}
                      bucket="pet-photos"
                      label="Foto 3 (Opcional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_id">Cliente</Label>
                    <Select
                      value={petFormData.client_id}
                      onValueChange={(value) => setPetFormData({ ...petFormData, client_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
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

                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Pet</Label>
                    <Input
                      id="name"
                      value={petFormData.name}
                      onChange={(e) => setPetFormData({ ...petFormData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="species">Espécie</Label>
                      <Select
                        value={petFormData.species}
                        onValueChange={(value: any) => setPetFormData({ ...petFormData, species: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cao">Cão</SelectItem>
                          <SelectItem value="gato">Gato</SelectItem>
                          <SelectItem value="passaro">Pássaro</SelectItem>
                          <SelectItem value="coelho">Coelho</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size">Porte</Label>
                      <Select
                        value={petFormData.size}
                        onValueChange={(value: any) => setPetFormData({ ...petFormData, size: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pequeno">Pequeno</SelectItem>
                          <SelectItem value="medio">Médio</SelectItem>
                          <SelectItem value="grande">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="breed">Raça</Label>
                      <Input
                        id="breed"
                        value={petFormData.breed}
                        onChange={(e) => setPetFormData({ ...petFormData, breed: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Idade</Label>
                      <Input
                        id="age"
                        type="number"
                        value={petFormData.age || ''}
                        onChange={(e) => setPetFormData({ ...petFormData, age: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medical_notes">Observações Médicas</Label>
                    <Textarea
                      id="medical_notes"
                      value={petFormData.medical_notes}
                      onChange={(e) => setPetFormData({ ...petFormData, medical_notes: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsPetDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : (editingPet ? 'Atualizar' : 'Salvar')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPets.map((pet) => (
              <Card key={pet.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pet.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditPet(pet)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePet(pet.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {pet.photo_url && (
                        <img
                          src={pet.photo_url}
                          alt={pet.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      {pet.photo_url_2 && (
                        <img
                          src={pet.photo_url_2}
                          alt={`${pet.name} 2`}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      {pet.photo_url_3 && (
                        <img
                          src={pet.photo_url_3}
                          alt={`${pet.name} 3`}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Cliente</p>
                      <p className="font-medium">{pet.clients.full_name}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={getSizeColor(pet.size || 'medio')}>
                        {pet.size || 'médio'}
                      </Badge>
                      {pet.breed && (
                        <Badge variant="outline">{pet.breed}</Badge>
                      )}
                      {pet.age && (
                        <Badge variant="outline">{pet.age} anos</Badge>
                      )}
                    </div>

                    {pet.medical_notes && (
                      <div>
                        <p className="text-sm text-gray-600">Observações</p>
                        <p className="text-sm">{pet.medical_notes}</p>
                      </div>
                    )}

                    {pet.last_visit && (
                      <div>
                        <p className="text-sm text-gray-600">Última visita</p>
                        <p className="text-sm">{new Date(pet.last_visit).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredClients.length === 0 && filteredPets.length === 0 && (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum resultado encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece cadastrando um cliente e seus pets.'}
          </p>
        </div>
      )}
    </div>
  );
};
