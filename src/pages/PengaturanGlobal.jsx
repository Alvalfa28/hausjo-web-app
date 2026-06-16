import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const PengaturanGlobal = () => {
  const [config, setConfig] = useState({
    biaya_admin_global: '',
    target_gaji_ideal: '',
    target_lama_kerja_ideal: '',
    target_riwayat_ideal: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "pengaturan", "konfigurasi_global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setConfig({
            biaya_admin_global: data.biaya_admin_global ?? '',
            target_gaji_ideal: data.target_gaji_ideal ?? '',
            target_lama_kerja_ideal: data.target_lama_kerja_ideal ?? '',
            target_riwayat_ideal: data.target_riwayat_ideal ?? ''
          });
        }
      } catch (error) {
        console.error("Gagal memuat pengaturan:", error);
      }
    };
    fetchConfig();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const docRef = doc(db, "pengaturan", "konfigurasi_global");
      
      // setDoc dengan {merge: true} akan membuat dokumen jika belum ada
      // atau memperbarui dokumen yang sudah ada tanpa menghapus field lain.
      await setDoc(docRef, { 
        ...config, 
        updated_at: serverTimestamp() 
      }, { merge: true });

      alert("Pengaturan sistem berhasil disimpan.");
    } catch (e) {
      console.error("Error:", e);
      alert("Gagal menyimpan perubahan. Cek koneksi atau izin akses.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Pengaturan Sistem</h2>
        <p className="text-gray-500 text-sm">Kelola konfigurasi biaya dan nilai target ideal sistem.</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Administrasi (Rp)</label>
            <input 
              type="number" 
              className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" 
              placeholder="0"
              value={config.biaya_admin_global}
              onChange={(e) => setConfig({...config, biaya_admin_global: e.target.value === '' ? '' : Number(e.target.value)})} 
            />
          </div>

          <h3 className="md:col-span-2 text-md font-semibold text-blue-900 mt-4 border-b pb-2">Target Parameter Ideal (Skala 1-5)</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Gaji</label>
            <input type="number" min="1" max="5" className="w-full p-3 bg-gray-50 border rounded-lg" 
              value={config.target_gaji_ideal}
              onChange={(e) => setConfig({...config, target_gaji_ideal: e.target.value === '' ? '' : Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Lama Kerja</label>
            <input type="number" min="1" max="5" className="w-full p-3 bg-gray-50 border rounded-lg" 
              value={config.target_lama_kerja_ideal}
              onChange={(e) => setConfig({...config, target_lama_kerja_ideal: e.target.value === '' ? '' : Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Riwayat</label>
            <input type="number" min="1" max="5" className="w-full p-3 bg-gray-50 border rounded-lg" 
              value={config.target_riwayat_ideal}
              onChange={(e) => setConfig({...config, target_riwayat_ideal: e.target.value === '' ? '' : Number(e.target.value)})} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
};

export default PengaturanGlobal;