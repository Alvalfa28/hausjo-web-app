import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';

const EditPiutang = () => {
  const { id } = useParams(); // Ambil ID Transaksi dari URL
  const navigate = useNavigate();
  
  const [nasabahList, setNasabahList] = useState([]);
  const [biayaAdmin, setBiayaAdmin] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    id_nasabah: '',
    nominal_pokok: '',
    status_atm: 'Ditahan',
    pin_atm: '' // PIN dikosongkan untuk diisi ulang sebagai verifikasi keamanan
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil list nasabah (untuk dropdown)
        const nasabahSnapshot = await getDocs(collection(db, "nasabah"));
        setNasabahList(nasabahSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

        // 2. Ambil data piutang yang mau di-edit
        const piutangRef = doc(db, "piutang", id);
        const piutangSnap = await getDoc(piutangRef);
        
        if (piutangSnap.exists()) {
          const data = piutangSnap.data();
          setBiayaAdmin(data.biaya_admin_temp); // Menggunakan biaya admin saat transaksi itu dibuat
          
          setFormData({
            id_nasabah: data.id_nasabah,
            nominal_pokok: data.nominal_pokok,
            status_atm: data.status_atm,
            pin_atm: '' // Sengaja dikosongkan
          });
        } else {
          alert("Data transaksi tidak ditemukan!");
          navigate('/transaksi-piutang');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

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

      const inputPinEncrypted = btoa(formData.pin_atm);
      if (nasabahTerpilih.pin_atm !== inputPinEncrypted) {
        alert("PIN ATM Salah! Perubahan ditolak untuk alasan keamanan.");
        setIsSubmitting(false);
        return;
      }

      // Perhitungan ulang
      const totalTagihan = Number(formData.nominal_pokok) + biayaAdmin;

      // Update dokumen ke Firestore
      const piutangRef = doc(db, "piutang", id);
      await updateDoc(piutangRef, {
        id_nasabah: formData.id_nasabah,
        nominal_pokok: Number(formData.nominal_pokok),
        total_tagihan: totalTagihan,
        status_atm: formData.status_atm,
        updated_at: serverTimestamp()
      });

      alert("Transaksi piutang berhasil diperbarui!");
      navigate('/transaksi-piutang');
      
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal memperbarui transaksi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat data...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
      <div className="mb-6">
        <button onClick={() => navigate('/transaksi-piutang')} className="text-sm text-gray-500 hover:text-blue-900 mb-4">&larr; Kembali</button>
        <h2 className="text-2xl font-bold text-blue-900">Ubah Transaksi Piutang</h2>
        <p className="text-gray-500 text-sm">Edit nominal tagihan atau ubah status penahanan jaminan fisik ATM.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nasabah</label>
          {/* Sengaja di-disabled agar tidak salah mengganti pemilik hutang secara tidak sengaja */}
          <select disabled className="w-full p-3 bg-gray-100 text-gray-500 border border-gray-200 rounded-lg outline-none cursor-not-allowed" 
            value={formData.id_nasabah}>
            {nasabahList.map(n => <option key={n.id} value={n.id}>{n.nama_lengkap} ({n.id_karyawan})</option>)}
          </select>
          <p className="text-[11px] text-gray-400 mt-1">*Pemilik transaksi tidak dapat diubah. Hapus transaksi jika terjadi kesalahan input nama.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Pinjaman Pokok (Rp)</label>
          <input type="number" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-400" 
            value={formData.nominal_pokok}
            onChange={(e) => setFormData({...formData, nominal_pokok: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status Jaminan ATM</label>
          <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-400" 
            value={formData.status_atm}
            onChange={(e) => setFormData({...formData, status_atm: e.target.value})}>
            <option value="Ditahan">KARTU ATM DITAHAN OLEH AGEN</option>
            <option value="Dikembalikan">KARTU ATM DIKEMBALIKAN KE NASABAH</option>
          </select>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <label className="block text-sm font-bold text-yellow-800 mb-1">Verifikasi Ulang PIN ATM</label>
          <p className="text-xs text-yellow-700 mb-3">Wajib memasukkan PIN Nasabah untuk mengesahkan perubahan data.</p>
          <input type="password" required maxLength="6" className="w-full p-3 bg-white border border-yellow-300 rounded-lg outline-none tracking-[0.3em] focus:ring-2 focus:ring-yellow-500" 
            placeholder="******"
            value={formData.pin_atm}
            onChange={(e) => setFormData({...formData, pin_atm: e.target.value})} />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors">
          {isSubmitting ? "Menyimpan Perubahan..." : "Simpan Perubahan Transaksi"}
        </button>
      </form>
    </div>
  );
};

export default EditPiutang;