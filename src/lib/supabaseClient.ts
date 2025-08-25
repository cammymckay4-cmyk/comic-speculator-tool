import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (process.env.SUPABASE_URL as string);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (process.env.SUPABASE_ANON_KEY as string);

// Initialize a singleton Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for fetching data from Supabase tables
export async function getSeries() {
  const { data, error } = await supabase.from('comic_series').select('*');
  if (error) throw error;
  return data;
}

export async function getIssues(seriesId: string) {
  const { data, error } = await supabase
    .from('issue')
    .select('*')
    .eq('series_id', seriesId);
  if (error) throw error;
  return data;
}

export async function getGrades() {
  const { data, error } = await supabase.from('grade').select('*');
  if (error) throw error;
  return data;
}

export async function getMarketValues(issueId: string, gradeName: string) {
  const { data, error } = await supabase
    .from('market_value')
    .select('*')
    .eq('issue_id', issueId)
    .eq('grade_name', gradeName);
  if (error) throw error;
  return data;
}

export async function getDeals() {
  const { data, error } = await supabase.from('deal').select('*');
  if (error) throw error;
  return data;
}

export async function createAlert(userId: string, issueId: string, gradeName: string, threshold: number) {
  const { data, error } = await supabase.from('alert').insert({
    user_id: userId,
    issue_id: issueId,
    grade_name: gradeName,
    threshold,
    active: true,
  });
  if (error) throw error;
  return data;
}
