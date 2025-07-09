
import React from 'react';
import { ServiceCard } from './ServiceCard';
import { Scissors } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Service = Tables<'services'>;

interface ServicesListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  searchTerm: string;
  typeFilter: string;
}

export const ServicesList = ({
  services,
  onEdit,
  onDelete,
  searchTerm,
  typeFilter
}: ServicesListProps) => {
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || service.service_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (filteredServices.length === 0) {
    return (
      <div className="text-center py-8">
        <Scissors className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum serviço encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchTerm || typeFilter !== 'all' 
            ? 'Tente ajustar os filtros de busca.' 
            : 'Comece cadastrando o primeiro serviço.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredServices.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
