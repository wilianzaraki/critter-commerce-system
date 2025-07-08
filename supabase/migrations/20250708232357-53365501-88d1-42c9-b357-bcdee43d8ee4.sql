
-- Create enum types
CREATE TYPE public.pet_species AS ENUM ('cao', 'gato', 'passaro', 'coelho', 'outro');
CREATE TYPE public.pet_size AS ENUM ('pequeno', 'medio', 'grande');
CREATE TYPE public.appointment_status AS ENUM ('agendado', 'em_andamento', 'concluido', 'cancelado');
CREATE TYPE public.service_type AS ENUM ('banho', 'tosa', 'banho_tosa', 'tosa_higienica', 'corte_unhas');
CREATE TYPE public.user_role AS ENUM ('admin', 'funcionario');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'funcionario',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  photo_url TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pets table
CREATE TABLE public.pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species pet_species NOT NULL,
  breed TEXT,
  age INTEGER,
  size pet_size,
  medical_notes TEXT,
  photo_url TEXT,
  last_visit DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product categories table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.product_categories(id),
  brand TEXT,
  description TEXT,
  sell_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  barcode TEXT UNIQUE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  service_type service_type NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  employee_id UUID REFERENCES public.profiles(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'agendado',
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sale items table
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  service_id UUID REFERENCES public.services(id),
  appointment_id UUID REFERENCES public.appointments(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stock movements table
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'saida', 'ajuste')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_id UUID, -- Can reference sale_id or other operations
  employee_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies allowing authenticated users to access all data
CREATE POLICY "Authenticated users can view all clients" ON public.clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all pets" ON public.pets
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all product categories" ON public.product_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all services" ON public.services
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all appointments" ON public.appointments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all sales" ON public.sales
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all sale items" ON public.sale_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all stock movements" ON public.stock_movements
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'funcionario'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default product categories
INSERT INTO public.product_categories (name) VALUES
  ('Alimentação'),
  ('Higiene'),
  ('Brinquedos'),
  ('Medicamentos'),
  ('Acessórios');

-- Insert default services
INSERT INTO public.services (name, service_type, base_price, duration_minutes, description) VALUES
  ('Banho', 'banho', 45.00, 60, 'Banho completo com shampoo neutro'),
  ('Tosa', 'tosa', 60.00, 90, 'Tosa completa com acabamento'),
  ('Banho e Tosa', 'banho_tosa', 80.00, 120, 'Serviço completo de banho e tosa'),
  ('Tosa Higiênica', 'tosa_higienica', 35.00, 45, 'Tosa nas áreas íntimas e patas'),
  ('Corte de Unhas', 'corte_unhas', 20.00, 15, 'Corte e lixamento das unhas');

-- Function to update stock after sale
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    -- Update product stock
    UPDATE public.products 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Insert stock movement record
    INSERT INTO public.stock_movements (product_id, movement_type, quantity, reason, reference_id)
    VALUES (NEW.product_id, 'saida', NEW.quantity, 'Venda', NEW.sale_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for stock updates
CREATE TRIGGER on_sale_item_created
  AFTER INSERT ON public.sale_items
  FOR EACH ROW EXECUTE FUNCTION public.update_product_stock();

-- Function to update client total spent
CREATE OR REPLACE FUNCTION public.update_client_total_spent()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.clients 
  SET total_spent = (
    SELECT COALESCE(SUM(final_amount), 0) 
    FROM public.sales 
    WHERE client_id = NEW.client_id
  )
  WHERE id = NEW.client_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for client total spent updates
CREATE TRIGGER on_sale_created
  AFTER INSERT ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.update_client_total_spent();
