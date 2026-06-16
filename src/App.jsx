import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import TambahNasabah from './pages/TambahNasabah';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<div className="p-6 bg-white rounded shadow text-gray-700">Ini adalah halaman Dashboard Utama.</div>} />
          <Route path="/tambah-nasabah" element={<TambahNasabah />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;