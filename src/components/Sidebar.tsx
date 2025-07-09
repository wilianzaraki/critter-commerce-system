
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Heart, 
  Package, 
  Calendar, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Scissors,
  PawPrint,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: Heart, label: 'Pets', path: '/pets' },
  { icon: Package, label: 'Produtos', path: '/produtos' },
  { icon: Scissors, label: 'Serviços', path: '/servicos' },
  { icon: Calendar, label: 'Agendamentos', path: '/agendamentos' },
  { icon: ShoppingCart, label: 'Vendas', path: '/vendas' },
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

const adminMenuItems = [
  { icon: Shield, label: 'Administração', path: '/admin' },
];

export const Sidebar = () => {
  const { isAdmin, loading } = useUserRole();

  console.log('Sidebar render:', { isAdmin, loading });

  const allMenuItems = isAdmin ? [...menuItems, ...adminMenuItems] : menuItems;

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <PawPrint className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PetShop Pro</h1>
            <p className="text-sm text-gray-500">Sistema de Gestão</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        {allMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors mb-1',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        
        {loading && (
          <div className="px-3 py-2 text-xs text-gray-500">
            Verificando permissões...
          </div>
        )}
      </nav>
    </div>
  );
};
