
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Heart, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { ImageUpload } from './ImageUpload';

type Pet = Tables<'pets'>;
type Client = Tables<'clients'>;

// Define the pet with client data type to match Supabase response
type PetWithClient = Pet & {
  clients: Client;
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
};

export const PetsPage = () => {
  const [pets, setPets] = useState<PetWithClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState<PetInsert>({
    client_id: '',
    name: '',
    species: 'cao',
    breed: '',
    age: undefined,
    size: 'medio',
    medical_notes: '',
    photo_url: ''
  });

  useEffect(() => {
    fetchPets();
    fetchClients();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPet) {
        const { error } = await supabase
          .from('pets')
          .update(formData)
          .eq('id', editingPet.id);

        if (error) throw error;

        toast({
          title: "Pet atualizado com sucesso!",
          description: "As informações do pet foram atualizadas.",
        });
      } else {
        const { error } = await supabase
          .from('pets')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Pet cadastrado com sucesso!",
          description: "O pet foi adicionado ao sistema.",
        });
      }

      setIsDialogOpen(false);
      setEditingPet(null);
      resetForm();
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

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      client_id: pet.client_id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age || undefined,
      size: pet.size || 'medio',
      medical_notes: pet.medical_notes || '',
      photo_url: pet.photo_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (petId: string) => {
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

  const resetForm = () => {
    setFormData({
      client_id: '',
      name: '',
      species: 'cao',
      breed: '',
      age: undefined,
      size: 'medio',
      medical_notes: '',
      photo_url: ''
    });
  };

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.clients.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading && pets.length === 0) {
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
          <Heart className="h-8 w-8 text-pink-600" />
          <div>
            <h1 className="text-3xl font-bold">Pets</h1>
            <p className="text-gray-600">Gerencie os pets dos seus clientes</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingPet(null); }}>
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
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageUpload
                value={formData.photo_url}
                onChange={(url) => setFormData({ ...formData, photo_url: url })}
                bucket="pet-photos"
                label="Foto do Pet"
              />

              <div className="space-y-2">
                <Label htmlFor="client_id">Cliente</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="species">Espécie</Label>
                  <Select
                    value={formData.species}
                    onValueChange={(value: any) => setFormData({ ...formData, species: value })}
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
                    value={formData.size}
                    onValueChange={(value: any) => setFormData({ ...formData, size: value })}
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
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_notes">Observações Médicas</Label>
                <Textarea
                  id="medical_notes"
                  value={formData.medical_notes}
                  onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar pets por nome, cliente ou raça..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPets.map((pet) => (
          <Card key={pet.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getSpeciesIcon(pet.species)}</span>
                  {pet.name}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(pet)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(pet.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pet.photo_url && (
                  <div className="flex justify-center">
                    <img
                      src={pet.photo_url}
                      alt={pet.name}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}

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

      {filteredPets.length === 0 && (
        <div className="text-center py-8">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pet encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece cadastrando o primeiro pet.'}
          </p>
        </div>
      )}
    </div>
  );
};
