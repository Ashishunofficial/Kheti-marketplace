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

        const rawWh = (whData as any[]) ?? [];
        const rawEq = (eqData as any[]) ?? [];

        const wh: WarehouseFacility[] = rawWh.map(r => ({
          id: r.id,
          ownerId: r.owner_id,
          name: r.name,
          ownerName: r.owner_name,
          type: r.type,
          district: r.district,
          state: r.state,
          totalCapacityMT: Number(r.total_capacity_mt || 1000),
          availableCapacityMT: Number(r.available_capacity_mt || 500),
          ratePerBagPerMonth: Number(r.rate_per_bag_per_month || 8),
          isWdrcRegistered: r.is_wdrc_registered ?? true,
          contactPhone: r.contact_phone || '',
          address: r.address || undefined,
          createdAt: r.created_at
        }));

        const eq: EquipmentRental[] = rawEq.map(r => ({
          id: r.id,
          ownerId: r.owner_id,
          title: r.title,
          category: r.category,
          ownerName: r.owner_name,
          district: r.district,
          state: r.state,
          ratePerHour: r.rate_per_hour ? Number(r.rate_per_hour) : undefined,
          ratePerAcre: r.rate_per_acre ? Number(r.rate_per_acre) : undefined,
          operatorIncluded: r.operator_included ?? true,
          isAvailableNow: r.is_available_now ?? true,
          contactPhone: r.contact_phone || undefined,
          modelYear: r.model_year || undefined,
          createdAt: r.created_at
        }));

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
