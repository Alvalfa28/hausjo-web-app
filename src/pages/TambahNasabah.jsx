import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const TambahNasabah = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankDropdown, setBankDropdown] = useState('');
  
  // BARU DITAMBAHKAN: State untuk mengontrol visibilitas PIN (Line 11)
  const [showPin, setShowPin] = useState(false);
  
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
      navigate('/manajemen-nasabah'); 
      
    } catch (error) {
      console.error("Error menambahkan dokumen: ", error);
      alert("Gagal menyimpan data: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button 
        onClick={() => navigate('/manajemen-nasabah')} 
        className="text-sm text-gray-500 hover:text-blue-900 flex items-center gap-1 transition-all"
      >
        &larr; Kembali ke Daftar Nasabah
      </button>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-blue-900 mb-1">Registrasi Nasabah & Jaminan</h2>
        <p className="text-gray-500 text-sm">Masukkan data master nasabah beserta rincian jaminan kartu ATM fisik secara lengkap.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-base font-bold text-blue-900 border-b pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">1</span>
              Data Pribadi & Pekerjaan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">ID Karyawan</label>
                <input type="text" name="id_karyawan" value={formData.id_karyawan} onChange={handleChange} required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all text-sm text-gray-800" placeholder="Nomor Induk Karyawan" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Nama Lengkap</label>
                <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all text-sm text-gray-800" placeholder="Nama sesuai KTP" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Nomor HP / WhatsApp</label>
                <input type="tel" name="no_hp" value={formData.no_hp} onChange={handleChange} required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all text-sm text-gray-800" placeholder="08xxxxxxxxxx" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Instansi / Pabrik</label>
                <input type="text" name="instansi" value={formData.instansi} onChange={handleChange} required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all text-sm text-gray-800" placeholder="Tempat bekerja" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-blue-900 border-b pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">2</span>
              Parameter Penilaian Kredit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Gaji Bulanan (Rp)</label>
                <input type="number" name="gaji_bulanan" value={formData.gaji_bulanan} onChange={handleChange} required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all text-sm text-gray-800" placeholder="Contoh: 4000000" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Lama Kerja (Tahun)</label>
                <input type="number" name="lama_kerja" value={formData.lama_kerja} onChange={handleChange} required min="0" step="0.5"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all text-sm text-gray-800" placeholder="Contoh: 2.5" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Skor Riwayat Bayar</label>
                <select name="status_riwayat" value={formData.status_riwayat} onChange={handleChange} required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all text-sm text-gray-800">
                  <option value="">Pilih Skor</option>
                  <option value="5">5 - Sangat Baik / Selalu Tepat Waktu</option>
                  <option value="4">4 - Baik / Pernah Terlambat 1-2 Hari</option>
                  <option value="3">3 - Netral / Nasabah Baru (Cold-Start)</option>
                  <option value="2">2 - Buruk / Sering Menunggak</option>
                  <option value="1">1 - Sangat Buruk / Pernah Gagal Bayar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 p-6 rounded-xl text-white shadow-inner">
            <h3 className="text-base font-bold text-sky-300 mb-4 border-b border-blue-800 pb-2 flex items-center gap-2">
              Verifikasi Fisik Jaminan Kartu ATM
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-blue-200 mb-1">Bank Penerbit</label>
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
                  className="w-full p-2.5 bg-blue-800 border border-blue-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-sky-400 outline-none"
                >
                  <option value="">-- Pilih Bank --</option>
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BRI">BRI</option>
                  <option value="BNI">BNI</option>
                  <option value="BSI">BSI</option>
                  <option value="BJB">BJB</option>
                  <option value="Lainnya">Lainnya... (Ketik Manual)</option>
                </select>

                {bankDropdown === 'Lainnya' && (
                  <input 
                    type="text" 
                    name="nama_bank" 
                    value={formData.nama_bank} 
                    onChange={handleChange} 
                    required 
                    placeholder="Ketik nama bank..."
                    className="mt-2 w-full p-2.5 bg-blue-800 border border-sky-400 rounded-lg text-white text-sm focus:ring-2 focus:ring-sky-400 outline-none placeholder-blue-300" 
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-blue-200 mb-1">Nama di Kartu</label>
                <input type="text" name="nama_kartu" value={formData.nama_kartu} onChange={handleChange} required
                  className="w-full p-2.5 bg-blue-800 border border-blue-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-sky-400 outline-none placeholder-blue-400" placeholder="NAMA DI KARTU" />
              </div>
              
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-blue-200 mb-1">16 Digit Nomor ATM</label>
                <input type="text" name="no_atm" value={formData.no_atm} onChange={handleChange} required maxLength="16"
                  className="w-full p-2.5 bg-blue-800 border border-blue-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-sky-400 outline-none placeholder-blue-400" placeholder="1234567890123456" />
              </div>
              
              {/* DIUBAH: Struktur Input PIN dengan Ikon Mata (Mulai Line 212 - 240) */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-blue-200 mb-1">PIN ATM (Disandikan)</label>
                <div className="relative">
                  <input 
                    type={showPin ? "text" : "password"} 
                    name="pin_atm" 
                    value={formData.pin_atm} 
                    onChange={handleChange} 
                    required 
                    maxLength="6"
                    className={`w-full p-2.5 bg-blue-800 border border-blue-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-sky-400 outline-none placeholder-blue-400 pr-10 ${showPin ? 'tracking-normal' : 'tracking-[0.3em]'}`} 
                    placeholder="******" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white focus:outline-none"
                  >
                    {showPin ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 17.772 17.772m0 0a1.18 1.18 0 0 1-1.665 0L12 14.165m5.772 3.607a11.162 11.162 0 0 1-5.772 1.638c-4.756 0-8.773-3.162-10.065-7.498a10.523 10.523 0 0 1 4.293-5.774M12 14.165a3 3 0 1 1-3-3l3 3Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {/* AKHIR PERUBAHAN */}

            </div>
            <p className="mt-4 text-xs text-blue-300 italic">
              *Pastikan fisik kartu ATM telah diterima dan divalidasi oleh Bendahara sebelum menyimpan data.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-70 text-sm"
            >
              {isSubmitting ? 'Menyimpan Data...' : 'Simpan Data Nasabah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahNasabah;