import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const TambahPiutang = () => {
  const navigate = useNavigate();
  const [nasabahList, setNasabahList] = useState([]);
  const [biayaAdmin, setBiayaAdmin] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    id_nasabah: '',
    nominal_pokok: '',
    status_atm: 'Ditahan' 
    // State pin_atm telah dihapus
  });

  // Fetch data nasabah (HANYA YANG LAYAK) & konfigurasi global
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Ambil data Nasabah dan Hasil Analisis
        const [nasabahSnap, analisisSnap] = await Promise.all([
          getDocs(collection(db, "nasabah")),
          getDocs(collection(db, "hasil_analisis"))
        ]);

        // 2. Cari status kelayakan terakhir untuk tiap nasabah
        const analisisDocs = analisisSnap.docs.map(doc => doc.data());
        analisisDocs.sort((a, b) => (b.created_at?.toDate() || 0) - (a.created_at?.toDate() || 0));
        
        const kelayakanMap = {};
        analisisDocs.forEach(item => {
          if (!kelayakanMap[item.id_nasabah]) {
            kelayakanMap[item.id_nasabah] = item.status_kelayakan;
          }
        });

        // 3. FILTER: Hanya masukkan nasabah yang statusnya "Layak"
        const eligibleNasabah = nasabahSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(n => kelayakanMap[n.id] === 'Layak');

        setNasabahList(eligibleNasabah);

        // 4. Ambil konfigurasi global (Biaya Admin)
        const configDoc = await getDoc(doc(db, "pengaturan", "konfigurasi_global"));
        if (configDoc.exists()) {
          setBiayaAdmin(configDoc.data().biaya_admin_global || 0);
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const nasabahTerpilih = nasabahList.find(n => n.id === formData.id_nasabah);
      
      if (!nasabahTerpilih) {
        alert("Data nasabah tidak valid.");
        setIsSubmitting(false);
        return;
      }

      // Validasi PIN dihapus dari sini

      const totalTagihan = Number(formData.nominal_pokok) + biayaAdmin;

      // SIMPAN PIUTANG DENGAN STATUS APPROVAL
      await addDoc(collection(db, "piutang"), {
        id_nasabah: formData.id_nasabah,
        nominal_pokok: Number(formData.nominal_pokok),
        biaya_admin_temp: biayaAdmin, 
        total_tagihan: totalTagihan,
        status_atm: formData.status_atm,
        // pin_atm dihapus dari payload database
        status_lunas: false,
        status_approval: 'Menunggu', 
        created_at: serverTimestamp()
      });

      alert("Pengajuan piutang berhasil dicatat dan sedang menunggu Approval Kepala Agen.");
      navigate('/transaksi-piutang');
      
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mencatat transaksi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat form pengajuan...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
      <div className="mb-6">
        <button onClick={() => navigate('/transaksi-piutang')} className="text-sm text-gray-500 hover:text-blue-900 mb-4 flex items-center gap-1">&larr; Kembali</button>
        <h2 className="text-2xl font-bold text-blue-900">Pengajuan Piutang Baru</h2>
        <p className="text-gray-500 text-sm">Formulir pengajuan utang yang akan diteruskan ke Kepala Agen.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Nasabah (Khusus Status Layak)</label>
          <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-400" 
            value={formData.id_nasabah}
            onChange={(e) => setFormData({...formData, id_nasabah: e.target.value})}>
            <option value="">-- Pilih Nasabah --</option>
            {nasabahList.length > 0 ? (
              nasabahList.map(n => <option key={n.id} value={n.id}>{n.nama_lengkap} ({n.id_karyawan})</option>)
            ) : (
              <option disabled>Tidak ada nasabah yang berstatus Layak</option>
            )}
          </select>
          <p className="text-[11px] text-gray-400 mt-1">*Jika nama tidak muncul, lakukan Analisis Kelayakan terlebih dahulu.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Pinjaman Pokok (Rp)</label>
          <input type="number" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-400" 
            placeholder="Contoh: 500000"
            value={formData.nominal_pokok}
            onChange={(e) => setFormData({...formData, nominal_pokok: e.target.value})} />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
          <p>Biaya Administrasi sistem: <strong>Rp {biayaAdmin.toLocaleString('id-ID')}</strong></p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status Jaminan ATM Awal</label>
          <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-400" 
            value={formData.status_atm}
            onChange={(e) => setFormData({...formData, status_atm: e.target.value})}>
            <option value="Ditahan">Ditahan (Diserahkan ke Bendahara)</option>
            <option value="Dikembalikan">Dikembalikan (Dalam Konfirmasi Khusus)</option>
          </select>
        </div>

        {/* Kolom Konfirmasi PIN ATM telah dihapus dari sini */}

        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-md">
          {isSubmitting ? "Memproses..." : "Ajukan Transaksi ke Kepala Agen"}
        </button>
      </form>
    </div>
  );
};

export default TambahPiutang;