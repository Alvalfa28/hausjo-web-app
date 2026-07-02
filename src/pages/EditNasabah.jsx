import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const EditNasabah = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // BARU DITAMBAHKAN: State untuk mengontrol visibilitas PIN (Line 11)
  const [showPin, setShowPin] = useState(false);
  
  const [formData, setFormData] = useState({
    id_karyawan: '', nama_lengkap: '', no_hp: '', instansi: '',
    nama_bank: '', nama_kartu: '', no_atm: '', pin_atm: '',
    gaji_bulanan: '', lama_kerja: '', status_riwayat: ''
  });

  const [bankDropdown, setBankDropdown] = useState('');

  useEffect(() => {
    const fetchNasabah = async () => {
      try {
        const docRef = doc(db, "nasabah", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            ...data,
            pin_atm: atob(data.pin_atm) 
          });
          setBankDropdown(data.nama_bank);
        } else {
          alert("Data tidak ditemukan!");
          navigate('/manajemen-nasabah');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNasabah();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const docRef = doc(db, "nasabah", id);
      await updateDoc(docRef, {
        ...formData,
        pin_atm: btoa(formData.pin_atm), 
        gaji_bulanan: Number(formData.gaji_bulanan), 
        lama_kerja: Number(formData.lama_kerja),    
        status_riwayat: Number(formData.status_riwayat), 
        updated_at: serverTimestamp() 
      });

      alert("Data Nasabah berhasil diperbarui!");
      navigate('/manajemen-nasabah'); 
      
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Gagal mengupdate data: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button 
        onClick={() => navigate('/manajemen-nasabah')} 
        className="mb-4 text-sm text-gray-500 hover:text-blue-900 flex items-center gap-1 transition-all"
      >
        &larr; Kembali ke Daftar Nasabah
      </button>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <div className="mb-8 border-b pb-4">
          <h2 className="text-2xl font-bold text-blue-900">Edit Data Nasabah</h2>
          <p className="text-gray-500 text-sm mt-1">Ubah data master nasabah yang diperlukan.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">1</span>
              Data Pribadi & Pekerjaan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Karyawan</label>
                <input type="text" name="id_karyawan" value={formData.id_karyawan} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP / WhatsApp</label>
                <input type="tel" name="no_hp" value={formData.no_hp} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instansi / Pabrik</label>
                <input type="text" name="instansi" value={formData.instansi} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">2</span>
              Parameter Penilaian Kredit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gaji Bulanan (Rp)</label>
                <input type="number" name="gaji_bulanan" value={formData.gaji_bulanan} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lama Kerja (Tahun)</label>
                <input type="number" name="lama_kerja" value={formData.lama_kerja} onChange={handleChange} required min="0" step="0.5" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skor Riwayat Bayar (Karakter)</label>
                <select name="status_riwayat" value={formData.status_riwayat} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all">
                  <option value="">Pilih Skor</option>
                  <option value="5">5 - Sangat Baik</option>
                  <option value="4">4 - Baik</option>
                  <option value="3">3 - Netral/Nasabah Baru</option>
                  <option value="2">2 - Buruk</option>
                  <option value="1">1 - Sangat Buruk</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 p-6 rounded-xl text-white">
            <h3 className="text-lg font-semibold text-sky-300 mb-4 border-b border-blue-800 pb-2">Verifikasi Fisik Jaminan Kartu ATM</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Bank Penerbit</label>
                <select value={bankDropdown} onChange={(e) => { setBankDropdown(e.target.value); setFormData(prev => ({...prev, nama_bank: e.target.value})) }} className="w-full p-2.5 bg-blue-800 border border-blue-700 rounded-lg text-white">
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BRI">BRI</option>
                  <option value="BNI">BNI</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-blue-200 mb-1">Nama Tertera di Kartu</label><input type="text" name="nama_kartu" value={formData.nama_kartu} onChange={handleChange} required className="w-full p-2.5 bg-blue-800 border border-blue-700 rounded-lg text-white" /></div>
              <div><label className="block text-sm font-medium text-blue-200 mb-1">16 Digit Nomor ATM</label><input type="text" name="no_atm" value={formData.no_atm} onChange={handleChange} required className="w-full p-2.5 bg-blue-800 border border-blue-700 rounded-lg text-white" /></div>
              
              {/* DIUBAH: Struktur Input PIN dengan Ikon Mata (Mulai Line 159 - 187) */}
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
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all">
              {isSubmitting ? 'Menyimpan...' : 'Update Data Nasabah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNasabah;