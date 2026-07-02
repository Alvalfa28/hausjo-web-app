import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, query, orderBy, deleteDoc } from 'firebase/firestore';

const TransaksiPiutang = () => {
  const navigate = useNavigate();
  const [piutangList, setPiutangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "piutang"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      
      const dataLengkap = await Promise.all(snapshot.docs.map(async (item) => {
        const piutangData = item.data();
        let namaNasabah = "Tidak Dikenal";
        
        if (piutangData.id_nasabah) {
          const nasabahSnap = await getDoc(doc(db, "nasabah", piutangData.id_nasabah));
          if (nasabahSnap.exists()) namaNasabah = nasabahSnap.data().nama_lengkap;
        }

        return { id: item.id, ...piutangData, nama_nasabah: namaNasabah };
      }));

      setPiutangList(dataLengkap);
    } catch (error) {
      console.error("Gagal mengambil data transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ PERINGATAN: Anda yakin ingin menghapus data transaksi piutang ini secara permanen?")) {
      try {
        await deleteDoc(doc(db, "piutang", id));
        alert("Data transaksi berhasil dihapus.");
        fetchData(); 
      } catch (error) {
        alert("Gagal menghapus data: " + error.message);
      }
    }
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

  const filteredList = piutangList.filter(item => 
    item.nama_nasabah.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-1">Buku Transaksi Piutang</h2>
          <p className="text-gray-500 text-sm">Kelola seluruh data pencairan pinjaman dan pemantauan pembayaran.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input type="text" placeholder="Cari Nama / TRX ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2.5 pl-9 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-900" />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          <button onClick={() => navigate('/tambah-piutang')} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md whitespace-nowrap">
            + Pengajuan Baru
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-10 text-center text-gray-500">Memuat data transaksi...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4">ID Trx</th>
                  <th className="p-4">Nasabah</th>
                  <th className="p-4">Tagihan</th>
                  <th className="p-4 text-center">Approval</th>
                  <th className="p-4 text-center">Pelunasan</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-mono text-xs text-gray-500 uppercase">TRX-{item.id.substring(0, 5)}</td>
                    <td className="p-4 font-bold text-blue-900">{item.nama_nasabah}</td>
                    <td className="p-4 font-semibold text-gray-800">{formatRupiah(item.total_tagihan)}</td>
                    <td className="p-4 text-center">
                       <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          item.status_approval === 'Disetujui' ? 'bg-green-50 text-green-600 border border-green-200' :
                          item.status_approval === 'Ditolak' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                       }`}>
                         {item.status_approval}
                       </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${item.status_lunas ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.status_lunas ? 'Lunas' : 'Belum Lunas'}
                      </span>
                    </td>
                    
                    {/* AKSI HANYA BERISI UBAH & HAPUS */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-3 text-xs font-bold">
                        <button 
                          onClick={() => navigate(`/edit-piutang/${item.id}`)} 
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
                        >
                          Ubah
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredList.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-400">Tidak ada data transaksi ditemukan.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransaksiPiutang;