
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Users, Mail, Calendar, Trash2 } from 'lucide-react';

type Profile = Tables<'profiles'>;
type EmployeeInvite = Tables<'employee_invites'>;

export const EmployeeList = () => {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<EmployeeInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Buscar funcionários existentes
      const { data: employeesData, error: employeesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'funcionario')
        .order('created_at', { ascending: false });

      if (employeesError) throw employeesError;

      // Buscar convites pendentes
      const { data: invitesData, error: invitesError } = await supabase
        .from('employee_invites')
        .select('*')
        .eq('used', false)
        .order('created_at', { ascending: false });

      if (invitesError) throw invitesError;

      setEmployees(employeesData || []);
      setInvites(invitesData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteInvite = async (inviteId: string) => {
    if (!confirm('Tem certeza que deseja excluir este convite?')) return;

    try {
      const { error } = await supabase
        .from('employee_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      toast({
        title: "Convite excluído",
        description: "O convite foi removido com sucesso.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir convite",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Funcionários Ativos ({employees.length})
          </CardTitle>
          <CardDescription>
            Lista de funcionários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhum funcionário cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{employee.full_name}</h4>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                  </div>
                  <Badge variant="secondary">Funcionário</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Convites Pendentes ({invites.length})
          </CardTitle>
          <CardDescription>
            Convites enviados que ainda não foram aceitos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhum convite pendente.
            </p>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{invite.full_name}</h4>
                    <p className="text-sm text-gray-600">{invite.email}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      Enviado em {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Pendente</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteInvite(invite.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
