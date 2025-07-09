
-- Primeiro, criar o tipo enum user_role se não existir
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'funcionario');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Recriar a função handle_new_user com o tipo correto
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

-- Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
