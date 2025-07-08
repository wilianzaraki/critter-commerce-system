
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Appointment = Tables<'appointments'>;
type Pet = Tables<'pets'>;
type Client = Tables<'clients'>;
type Service = Tables<'services'>;

type AppointmentInsert = {
  pet_id: string;
  service_id: string;
  employee_id?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  price: number;
  notes?: string;
};

export const AgendamentosPage = () => {
  const [appointments, setAppointments] = useState<(Appointment & { pets: Pet & { clients: Client }, services: Service })[]>([]);
  const [pets, setPets] = useState<(Pet & { clients: Client })[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState<AppointmentInsert>({
    pet_id: '',
    service_id: '',
    employee_id: '',
    appointment_date: '',
    appointment_time: '',
    status: 'agendado',
    price: 0,
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchPets();
    fetchServices();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          pets!inner (
            *,
            clients!inner (*)
          ),
          services!inner (*)
        `)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        .order('name');

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const employeeId = userData.user?.id;

      const appointmentData = {
        ...formData,
        employee_id: employeeId
      };

      if (editingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', editingAppointment.id);

        if (error) throw error;

        toast({
          title: "Agendamento atualizado com sucesso!",
          description: "As informações do agendamento foram atualizadas.",
        });
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert([appointmentData]);

        if (error) throw error;

        toast({
          title: "Agendamento criado com sucesso!",
          description: "O agendamento foi adicionado ao sistema.",
        });
      }

      setIsDialogOpen(false);
      setEditingAppointment(null);
      resetForm();
      fetchAppointments();
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

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      pet_id: appointment.pet_id,
      service_id: appointment.service_id,
      employee_id: appointment.employee_id || '',
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      status: appointment.status,
      price: Number(appointment.price),
      notes: appointment.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Agendamento excluído com sucesso!",
        description: "O agendamento foi removido do sistema.",
      });

      fetchAppointments();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir agendamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      pet_id: '',
      service_id: '',
      employee_id: '',
      appointment_date: '',
      appointment_time: '',
      status: 'agendado',
      price: 0,
      notes: ''
    });
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setFormData({
      ...formData,
      service_id: serviceId,
      price: service ? Number(service.base_price) : 0
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.pets.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.pets.clients.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.services.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  if (loading && appointments.length === 0) {
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
          <Calendar className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">Agendamentos</h1>
            <p className="text-gray-600">Gerencie os agendamentos de serviços</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingAppointment(null); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pet_id">Pet</Label>
                <Select
                  value={formData.pet_id}
                  onValueChange={(value) => setFormData({ ...formData, pet_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} - {pet.clients.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_id">Serviço</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={handleServiceChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - R$ {Number(service.base_price).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment_date">Data</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment_time">Horário</Label>
                  <Input
                    id="appointment_time"
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : (editingAppointment ? 'Atualizar' : 'Salvar')}
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
            placeholder="Buscar por pet, cliente ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{appointment.pets.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(appointment)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(appointment.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium">{appointment.pets.clients.full_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Serviço</p>
                  <p className="font-medium">{appointment.services.name}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{appointment.appointment_time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusLabel(appointment.status)}
                  </Badge>
                  <span className="font-bold text-green-600">
                    R$ {Number(appointment.price).toFixed(2)}
                  </span>
                </div>

                {appointment.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Observações</p>
                    <p className="text-sm">{appointment.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum agendamento encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece criando o primeiro agendamento.'}
          </p>
        </div>
      )}
    </div>
  );
};
