import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, getDoc, query, orderBy } from 'firebase/firestore';

const ApprovalKredit = () => {
  const [daftarPengajuan, setDaftarPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "piutang"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      
      const dataPengajuan = await Promise.all(snapshot.docs.map(async (item) => {
        const piutangData = item.data();
        let nasabahInfo = { nama_lengkap: "Unknown", instansi: "-" };
        
        if (piutangData.id_nasabah) {
          const nasabahSnap = await getDoc(doc(db, "nasabah", piutangData.id_nasabah));
          if (nasabahSnap.exists()) nasabahInfo = nasabahSnap.data();
        }

        return {
          id: item.id,
          ...piutangData,
          nama_nasabah: nasabahInfo.nama_lengkap,
          instansi: nasabahInfo.instansi
        };
      }));
      
      setDaftarPengajuan(dataPengajuan);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Disetujui': return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Disetujui</span>;
      case 'Ditolak': return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">Ditolak</span>;
      default: return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">Menunggu</span>;
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "piutang", id), { status_approval: status });
      alert(`Pengajuan berhasil diperbarui menjadi: ${status}`);
      fetchData();
      setSelectedDetail(null);
    } catch (error) {
      alert("Gagal memperbarui status.");
    }
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Approval Kredit (Kepala Agen)</h2>
        <p className="text-gray-500 text-sm">Daftar pengajuan transaksi pinjaman yang membutuhkan persetujuan.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500">Memuat data...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-4">Tgl Pengajuan</th>
                  <th className="p-4">Nama Nasabah</th>
                  <th className="p-4">Pokok Pinjaman</th>
                  <th className="p-4">Total Tagihan</th>
                  <th className="p-4">Status Approval</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {daftarPengajuan.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-600">
                      {item.created_at?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 font-medium text-blue-900">{item.nama_nasabah}</td>
                    <td className="p-4 text-gray-600">{formatRupiah(item.nominal_pokok)}</td>
                    <td className="p-4 font-semibold text-gray-800">{formatRupiah(item.total_tagihan)}</td>
                    <td className="p-4">{getStatusBadge(item.status_approval)}</td>
                    
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => setSelectedDetail(item)} 
                          className="bg-blue-50 hover:bg-blue-900 hover:text-white text-blue-900 font-bold py-1.5 px-3 rounded text-xs transition-colors border border-blue-200"
                        >
                          Detail
                        </button>
                        
                        {item.status_approval === 'Menunggu' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(item.id, 'Disetujui')} 
                              className="bg-green-50 hover:bg-green-600 hover:text-white text-green-800 font-bold py-1.5 px-3 rounded text-xs transition-colors border border-green-200"
                            >
                              Setujui
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(item.id, 'Ditolak')} 
                              className="bg-red-50 hover:bg-red-600 hover:text-white text-red-800 font-bold py-1.5 px-3 rounded text-xs transition-colors border border-red-200"
                            >
                              Tolak
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {daftarPengajuan.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">Belum ada pengajuan pinjaman.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL APPROVAL */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-bold text-blue-900 mb-4 border-b pb-2">Detail Pengajuan Pinjaman</h3>
            <div className="space-y-3 text-sm">
              <p><strong>Nama Nasabah:</strong> <span className="font-medium text-gray-800">{selectedDetail.nama_nasabah}</span></p>
              <p><strong>Instansi:</strong> {selectedDetail.instansi}</p>
              <div className="p-3 bg-gray-50 border rounded-lg my-3">
                <p><strong>Pokok Pinjaman:</strong> {formatRupiah(selectedDetail.nominal_pokok)}</p>
                <p><strong>Biaya Admin:</strong> {formatRupiah(selectedDetail.biaya_admin_temp)}</p>
                <p className="mt-2 pt-2 border-t font-bold text-red-600">Total Pencairan/Tagihan: {formatRupiah(selectedDetail.total_tagihan)}</p>
              </div>
              <p><strong>Status Jaminan:</strong> {selectedDetail.status_atm}</p>
              <p className="flex items-center gap-2 mt-2"><strong>Status Approval:</strong> {getStatusBadge(selectedDetail.status_approval)}</p>
            </div>
            
            <div className="flex gap-2 mt-6">
              {selectedDetail.status_approval === 'Menunggu' && (
                <>
                  <button onClick={() => handleUpdateStatus(selectedDetail.id, 'Disetujui')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm transition-colors">Setujui Pinjaman</button>
                  <button onClick={() => handleUpdateStatus(selectedDetail.id, 'Ditolak')} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold text-sm transition-colors">Tolak Pinjaman</button>
                </>
              )}
              <button onClick={() => setSelectedDetail(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-bold text-sm transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalKredit;