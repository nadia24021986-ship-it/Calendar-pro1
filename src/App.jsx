import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc 
} from "firebase/firestore";

function App() {
  const [tamuList, setTamuList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMess, setFilterMess] = useState("Semua Mess");
  const [showModal, setShowModal] = useState(false);

  // State Form Input Manual
  const [namaTamu, setNamaTamu] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [pagi, setPagi] = useState("");
  const [siang, setSiang] = useState("");
  const [malam, setMalam] = useState("");
  const [mess, setMess] = useState("");
  const [petugas, setPetugas] = useState("Suhendro");

  // Ambil Data Otomatis dari Firebase Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "catering"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTamuList(data);
    });
    return () => unsubscribe();
  }, []);

  // Simpan Data Baru ke Firebase
  const handleSimpanData = async (e) => {
    e.preventDefault();
    if (!namaTamu || !tanggal) {
      alert("Nama Tamu dan Tanggal wajib diisi!");
      return;
    }

    try {
      await addDoc(collection(db, "catering"), {
        namaTamu,
        tanggal,
        pagi: pagi ? parseInt(pagi) : 0,
        siang: siang ? parseInt(siang) : 0,
        malam: malam ? parseInt(malam) : 0,
        mess,
        petugas,
        createdAt: new Date().toISOString()
      });

      // Reset Form & Tutup Modal
      setNamaTamu("");
      setTanggal("");
      setPagi("");
      setSiang("");
      setMalam("");
      setMess("");
      setShowModal(false);
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    }
  };

  // Hapus Data
  const handleHapusData = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      await deleteDoc(doc(db, "catering", id));
    }
  };

  // Filter Data Berdasarkan Pencarian dan Dropdown Mess
  const filteredData = tamuList.filter((item) => {
    const matchSearch = 
      item.namaTamu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mess?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.petugas?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchMess = filterMess === "Semua Mess" || item.mess === filterMess;
    
    return matchSearch && matchMess;
  });

  // Hitung Total Ringkasan
  const totalTamu = filteredData.length;
  const totalMakanan = filteredData.reduce((acc, curr) => {
    return acc + (curr.pagi || 0) + (curr.siang || 0) + (curr.malam || 0);
  }, 0);

  // Ambil daftar unik mess untuk pilihan dropdown filter
  const daftarMessUnik = ["Semua Mess", ...new Set(tamuList.map(item => item.mess).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* HEADER UTAMA */}
      <header className="bg-[#00875A] text-white px-4 py-3 flex flex-wrap items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🍽️</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Catering Smart Calendar</h1>
            <p className="text-xs text-green-100">Sistem Filter & AI Scheduler</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          <span className="bg-green-700 text-xs px-3 py-1.5 rounded-full flex items-center">
            👤 Halo, {petugas}
          </span>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-white text-[#00875A] text-xs font-semibold px-3 py-1.5 rounded shadow hover:bg-green-50"
          >
            + Tambah Manual
          </button>
          <button className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded shadow hover:bg-emerald-700">
            🪄 Upload PDF / AI
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-4">
        {/* RINGKASAN KARTU UTAMA */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Total Tamu</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalTamu}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-200">
            <p className="text-xs uppercase tracking-wider text-emerald-700 font-bold">Total Makanan</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{totalMakanan}</p>
          </div>
        </div>

        {/* INPUT FILTER & PENCARIAN */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Cari tamu, mess, atau petugas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00875A]"
            />
          </div>
          <div>
            <select 
              value={filterMess}
              onChange={(e) => setFilterMess(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#00875A]"
            >
              {daftarMessUnik.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-gray-700">
            📤 Ekspor
          </button>
        </div>

        {/* TABEL JADWAL MAKAN KATERING */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Jadwal Makan Katering</h3>
            <span className="bg-[#00875A] text-white text-xs font-bold px-2 py-1 rounded">
              Total Saringan: {totalMakanan}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 font-semibold uppercase text-xs border-b border-gray-200">
                  <th className="p-3">Tamu & Foto</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3 text-center">Pagi (B)</th>
                  <th className="p-3 text-center">Siang (L)</th>
                  <th className="p-3 text-center">Malam (D)</th>
                  <th className="p-3">Mess / Lokasi</th>
                  <th className="p-3">Petugas</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400">
                      Belum ada jadwal makan katering terdaftar.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold text-gray-900 flex items-center space-x-2">
                        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">👤</div>
                        <span>{item.namaTamu}</span>
                      </td>
                      <td className="p-3 text-gray-600">{item.tanggal}</td>
                      <td className="p-3 text-center">{item.pagi ? <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">{item.pagi}</span> : "-"}</td>
                      <td className="p-3 text-center">{item.siang ? <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold">{item.siang}</span> : "-"}</td>
                      <td className="p-3 text-center">{item.malam ? <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">{item.malam}</span> : "-"}</td>
                      <td className="p-3 text-gray-600">{item.mess || "-"}</td>
                      <td className="p-3"><span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-xs">{item.petugas}</span></td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleHapusData(item.id)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* POPUP MODAL INPUT MANUAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="bg-[#00875A] text-white p-4 font-bold flex justify-between items-center">
              <span>Tambah Jadwal Katering</span>
              <button onClick={() => setShowModal(false)} className="text-xl">&times;</button>
            </div>
            <form onSubmit={handleSimpanData} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase">Nama Tamu / Rombongan</label>
                <input type="text" required placeholder="Contoh: Instruktur Safindo Raya" value={namaTamu} onChange={(e) => setNamaTamu(e.target.value)} className="w-full border p-2 text-sm rounded mt-1"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase">Tanggal</label>
                <input type="text" required placeholder="Contoh: Rab, 17 Jun 2026" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full border p-2 text-sm rounded mt-1"/>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase">Pagi (B)</label>
                  <input type="number" placeholder="0" value={pagi} onChange={(e) => setPagi(e.target.value)} className="w-full border p-2 text-sm rounded mt-1 text-center"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase">Siang (L)</label>
                  <input type="number" placeholder="0" value={siang} onChange={(e) => setSiang(e.target.value)} className="w-full border p-2 text-sm rounded mt-1 text-center"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase">Malam (D)</label>
                  <input type="number" placeholder="0" value={malam} onChange={(e) => setMalam(e.target.value)} className="w-full border p-2 text-sm rounded mt-1 text-center"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase">Mess / Lokasi</label>
                <input type="text" placeholder="Contoh: B12-2 atau E3" value={mess} onChange={(e) => setMess(e.target.value)} className="w-full border p-2 text-sm rounded mt-1"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase">Petugas</label>
                <input type="text" value={petugas} onChange={(e) => setPetugas(e.target.value)} className="w-full border p-2 text-sm rounded mt-1 bg-gray-50"/>
              </div>
              <div className="flex space-x-2 pt-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100">Batal</button>
                <button type="submit" className="px-4 py-2 bg-[#00875A] text-white rounded text-sm font-bold hover:bg-green-700">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
