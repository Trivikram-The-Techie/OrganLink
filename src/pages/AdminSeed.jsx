import React, { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../firebase';
import { seedDatabase, MOCK_HOSPITALS, MOCK_RECIPIENTS } from '../utils/seeder';
import { Database, RefreshCw, CheckCircle, Server, Users, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSeed() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ hospitals: 0, recipients: 0, cases: 0 });
  const [message, setMessage] = useState('');

  const fetchStats = async () => {
    try {
      const hospSnap = await getDocs(collection(db, 'hospitals'));
      const recSnap = await getDocs(collection(db, 'recipients'));
      const casesSnap = await getDocs(collection(db, 'cases'));
      
      setStats({
        hospitals: hospSnap.size,
        recipients: recSnap.size,
        cases: casesSnap.size
      });
    } catch (error) {
      console.error('Error fetching db stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeed = async () => {
    setLoading(true);
    setMessage('');
    try {
      await seedDatabase();
      await fetchStats();
      setMessage('Database successfully reset and seeded!');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error(error);
      setMessage(`Error seeding database: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-medical-dark text-slate-800 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-medical-border">
          <div>
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-brand-600" />
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-medical-accent bg-clip-text text-transparent">
                OrganLink System Console
              </h1>
            </div>
            <p className="text-slate-500 mt-2 text-sm">
              Developer & Judge demo management dashboard to reset, seed, and inspect mock data.
            </p>
          </div>
          <Link 
            to="/" 
            className="mt-4 md:mt-0 px-5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:border-brand-500 shadow-sm transition-all text-sm font-semibold"
          >
            ← Back to Home
          </Link>
        </header>

        {/* Database Status Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border border-medical-border flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seeded Hospitals</p>
              <h3 className="text-3xl font-black mt-1 text-slate-900">{stats.hospitals}</h3>
            </div>
            <div className="p-3 bg-brand-50 text-brand-600 rounded-lg border border-brand-100 shadow-sm">
              <Landmark className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-medical-border flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Waitlisted Candidates</p>
              <h3 className="text-3xl font-black mt-1 text-slate-900">{stats.recipients}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 shadow-sm">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-medical-border flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Transit Cases</p>
              <h3 className="text-3xl font-black mt-1 text-slate-900">{stats.cases}</h3>
            </div>
            <div className="p-3 bg-sky-50 text-sky-655 rounded-lg border border-sky-100 shadow-sm">
              <Server className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Control Card */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 p-8 rounded-2xl border border-medical-border shadow-md mb-10">
          <div className="max-w-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Database Seeding Control</h2>
            <p className="text-xs text-slate-550 mb-6 leading-relaxed">
              Pressing the button below will clear all current cases from the database and insert a fresh set of 6 hospitals and 15 waitlist recipients. This is critical for testing the real-time matching and ranking system with a clean slate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={handleSeed}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold rounded-xl shadow-md hover:shadow-brand-500/10 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Rebuilding Database...' : 'Reset & Seed Demo Data'}
              </button>
              {message && (
                <div className="flex items-center gap-2 text-green-700 text-xs font-bold animate-pulse">
                  <CheckCircle className="h-4.5 w-4.5" />
                  <span>{message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hospitals Panel */}
          <div className="bg-white rounded-xl border border-medical-border p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-brand-600" />
              Pre-defined Hospitals ({MOCK_HOSPITALS.length})
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {MOCK_HOSPITALS.map((h) => (
                <div key={h.hospitalId} className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 hover:border-brand-500/40 transition-colors shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-850 text-xs">{h.name}</h4>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-slate-200/60 text-slate-600 font-mono font-semibold">{h.hospitalId}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{h.address}</p>
                  <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                    <span>Coord: <strong className="text-slate-600">{h.coordinatorName}</strong></span>
                    <span>Coordinates: {h.lat.toFixed(4)}, {h.lng.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waitlist Panel */}
          <div className="bg-white rounded-xl border border-medical-border p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Recipient Waitlist Sample ({MOCK_RECIPIENTS.length})
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {MOCK_RECIPIENTS.map((r) => (
                <div key={r.recipientId} className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 hover:border-blue-500/40 transition-colors shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-850 text-xs">{r.name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase tracking-wider border border-blue-200 font-mono">{r.organNeeded}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                    <span>Blood: <strong className="text-brand-600 font-mono">{r.bloodGroup}</strong></span>
                    <span>Urgency Score: <strong className="text-red-600 font-bold">{r.urgencyScore} / 100</strong></span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Listed at {r.hospitalName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
