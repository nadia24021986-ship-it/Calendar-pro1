import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Clock, Tag } from 'lucide-react';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null); // Detektor eror pelindung layar putih
  
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('Kerja');

  useEffect(() => {
    try {
      const q = query(collection(db, 'events'), orderBy('time', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const eventsData = [];
        snapshot.forEach((doc) => {
          eventsData.push({ id: doc.id, ...doc.data() });
        });
        setEvents(eventsData);
      }, (error) => {
        console.error("Firestore Error:", error);
        setFirebaseError(error.message);
      });
      return () => unsubscribe();
    } catch (err) {
      setFirebaseError(err.message);
    }
  }, []);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const daysOfWeek = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !selectedDate) return;

    try {
      await addDoc(collection(db, 'events'), {
        title,
        date: selectedDate,
        time: time || '00:00',
        category
      });
      setTitle('');
      setTime('');
      setShowModal(false);
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus kegiatan ini?")) {
      await deleteDoc(doc(db, 'events', id));
    }
  };

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(i);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Banner Notifikasi jika ada Eror Koneksi Firebase */}
        {firebaseError && (
          <div className="lg:col-span-3 bg-red-900/80 border border-red-500 text-red-200 p-3 rounded-xl text-xs">
            <strong>⚠️ Info Sistem:</strong> {firebaseError}. (Pastikan Rules di Firebase Console sudah di-Publish ke 'true')
          </div>
        )}

        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold">{monthNames[month]} {year}</h1>
            </div>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1.5 hover:bg-slate-700 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-slate-700 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-1">
            {daysOfWeek.map(day => <div key={day} className="py-1">{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`}></div>;
              
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === dateString);

              return (
                <div 
                  key={day} 
                  onClick={() => { setSelectedDate(dateString); setShowModal(true); }}
                  className="min-h-[55px] p-1 bg-slate-750 border border-slate-700 hover:border-indigo-500 rounded-lg cursor-pointer flex flex-col justify-between"
                >
                  <span className="font-bold text-xs text-slate-400">{day}</span>
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.slice(0, 1).map(e => (
                      <span key={e.id} className={`text-[8px] px-1 py-0.5 rounded truncate text-white ${
                        e.category === 'Kerja' ? 'bg-blue-600' : e.category === 'Pribadi' ? 'bg-emerald-600' : 'bg-purple-600'
                      }`}>
                        {e.title}
                      </span>
                    ))}
                    {dayEvents.length > 1 && <span className="text-[7px] text-slate-400 text-center">+{dayEvents.length - 1}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-700 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Agenda Kegiatan
            </h2>
            <button 
              onClick={() => { setSelectedDate(new Date().toISOString().split('T')[0]); setShowModal(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-slate-400 text-center py-6 text-xs">Belum ada agenda kegiatan.</p>
            ) : (
              events.map(event => (
                <div key={event.id} className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex justify-between items-start gap-2">
                  <div className="overflow-hidden">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      event.category === 'Kerja' ? 'bg-blue-900/50 text-blue-300' : event.category === 'Pribadi' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-purple-900/50 text-purple-300'
                    }`}>
                      {event.category}
                    </span>
                    <h3 className="font-semibold text-xs text-slate-100 mt-1 truncate">{event.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {event.date} • {event.time}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(event.id)} className="text-slate-500 hover:text-red-400 p-0.5 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm p-5 relative shadow-2xl">
            <h3 className="text-md font-bold mb-3 flex items-center gap-2 text-indigo-400">
              <Tag className="w-4 h-4" /> Tambah Agenda
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Nama Kegiatan</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Meeting" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Tanggal</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Jam</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Kategori</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none">
                  <option value="Kerja">Kerja 🔵</option>
                  <option value="Pribadi">Pribadi 🟢</option>
                  <option value="Penting">Penting 🟣</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 rounded-lg bg-slate-700 text-[11px] font-medium">Batal</button>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-indigo-600 text-[11px] font-medium text-white">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
