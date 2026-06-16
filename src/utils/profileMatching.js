// src/utils/profileMatching.js

/**
 * Fungsi untuk mengonversi nilai GAP menjadi Bobot Nilai
 * Sesuai aturan: 0=5.0, 1=4.5, -1=4.0, 2=3.5, -2=3.0
 */
export const konversiGapKeBobot = (gap) => {
  switch (gap) {
    case 0: return 5.0;
    case 1: return 4.5;
    case -1: return 4.0;
    case 2: return 3.5;
    case -2: return 3.0;
    case 3: return 2.5;
    case -3: return 2.0;
    case 4: return 1.5;
    case -4: return 1.0;
    default: return 1.0; // Nilai terendah jika gap sangat jauh
  }
};

/**
 * Fungsi Utama Eksekusi Profile Matching
 * @param {Object} nilaiAktual - Berisi skor aktual nasabah (skala 1-5) { gaji, riwayat, lamaKerja }
 * @returns {Object} Hasil analisis lengkap (Skor Akhir & Status)
 */
export const hitungKelayakanKredit = (nilaiAktual) => {
  
  // 1. DEFINISI TARGET IDEAL (Sesuai Aturan Mutlak)
  const target = {
    gaji: 4,         // Core Factor
    riwayat: 5,      // Core Factor
    lamaKerja: 4     // Secondary Factor
  };

  // 2. HITUNG SELISIH (GAP) = Aktual - Target
  const gapGaji = nilaiAktual.gaji - target.gaji;
  const gapRiwayat = nilaiAktual.riwayat - target.riwayat;
  const gapLamaKerja = nilaiAktual.lamaKerja - target.lamaKerja;

  // 3. KONVERSI GAP KE BOBOT NILAI
  const bobotGaji = konversiGapKeBobot(gapGaji);
  const bobotRiwayat = konversiGapKeBobot(gapRiwayat);
  const bobotLamaKerja = konversiGapKeBobot(gapLamaKerja);

  // 4. PENGELOMPOKAN CORE FACTOR (NCF) & SECONDARY FACTOR (NSF)
  // Gaji dan Riwayat adalah Core Factor. Kita cari rata-ratanya.
  const ncf = (bobotGaji + bobotRiwayat) / 2;
  
  // Lama Kerja adalah Secondary Factor. Karena hanya 1 kriteria, rata-ratanya adalah nilainya sendiri.
  const nsf = bobotLamaKerja / 1; 

  // 5. PERHITUNGAN TOTAL SKOR AKHIR
  // Rumus: (60% x NCF) + (40% x NSF)
  const totalSkor = (0.6 * ncf) + (0.4 * nsf);

  // 6. PENENTUAN STATUS KELAYAKAN
  // Status: >= 4.0 (Layak), < 4.0 (Tidak Layak)
  const status = totalSkor >= 4.0 ? "Layak" : "Tidak Layak";

  // Kembalikan objek berisi rincian perhitungan untuk ditampilkan di UI/disimpan ke Firestore
  return {
    rincianGap: { gapGaji, gapRiwayat, gapLamaKerja },
    rincianBobot: { bobotGaji, bobotRiwayat, bobotLamaKerja },
    ncf,
    nsf,
    totalSkor: parseFloat(totalSkor.toFixed(2)), // Bulatkan 2 angka di belakang koma
    status
  };
};