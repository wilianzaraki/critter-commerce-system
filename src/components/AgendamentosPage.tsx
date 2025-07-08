
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Calendar, Clock, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const mockAppointments = [
  {
    id: 1,
    date: '2024-01-20',
    time: '09:00',
    petName: 'Luna',
    ownerName: 'Maria Silva',
    service: 'Banho e Tosa',
    employee: 'Ana Silva',
    status: 'Agendado',
    price: 80.00,
    notes: 'Pet nervoso, ter cuidado'
  },
  {
    id: 2,
    date: '2024-01-20',
    time: '10:30',
    petName: 'Max',
    ownerName: 'João Santos',
    service: 'Banho',
    employee: 'Carlos Oliveira',
    status: 'Em andamento',
    price: 45.00,
    notes: ''
  },
  {
    id: 3,
    date: '2024-01-20',
    time: '14:00',
    petName: 'Bella',
    ownerName: 'Ana Costa',
    service: 'Tosa',
    employee: 'Ana Silva',
    status: 'Concluído',
    price: 60.00,
    notes: 'Tosa higiênica'
  },
];

const services = [
  { name: 'Banho', price: 45.00 },
  { name: 'Tosa', price: 60.00 },
  { name: 'Banho e Tosa', price: 80.00 },
  { name: 'Tosa Higiênica', price: 35.00 },
  { name: 'Corte de Unhas', price: 20.00 }
];

const employees = ['Ana Silva', 'Carlos Oliveira', 'Marina Santos'];

const statuses = ['Agendado', 'Em andamento', 'Concluído', 'Cancelado'];

export const AgendamentosPage = () => {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setIsDialogOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Agendado':
        return 'bg-blue-100 text-blue-800';
      case 'Em andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Concluído':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const AppointmentForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Data</Label>
          <Input id="date" type="date" />
        </div>
        <div>
          <Label htmlFor="time">Horário</Label>
          <Input id="time" type="time" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="petName">Nome do Pet</Label>
          <Input id="petName" placeholder="Digite o nome do pet" />
        </div>
        <div>
          <Label htmlFor="ownerName">Nome do Dono</Label>
          <Input id="ownerName" placeholder="Nome do proprietário" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="service">Serviço</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o serviço" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.name} value={service.name}>
                  {service.name} - R$ {service.price.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="employee">Funcionário</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o funcionário" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee} value={employee}>
                  {employee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="price">Valor</Label>
          <Input id="price" type="number" step="0.01" placeholder="0,00" />
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" placeholder="Observações especiais sobre o atendimento" />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
          Cancelar
        </Button>
        <Button onClick={() => setIsDialogOpen(false)}>
          {editingAppointment ? 'Atualizar' : 'Agendar'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600">Gerencie os agendamentos de banho e tosa</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddAppointment}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </DialogTitle>
            </DialogHeader>
            <AppointmentForm />
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
                placeholder="Buscar por pet, dono ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{appointment.employee}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Pet</p>
                      <p className="font-medium">{appointment.petName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Proprietário</p>
                      <p className="font-medium">{appointment.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Serviço</p>
                      <p className="font-medium">{appointment.service}</p>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="bg-yellow-50 p-2 rounded text-sm">
                      <p className="text-yellow-800">{appointment.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  <p className="text-lg font-bold text-green-600">
                    R$ {appointment.price.toFixed(2)}
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditAppointment(appointment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
