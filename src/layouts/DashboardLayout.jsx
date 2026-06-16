import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-blue-900 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold tracking-wider text-white">
          HAUS<span className="text-sky-400">JO</span>
        </h1>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b shadow-sm flex items-center px-8">
          <h2 className="text-lg font-semibold text-gray-700">Dashboard Utama</h2>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};
export default DashboardLayout;