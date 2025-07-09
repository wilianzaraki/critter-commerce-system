
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Clock } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Service = Tables<'services'>;

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

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

export const ServiceCard = ({ service, onEdit, onDelete }: ServiceCardProps) => {
  return (
    <Card key={service.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(service)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(service.id)}>
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
              className="w-16 h-16 object-cover rounded-md float-right ml-3"
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
  );
};
