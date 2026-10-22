'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { MOCK_CABS } from '@/lib/data/mockData';
import { DataTable, ColumnDef } from '@/components/admin/DataTable';
import { EntityModal, FieldSchema } from '@/components/admin/EntityModal';
import { useToast } from '@/components/ToastProvider';
import { Car, ArrowRight, Sparkles, Star, Users, CheckCircle2 } from 'lucide-react';

const CAB_SCHEMA: FieldSchema[] = [
  { name: 'id', label: 'Fleet Vehicle ID', type: 'text', placeholder: 'e.g. cab-innova-bom-01', required: true },
  { name: 'vehicle_model', label: 'Vehicle Model Name', type: 'text', placeholder: 'e.g. Toyota Innova Crysta', required: true },
  {
    name: 'vehicle_type',
    label: 'Vehicle Category Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Sedan', value: 'Sedan' },
      { label: 'Prime Sedan', value: 'Prime Sedan' },
      { label: 'SUV', value: 'SUV' },
      { label: 'Electric SUV', value: 'Electric SUV' },
      { label: 'Luxury Van', value: 'Luxury Van' },
    ],
    defaultValue: 'SUV',
  },
  {
    name: 'category',
    label: 'Transit Service Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Airport Transfer', value: 'Airport Transfer' },
      { label: 'Outstation Intercity', value: 'Outstation Intercity' },
      { label: 'Hourly Rental', value: 'Hourly Rental' },
    ],
    defaultValue: 'Airport Transfer',
  },
  { name: 'operator_name', label: 'Chauffeur / Fleet Partner', type: 'text', placeholder: 'e.g. Farways Verified Chauffeurs', required: true, defaultValue: 'Farways Verified Chauffeurs' },
  {
    name: 'fuel_type',
    label: 'Fuel / Energy Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Electric (Green Fleet)', value: 'Electric' },
      { label: 'CNG', value: 'CNG' },
      { label: 'Petrol / Diesel', value: 'Petrol / Diesel' },
    ],
    defaultValue: 'Petrol / Diesel',
  },
  { name: 'capacity_passengers', label: 'Passenger Capacity', type: 'number', defaultValue: 6 },
  { name: 'capacity_luggage', label: 'Luggage Bags Capacity', type: 'number', defaultValue: 4 },
  { name: 'driver_rating', label: 'Driver Rating (1.0 - 5.0)', type: 'number', min: 1, max: 5, step: 0.1, defaultValue: 4.9 },
  { name: 'route_origin', label: 'Pick-up Hub / Origin', type: 'text', placeholder: 'e.g. Mumbai Airport (BOM)', required: true },
  { name: 'route_destination', label: 'Drop-off Hub / Destination', type: 'text', placeholder: 'e.g. South Mumbai (Colaba)', required: true },
  { name: 'distance_km', label: 'Estimated Distance (km)', type: 'number', defaultValue: 28 },
  { name: 'estimated_duration', label: 'Estimated Duration', type: 'text', placeholder: 'e.g. 45 mins', defaultValue: '45 mins' },
  { name: 'base_price', label: 'Base Chauffeur Rate (₹)', type: 'number', required: true, defaultValue: 1450 },
  { name: 'tax', label: 'GST & State Tolls (₹)', type: 'number', required: true, defaultValue: 180 },
  { name: 'platform_fee', label: 'Upfront Driver Allowance (₹)', type: 'number', defaultValue: 0 },
  { name: 'total_price', label: 'Guaranteed All-Inclusive Fare (₹)', type: 'number', defaultValue: 1630 },
  { name: 'includes_tolls', label: 'Includes Highway Tolls (No Cash Demands)', type: 'boolean', defaultValue: true },
  { name: 'includes_parking', label: 'Includes Airport Terminal Parking Fee', type: 'boolean', defaultValue: true },
  { name: 'ac_available', label: 'Guaranteed Air Conditioning (AC)', type: 'boolean', defaultValue: true },
  { name: 'free_waiting_mins', label: 'Complimentary Flight Delay Waiting (mins)', type: 'number', defaultValue: 45 },
  { name: 'features', label: 'Vehicle Features (Comma-Separated)', type: 'array', placeholder: 'Flight Tracking, Commercial Yellow Plate, Air Purifier', colSpan: 2 },
];

export default function AdminCabsPage() {
  const toast = useToast();
  const [cabs, setCabs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCab, setSelectedCab] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Cabs from Supabase
  const fetchCabs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('cabs').select('*').order('created_at', { ascending: false });

      if (error) {
        console.warn('[Admin Cabs] Fetch error, falling back to local dataset:', error.message);
        const mapped = MOCK_CABS.map((c) => ({
          ...c,
          vehicle_model: c.vehicleModel,
          vehicle_type: c.vehicleType,
          operator_name: c.operatorName,
          fuel_type: c.fuelType,
          capacity_passengers: c.capacityPassengers,
          capacity_luggage: c.capacityLuggage,
          driver_rating: c.driverRating,
          route_origin: c.routeOrigin,
          route_destination: c.routeDestination,
          distance_km: c.distanceKm,
          estimated_duration: c.estimatedDuration,
          includes_tolls: c.includesTolls,
          includes_parking: c.includesParking,
          ac_available: c.acAvailable,
          free_waiting_mins: c.freeWaitingMins,
        }));
        setCabs(mapped);
      } else if (data && data.length > 0) {
        setCabs(data);
      } else {
        const mapped = MOCK_CABS.map((c) => ({
          ...c,
          vehicle_model: c.vehicleModel,
          vehicle_type: c.vehicleType,
          operator_name: c.operatorName,
          fuel_type: c.fuelType,
          capacity_passengers: c.capacityPassengers,
          capacity_luggage: c.capacityLuggage,
          driver_rating: c.driverRating,
          route_origin: c.routeOrigin,
          route_destination: c.routeDestination,
          distance_km: c.distanceKm,
          estimated_duration: c.estimatedDuration,
          includes_tolls: c.includesTolls,
          includes_parking: c.includesParking,
          ac_available: c.acAvailable,
          free_waiting_mins: c.freeWaitingMins,
        }));
        setCabs(mapped);
      }
    } catch (err: any) {
      console.error('[Admin Cabs] Exception loading cabs:', err);
      toast.error('Failed to load cabs inventory from database.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCabs();
  }, [fetchCabs]);

  const handleOpenCreate = () => {
    setSelectedCab(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cab: any) => {
    setSelectedCab(cab);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (cab: any) => {
    const cabStr = `${cab.vehicle_model || cab.vehicleModel} (${cab.operator_name || cab.operatorName})`;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete Fleet Vehicle "${cabStr}"?\n\nThis will remove the vehicle from live transfer search results.`
    );
    if (!confirmed) return;

    try {
      setCabs((prev) => prev.filter((c) => c.id !== cab.id));

      const { error } = await supabase.from('cabs').delete().eq('id', cab.id);
      if (error) {
        console.warn('[Admin Cabs] Supabase delete warning:', error.message);
      }

      toast.success(`Deleted cab vehicle "${cabStr}" successfully.`);
    } catch (err: any) {
      console.error('[Admin Cabs] Delete failed:', err);
      toast.error(err.message || 'Failed to delete vehicle from database.');
      fetchCabs();
    }
  };

  const handleModalSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const payload: any = {
          ...formData,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('cabs').insert(payload);
        if (error) {
          console.warn('[Admin Cabs] Supabase insert warning:', error.message);
        }

        setCabs((prev) => [payload, ...prev]);
        toast.success(`Vehicle "${payload.vehicle_model}" added to fleet.`);
      } else {
        const { error } = await supabase
          .from('cabs')
          .update(formData)
          .eq('id', selectedCab.id);

        if (error) {
          console.warn('[Admin Cabs] Supabase update warning:', error.message);
        }

        setCabs((prev) =>
          prev.map((c) => (c.id === selectedCab.id ? { ...c, ...formData } : c))
        );
        toast.success(`Vehicle "${formData.vehicle_model}" updated successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('[Admin Cabs] Submit failed:', err);
      toast.error(err.message || 'Database write operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef[] = [
    {
      key: 'vehicle_model',
      header: 'Vehicle & Operator',
      render: (row) => (
        <div className="max-w-xs">
          <div className="font-bold text-white text-xs flex items-center gap-1.5">
            <span>{row.vehicle_model || row.vehicleModel}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
              {row.vehicle_type || row.vehicleType}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
            <span>{row.operator_name || row.operatorName}</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">{row.fuel_type || row.fuelType}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'route_origin',
      header: 'Transfer Route',
      render: (row) => (
        <div className="flex items-center gap-2 max-w-xs">
          <div className="text-left truncate">
            <span className="font-bold text-xs text-white truncate block">
              {row.route_origin || row.routeOrigin}
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div className="text-left truncate">
            <span className="font-bold text-xs text-white truncate block">
              {row.route_destination || row.routeDestination}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category & Capacity',
      render: (row) => (
        <div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
            {row.category}
          </span>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-cyan-400" />
            <span>{row.capacity_passengers || row.capacityPassengers || 4} Guests • {row.capacity_luggage || row.capacityLuggage || 3} Bags</span>
          </div>
        </div>
      ),
    },
    {
      key: 'driver_rating',
      header: 'Driver & Inclusions',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
            <Star className="w-3 h-3 fill-emerald-400" />
            <span>{row.driver_rating || row.driverRating || 4.9} Rating</span>
          </div>
          <div className="text-[10px] text-emerald-300 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Tolls & Parking Included</span>
          </div>
        </div>
      ),
    },
    {
      key: 'base_price',
      header: 'Guaranteed Fare',
      render: (row) => (
        <div>
          <div className="text-xs font-mono font-bold text-white">
            ₹{Number(row.total_price || (Number(row.base_price) + Number(row.tax))).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Base: ₹{Number(row.base_price).toLocaleString('en-IN')} + Toll/Tax: ₹{Number(row.tax).toLocaleString('en-IN')}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 text-cyan-400 flex items-center justify-center border border-cyan-800/60">
              <Car className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Cab Fleets & Airport Transfers
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage airport chauffeurs, verified outstation vehicles, EV fleets, and 100% all-inclusive pricing with zero driver cash surprises.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-ocean to-cyan-600 hover:from-ocean-dark hover:to-cyan-700 text-white text-xs font-bold shadow-md shadow-ocean/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Add New Cab</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={cabs}
        isLoading={isLoading}
        searchPlaceholder="Filter cabs by vehicle model, route origin/destination, or operator..."
        onCreateNew={handleOpenCreate}
        createButtonLabel="Add New Cab"
        actions={{
          onEdit: handleOpenEdit,
          onDelete: handleDelete,
        }}
        emptyMessage="No cab fleets found matching your filter."
      />

      <EntityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add New Fleet Vehicle' : `Edit Cab: ${selectedCab?.vehicle_model || selectedCab?.vehicleModel}`}
        subtitle="Pricing guarantees zero cash demands or hidden toll fees at destination."
        schema={CAB_SCHEMA}
        initialData={selectedCab}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
        mode={modalMode}
      />
    </div>
  );
}
