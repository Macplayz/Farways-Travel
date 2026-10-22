'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { MOCK_FLIGHTS } from '@/lib/data/mockData';
import { DataTable, ColumnDef } from '@/components/admin/DataTable';
import { EntityModal, FieldSchema } from '@/components/admin/EntityModal';
import { useToast } from '@/components/ToastProvider';
import { Plane, ArrowRight, Sparkles, Clock, ShieldCheck } from 'lucide-react';

const FLIGHT_SCHEMA: FieldSchema[] = [
  { name: 'id', label: 'Flight Identifier', type: 'text', placeholder: 'e.g. fl-indigo-bom-del-5342', required: true },
  {
    name: 'airline_name',
    label: 'Airline Name',
    type: 'select',
    required: true,
    options: [
      { label: 'IndiGo', value: 'IndiGo' },
      { label: 'Air India', value: 'Air India' },
      { label: 'Akasa Air', value: 'Akasa Air' },
      { label: 'Vistara', value: 'Vistara' },
      { label: 'Emirates', value: 'Emirates' },
      { label: 'Singapore Airlines', value: 'Singapore Airlines' },
      { label: 'SpiceJet', value: 'SpiceJet' },
    ],
    defaultValue: 'IndiGo',
  },
  { name: 'airline_code', label: 'IATA Airline Code', type: 'text', placeholder: 'e.g. 6E', required: true, defaultValue: '6E' },
  { name: 'flight_number', label: 'Flight Number', type: 'text', placeholder: 'e.g. 6E 5342', required: true },
  { name: 'aircraft', label: 'Aircraft Model', type: 'text', placeholder: 'e.g. Airbus A321neo', defaultValue: 'Airbus A321neo' },
  { name: 'origin_city', label: 'Origin City', type: 'text', placeholder: 'e.g. Mumbai', required: true },
  { name: 'origin_code', label: 'Origin IATA Code', type: 'text', placeholder: 'e.g. BOM', required: true },
  { name: 'origin_airport', label: 'Origin Airport Name', type: 'text', placeholder: 'e.g. Chhatrapati Shivaji Maharaj Intl' },
  { name: 'origin_terminal', label: 'Origin Terminal', type: 'text', placeholder: 'e.g. T2', defaultValue: 'T2' },
  { name: 'destination_city', label: 'Destination City', type: 'text', placeholder: 'e.g. Delhi', required: true },
  { name: 'destination_code', label: 'Destination IATA Code', type: 'text', placeholder: 'e.g. DEL', required: true },
  { name: 'destination_airport', label: 'Destination Airport Name', type: 'text', placeholder: 'e.g. Indira Gandhi Intl' },
  { name: 'destination_terminal', label: 'Destination Terminal', type: 'text', placeholder: 'e.g. T3', defaultValue: 'T3' },
  { name: 'departure_time', label: 'Departure Time (HH:mm)', type: 'text', placeholder: '06:00', required: true, defaultValue: '06:00' },
  { name: 'arrival_time', label: 'Arrival Time (HH:mm)', type: 'text', placeholder: '08:15', required: true, defaultValue: '08:15' },
  { name: 'duration_minutes', label: 'Duration in Minutes', type: 'number', defaultValue: 135 },
  { name: 'duration_formatted', label: 'Formatted Duration', type: 'text', placeholder: '2h 15m', defaultValue: '2h 15m' },
  { name: 'stops', label: 'Number of Stops (0 for Non-stop)', type: 'number', defaultValue: 0 },
  {
    name: 'cabin_class',
    label: 'Cabin Class',
    type: 'select',
    required: true,
    options: [
      { label: 'Economy', value: 'Economy' },
      { label: 'Premium Economy', value: 'Premium Economy' },
      { label: 'Business', value: 'Business' },
    ],
    defaultValue: 'Economy',
  },
  { name: 'baggage_cabin_kg', label: 'Cabin Baggage (kg)', type: 'number', defaultValue: 7 },
  { name: 'baggage_checkin_kg', label: 'Check-in Baggage (kg)', type: 'number', defaultValue: 15 },
  { name: 'base_price', label: 'Adult Base Fare (₹)', type: 'number', required: true, defaultValue: 4500 },
  { name: 'tax', label: 'Passenger Fees & Taxes (₹)', type: 'number', required: true, defaultValue: 820 },
  { name: 'platform_fee', label: 'Platform Transparency Fee (₹)', type: 'number', defaultValue: 0 },
  { name: 'total_price', label: 'All-Inclusive Total Fare (₹)', type: 'number', defaultValue: 5320 },
  { name: 'on_time_performance_score', label: 'On-Time Score (%)', type: 'number', defaultValue: 94 },
  { name: 'carbon_footprint_kg', label: 'Carbon Footprint (kg)', type: 'number', defaultValue: 120 },
];

export default function AdminFlightsPage() {
  const toast = useToast();
  const [flights, setFlights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Flights from Supabase
  const fetchFlights = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('flights').select('*').order('created_at', { ascending: false });

      if (error) {
        console.warn('[Admin Flights] Fetch error, falling back to local dataset:', error.message);
        // Fallback to mock flights mapped to snake_case
        const mapped = MOCK_FLIGHTS.map((f) => ({
          ...f,
          airline_name: f.airlineName,
          airline_code: f.airlineCode,
          flight_number: f.flightNumber,
          origin_city: f.originCity,
          origin_code: f.originCode,
          origin_airport: f.originAirport,
          origin_terminal: f.originTerminal,
          destination_city: f.destinationCity,
          destination_code: f.destinationCode,
          destination_airport: f.destinationAirport,
          destination_terminal: f.destinationTerminal,
          departure_time: f.departureTime,
          arrival_time: f.arrivalTime,
          duration_minutes: f.durationMinutes,
          duration_formatted: f.durationFormatted,
          cabin_class: f.cabinClass,
          baggage_cabin_kg: f.baggageAllowance?.cabinKg || 7,
          baggage_checkin_kg: f.baggageAllowance?.checkInKg || 15,
          on_time_performance_score: f.onTimePerformanceScore || 90,
          carbon_footprint_kg: f.carbonFootprintKg || 120,
        }));
        setFlights(mapped);
      } else if (data && data.length > 0) {
        setFlights(data);
      } else {
        const mapped = MOCK_FLIGHTS.map((f) => ({
          ...f,
          airline_name: f.airlineName,
          airline_code: f.airlineCode,
          flight_number: f.flightNumber,
          origin_city: f.originCity,
          origin_code: f.originCode,
          origin_airport: f.originAirport,
          origin_terminal: f.originTerminal,
          destination_city: f.destinationCity,
          destination_code: f.destinationCode,
          destination_airport: f.destinationAirport,
          destination_terminal: f.destinationTerminal,
          departure_time: f.departureTime,
          arrival_time: f.arrivalTime,
          duration_minutes: f.durationMinutes,
          duration_formatted: f.durationFormatted,
          cabin_class: f.cabinClass,
          baggage_cabin_kg: f.baggageAllowance?.cabinKg || 7,
          baggage_checkin_kg: f.baggageAllowance?.checkInKg || 15,
          on_time_performance_score: f.onTimePerformanceScore || 90,
          carbon_footprint_kg: f.carbonFootprintKg || 120,
        }));
        setFlights(mapped);
      }
    } catch (err: any) {
      console.error('[Admin Flights] Exception loading flights:', err);
      toast.error('Failed to load flights from database.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const handleOpenCreate = () => {
    setSelectedFlight(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (flight: any) => {
    setSelectedFlight(flight);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (flight: any) => {
    const flightIdStr = flight.flight_number || flight.flightNumber || flight.id;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete Flight "${flightIdStr}"?\n\nThis will remove the schedule from live search results.`
    );
    if (!confirmed) return;

    try {
      setFlights((prev) => prev.filter((f) => f.id !== flight.id));

      const { error } = await supabase.from('flights').delete().eq('id', flight.id);
      if (error) {
        console.warn('[Admin Flights] Supabase delete warning:', error.message);
      }

      toast.success(`Deleted flight "${flightIdStr}" successfully.`);
    } catch (err: any) {
      console.error('[Admin Flights] Delete failed:', err);
      toast.error(err.message || 'Failed to delete flight from database.');
      fetchFlights();
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

        const { error } = await supabase.from('flights').insert(payload);
        if (error) {
          console.warn('[Admin Flights] Supabase insert warning:', error.message);
        }

        setFlights((prev) => [payload, ...prev]);
        toast.success(`Flight "${payload.flight_number}" added to schedule.`);
      } else {
        const { error } = await supabase
          .from('flights')
          .update(formData)
          .eq('id', selectedFlight.id);

        if (error) {
          console.warn('[Admin Flights] Supabase update warning:', error.message);
        }

        setFlights((prev) =>
          prev.map((f) => (f.id === selectedFlight.id ? { ...f, ...formData } : f))
        );
        toast.success(`Flight "${formData.flight_number}" updated successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('[Admin Flights] Submit failed:', err);
      toast.error(err.message || 'Database write operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef[] = [
    {
      key: 'airline_name',
      header: 'Airline & Flight No',
      render: (row) => (
        <div>
          <div className="font-bold text-white text-xs flex items-center gap-1.5">
            <span>{row.airline_name || row.airlineName}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
              {row.flight_number || row.flightNumber}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {row.aircraft || 'Commercial Jet'} • {row.cabin_class || row.cabinClass || 'Economy'}
          </div>
        </div>
      ),
    },
    {
      key: 'origin_city',
      header: 'Route',
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
      header: 'Schedule & Duration',
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{row.departure_time || row.departureTime} - {row.arrival_time || row.arrivalTime}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {row.duration_formatted || row.durationFormatted} • {Number(row.stops ?? 0) === 0 ? 'Non-stop' : `${row.stops} stop`}
          </div>
        </div>
      ),
    },
    {
      key: 'on_time_performance_score',
      header: 'Punctuality',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{row.on_time_performance_score || row.onTimePerformanceScore || 90}% On-Time</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Cabin: {row.baggage_cabin_kg || 7}kg • Bag: {row.baggage_checkin_kg || 15}kg
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
            Base: ₹{Number(row.base_price).toLocaleString('en-IN')} + Tax: ₹{Number(row.tax).toLocaleString('en-IN')}
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
              <Plane className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Flight Routes & Inventory
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage scheduled air connections, domestic & international routes, aircraft types, and transparent fares.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-ocean to-cyan-600 hover:from-ocean-dark hover:to-cyan-700 text-white text-xs font-bold shadow-md shadow-ocean/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Add New Flight</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={flights}
        isLoading={isLoading}
        searchPlaceholder="Filter flights by flight number, airline, or city code (e.g. BOM, DEL)..."
        onCreateNew={handleOpenCreate}
        createButtonLabel="Add New Flight"
        actions={{
          onEdit: handleOpenEdit,
          onDelete: handleDelete,
        }}
        emptyMessage="No flight schedules match your filter."
      />

      <EntityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Flight Schedule' : `Edit Flight: ${selectedFlight?.flight_number || selectedFlight?.flightNumber}`}
        subtitle="Schedules synchronize directly with consumer search and instant checkout."
        schema={FLIGHT_SCHEMA}
        initialData={selectedFlight}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
        mode={modalMode}
      />
    </div>
  );
}
