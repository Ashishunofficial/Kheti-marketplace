/**
 * useSchemes — Government schemes from Supabase
 */
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { GovernmentScheme } from '../types';
import { MOCK_GOVT_SCHEMES } from '../data/mockData';

export function useSchemes() {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSchemes(MOCK_GOVT_SCHEMES);
      setLoading(false);
      return;
    }
    async function fetchSchemes() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('government_schemes')
        .select('*')
        .order('verified_date', { ascending: false });
      if (err) {
        setSchemes(MOCK_GOVT_SCHEMES);
        setError(err.message);
      } else {
        setSchemes((data as GovernmentScheme[]).length > 0 ? (data as GovernmentScheme[]) : MOCK_GOVT_SCHEMES);
      }
      setLoading(false);
    }
    fetchSchemes();
  }, []);

  return { schemes, loading, error };
}

/**
 * useExperts — University experts from Supabase
 */
import type { UniversityExpert } from '../types';
import { MOCK_UNIVERSITY_EXPERTS } from '../data/mockData';

export function useExperts() {
  const [experts, setExperts] = useState<UniversityExpert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setExperts(MOCK_UNIVERSITY_EXPERTS);
      setLoading(false);
      return;
    }
    async function fetchExperts() {
      const { data, error } = await supabase
        .from('university_experts')
        .select('*')
        .eq('is_verified_scientist', true)
        .order('rating', { ascending: false });
      setExperts(
        !error && data && data.length > 0 ? (data as UniversityExpert[]) : MOCK_UNIVERSITY_EXPERTS
      );
      setLoading(false);
    }
    fetchExperts();
  }, []);

  return { experts, loading };
}
