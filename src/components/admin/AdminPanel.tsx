
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, Plus } from 'lucide-react';
import { EmployeeInviteForm } from './EmployeeInviteForm';
import { EmployeeList } from './EmployeeList';

export const AdminPanel = () => {
  const [showInviteForm, setShowInviteForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel do Administrador</h1>
          <p className="text-gray-600">Gerencie funcionários e configurações do sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Administrador</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Funcionários
            </CardTitle>
            <CardDescription>
              Gerencie os funcionários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowInviteForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Convidar Funcionário
            </Button>
          </CardContent>
        </Card>
      </div>

      {showInviteForm && (
        <EmployeeInviteForm onClose={() => setShowInviteForm(false)} />
      )}

      <EmployeeList />
    </div>
  );
};
