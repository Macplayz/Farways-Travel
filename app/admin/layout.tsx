'use client';

import React, { useState } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-ocean selection:text-white">
        {/* Responsive Sidebar */}
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area (Offset by sidebar width on desktop lg:ml-72) */}
        <div className="lg:pl-72 flex flex-col flex-1 min-w-0 min-h-screen">
          <AdminHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-950">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
