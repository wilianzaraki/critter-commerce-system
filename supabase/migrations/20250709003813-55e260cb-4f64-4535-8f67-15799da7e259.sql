
-- Atualizar a função handle_new_user para definir o primeiro usuário como admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Contar quantos usuários já existem
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN user_count = 0 THEN 'admin'::user_role
      ELSE 'funcionario'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar tabela para convites de funcionários
CREATE TABLE public.employee_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  invite_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de convites
ALTER TABLE public.employee_invites ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem convites
CREATE POLICY "Admins can manage employee invites" ON public.employee_invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Atualizar políticas existentes para restringir acesso de funcionários a certas funcionalidades
-- Política para que apenas admins possam gerenciar produtos
DROP POLICY IF EXISTS "Authenticated users can view all products" ON public.products;
CREATE POLICY "Users can view products" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.is_admin());

-- Política para que apenas admins possam gerenciar categorias de produtos
DROP POLICY IF EXISTS "Authenticated users can view all product categories" ON public.product_categories;
CREATE POLICY "Users can view product categories" ON public.product_categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage product categories" ON public.product_categories
  FOR ALL USING (public.is_admin());

-- Política para que apenas admins possam gerenciar serviços
DROP POLICY IF EXISTS "Authenticated users can view all services" ON public.services;
CREATE POLICY "Users can view services" ON public.services
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.is_admin());

-- Política para relatórios (apenas admins)
DROP POLICY IF EXISTS "Authenticated users can view all sales" ON public.sales;
CREATE POLICY "Users can view sales" ON public.sales
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage sales" ON public.sales
  FOR ALL USING (public.is_admin());
