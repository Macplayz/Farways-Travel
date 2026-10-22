'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { MOCK_TRAINS } from '@/lib/data/mockData';
import { DataTable, ColumnDef } from '@/components/admin/DataTable';
import { EntityModal, FieldSchema } from '@/components/admin/EntityModal';
import { useToast } from '@/components/ToastProvider';
import { TrainFront, ArrowRight, Sparkles, Clock, Utensils, ShieldCheck } from 'lucide-react';

const TRAIN_SCHEMA: FieldSchema[] = [
  { name: 'id', label: 'Train Identifier', type: 'text', placeholder: 'e.g. trn-vande-bharat-22229', required: true },
  { name: 'train_number', label: 'Train Number (5-digits)', type: 'text', placeholder: 'e.g. 22229', required: true },
  { name: 'train_name', label: 'Official Train Name', type: 'text', placeholder: 'e.g. CSMT - Madgaon Vande Bharat Express', required: true, colSpan: 2 },
  {
    name: 'train_type',
    label: 'Train Category / Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Vande Bharat Express', value: 'Vande Bharat Express' },
      { label: 'Tejas Rajdhani Express', value: 'Tejas Rajdhani Express' },
      { label: 'Gatimaan Express', value: 'Gatimaan Express' },
      { label: 'Tejas Express', value: 'Tejas Express' },
      { label: 'Jan Shatabdi', value: 'Jan Shatabdi' },
      { label: 'Superfast Express', value: 'Superfast Express' },
    ],
    defaultValue: 'Vande Bharat Express',
  },
  {
    name: 'selected_class',
    label: 'Primary Coach Class',
    type: 'select',
    required: true,
    options: [
      { label: 'AC Chair Car (CC)', value: 'CC' },
      { label: 'Executive Chair Car (EC)', value: 'EC' },
      { label: 'AC 1st Class (1A)', value: '1A' },
      { label: 'AC 2-Tier (2A)', value: '2A' },
      { label: 'AC 3-Tier (3A)', value: '3A' },
      { label: 'Sleeper (SL)', value: 'SL' },
    ],
    defaultValue: 'CC',
  },
  { name: 'origin_station', label: 'Origin Station Name', type: 'text', placeholder: 'e.g. Chhatrapati Shivaji Maharaj Terminus', required: true },
  { name: 'origin_code', label: 'Origin Station Code', type: 'text', placeholder: 'e.g. CSMT', required: true },
  { name: 'origin_city', label: 'Origin City', type: 'text', placeholder: 'e.g. Mumbai', required: true },
  { name: 'destination_station', label: 'Destination Station Name', type: 'text', placeholder: 'e.g. Madgaon Junction', required: true },
  { name: 'destination_code', label: 'Destination Station Code', type: 'text', placeholder: 'e.g. MAO', required: true },
  { name: 'destination_city', label: 'Destination City', type: 'text', placeholder: 'e.g. Goa', required: true },
  { name: 'departure_time', label: 'Departure Time (HH:mm)', type: 'text', placeholder: '05:25', required: true, defaultValue: '05:25' },
  { name: 'arrival_time', label: 'Arrival Time (HH:mm)', type: 'text', placeholder: '13:10', required: true, defaultValue: '13:10' },
  { name: 'duration_minutes', label: 'Duration in Minutes', type: 'number', defaultValue: 465 },
  { name: 'duration_formatted', label: 'Formatted Duration', type: 'text', placeholder: '7h 45m', defaultValue: '7h 45m' },
  { name: 'runs_on_days', label: 'Running Days (Comma-Separated)', type: 'array', placeholder: 'Mon, Tue, Wed, Fri, Sat, Sun', colSpan: 2 },
  { name: 'base_price', label: 'IRCTC Base Fare (₹)', type: 'number', required: true, defaultValue: 1815 },
  { name: 'tax', label: 'Superfast Surcharge & GST (₹)', type: 'number', required: true, defaultValue: 95 },
  { name: 'platform_fee', label: 'Platform Transparency Markup (₹)', type: 'number', defaultValue: 0 },
  { name: 'total_price', label: 'Guaranteed Total Upfront Fare (₹)', type: 'number', defaultValue: 1910 },
  { name: 'catering_included', label: 'Catering / Meals Included in Fare', type: 'boolean', defaultValue: true },
  { name: 'pantry_available', label: 'Onboard Pantry Car Available', type: 'boolean', defaultValue: true },
  { name: 'on_time_score', label: 'Punctuality Score (%)', type: 'number', defaultValue: 96 },
  { name: 'distance_km', label: 'Track Distance (km)', type: 'number', defaultValue: 580 },
  { name: 'amenities', label: 'Onboard Amenities (Comma-Separated)', type: 'array', placeholder: 'Bio-Vacuum Toilets, CCTV, High-Speed WiFi, Hot Meals', colSpan: 2 },
];

export default function AdminTrainsPage() {
  const toast = useToast();
  const [trains, setTrains] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTrain, setSelectedTrain] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Trains from Supabase
  const fetchTrains = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('trains').select('*').order('created_at', { ascending: false });

      if (error) {
        console.warn('[Admin Trains] Fetch error, falling back to local dataset:', error.message);
        const mapped = MOCK_TRAINS.map((t) => ({
          ...t,
          train_number: t.trainNumber,
          train_name: t.trainName,
          train_type: t.trainType,
          origin_station: t.originStation,
          origin_code: t.originCode,
          origin_city: t.originCity,
          destination_station: t.destinationStation,
          destination_code: t.destinationCode,
          destination_city: t.destinationCity,
          departure_time: t.departureTime,
          arrival_time: t.arrivalTime,
          duration_minutes: t.durationMinutes,
          duration_formatted: t.durationFormatted,
          runs_on_days: t.runsOnDays,
          selected_class: t.selectedClass,
          catering_included: t.cateringIncluded,
          pantry_available: t.pantryAvailable,
          on_time_score: t.onTimeScore,
          distance_km: t.distanceKm,
        }));
        setTrains(mapped);
      } else if (data && data.length > 0) {
        setTrains(data);
      } else {
        const mapped = MOCK_TRAINS.map((t) => ({
          ...t,
          train_number: t.trainNumber,
          train_name: t.trainName,
          train_type: t.trainType,
          origin_station: t.originStation,
          origin_code: t.originCode,
          origin_city: t.originCity,
          destination_station: t.destinationStation,
          destination_code: t.destinationCode,
          destination_city: t.destinationCity,
          departure_time: t.departureTime,
          arrival_time: t.arrivalTime,
          duration_minutes: t.durationMinutes,
          duration_formatted: t.durationFormatted,
          runs_on_days: t.runsOnDays,
          selected_class: t.selectedClass,
          catering_included: t.cateringIncluded,
          pantry_available: t.pantryAvailable,
          on_time_score: t.onTimeScore,
          distance_km: t.distanceKm,
        }));
        setTrains(mapped);
      }
    } catch (err: any) {
      console.error('[Admin Trains] Exception loading trains:', err);
      toast.error('Failed to load trains inventory from database.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTrains();
  }, [fetchTrains]);

  const handleOpenCreate = () => {
    setSelectedTrain(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (train: any) => {
    setSelectedTrain(train);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (train: any) => {
    const trainStr = `${train.train_number || train.trainNumber} - ${train.train_name || train.trainName}`;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete Train "${trainStr}"?\n\nThis will remove the schedule from live search results.`
    );
    if (!confirmed) return;

    try {
      setTrains((prev) => prev.filter((t) => t.id !== train.id));

      const { error } = await supabase.from('trains').delete().eq('id', train.id);
      if (error) {
        console.warn('[Admin Trains] Supabase delete warning:', error.message);
      }

      toast.success(`Deleted train schedule "${trainStr}" successfully.`);
    } catch (err: any) {
      console.error('[Admin Trains] Delete failed:', err);
      toast.error(err.message || 'Failed to delete train from database.');
      fetchTrains();
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

        const { error } = await supabase.from('trains').insert(payload);
        if (error) {
          console.warn('[Admin Trains] Supabase insert warning:', error.message);
        }

        setTrains((prev) => [payload, ...prev]);
        toast.success(`Train "${payload.train_number}" added to schedule.`);
      } else {
        const { error } = await supabase
          .from('trains')
          .update(formData)
          .eq('id', selectedTrain.id);

        if (error) {
          console.warn('[Admin Trains] Supabase update warning:', error.message);
        }

        setTrains((prev) =>
          prev.map((t) => (t.id === selectedTrain.id ? { ...t, ...formData } : t))
        );
        toast.success(`Train "${formData.train_number}" updated successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('[Admin Trains] Submit failed:', err);
      toast.error(err.message || 'Database write operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef[] = [
    {
      key: 'train_number',
      header: 'Train & Class',
      render: (row) => (
        <div className="max-w-xs">
          <div className="font-bold text-white text-xs flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
              {row.train_number || row.trainNumber}
            </span>
            <span className="truncate">{row.train_name || row.trainName}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
            <span className="text-cyan-400 font-semibold">{row.train_type || row.trainType}</span>
            <span>•</span>
            <span>Class: {row.selected_class || row.selectedClass || 'CC'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'origin_city',
      header: 'Route & Track',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="text-left">
            <span className="font-mono font-bold text-xs text-white">
              {row.origin_code || row.originCode}
            </span>
            <span className="text-[10px] text-slate-400 block truncate max-w-[80px]">
              {row.origin_city || row.originCity}
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div className="text-left">
            <span className="font-mono font-bold text-xs text-white">
              {row.destination_code || row.destinationCode}
            </span>
            <span className="text-[10px] text-slate-400 block truncate max-w-[80px]">
              {row.destination_city || row.destinationCity}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'departure_time',
      header: 'Schedule & Time',
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{row.departure_time || row.departureTime} - {row.arrival_time || row.arrivalTime}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {row.duration_formatted || row.durationFormatted} • {row.distance_km || row.distanceKm || 500} km
          </div>
        </div>
      ),
    },
    {
      key: 'catering_included',
      header: 'Features & On-Time',
      render: (row) => (
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {Boolean(row.catering_included ?? row.cateringIncluded) ? (
              <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                <Utensils className="w-3 h-3" /> Meals Included
              </span>
            ) : (
              <span className="text-slate-500 text-[10px]">No Catering</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-0.5 font-bold">
            <ShieldCheck className="w-3 h-3" />
            <span>{row.on_time_score || row.onTimeScore || 95}% On-Time</span>
          </div>
        </div>
      ),
    },
    {
      key: 'base_price',
      header: 'Fare Breakdown',
      render: (row) => (
        <div>
          <div className="text-xs font-mono font-bold text-white">
            ₹{Number(row.total_price || (Number(row.base_price) + Number(row.tax))).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Base: ₹{Number(row.base_price).toLocaleString('en-IN')} + Surcharge: ₹{Number(row.tax).toLocaleString('en-IN')}
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
              <TrainFront className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Rail Schedules & Trains
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage Indian Railways Vande Bharat, Tejas Rajdhani, and Superfast express trains with transparent IRCTC fares.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-ocean to-cyan-600 hover:from-ocean-dark hover:to-cyan-700 text-white text-xs font-bold shadow-md shadow-ocean/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Add New Train</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={trains}
        isLoading={isLoading}
        searchPlaceholder="Filter trains by train number, name, or city (e.g. 22229, Vande Bharat)..."
        onCreateNew={handleOpenCreate}
        createButtonLabel="Add New Train"
        actions={{
          onEdit: handleOpenEdit,
          onDelete: handleDelete,
        }}
        emptyMessage="No train schedules match your current search query."
      />

      <EntityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Train Service' : `Edit Train: ${selectedTrain?.train_number || selectedTrain?.trainNumber}`}
        subtitle="Changes immediately update consumer rail searches across Farways."
        schema={TRAIN_SCHEMA}
        initialData={selectedTrain}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
        mode={modalMode}
      />
    </div>
  );
}
