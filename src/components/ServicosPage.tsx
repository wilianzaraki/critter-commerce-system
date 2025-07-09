
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Scissors } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { ServiceFilters } from './servicos/ServiceFilters';
import { ServicesList } from './servicos/ServicesList';
import { ServiceForm } from './servicos/ServiceForm';
import { useServicesData } from './servicos/useServicesData';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const { services, loading, saveService, deleteService } = useServicesData();

  const [formData, setFormData] = useState<ServiceInsert>({
    name: '',
    service_type: 'banho',
    base_price: 0,
    duration_minutes: 60,
    description: '',
    image_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveService(formData, editingService || undefined);
    
    if (success) {
      setIsDialogOpen(false);
      setEditingService(null);
      resetForm();
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
            
            <ServiceForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              loading={loading}
              isEditing={!!editingService}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ServiceFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      <ServicesList
        services={services}
        onEdit={handleEdit}
        onDelete={deleteService}
        searchTerm={searchTerm}
        typeFilter={typeFilter}
      />
    </div>
  );
};
