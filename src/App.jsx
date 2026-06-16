import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-blue-900">Selamat Datang di Sistem Piutang HausJo</h2>
        <p className="mt-2 text-gray-600">Sistem siap digunakan untuk manajemen piutang dan jaminan.</p>
      </div>
    </DashboardLayout>
  );
}
export default App;