
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Code, User, Phone, Zap } from 'lucide-react';

export const ConfiguracoesPage = () => {
  const systemInfo = {
    version: '1.0.0',
    developer: 'Wilian dos Santos',
    phone: '(62) 993397975',
    technologies: [
      { name: 'React', description: 'Biblioteca JavaScript para interfaces', icon: '⚛️' },
      { name: 'TypeScript', description: 'JavaScript com tipagem estática', icon: '📘' },
      { name: 'Supabase', description: 'Backend como serviço', icon: '🚀' },
      { name: 'Tailwind CSS', description: 'Framework CSS utilitário', icon: '🎨' },
      { name: 'Vite', description: 'Build tool moderna e rápida', icon: '⚡' },
      { name: 'shadcn/ui', description: 'Componentes UI modernos', icon: '🧩' }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-gray-600" />
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-gray-600">Informações do sistema e desenvolvedor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nome do Sistema</p>
              <p className="font-semibold text-lg">PetShop Pro</p>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-gray-600">Versão</p>
              <Badge variant="outline" className="font-mono">
                v{systemInfo.version}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Descrição</p>
              <p className="text-sm">Sistema completo de gestão para petshops, incluindo controle de clientes, pets, produtos, serviços e vendas.</p>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Desenvolvedor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Desenvolvedor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="font-semibold text-lg">{systemInfo.developer}</p>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-gray-600">Contato</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <p className="font-medium">{systemInfo.phone}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Especialidades</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">Supabase</Badge>
                <Badge variant="secondary">Full Stack</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tecnologias Utilizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-600" />
            Tecnologias Utilizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemInfo.technologies.map((tech, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{tech.icon}</span>
                  <h3 className="font-semibold">{tech.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{tech.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recursos do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Gestão de Clientes</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cadastro completo de clientes</li>
                <li>• Histórico de compras e gastos</li>
                <li>• Controle de pets por cliente</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Controle de Pets</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Múltiplas fotos por pet</li>
                <li>• Fichas médicas e observações</li>
                <li>• Histórico de serviços</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Produtos e Estoque</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Controle de estoque automático</li>
                <li>• Alertas de estoque baixo</li>
                <li>• Categorização de produtos</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Vendas e Serviços</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Sistema de vendas integrado</li>
                <li>• Agendamento de serviços</li>
                <li>• Relatórios detalhados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
