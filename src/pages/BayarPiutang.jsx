import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';

const BayarPiutang = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [bayarNominal, setBayarNominal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      const docRef = doc(db, "piutang", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const piutang = snap.data();
        const nSnap = await getDoc(doc(db, "nasabah", piutang.id_nasabah));
        setData({ ...piutang, nasabah: nSnap.data() });
      }
    };
    fetchDetail();
  }, [id]);

  const handleProsesBayar = async (e) => {
    e.preventDefault();
    const nominal = Number(bayarNominal);
    if (nominal <= 0) return alert("Masukkan nominal yang valid!");
    if (nominal > data.total_tagihan) return alert("Nominal melebihi sisa piutang!");

    setIsSubmitting(true);
    try {
      const piutangRef = doc(db, "piutang", id);
      const sisaBaru = data.total_tagihan - nominal;
      const isLunas = sisaBaru <= 0;

      // 1. Update data piutang (Sisa Tagihan & Status Lunas)
      await updateDoc(piutangRef, {
        total_tagihan: sisaBaru,
        status_lunas: isLunas,
        updated_at: serverTimestamp()
      });

      // 2. [FITUR BARU] Update Skor Riwayat Nasabah jika Lunas
      if (isLunas) {
        const nasabahRef = doc(db, "nasabah", data.id_nasabah);
        await updateDoc(nasabahRef, {
          status_riwayat: 5, // Otomatis menjadi 5 (Sangat Baik / Tepat Waktu)
          updated_at: serverTimestamp()
        });
      }

      // 3. Catat ke histori transaksi log pembayaran
      await addDoc(collection(db, "log_pembayaran"), {
        id_piutang: id,
        id_nasabah: data.id_nasabah,
        nominal_bayar: nominal,
        sisa_piutang: sisaBaru,
        tanggal: serverTimestamp()
      });

      if (isLunas) {
        alert("Pembayaran Berhasil! Piutang Lunas dan Skor Riwayat Nasabah telah ditingkatkan menjadi SANGAT BAIK (5).");
      } else {
        alert("Pembayaran Berhasil Dicatat!");
      }
      
      navigate('/pelunasan-utang');
    } catch (error) {
      console.error("Gagal bayar:", error);
      alert("Gagal memproses pembayaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data) return <p className="p-10 text-center">Memuat detail...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => navigate('/pelunasan-utang')} className="mb-4 text-gray-500 text-sm hover:text-blue-900 transition-colors">&larr; Kembali</button>
      
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-xl font-bold text-blue-900 mb-6 border-b pb-4">Formulir Pembayaran Utang</h2>
        
        <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Nama Nasabah</p>
            <p className="font-bold text-blue-900">{data.nasabah.nama_lengkap}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Sisa Piutang Saat Ini</p>
            <p className="font-bold text-red-600 text-lg">Rp {data.total_tagihan.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {!data.status_lunas ? (
          <form onSubmit={handleProsesBayar} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Nominal yang Dibayarkan (Rp)</label>
              <input 
                type="number" 
                value={bayarNominal}
                onChange={(e) => setBayarNominal(e.target.value)}
                placeholder="Contoh: 500000"
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-bold text-blue-900 transition-all"
                required
              />
              <p className="text-[11px] text-gray-500 mt-2 italic">
                *Jika pembayaran membuat sisa utang menjadi Rp 0, skor riwayat nasabah otomatis menjadi 5 (Sangat Baik).
              </p>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3.5 mt-2 bg-blue-900 text-white font-black rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-md tracking-wider"
            >
              {isSubmitting ? 'MEMPROSES TRANSAKSI...' : 'KONFIRMASI PEMBAYARAN'}
            </button>
          </form>
        ) : (
          <div className="p-4 bg-green-50 text-green-700 text-center rounded-lg font-bold border border-green-200">
            ✅ PIUTANG INI SUDAH DILUNASI
          </div>
        )}
      </div>
    </div>
  );
};

export default BayarPiutang;