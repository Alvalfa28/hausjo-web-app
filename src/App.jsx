import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import AnalisisKelayakan from './pages/AnalisisKelayakan';
import TambahPiutang from './pages/TambahPiutang';
import PengaturanGlobal from './pages/PengaturanGlobal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout utama yang membungkus semua halaman */}
        <Route path="/" element={<DashboardLayout />}>
          {/* Redirect default ke analisis jika buka root */}
          <Route index element={<Navigate to="/analisis-kelayakan" />} />
          
          <Route path="analisis-kelayakan" element={<AnalisisKelayakan />} />
          <Route path="transaksi-piutang" element={<TambahPiutang />} />
          <Route path="pengaturan" element={<PengaturanGlobal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;