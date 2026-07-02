import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <h1 className="text-xl font-bold text-blue-900 mb-8">Agen Hausjo</h1>
        <nav className="space-y-2">
          <Link to="/manajemen-nasabah" className="block p-2 hover:bg-blue-50 rounded">Manajemen Nasabah</Link>
          <Link to="/analisis-kelayakan" className="block p-2 hover:bg-blue-50 rounded">Analisis Kelayakan</Link>
          <Link to="/transaksi-piutang" className="block p-2 hover:bg-blue-50 rounded">Transaksi Piutang</Link>
          <Link to="/approval-kredit" className="block p-2 hover:bg-blue-50 rounded">Approval Kredit</Link>
          <Link to="/pelunasan-utang" className="block p-2 hover:bg-blue-50 rounded">Pelunasan Utang</Link>
          <Link to="/kriteria-penilaian" className="block p-2 hover:bg-blue-50 rounded">Kriteria Penilaian</Link>
          <Link to="/pengaturan" className="block p-2 hover:bg-blue-50 rounded">Pengaturan</Link>
          
          
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8">
          <span className="text-sm font-medium text-gray-600">Analis Kredit</span>
        </header>
        
        <main className="p-8 overflow-y-auto">
          {/* Outlet adalah kunci utama agar konten halaman muncul! */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;