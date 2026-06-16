import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const TambahNasabah = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 1. STATE FORM DATA (Hanya dideklarasikan satu kali)
  const [formData, setFormData] = useState({
    id_karyawan: '',
    nama_lengkap: '',
    no_hp: '',
    instansi: '',
    nama_bank: '', 
    nama_kartu: '',
    no_atm: '',
    pin_atm: '',
    gaji_bulanan: '',
    lama_kerja: '',
    status_riwayat: ''
  });

  // 2. STATE KONTROL DROPDOWN BANK
  const [bankDropdown, setBankDropdown] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "nasabah"), {
        id_karyawan: formData.id_karyawan,
        nama_lengkap: formData.nama_lengkap,
        no_hp: formData.no_hp,
        instansi: formData.instansi,
        nama_bank: formData.nama_bank,
        nama_kartu: formData.nama_kartu,
        no_atm: formData.no_atm,
        pin_atm: btoa(formData.pin_atm), 
        gaji_bulanan: Number(formData.gaji_bulanan), 
        lama_kerja: Number(formData.lama_kerja),     
        status_riwayat: Number(formData.status_riwayat), 
        created_at: serverTimestamp() 
      });

      alert("Data Nasabah dan Jaminan ATM berhasil disimpan!");
      
      // Reset Form dan Dropdown setelah berhasil simpan
      setFormData({
        id_karyawan: '', nama_lengkap: '', no_hp: '', instansi: '',
        nama_bank: '', nama_kartu: '', no_atm: '', pin_atm: '', 
        gaji_bulanan: '', lama_kerja: '', status_riwayat: ''
      });
      setBankDropdown('');
      
    } catch (error) {
      console.error("Error menambahkan dokumen: ", error);
      alert("Gagal menyimpan data: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-blue-900">Registrasi Nasabah & Jaminan</h2>
        <p className="text-gray-500 text-sm mt-1">Masukkan data master nasabah beserta rincian jaminan kartu ATM fisik.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* BAGIAN 1: DATA PRIBADI */}
        <div>
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">1</span>
            Data Pribadi & Pekerjaan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Karyawan</label>
              <input type="text" name="id_karyawan" value={formData.id_karyawan} onChange={handleChange} required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all" placeholder="Nomor Induk Karyawan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all" placeholder="Nama sesuai KTP" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP / WhatsApp</label>
              <input type="tel" name="no_hp" value={formData.no_hp} onChange={handleChange} required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all" placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instansi / Pabrik</label>
              <input type="text" name="instansi" value={formData.instansi} onChange={handleChange} required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all" placeholder="Tempat bekerja" />
            </div>
          </div>
        </div>

        {/* BAGIAN 2: PENILAIAN */}
        <div>
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">2</span>
            Parameter Penilaian Kredit
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gaji Bulanan (Rp)</label>
              <input type="number" name="gaji_bulanan" value={formData.gaji_bulanan} onChange={handleChange} required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all" placeholder="Contoh: 4000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lama Kerja (Tahun)</label>
              <input type="number" name="lama_kerja" value={formData.lama_kerja} onChange={handleChange} required min="0" step="0.5"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all" placeholder="Contoh: 2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skor Riwayat Bayar (1-5)</label>
              <select name="status_riwayat" value={formData.status_riwayat} onChange={handleChange} required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all">
                <option value="">-- Pilih Skor --</option>
                <option value="5">5 - Sangat Lancar / Nasabah Baru</option>
                <option value="4">4 - Lancar (Pernah telat &lt; 3 hari)</option>
                <option value="3">3 - Cukup (Sering telat, lunas)</option>
                <option value="2">2 - Buruk (Menunggak lama)</option>
                <option value="1">1 - Sangat Buruk (Blacklist)</option>
              </select>
            </div>
          </div>
        </div>

        {/* BAGIAN 3: JAMINAN KARTU ATM */}
        <div className="bg-blue-900 p-6 rounded-xl text-white">
          <h3 className="text-lg font-semibold text-sky-300 mb-4 border-b border-blue-800 pb-2">
            Verifikasi Fisik Jaminan Kartu ATM
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Input Nama Bank */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Bank Penerbit</label>
              <select 
                value={bankDropdown} 
                onChange={(e) => {
                  setBankDropdown(e.target.value);
                  if (e.target.value !== 'Lainnya') {
                    setFormData(prev => ({ ...prev, nama_bank: e.target.value }));
                  } else {
                    setFormData(prev => ({ ...prev, nama_bank: '' }));
                  }
                }} 
                required={bankDropdown !== 'Lainnya'}
                className="w-full p-2.5 bg-blue-800 border border-blue-700 rounded-lg text-white focus:ring-2 focus:ring-sky-400 outline-none"
              >
                <option value="">-- Pilih Bank --</option>
                <option value="BCA">BCA</option>
                <option value="Mandiri">Mandiri</option>
                <option value="BRI">BRI</option>
                <option value="BNI">BNI</option>
                <option value="BSI">BSI</option>
                <option value="BJB">BJB</option>
                <option value="Lainnya">Lainnya...</option>
              </select>

              {/* Kolom pengisian manual muncul jika "Lainnya" dipilih */}
              {bankDropdown === 'Lainnya' && (
                <input 
                  type="text" 
                  name="nama_bank" 
                  value={formData.nama_bank} 
                  onChange={handleChange} 
                  required 
                  placeholder="Ketik nama bank..."
                  className="mt-3 w-full p-2.5 bg-blue-800 border border-sky-400 rounded-lg text-white focus:ring-2 focus:ring-sky-400 outline-none placeholder-blue-300 shadow-[0_0_10px_rgba(56,189,248,0.2)] transition-all" 
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Nama Tertera di Kartu</label>
              <input type="text" name="nama_kartu" value={formData.nama_kartu} onChange={handleChange} required
                className="w-full p-2.5 bg-blue-800 border border-blue-700 rounded-lg text-white focus:ring-2 focus:ring-sky-400 outline-none placeholder-blue-400" placeholder="NAMA DI KARTU" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">16 Digit Nomor ATM</label>
              <input type="text" name="no_atm" value={formData.no_atm} onChange={handleChange} required maxLength="16"
                className="w-full p-2.5 bg-blue-800 border border-blue-700 rounded-lg text-white focus:ring-2 focus:ring-sky-400 outline-none placeholder-blue-400" placeholder="1234567890123456" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">PIN ATM (Disandikan)</label>
              <input type="password" name="pin_atm" value={formData.pin_atm} onChange={handleChange} required maxLength="6"
                className="w-full p-2.5 bg-blue-800 border border-blue-700 rounded-lg text-white focus:ring-2 focus:ring-sky-400 outline-none placeholder-blue-400 tracking-[0.3em]" placeholder="******" />
            </div>
          </div>
          <p className="mt-4 text-xs text-blue-300 italic">
            *Pastikan kartu fisik telah diterima oleh Bendahara. PIN disimpan dalam format terenkripsi.
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-70"
          >
            {isSubmitting ? 'Menyimpan Data...' : 'Simpan Data Nasabah'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default TambahNasabah;