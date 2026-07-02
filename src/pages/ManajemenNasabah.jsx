import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

const ManajemenNasabah = () => {
  const navigate = useNavigate();
  const [nasabahList, setNasabahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null); // State untuk Detail Modal

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "nasabah"));
      setNasabahList(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching nasabah:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi Hapus
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data nasabah ini?")) {
      try {
        await deleteDoc(doc(db, "nasabah", id));
        alert("Data berhasil dihapus.");
        fetchData(); // Refresh daftar setelah hapus
      } catch (error) {
        alert("Gagal menghapus data: " + error.message);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Manajemen Nasabah</h2>
          <p className="text-gray-500 text-sm">Daftar nasabah terdaftar dan kelola jaminan fisik.</p>
        </div>
        <button 
          onClick={() => navigate('/tambah-nasabah')}
          className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md"
        >
          + Tambah Nasabah
        </button>
      </div>

      {/* TABEL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <p className="p-8 text-center">Memuat data...</p> : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">ID Karyawan</th>
                <th className="p-4">Instansi</th>
                <th className="p-4">Bank</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {nasabahList.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-900">{n.nama_lengkap}</td>
                  <td className="p-4">{n.id_karyawan}</td>
                  <td className="p-4">{n.instansi}</td>
                  <td className="p-4">{n.nama_bank}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => setSelectedDetail(n)} className="text-blue-600 hover:underline px-2">Detail</button>
                    <button onClick={() => navigate(`/edit-nasabah/${n.id}`)} className="text-green-600 hover:underline px-2">Ubah</button>
                    <button onClick={() => handleDelete(n.id)} className="text-red-600 hover:underline px-2">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DETAIL */}
      {/* MODAL DETAIL */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-blue-900 mb-4 border-b pb-2">Detail Nasabah</h3>
            <div className="space-y-3 text-sm">
              <p><strong>Nama:</strong> {selectedDetail.nama_lengkap}</p>
              <p><strong>ID Karyawan:</strong> {selectedDetail.id_karyawan}</p>
              <p><strong>No HP:</strong> {selectedDetail.no_hp}</p>
              <p><strong>Instansi:</strong> {selectedDetail.instansi}</p>
              <p><strong>Bank:</strong> {selectedDetail.nama_bank}</p>
              <p><strong>No ATM:</strong> {selectedDetail.no_atm}</p>
              <p><strong>Gaji:</strong> Rp {Number(selectedDetail.gaji_bulanan).toLocaleString()}</p>
              <p><strong>Lama Kerja:</strong> {selectedDetail.lama_kerja} Tahun</p>
              <p><strong>Skor Riwayat:</strong> {selectedDetail.status_riwayat}</p>
            </div>
            
            {/* Kumpulan Tombol Aksi */}
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => navigate(`/histori-nasabah/${selectedDetail.id}`)}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-lg font-bold text-sm text-center transition-colors"
              >
                Lihat Histori Transaksi &rarr;
              </button>
              <button 
                onClick={() => setSelectedDetail(null)} 
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenNasabah;