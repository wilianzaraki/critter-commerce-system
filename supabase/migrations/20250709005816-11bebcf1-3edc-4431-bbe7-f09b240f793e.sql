
-- Limpar qualquer configuração anterior que possa estar causando conflito
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Verificar se o tipo user_role existe e criá-lo se necessário
DO $$ 
BEGIN
    -- Tentar criar o tipo, ignorar se já existir
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'funcionario');
    END IF;
END $$;

-- Verificar se a tabela profiles tem a coluna role com o tipo correto
DO $$
BEGIN
    -- Se a coluna role não existir, adicioná-la
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'funcionario'::user_role;
    END IF;
    
    -- Se existir mas com tipo errado, corrigi-la
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'role' 
               AND data_type != 'USER-DEFINED') THEN
        ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING role::user_role;
    END IF;
END $$;

-- Recriar a função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Contar quantos usuários já existem na tabela profiles
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Inserir o novo perfil
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para debugging
    RAISE LOG 'Erro na função handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
