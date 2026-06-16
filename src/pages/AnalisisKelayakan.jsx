import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { hitungKelayakanKredit } from '../utils/profileMatching';

const AnalisisKelayakan = () => {
  const [nasabahList, setNasabahList] = useState([]);
  const [selectedNasabah, setSelectedNasabah] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [nilaiAktual, setNilaiAktual] = useState({
    gaji: '',
    riwayat: '',
    lamaKerja: ''
  });

  const [hasilAnalisis, setHasilAnalisis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchNasabah = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "nasabah"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNasabahList(data);
      } catch (error) {
        console.error("Gagal mengambil data nasabah:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNasabah();
  }, []);

  const handleSelectNasabah = (e) => {
    const nasabahId = e.target.value;
    setSelectedNasabah(nasabahId);
    setHasilAnalisis(null); 

    if (!nasabahId) {
      setNilaiAktual({ gaji: '', riwayat: '', lamaKerja: '' });
      return;
    }

    const nasabah = nasabahList.find(n => n.id === nasabahId);
    if (nasabah) {
      
      // 1. MAPPING GAJI BULANAN (Sesuai Bab 3.4.1 Poin 1)
      let skorGaji = 1;
      if (nasabah.gaji_bulanan > 5000000) skorGaji = 5;
      else if (nasabah.gaji_bulanan >= 4000000) skorGaji = 4; // Rp4.000.000 - Rp5.000.000
      else if (nasabah.gaji_bulanan >= 3000000) skorGaji = 3; // Rp3.000.000 - < Rp4.000.000
      else if (nasabah.gaji_bulanan >= 2000000) skorGaji = 2; // Rp2.000.000 - < Rp3.000.000
      else skorGaji = 1;                                      // < Rp2.000.000

      // 2. MAPPING LAMA KERJA (Sesuai Bab 3.4.1 Poin 2)
      let skorLamaKerja = 1;
      if (nasabah.lama_kerja > 6) skorLamaKerja = 5;
      else if (nasabah.lama_kerja >= 5) skorLamaKerja = 4; // 5 - 6 Tahun
      else if (nasabah.lama_kerja >= 3) skorLamaKerja = 3; // 3 - 4 Tahun
      else if (nasabah.lama_kerja >= 1) skorLamaKerja = 2; // 1 - 2 Tahun
      else skorLamaKerja = 1;                              // < 1 Tahun

      // 3. MAPPING RIWAYAT BAYAR (Sesuai Bab 3.4.1 Poin 3)
      // Terapkan aturan cold-start: jika tidak ada data riwayat, beri default 3 (Netral / Nasabah Baru)
      let skorRiwayat = nasabah.status_riwayat ? Number(nasabah.status_riwayat) : 3;

      setNilaiAktual({
        gaji: skorGaji,
        riwayat: skorRiwayat,
        lamaKerja: skorLamaKerja
      });
    }
  };

  const handleHitung = () => {
    if (!selectedNasabah || !nilaiAktual.gaji) {
      alert("Pilih nasabah terlebih dahulu!");
      return;
    }
    const hasil = hitungKelayakanKredit(nilaiAktual);
    setHasilAnalisis(hasil);
  };

  const handleSimpanHasil = async () => {
    if (!hasilAnalisis) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "hasil_analisis"), {
        id_nasabah: selectedNasabah,
        total_skor: hasilAnalisis.totalSkor,
        status_kelayakan: hasilAnalisis.status,
        status_approval: "Menunggu", 
        kesimpulan: `Skor NCF: ${hasilAnalisis.ncf}, Skor NSF: ${hasilAnalisis.nsf}. Dinyatakan ${hasilAnalisis.status}.`,
        created_at: serverTimestamp()
      });
      alert("Hasil analisis kelayakan berhasil disubmit ke Kepala Agen!");
      setHasilAnalisis(null);
      setSelectedNasabah('');
      setNilaiAktual({ gaji: '', riwayat: '', lamaKerja: '' });
    } catch (error) {
      console.error("Error menyimpan hasil:", error);
      alert("Gagal menyimpan hasil analisis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Analisis Kelayakan Kredit</h2>
        <p className="text-gray-500 text-sm">Sistem Pendukung Keputusan Profile Matching sesuai Bab 3.4.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">1. Pilih Nasabah (Master Data)</label>
            <select 
              value={selectedNasabah} 
              onChange={handleSelectNasabah}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
            >
              <option value="">-- Pilih Data Nasabah --</option>
              {isLoading ? (
                <option disabled>Memuat data...</option>
              ) : (
                nasabahList.map(n => (
                  <option key={n.id} value={n.id}>{n.nama_lengkap} ({n.id_karyawan})</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-3">2. Nilai Kriteria Tersandikan</label>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Kapasitas (Gaji) - Target: 4</label>
                <input type="number" value={nilaiAktual.gaji} readOnly className="w-full p-2 bg-gray-100 text-gray-500 border rounded-lg cursor-not-allowed font-bold" />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Karakter (Riwayat) - Target: 5</label>
                <input type="number" value={nilaiAktual.riwayat} readOnly className="w-full p-2 bg-gray-100 text-gray-500 border rounded-lg cursor-not-allowed font-bold" />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Loyalitas (Lama Kerja) - Target: 4</label>
                <input type="number" value={nilaiAktual.lamaKerja} readOnly className="w-full p-2 bg-gray-100 text-gray-500 border rounded-lg cursor-not-allowed font-bold" />
              </div>
            </div>
            <p className="text-[11px] text-sky-600 mt-3 leading-relaxed italic">
              *Konversi aktual nasabah ke rentang nilai 1-5 dilakukan otomatis oleh sistem menggunakan aturan penetapan standar operasional (Bab 3.4.1).
            </p>
          </div>

          <button onClick={handleHitung} className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow transition-colors">
            Hitung Profile Matching
          </button>
        </div>

        <div className="lg:col-span-2">
          {hasilAnalisis ? (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-bold text-blue-900 mb-4 border-b pb-2">Laporan Hasil Keputusan</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-sky-50 rounded-lg border border-sky-100">
                  <p className="text-xs text-sky-700 font-semibold mb-1">Nilai Core Factor (60%)</p>
                  <p className="text-2xl font-bold text-blue-900">{hasilAnalisis.ncf}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Nilai Secondary Factor (40%)</p>
                  <p className="text-2xl font-bold text-gray-800">{hasilAnalisis.nsf}</p>
                </div>
              </div>

              <div className={`p-6 rounded-xl mb-6 text-center border-2 ${hasilAnalisis.status === 'Layak' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <p className="text-sm font-semibold mb-2">TOTAL SKOR KELAYAKAN</p>
                <p className="text-5xl font-black mb-2">{hasilAnalisis.totalSkor}</p>
                <p className="text-xl font-bold uppercase tracking-widest">{hasilAnalisis.status}</p>
              </div>

              <div className="mt-auto pt-4 flex justify-end">
                <button 
                  onClick={handleSimpanHasil} 
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow disabled:opacity-70"
                >
                  {isSubmitting ? 'Menyimpan ke Database...' : 'Simpan & Ajukan Approval'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-4xl mb-4">⚖️</span>
              <p>Pilih nama nasabah dari master data untuk memulai kalkulasi otomatis.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AnalisisKelayakan;