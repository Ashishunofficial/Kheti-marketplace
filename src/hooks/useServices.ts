/**
 * useServices — Supabase-backed warehouse facilities and equipment rentals
 * with geolocation-aware district filtering
 */
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { WarehouseFacility, EquipmentRental } from '../types';
import { MOCK_WAREHOUSES, MOCK_EQUIPMENTS } from '../data/mockData';

interface UseServicesReturn {
  warehouses: WarehouseFacility[];
  equipment: EquipmentRental[];
  loading: boolean;
  error: string | null;
}

export function useServices(district?: string): UseServicesReturn {
  const [warehouses, setWarehouses] = useState<WarehouseFacility[]>([]);
  const [equipment, setEquipment] = useState<EquipmentRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setWarehouses(MOCK_WAREHOUSES);
      setEquipment(MOCK_EQUIPMENTS);
      setLoading(false);
      return;
    }

    async function fetchServices() {
      setLoading(true);
      try {
        let warehouseQuery = supabase.from('warehouse_facilities').select('*').order('is_wdrc_registered', { ascending: false });
        let equipQuery = supabase.from('equipment_rentals').select('*').order('is_available_now', { ascending: false });

        // Prefer nearby district but show all if no match
        const [{ data: whData, error: whErr }, { data: eqData, error: eqErr }] = await Promise.all([
          warehouseQuery, equipQuery,
        ]);

        if (whErr) throw whErr;
        if (eqErr) throw eqErr;

        const wh = (whData as WarehouseFacility[]) ?? [];
        const eq = (eqData as EquipmentRental[]) ?? [];

        // Sort by district proximity if we have a district
        if (district) {
          wh.sort((a, b) => {
            const aMatch = a.district === district ? 0 : 1;
            const bMatch = b.district === district ? 0 : 1;
            return aMatch - bMatch;
          });
          eq.sort((a, b) => {
            const aMatch = a.district === district ? 0 : 1;
            const bMatch = b.district === district ? 0 : 1;
            return aMatch - bMatch;
          });
        }

        // Fallback to mock if Supabase tables are empty (not yet seeded)
        setWarehouses(wh.length > 0 ? wh : MOCK_WAREHOUSES);
        setEquipment(eq.length > 0 ? eq : MOCK_EQUIPMENTS);
      } catch (err: any) {
        setError(err.message);
        setWarehouses(MOCK_WAREHOUSES);
        setEquipment(MOCK_EQUIPMENTS);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [district]);

  return { warehouses, equipment, loading, error };
}
