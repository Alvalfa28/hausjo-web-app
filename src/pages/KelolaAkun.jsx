import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const KelolaAkun = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    password: '',
    role: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsersList(users);
    } catch (error) {
      console.error("Gagal memuat akun:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Cek apakah username sudah dipakai
      const isExist = usersList.some(u => u.username.toLowerCase() === formData.username.toLowerCase());
      if (isExist) {
        alert("Username sudah digunakan! Silakan gunakan username lain.");
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, "users"), {
        nama_lengkap: formData.nama_lengkap,
        username: formData.username.toLowerCase(),
        password: btoa(formData.password), // Disandikan menggunakan base64
        role: formData.role,
        created_at: serverTimestamp()
      });

      alert("Akun pengguna berhasil ditambahkan!");
      setFormData({ nama_lengkap: '', username: '', password: '', role: '' });
      fetchUsers(); // Refresh tabel
    } catch (error) {
      alert("Gagal menambahkan akun: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, role) => {
    if (role === 'Staff IT') {
      alert("Akses ditolak: Akun Master (Staff IT) tidak boleh dihapus!");
      return;
    }

    if (window.confirm("Yakin ingin menghapus akun ini?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        alert("Akun berhasil dihapus.");
        fetchUsers();
      } catch (error) {
        alert("Gagal menghapus akun.");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Kelola Akun Sistem</h2>
        <p className="text-gray-500 text-sm">Hak Akses Eksklusif: Staff IT. Kelola pengguna yang dapat masuk ke dalam sistem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORM TAMBAH AKUN */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-blue-900 mb-4 border-b pb-2">Tambah Pengguna Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap Karyawan</label>
                <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Cth: Budi Santoso" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Username Login</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Tanpa spasi (cth: budi123)" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password Sementara</label>
                <input type="text" name="password" value={formData.password} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Masukkan password" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Role / Hak Akses</label>
                <select name="role" value={formData.role} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 outline-none">
                  <option value="">-- Pilih Role --</option>
                  <option value="Analis Kredit">Analis Kredit</option>
                  <option value="Kepala Agen">Kepala Agen</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Staff IT">Staff IT</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow mt-2 transition-colors text-sm">
                {isSubmitting ? 'Menyimpan...' : 'Buat Akun'}
              </button>
            </form>
          </div>
        </div>

        {/* TABEL DAFTAR AKUN */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <p className="p-8 text-center text-gray-500">Memuat data akun...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-4">Nama Lengkap</th>
                      <th className="p-4">Username</th>
                      <th className="p-4">Role Akses</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usersList.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800">{user.nama_lengkap}</td>
                        <td className="p-4 text-gray-600 font-mono text-xs">{user.username}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'Staff IT' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'Kepala Agen' ? 'bg-red-100 text-red-700' :
                            user.role === 'Bendahara' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDelete(user.id, user.role)} className="text-red-600 hover:text-red-800 font-bold text-xs transition-colors">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default KelolaAkun;