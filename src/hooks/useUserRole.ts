
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type UserRole = Tables<'profiles'>['role'];

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log('User authenticated:', user.id);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user role:', error);
          } else {
            console.log('User role fetched:', data.role);
            setRole(data.role);
          }
        } else {
          console.log('No authenticated user');
        }
      } catch (error) {
        console.error('Error getting user role:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  console.log('useUserRole state:', { role, loading, isAdmin: role === 'admin' });

  return { role, loading, isAdmin: role === 'admin' };
};
