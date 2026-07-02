import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc } from 'firebase/firestore';

const HistoriNasabah = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Mengambil ID Nasabah dari URL
  const [nasabah, setNasabah] = useState(null);
  const [historiTransaksi, setHistoriTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoriData = async () => {
      try {
        // 1. Ambil Informasi Master Nasabah
        const nasabahDoc = await getDoc(doc(db, "nasabah", id));
        if (nasabahDoc.exists()) {
          setNasabah(nasabahDoc.data());
        }

        // 2. Ambil Histori Transaksi Piutang Nasabah Ini
        const q = query(
          collection(db, "piutang"),
          where("id_nasabah", "==", id)
        );
        const querySnapshot = await getDocs(q);
        const listTransaksi = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Urutkan berdasarkan tanggal terbaru di sisi client jika server-side order terkendala indeks
        const sortedTransaksi = listTransaksi.sort((a, b) => {
          return (b.created_at?.toDate() || 0) - (a.created_at?.toDate() || 0);
        });

        setHistoriTransaksi(sortedTransaksi);
      } catch (error) {
        console.error("Gagal memuat histori transaksi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoriData();
  }, [id]);

  // FUNGSI HAPUS TRANSAKSI
  const handleDeleteTransaksi = async (txId) => {
    if (window.confirm("⚠️ PERINGATAN: Apakah Anda yakin ingin menghapus catatan transaksi ini secara permanen?")) {
      try {
        await deleteDoc(doc(db, "piutang", txId));
        alert("Data transaksi berhasil dihapus dari histori.");
        // Perbarui state secara lokal agar tabel langsung berubah tanpa harus memuat ulang dari server
        setHistoriTransaksi(prev => prev.filter(tx => tx.id !== txId));
      } catch (error) {
        console.error("Gagal menghapus transaksi:", error);
        alert("Terjadi kesalahan saat menghapus data.");
      }
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  if (loading) return <div className="p-8 text-center">Memuat histori transaksi...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Navigasi Kembali */}
      <button 
        onClick={() => navigate('/manajemen-nasabah')}
        className="mb-6 text-sm text-gray-500 hover:text-blue-900 flex items-center gap-1 transition-all"
      >
        &larr; Kembali ke Manajemen Nasabah
      </button>

      {/* Ringkasan Profil Nasabah di Atas Tabel */}
      {nasabah && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Nama Nasabah</p>
            <p className="text-lg font-bold text-blue-900">{nasabah.nama_lengkap}</p>
            <p className="text-sm text-gray-500">ID Karyawan: {nasabah.id_karyawan}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Instansi Pekerjaan</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{nasabah.instansi}</p>
            <p className="text-sm text-gray-500">HP: {nasabah.no_hp}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Jaminan Fisik Terdaftar</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">Kartu ATM {nasabah.nama_bank}</p>
            <p className="text-xs text-gray-400 font-mono">No. Kartu: {nasabah.no_atm}</p>
          </div>
        </div>
      )}

      {/* Tabel Histori Transaksi Finansial */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-blue-900">Buku Besar Transaksi Piutang</h3>
          <p className="text-xs text-gray-500">Menampilkan seluruh catatan pinjaman berjalan maupun yang sudah diselesaikan.</p>
        </div>

        {historiTransaksi.length === 0 ? (
          <p className="p-12 text-center text-gray-400">Belum ada riwayat transaksi piutang untuk nasabah ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Tanggal Pinjam</th>
                  <th className="p-4">Pokok Pinjaman</th>
                  <th className="p-4">Biaya Admin</th>
                  <th className="p-4">Total Tagihan</th>
                  <th className="p-4">Status Transaksi</th>
                  <th className="p-4">Kondisi Jaminan</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {historiTransaksi.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-600">
                      {tx.created_at?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="p-4 font-medium text-gray-700">{formatRupiah(tx.nominal_pokok)}</td>
                    <td className="p-4 text-gray-500">{formatRupiah(tx.biaya_admin_temp)}</td>
                    <td className="p-4 font-semibold text-blue-900">{formatRupiah(tx.total_tagihan)}</td>
                    <td className="p-4">
                      {tx.status_lunas ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Lunas</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Belum Lunas</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${tx.status_atm === 'Ditahan' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-600'}`}>
                        ATM {tx.status_atm || 'Ditahan'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDeleteTransaksi(tx.id)} 
                        className="text-red-600 hover:text-red-800 font-bold text-xs transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriNasabah;