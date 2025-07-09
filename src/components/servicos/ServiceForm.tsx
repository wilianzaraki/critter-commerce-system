
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ImageUpload';

interface ServiceFormData {
  name: string;
  service_type: 'banho' | 'tosa' | 'banho_tosa' | 'tosa_higienica' | 'corte_unhas';
  base_price: number;
  duration_minutes?: number;
  description?: string;
  image_url?: string;
}

interface ServiceFormProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  isEditing: boolean;
}

export const ServiceForm = ({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  loading,
  isEditing
}: ServiceFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ImageUpload
        value={formData.image_url}
        onChange={(url) => onFormDataChange({ ...formData, image_url: url })}
        bucket="service-photos"
        label="Foto do Serviço"
      />

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Serviço</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="service_type">Tipo de Serviço</Label>
        <Select
          value={formData.service_type}
          onValueChange={(value: any) => onFormDataChange({ ...formData, service_type: value })}
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
            onChange={(e) => onFormDataChange({ ...formData, base_price: Number(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration_minutes">Duração (min)</Label>
          <Input
            id="duration_minutes"
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => onFormDataChange({ ...formData, duration_minutes: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
        </Button>
      </div>
    </form>
  );
};
