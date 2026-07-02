import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const PortalNasabah = () => {
  // State untuk form login
  const [noHp, setNoHp] = useState('');
  const [pinAtm, setPinAtm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // State untuk data setelah login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nasabahData, setNasabahData] = useState(null);
  const [piutangData, setPiutangData] = useState(null);

  // FUNGSI LOGIN & AMBIL DATA
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Cari nasabah berdasarkan Nomor HP
      const qNasabah = query(collection(db, "nasabah"), where("no_hp", "==", noHp));
      const snapNasabah = await getDocs(qNasabah);

      if (snapNasabah.empty) {
        setErrorMsg('Nomor HP tidak terdaftar.');
        setLoading(false);
        return;
      }

      // 2. Verifikasi PIN ATM
      const nasabahDoc = snapNasabah.docs[0];
      const dataNasabah = nasabahDoc.data();
      const encryptedInputPin = btoa(pinAtm); // Cocokkan dengan enkripsi saat tambah nasabah

      if (dataNasabah.pin_atm !== encryptedInputPin) {
        setErrorMsg('PIN ATM Fisik salah.');
        setLoading(false);
        return;
      }

      // 3. Jika Valid, ambil data piutang/transaksi terakhir
      const qPiutang = query(
        collection(db, "piutang"), 
        where("id_nasabah", "==", nasabahDoc.id)
      );
      const snapPiutang = await getDocs(qPiutang);
      
      // Mengambil piutang terbaru (jika ada lebih dari satu)
      let dataPiutangTerbaru = null;
      if (!snapPiutang.empty) {
        const listPiutang = snapPiutang.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        listPiutang.sort((a, b) => (b.created_at?.toDate() || 0) - (a.created_at?.toDate() || 0));
        dataPiutangTerbaru = listPiutang[0];
      }

      // Set State
      setNasabahData({ id: nasabahDoc.id, ...dataNasabah });
      setPiutangData(dataPiutangTerbaru);
      setIsLoggedIn(true);

    } catch (error) {
      console.error("Error login portal:", error);
      setErrorMsg('Terjadi kesalahan sistem. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setNasabahData(null);
    setPiutangData(null);
    setNoHp('');
    setPinAtm('');
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

  // ==========================================
  // TAMPILAN 1: HALAMAN LOGIN PORTAL NASABAH
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
          <div className="text-center mb-8 border-b-2 border-dashed border-gray-200 pb-6">
            <h1 className="text-xl font-black text-blue-900 tracking-wider">PORTAL CEK PIUTANG</h1>
            <h2 className="text-lg font-bold text-gray-700">AGEN HAUSJO HERDIANSYAH</h2>
          </div>

          <p className="text-center text-sm text-gray-600 mb-6 font-medium">
            Silakan masukkan kredensial Anda untuk melihat rincian tagihan.
          </p>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold mb-4 border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Nomor HP Terdaftar
              </label>
              <input 
                type="tel" 
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                required
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-center font-bold text-blue-900 tracking-widest focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                PIN ATM Fisik
              </label>
              <input 
                type="password" 
                value={pinAtm}
                onChange={(e) => setPinAtm(e.target.value)}
                required
                maxLength="6"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-center font-bold text-blue-900 tracking-[0.5em] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="******"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-4 bg-blue-900 hover:bg-blue-800 text-white font-black rounded-lg shadow-lg transition-all tracking-widest"
            >
              {loading ? 'MEMERIKSA...' : 'CEK DATA PINJAMAN'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8 italic">
            *Jika lupa PIN, silakan hubungi Admin Agen Hausjo.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN 2: HALAMAN RINCIAN PINJAMAN (DASHBOARD)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col py-10 items-center p-4">
      
      {/* Tombol Cetak & Logout di luar area struk agar rapi saat diprint */}
      <div className="w-full max-w-md flex justify-between mb-4 print:hidden">
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 font-bold text-sm flex items-center gap-1 transition-colors">
          &larr; Keluar
        </button>
        <button onClick={() => window.print()} className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider shadow-md">
          Cetak Tagihan
        </button>
      </div>

      {/* Area Struk / Rincian */}
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 print:shadow-none print:border-none print:p-0">
        
        <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-6">
          <h1 className="text-lg font-black text-blue-900 tracking-wider uppercase">PORTAL NASABAH</h1>
          <h2 className="text-base font-bold text-gray-700">AGEN HAUSJO HERDIANSYAH</h2>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">Halo,</p>
          <p className="text-xl font-bold text-gray-800">{nasabahData.nama_lengkap}</p>
          <p className="text-xs font-semibold text-blue-600 uppercase mt-1">Instansi: {nasabahData.instansi}</p>
        </div>

        <div className="border-t border-b py-4 my-6">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Ringkasan Pinjaman Anda Saat Ini</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-center">
              <p className="text-[10px] font-bold text-red-500 uppercase mb-1">Sisa Tagihan</p>
              <p className="text-lg font-black text-red-700">
                {piutangData ? formatRupiah(piutangData.total_tagihan) : 'Rp 0'}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-center flex flex-col justify-center items-center">
              <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Jaminan ATM</p>
              <p className="text-sm font-black text-blue-800">
                {piutangData && !piutangData.status_lunas ? 'DITAHAN' : 'DIKEMBALIKAN'}
              </p>
            </div>
          </div>
        </div>

        {piutangData ? (
          <div className="mb-6">
            <p className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Rincian Transaksi Terakhir:</p>
            <table className="w-full text-sm text-gray-600">
              <tbody>
                <tr><td className="py-1">No. TRX</td><td className="py-1 font-semibold text-right">{piutangData.id}</td></tr>
                <tr><td className="py-1">Tanggal Cair</td><td className="py-1 font-semibold text-right">{piutangData.created_at?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
                <tr><td className="py-1">Pokok Pinjaman</td><td className="py-1 font-semibold text-right">{formatRupiah(piutangData.nominal_pokok)}</td></tr>
                <tr><td className="py-1">Biaya Admin</td><td className="py-1 font-semibold text-right">{formatRupiah(piutangData.biaya_admin_temp)}</td></tr>
                <tr><td className="py-2 border-b"></td><td className="py-2 border-b"></td></tr>
                <tr>
                  <td className="py-3 font-bold text-gray-800">Status</td>
                  <td className="py-3 text-right">
                    <span className={`font-black uppercase tracking-wider ${piutangData.status_lunas ? 'text-green-600' : 'text-red-600'}`}>
                      {piutangData.status_lunas ? 'LUNAS' : 'BELUM LUNAS'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm">
            Tidak ada riwayat pinjaman aktif yang ditemukan.
          </div>
        )}

        <div className="border-t-2 border-dashed border-gray-300 pt-6 mt-4">
          <p className="text-center text-xs text-gray-400 italic leading-relaxed">
            *Harap lakukan pelunasan tepat waktu agar kartu ATM fisik dapat segera dikembalikan oleh pihak Bendahara.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PortalNasabah;