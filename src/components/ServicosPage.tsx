import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Scissors, Edit, Trash2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { ImageUpload } from '@/components/ImageUpload';

type Service = Tables<'services'>;

type ServiceInsert = {
  name: string;
  service_type: 'banho' | 'tosa' | 'banho_tosa' | 'tosa_higienica' | 'corte_unhas';
  base_price: number;
  duration_minutes?: number;
  description?: string;
  image_url?: string;
};

export const ServicosPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ServiceInsert>({
    name: '',
    service_type: 'banho',
    base_price: 0,
    duration_minutes: 60,
    description: '',
    image_url: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar serviços",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(formData)
          .eq('id', editingService.id);

        if (error) throw error;

        toast({
          title: "Serviço atualizado com sucesso!",
          description: "As informações do serviço foram atualizadas.",
        });
      } else {
        const { error } = await supabase
          .from('services')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Serviço cadastrado com sucesso!",
          description: "O serviço foi adicionado ao sistema.",
        });
      }

      setIsDialogOpen(false);
      setEditingService(null);
      resetForm();
      fetchServices();
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

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      service_type: service.service_type,
      base_price: Number(service.base_price),
      duration_minutes: service.duration_minutes || 60,
      description: service.description || '',
      image_url: service.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Serviço excluído com sucesso!",
        description: "O serviço foi removido do sistema.",
      });

      fetchServices();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir serviço",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      service_type: 'banho',
      base_price: 0,
      duration_minutes: 60,
      description: '',
      image_url: ''
    });
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || service.service_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'banho': return 'Banho';
      case 'tosa': return 'Tosa';
      case 'banho_tosa': return 'Banho e Tosa';
      case 'tosa_higienica': return 'Tosa Higiênica';
      case 'corte_unhas': return 'Corte de Unhas';
      default: return type;
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'banho': return 'bg-blue-100 text-blue-800';
      case 'tosa': return 'bg-purple-100 text-purple-800';
      case 'banho_tosa': return 'bg-green-100 text-green-800';
      case 'tosa_higienica': return 'bg-yellow-100 text-yellow-800';
      case 'corte_unhas': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && services.length === 0) {
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
          <Scissors className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">Serviços</h1>
            <p className="text-gray-600">Gerencie os serviços oferecidos</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingService(null); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                bucket="service-photos"
                label="Foto do Serviço"
              />

              <div className="space-y-2">
                <Label htmlFor="name">Nome do Serviço</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_type">Tipo de Serviço</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value: any) => setFormData({ ...formData, service_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banho">Banho</SelectItem>
                    <SelectItem value="tosa">Tosa</SelectItem>
                    <SelectItem value="banho_tosa">Banho e Tosa</SelectItem>
                    <SelectItem value="tosa_higienica">Tosa Higiênica</SelectItem>
                    <SelectItem value="corte_unhas">Corte de Unhas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_price">Preço Base</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duração (min)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
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
                  {loading ? 'Salvando...' : (editingService ? 'Atualizar' : 'Salvar')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar serviços por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="banho">Banho</SelectItem>
            <SelectItem value="tosa">Tosa</SelectItem>
            <SelectItem value="banho_tosa">Banho e Tosa</SelectItem>
            <SelectItem value="tosa_higienica">Tosa Higiênica</SelectItem>
            <SelectItem value="corte_unhas">Corte de Unhas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {service.image_url && (
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    R$ {Number(service.base_price).toFixed(2)}
                  </span>
                  <Badge className={getServiceTypeColor(service.service_type)}>
                    {getServiceTypeLabel(service.service_type)}
                  </Badge>
                </div>

                {service.duration_minutes && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {service.duration_minutes} minutos
                    </span>
                  </div>
                )}

                {service.description && (
                  <p className="text-sm text-gray-700">{service.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-8">
          <Scissors className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum serviço encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece cadastrando o primeiro serviço.'}
          </p>
        </div>
      )}
    </div>
  );
};
