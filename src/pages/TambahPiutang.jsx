import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const TambahPiutang = () => {
  const [nasabahList, setNasabahList] = useState([]);
  const [biayaAdmin, setBiayaAdmin] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    id_nasabah: '',
    nominal_pokok: '',
    status_atm: 'Ditahan', // Default status jaminan
    pin_atm: ''
  });

  // Fetch data nasabah & konfigurasi global saat halaman dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil list nasabah
        const nasabahSnapshot = await getDocs(collection(db, "nasabah"));
        setNasabahList(nasabahSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Ambil konfigurasi global (Biaya Admin)
        const configDoc = await getDoc(doc(db, "pengaturan", "konfigurasi_global"));
        if (configDoc.exists()) {
          setBiayaAdmin(configDoc.data().biaya_admin_global || 0);
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Cari data nasabah terpilih untuk validasi PIN
      const nasabahTerpilih = nasabahList.find(n => n.id === formData.id_nasabah);
      
      if (!nasabahTerpilih) {
        alert("Data nasabah tidak ditemukan.");
        setIsSubmitting(false);
        return;
      }

      // 2. Enkripsi PIN input untuk dibandingkan dengan database (menggunakan btoa seperti saat pendaftaran)
      const inputPinEncrypted = btoa(formData.pin_atm);

      // 3. Validasi PIN ATM
      if (nasabahTerpilih.pin_atm !== inputPinEncrypted) {
        alert("PIN ATM Salah! Silakan periksa kembali PIN nasabah.");
        setIsSubmitting(false);
        return;
      }

      // 4. Proses perhitungan
      const totalTagihan = Number(formData.nominal_pokok) + biayaAdmin;

      // 5. Simpan ke koleksi 'piutang'
      await addDoc(collection(db, "piutang"), {
        id_nasabah: formData.id_nasabah,
        nominal_pokok: Number(formData.nominal_pokok),
        biaya_admin_temp: biayaAdmin, // Snapshot biaya admin saat transaksi
        total_tagihan: totalTagihan,
        status_atm: formData.status_atm,
        pin_atm: inputPinEncrypted, 
        status_lunas: false,
        created_at: serverTimestamp()
      });

      alert("Transaksi piutang berhasil dicatat & jaminan ATM disimpan.");
      
      // Reset form
      setFormData({ id_nasabah: '', nominal_pokok: '', status_atm: 'Ditahan', pin_atm: '' });
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mencatat transaksi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Input Transaksi Piutang</h2>
        <p className="text-gray-500 text-sm">Pencatatan pinjaman dan penahanan jaminan fisik.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropdown Nasabah */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Nasabah</label>
          <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-400" 
            value={formData.id_nasabah}
            onChange={(e) => setFormData({...formData, id_nasabah: e.target.value})}>
            <option value="">-- Pilih Nasabah --</option>
            {nasabahList.map(n => <option key={n.id} value={n.id}>{n.nama_lengkap} ({n.id_karyawan})</option>)}
          </select>
        </div>

        {/* Nominal Pinjaman */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Pinjaman Pokok (Rp)</label>
          <input type="number" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-400" 
            placeholder="Contoh: 500000"
            value={formData.nominal_pokok}
            onChange={(e) => setFormData({...formData, nominal_pokok: e.target.value})} />
        </div>

        {/* Info Biaya Admin */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
          <p>Biaya Administrasi sistem saat ini: <strong>Rp {biayaAdmin.toLocaleString()}</strong></p>
          <p className="text-xs mt-1 italic">Nilai ini akan otomatis ditambahkan ke total tagihan.</p>
        </div>

        {/* PIN ATM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi PIN ATM Nasabah</label>
          <input type="password" required maxLength="6" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none tracking-[0.3em] focus:ring-2 focus:ring-sky-400" 
            placeholder="******"
            value={formData.pin_atm}
            onChange={(e) => setFormData({...formData, pin_atm: e.target.value})} />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors">
          {isSubmitting ? "Memproses..." : "Konfirmasi Pinjaman & Tahan Jaminan"}
        </button>
      </form>
    </div>
  );
};

export default TambahPiutang;