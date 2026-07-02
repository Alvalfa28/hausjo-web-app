import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const KriteriaPenilaian = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Perhatikan: Menggunakan 'min' dan 'max', bukan sekadar teks 'range'
  const [gaji, setGaji] = useState([
    { min: 5000001, max: '', bobot: 5 }, // max kosong = ke atas
    { min: 4000000, max: 5000000, bobot: 4 },
    { min: 3000000, max: 3999999, bobot: 3 },
    { min: 2000000, max: 2999999, bobot: 2 },
    { min: 0, max: 1999999, bobot: 1 },
  ]);

  const [riwayat, setRiwayat] = useState([
    { desc: 'Sangat Baik / Selalu Tepat Waktu', bobot: 5 },
    { desc: 'Baik / Pernah Terlambat 1-2 Hari', bobot: 4 },
    { desc: 'Netral / Nasabah Baru (Cold-Start)', bobot: 3 },
    { desc: 'Buruk / Sering Menunggak', bobot: 2 },
    { desc: 'Sangat Buruk / Pernah Gagal Bayar', bobot: 1 },
  ]);

  const [lamaKerja, setLamaKerja] = useState([
    { min: 6.1, max: '', bobot: 5 }, // Lebih dari 6 tahun
    { min: 5, max: 6, bobot: 4 },
    { min: 3, max: 4.9, bobot: 3 },
    { min: 1, max: 2.9, bobot: 2 },
    { min: 0, max: 0.9, bobot: 1 },
  ]);

  useEffect(() => {
    const fetchKriteria = async () => {
      try {
        const docRef = doc(db, "pengaturan", "matriks_kriteria");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.gaji) setGaji(data.gaji);
          if (data.riwayat) setRiwayat(data.riwayat);
          if (data.lamaKerja) setLamaKerja(data.lamaKerja);
        }
      } catch (error) {
        console.error("Gagal memuat kriteria:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchKriteria();
  }, []);

  const handleChange = (index, field, value, stateSetter, stateData) => {
    const newData = [...stateData];
    newData[index][field] = value;
    stateSetter(newData);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, "pengaturan", "matriks_kriteria"), {
        gaji, riwayat, lamaKerja, updated_at: serverTimestamp()
      });
      alert("Matriks Kriteria Dinamis berhasil disimpan!");
    } catch (error) {
      alert("Gagal menyimpan matriks kriteria.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat matriks kriteria...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Kelola Kriteria Penilaian</h2>
        <p className="text-gray-500 text-sm">Pengaturan batas min-max (dinamis) untuk perhitungan otomatis Profile Matching.</p>
      </div>

      <form onSubmit={handleSimpan} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* KOLOM KIRI: CORE FACTOR */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-blue-900 uppercase flex items-center gap-2"><span className="w-2 h-6 bg-blue-900 rounded-full"></span>Core Factor (60%)</h3>

            {/* Gaji */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="text-base font-bold text-gray-800 mb-4">Besaran Gaji Bulanan (C1)</h4>
              <div className="flex gap-2 mb-2 px-1 text-xs font-semibold text-gray-400 uppercase">
                <div className="flex-1">Batas Minimum (Rp)</div>
                <div className="flex-1">Batas Maksimum (Rp)</div>
                <div className="w-20 text-center">Bobot</div>
              </div>
              <div className="space-y-3">
                {gaji.map((item, index) => (
                  <div key={`gaji-${index}`} className="flex gap-2 items-center">
                    <input type="number" value={item.min} onChange={(e) => handleChange(index, 'min', e.target.value, setGaji, gaji)} required className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" />
                    <span className="text-gray-400 font-bold">-</span>
                    <input type="number" value={item.max} onChange={(e) => handleChange(index, 'max', e.target.value, setGaji, gaji)} placeholder="> Ke atas" className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" />
                    <input type="number" value={item.bobot} onChange={(e) => handleChange(index, 'bobot', Number(e.target.value), setGaji, gaji)} required className="w-20 p-2 bg-blue-50 text-blue-900 font-bold border border-blue-200 rounded-lg text-center outline-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Riwayat */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="text-base font-bold text-gray-800 mb-4">Riwayat Pembayaran (C3)</h4>
              <div className="flex gap-2 mb-2 px-1 text-xs font-semibold text-gray-400 uppercase">
                <div className="flex-1">Deskripsi Kondisi (Statik)</div>
                <div className="w-20 text-center">Bobot</div>
              </div>
              <div className="space-y-3">
                {riwayat.map((item, index) => (
                  <div key={`riwayat-${index}`} className="flex gap-2 items-center">
                    <input type="text" value={item.desc} readOnly className="flex-1 p-2 bg-gray-100 text-gray-500 border border-gray-200 rounded-lg text-sm outline-none cursor-not-allowed" />
                    <input type="number" value={item.bobot} onChange={(e) => handleChange(index, 'bobot', Number(e.target.value), setRiwayat, riwayat)} required className="w-20 p-2 bg-blue-50 text-blue-900 font-bold border border-blue-200 rounded-lg text-center outline-none" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-3 text-gray-400">*Deskripsi C3 tidak dapat diubah karena terikat pada dropdown form master nasabah.</p>
            </div>
          </div>

          {/* KOLOM KANAN: SECONDARY FACTOR */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-700 uppercase flex items-center gap-2"><span className="w-2 h-6 bg-gray-400 rounded-full"></span>Secondary Factor (40%)</h3>

            {/* Lama Kerja */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="text-base font-bold text-gray-800 mb-4">Lama Kerja (C2)</h4>
              <div className="flex gap-2 mb-2 px-1 text-xs font-semibold text-gray-400 uppercase">
                <div className="flex-1">Minimum (Tahun)</div>
                <div className="flex-1">Maksimum (Tahun)</div>
                <div className="w-20 text-center">Bobot</div>
              </div>
              <div className="space-y-3">
                {lamaKerja.map((item, index) => (
                  <div key={`lamaKerja-${index}`} className="flex gap-2 items-center">
                    <input type="number" step="0.1" value={item.min} onChange={(e) => handleChange(index, 'min', e.target.value, setLamaKerja, lamaKerja)} required className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" />
                    <span className="text-gray-400 font-bold">-</span>
                    <input type="number" step="0.1" value={item.max} onChange={(e) => handleChange(index, 'max', e.target.value, setLamaKerja, lamaKerja)} placeholder="> Ke atas" className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" />
                    <input type="number" value={item.bobot} onChange={(e) => handleChange(index, 'bobot', Number(e.target.value), setLamaKerja, lamaKerja)} required className="w-20 p-2 bg-gray-100 text-gray-800 font-bold border border-gray-300 rounded-lg text-center outline-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow-md transition-all">
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Matriks Kriteria'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KriteriaPenilaian;