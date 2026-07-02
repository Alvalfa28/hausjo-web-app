import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ManajemenNasabah from './pages/ManajemenNasabah';
import TambahNasabah from './pages/TambahNasabah';
import EditNasabah from './pages/EditNasabah';
import HistoriNasabah from './pages/HistoriNasabah';
import AnalisisKelayakan from './pages/AnalisisKelayakan';
import TransaksiPiutang from './pages/TransaksiPiutang';
import TambahPiutang from './pages/TambahPiutang';
import EditPiutang from './pages/EditPiutang';
import PelunasanUtang from './pages/PelunasanUtang';
import BayarPiutang from './pages/BayarPiutang';
import PengaturanGlobal from './pages/PengaturanGlobal';
import ApprovalKredit from './pages/ApprovalKredit';
import KriteriaPenilaian from './pages/KriteriaPenilaian';
import PortalNasabah from './pages/PortalNasabah';
import KelolaAkun from './pages/KelolaAkun';  


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout utama yang membungkus semua halaman */}
        <Route path="/" element={<DashboardLayout />}>
          {/* Redirect default ke analisis jika buka root */}
          <Route index element={<Navigate to="/analisis-kelayakan" />} />
          <Route path="manajemen-nasabah" element={<ManajemenNasabah />} />
          <Route path="tambah-nasabah" element={<TambahNasabah />} />
          <Route path="/edit-nasabah/:id" element={<EditNasabah />} />
          <Route path="/histori-nasabah/:id" element={<HistoriNasabah />} />
          <Route path="analisis-kelayakan" element={<AnalisisKelayakan />} />
          <Route path="transaksi-piutang" element={<TransaksiPiutang />} />
          <Route path="tambah-piutang" element={<TambahPiutang />} />
          <Route path="/edit-piutang/:id" element={<EditPiutang />} />
          <Route path="pelunasan-utang" element={<PelunasanUtang />} />
          <Route path="/bayar-piutang/:id" element={<BayarPiutang />} />
          <Route path="pengaturan" element={<PengaturanGlobal />} />
          <Route path="approval-kredit" element={<ApprovalKredit />} />
          <Route path="kriteria-penilaian" element={<KriteriaPenilaian />} />
          <Route path="portal-nasabah" element={<PortalNasabah />} />
          <Route path="kelola-akun" element={<KelolaAkun />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;