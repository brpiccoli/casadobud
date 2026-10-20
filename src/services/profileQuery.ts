import { supabase } from '@/integrations/supabase/client';

export type StaffProfile = {
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  occupation: string | null;
  company_name: string | null;
  dark_mode: boolean | null;
};

export type StaffProfileUpdate = Partial<Pick<StaffProfile, 'name' | 'dark_mode'>>;

const PROFILE_SELECT =
  'name, first_name, last_name, email, avatar_url, occupation, company_name, dark_mode';

export async function fetchStaffProfile(userId: string): Promise<StaffProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateStaffProfile(
  userId: string,
  update: StaffProfileUpdate,
): Promise<void> {
  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('user_id', userId)
    .select('user_id');

  if (error) {
    throw error;
  }

  if (data.length === 0) {
    throw new Error('Perfil não encontrado para salvar as preferências.');
  }
}
