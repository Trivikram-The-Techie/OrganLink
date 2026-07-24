import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, collection, getDocs, onSnapshot } from '../firebase';
import { Activity, ShieldAlert, Heart, Truck, Lock, ArrowRight, Database, MapPin, Search } from 'lucide-react';

export default function LandingPage() {
  const [networkHospitals, setNetworkHospitals] = useState([]);
  const [activeCases, setActiveCases] = useState([]);
  const [waitlist, setWaitlist] = useState([]);

  // Load hospitals, active cases, and waitlist for the Availability Registry
  useEffect(() => {
    // 1. Fetch hospitals
    getDocs(collection(db, 'hospitals')).then((snap) => {
      const list = [];
      snap.forEach(d => list.push(d.data()));
      setNetworkHospitals(list);
    });

    // 2. Listen to active cases for organ availability
    const unsubscribeCases = onSnapshot(collection(db, 'cases'), (snap) => {
      const list = [];
      snap.forEach(d => list.push(d.data()));
      setActiveCases(list);
    });

    // 3. Listen to waitlist
    const unsubscribeWaitlist = onSnapshot(collection(db, 'recipients'), (snap) => {
      const list = [];
      snap.forEach(d => list.push(d.data()));
      setWaitlist(list);
    });

    return () => {
      unsubscribeCases();
      unsubscribeWaitlist();
    };
  }, []);

  return (
    <div className="min-h-screen bg-medical-dark text-slate-800 flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-medical-border px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-medical-accent" />
            <span className="font-extrabold text-xl tracking-wider text-slate-900">
              Organ<span className="text-brand-600">Link</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/admin" 
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-medical-border hover:border-brand-500 text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5"
            >
              <Database className="h-3.5 w-3.5" />
              Demo Seeder
            </Link>
            <Link 
              to="/login" 
              className="text-xs font-semibold px-4.5 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-lg transition-all shadow-md"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
              <ShieldAlert className="h-4.5 w-4.5 text-brand-600" />
              Time-Critical Medical Logistics Network
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 leading-tight">
              Connecting Available Donors to Compatible Recipients <span className="text-medical-accent">in Real-Time</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
              OrganLink simplifies transplant coordination. Filter waitlists instantly, run travel feasibility algorithms, notify recipient hospitals in real-time, and securely unlock coordinator contact details via mutual authorization.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold rounded-xl shadow-lg hover:shadow-brand-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                Enter Portal Dashboard
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link
                to="/admin"
                className="w-full sm:w-auto px-8 py-3.5 bg-white border border-medical-border hover:border-brand-500 text-slate-700 hover:text-slate-900 font-semibold rounded-xl transition-all text-sm shadow-sm"
              >
                Initialize Demo Data
              </Link>
            </div>
          </div>

          {/* Key Value Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-6 rounded-2xl border border-medical-border hover:border-brand-500/50 hover:shadow-md transition-all">
              <div className="p-3 bg-brand-100 text-brand-600 rounded-xl inline-block mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Automated Matching</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Queries the Firestore recipient waitlist database instantly matching ABO blood groups and organ eligibility criteria.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-medical-border hover:border-brand-500/50 hover:shadow-md transition-all">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl inline-block mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Transport Feasibility</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Integrates Google Maps Distance Matrix to check if transplant travel time fits within the organ's viability window.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-medical-border hover:border-brand-500/50 hover:shadow-md transition-all">
              <div className="p-3 bg-sky-100 text-sky-600 rounded-xl inline-block mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Mutual Confirmation Gate</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Keeps patient data and hospital coordinator phone numbers locked. Contact details reveal ONLY when both sides approve.
              </p>
            </div>
          </div>

          {/* --- ORGAN AVAILABILITY & HOSPITAL DIRECTORY --- */}
          <div className="bg-white rounded-2xl border border-medical-border shadow-sm p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-medical-border">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5.5 w-5.5 text-medical-accent" />
                  National Network Organ Availability Registry
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Active organ availability dispatches and waitlist demands listed across matching facilities.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-medical-neon-green"></span> {activeCases.filter(c => c.status === 'matching').length} Organs Offered</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500"></span> {waitlist.length} Waiting Patients</span>
              </div>
            </div>

            {networkHospitals.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Database className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Database is empty. Go to the <Link to="/admin" className="underline text-brand-600">Demo Seeder</Link> to initialize data.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3 px-4">Hospital Facility</th>
                      <th className="py-3 px-4">Location Address</th>
                      <th className="py-3 px-4">Organ Supply (Available Now)</th>
                      <th className="py-3 px-4">Waitlist Demand (Patients)</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {networkHospitals.map((hosp) => {
                      // Filter available organs registered by this hospital (status matching)
                      const availableOrgans = activeCases.filter(
                        c => c.donorHospitalId === hosp.hospitalId && c.status === 'matching'
                      );

                      // Filter waitlisted patients at this hospital
                      const hospitalWaitlist = waitlist.filter(
                        r => r.hospitalId === hosp.hospitalId
                      );

                      return (
                        <tr key={hosp.hospitalId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-900">{hosp.name}</td>
                          <td className="py-4 px-4 text-slate-500">{hosp.address}</td>
                          <td className="py-4 px-4">
                            {availableOrgans.length === 0 ? (
                              <span className="text-slate-400 font-semibold">— None</span>
                            ) : (
                              <div className="flex gap-1.5 flex-wrap">
                                {availableOrgans.map((c, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-bold uppercase text-[9px] border border-brand-200">
                                    {c.organType} ({c.bloodGroup})
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {hospitalWaitlist.length === 0 ? (
                              <span className="text-slate-400">— None</span>
                            ) : (
                              <div className="flex gap-1.5 flex-wrap">
                                {hospitalWaitlist.map((w, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold uppercase text-[9px] border border-blue-200">
                                    {w.organNeeded} ({w.bloodGroup})
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold border border-green-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span> Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-medical-border py-6 px-6 bg-white text-center text-xs text-slate-400 shadow-inner">
        <p>© 2026 OrganLink Coordination Network. Created as a hackathon prototype.</p>
      </footer>
    </div>
  );
}
