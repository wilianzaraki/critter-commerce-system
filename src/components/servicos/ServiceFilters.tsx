
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface ServiceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
}

export const ServiceFilters = ({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange
}: ServiceFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex items-center space-x-2 flex-1">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar serviços por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
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
  );
};
