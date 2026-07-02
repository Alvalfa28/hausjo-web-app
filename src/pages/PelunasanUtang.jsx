import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const PelunasanUtang = () => {
  const navigate = useNavigate();
  const [daftarPiutang, setDaftarPiutang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Belum Lunas');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Ambil data piutang berdasarkan filter status_lunas
      const isLunas = filterStatus === 'Lunas';
      const q = query(collection(db, "piutang"), where("status_lunas", "==", isLunas));
      const querySnapshot = await getDocs(q);

      const dataLengkap = await Promise.all(querySnapshot.docs.map(async (docItem) => {
        const p = docItem.data();
        
        // 2. Ambil detail nasabah untuk setiap piutang
        const nasabahRef = await getDocs(query(collection(db, "nasabah"), where("__name__", "==", p.id_nasabah)));
        const nasabahData = nasabahRef.docs[0]?.data() || {};

        return {
          id: docItem.id,
          ...p,
          nama: nasabahData.nama_lengkap || 'Tidak Dikenal',
          nik: nasabahData.id_karyawan || '-',
          instansi: nasabahData.instansi || '-',
        };
      }));

      setDaftarPiutang(dataLengkap);
    } catch (error) {
      console.error("Gagal memuat data pelunasan:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  // Logika Pencarian
  const filteredData = daftarPiutang.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.nik.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-1">Kelola Pelunasan Utang</h2>
          <p className="text-gray-500 text-sm">Halaman pemrosesan pembayaran dan pelunasan piutang nasabah.</p>
        </div>

        <div className="flex gap-4">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="Belum Lunas">Belum Lunas</option>
            <option value="Lunas">Lunas</option>
          </select>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari Nama / NIK..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 pl-8 border border-gray-300 rounded-lg text-sm outline-none w-64"
            />
            <span className="absolute left-2 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <p className="p-10 text-center">Memuat data piutang...</p> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
              <tr>
                <th className="p-4">Nama Nasabah</th>
                <th className="p-4">Instansi</th>
                <th className="p-4 text-right">Nominal Pokok</th>
                <th className="p-4 text-right">Sisa Piutang</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <p className="font-bold text-blue-900">{item.nama}</p>
                    <p className="text-[10px] text-gray-400">{item.nik}</p>
                  </td>
                  <td className="p-4 text-gray-600">{item.instansi}</td>
                  <td className="p-4 text-right font-medium">{formatRupiah(item.nominal_pokok)}</td>
                  <td className="p-4 text-right font-bold text-red-600">{formatRupiah(item.total_tagihan)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status_lunas ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.status_lunas ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => navigate(`/bayar-piutang/${item.id}`)}
                      className="text-blue-600 hover:text-blue-900 font-bold underline"
                    >
                      {item.status_lunas ? 'Lihat' : 'Bayar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PelunasanUtang;