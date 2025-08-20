import { supabase } from '../supabaseClient';

export const checkAdmin = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();
  if (error) throw error;
  return data.role === 'admin';
};