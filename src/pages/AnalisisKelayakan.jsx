import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { hitungKelayakanKredit } from '../utils/profileMatching';

const AnalisisKelayakan = () => {
  const [view, setView] = useState('list'); 
  const [nasabahList, setNasabahList] = useState([]);
  const [matriksKriteria, setMatriksKriteria] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedNasabah, setSelectedNasabah] = useState(null);
  const [nilaiAktual, setNilaiAktual] = useState({ gaji: '', riwayat: '', lamaKerja: '' });
  const [hasilAnalisis, setHasilAnalisis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNasabah = async () => {
    setIsLoading(true);
    try {
      const [nasabahSnap, analisisSnap, matriksSnap] = await Promise.all([
        getDocs(collection(db, "nasabah")),
        getDocs(collection(db, "hasil_analisis")),
        getDoc(doc(db, "pengaturan", "matriks_kriteria"))
      ]);

      if (matriksSnap.exists()) {
        setMatriksKriteria(matriksSnap.data());
      } else {
        alert("Matriks Kriteria belum di-setup! Silakan simpan dulu di halaman Kriteria Penilaian.");
      }

      const analisisDocs = analisisSnap.docs.map(doc => doc.data());
      analisisDocs.sort((a, b) => (b.created_at?.toDate() || 0) - (a.created_at?.toDate() || 0));

      const analisisMap = {};
      analisisDocs.forEach(item => {
        if (!analisisMap[item.id_nasabah]) analisisMap[item.id_nasabah] = item; 
      });

      const data = nasabahSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status_kelayakan: analisisMap[doc.id] ? analisisMap[doc.id].status_kelayakan : 'Belum Dianalisis',
        // Menyimpan data riwayat analisis agar bisa langsung dirender saat klik Detail
        riwayat_analisis: analisisMap[doc.id] || null 
      }));

      setNasabahList(data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNasabah();
  }, []);

  const handlePilihNasabah = (nasabah, isDetail = false) => {
    setSelectedNasabah(nasabah);
    
    if (!matriksKriteria) return alert("Aturan matriks belum termuat. Harap refresh halaman.");

    let skorGaji = 1;
    const gajiActual = Number(nasabah.gaji_bulanan);
    for (let rule of matriksKriteria.gaji) {
      const min = Number(rule.min);
      const max = rule.max === '' || rule.max === null ? Infinity : Number(rule.max);
      if (gajiActual >= min && gajiActual <= max) { skorGaji = rule.bobot; break; }
    }

    let skorLamaKerja = 1;
    const kerjaActual = Number(nasabah.lama_kerja);
    for (let rule of matriksKriteria.lamaKerja) {
      const min = Number(rule.min);
      const max = rule.max === '' || rule.max === null ? Infinity : Number(rule.max);
      if (kerjaActual >= min && kerjaActual <= max) { skorLamaKerja = rule.bobot; break; }
    }

    let skorRiwayat = nasabah.status_riwayat ? Number(nasabah.status_riwayat) : 3;

    setNilaiAktual({ gaji: skorGaji, riwayat: skorRiwayat, lamaKerja: skorLamaKerja });

    // Jika masuk dari tombol "Detail", langsung hitung hasilnya agar tampil
    if (isDetail && nasabah.riwayat_analisis) {
      const hasil = hitungKelayakanKredit({ gaji: skorGaji, riwayat: skorRiwayat, lamaKerja: skorLamaKerja });
      setHasilAnalisis(hasil);
    } else {
      setHasilAnalisis(null);
    }
    
    setView('detail'); 
  };

  const handleHitung = () => {
    const hasil = hitungKelayakanKredit(nilaiAktual);
    setHasilAnalisis(hasil);
  };

  const handleSimpanHasil = async () => {
    if (!hasilAnalisis) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "hasil_analisis"), {
        id_nasabah: selectedNasabah.id,
        total_skor: hasilAnalisis.totalSkor,
        status_kelayakan: hasilAnalisis.status,
        kesimpulan: `Skor NCF: ${hasilAnalisis.ncf}, Skor NSF: ${hasilAnalisis.nsf}. Dinyatakan ${hasilAnalisis.status}.`,
        created_at: serverTimestamp()
      });
      alert("Hasil kelayakan profil berhasil disimpan ke database!");
      await fetchNasabah(); 
      setHasilAnalisis(null);
      setSelectedNasabah(null);
      setView('list'); 
    } catch (error) {
      alert("Gagal menyimpan hasil analisis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'list') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Analisis Profil Nasabah</h2>
          <p className="text-gray-500 text-sm">Menentukan kelayakan nasabah sebelum dapat mengajukan pinjaman.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <p className="p-8 text-center text-gray-500">Memuat data nasabah...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="p-4">Nama Nasabah</th>
                    <th className="p-4">ID Karyawan</th>
                    <th className="p-4">Gaji Bulanan</th>
                    <th className="p-4">Status Profil</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {nasabahList.map(n => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-blue-900">{n.nama_lengkap}</td>
                      <td className="p-4 text-gray-600">{n.id_karyawan}</td>
                      <td className="p-4 text-gray-600">Rp {Number(n.gaji_bulanan).toLocaleString('id-ID')}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                          n.status_kelayakan === 'TIDAK LAYAK' ? 'bg-red-100 text-red-700' : 
                          n.status_kelayakan === 'Layak' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {n.status_kelayakan}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          {n.status_kelayakan === 'Belum Dianalisis' ? (
                            <button onClick={() => handlePilihNasabah(n, false)} className="bg-blue-100 hover:bg-blue-900 hover:text-white text-blue-800 font-bold py-1.5 px-4 rounded text-xs transition-colors">
                              Analisis &rarr;
                            </button>
                          ) : (
                            <>
                              <button onClick={() => handlePilihNasabah(n, true)} className="bg-gray-100 hover:bg-gray-300 text-gray-700 font-bold py-1.5 px-3 rounded text-xs transition-colors">
                                Detail
                              </button>
                              <button onClick={() => handlePilihNasabah(n, false)} className="bg-blue-50 hover:bg-blue-900 hover:text-white text-blue-900 font-bold py-1.5 px-3 rounded text-xs transition-colors">
                                Re-Analisis
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <button onClick={() => setView('list')} className="text-sm text-gray-500 hover:text-blue-900 flex items-center gap-1 transition-all">&larr; Kembali ke Daftar Nasabah</button>
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-blue-900">Proses Analisis: {selectedNasabah?.nama_lengkap}</h2>
          <p className="text-gray-500 text-sm">Sistem Pendukung Keputusan Profile Matching</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-3">Nilai Kriteria Tersandikan</label>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Kapasitas (Gaji) - Target: 4</label>
                <input type="number" value={nilaiAktual.gaji} readOnly className="w-full p-2.5 bg-gray-50 text-blue-900 border border-gray-200 rounded-lg font-bold" />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Karakter (Riwayat) - Target: 5</label>
                <input type="number" value={nilaiAktual.riwayat} readOnly className="w-full p-2.5 bg-gray-50 text-blue-900 border border-gray-200 rounded-lg font-bold" />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Loyalitas (Lama Kerja) - Target: 4</label>
                <input type="number" value={nilaiAktual.lamaKerja} readOnly className="w-full p-2.5 bg-gray-50 text-blue-900 border border-gray-200 rounded-lg font-bold" />
              </div>
            </div>
          </div>
          <button onClick={handleHitung} className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow transition-colors">
            {hasilAnalisis ? 'Hitung Ulang' : 'Hitung Profile Matching'}
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
              <div className={`p-6 rounded-xl mb-6 text-center border-2 ${hasilAnalisis.status === 'TIDAK LAYAK' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                <p className="text-sm font-semibold mb-2">TOTAL SKOR KELAYAKAN</p>
                <p className="text-5xl font-black mb-2">{hasilAnalisis.totalSkor}</p>
                <p className="text-xl font-bold uppercase tracking-widest">{hasilAnalisis.status}</p>
              </div>
              <div className="mt-auto pt-4 flex justify-end">
                <button onClick={handleSimpanHasil} disabled={isSubmitting} className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow disabled:opacity-70">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Status Profil'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-4xl mb-4">⚖️</span>
              <p>Klik tombol hitung untuk melihat atau memperbarui hasil.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalisisKelayakan;