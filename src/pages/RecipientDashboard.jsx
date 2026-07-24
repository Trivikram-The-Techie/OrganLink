import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, onSnapshot, query, where, doc, updateDoc } from '../firebase';
import { AlertCircle, Activity, Bell, Check, X, ShieldAlert, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecipientDashboard() {
  const { user, logout } = useAuth();
  
  const [incomingAlerts, setIncomingAlerts] = useState([]);
  const [myCases, setMyCases] = useState([]);
  const [dismissedCases, setDismissedCases] = useState(() => {
    const saved = localStorage.getItem('organlink_dismissed_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // Save dismissed alerts to local storage
  useEffect(() => {
    localStorage.setItem('organlink_dismissed_alerts', JSON.stringify(dismissedCases));
  }, [dismissedCases]);

  // 1. Real-time listener for incoming matching alerts
  useEffect(() => {
    if (!user?.hospitalId) return;

    const q = query(
      collection(db, 'cases'),
      where('status', '==', 'matching')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alerts = [];
      snapshot.forEach((doc) => {
        const caseData = doc.data();
        const candidates = caseData.rankedCandidates || [];
        const isCandidate = candidates.some(c => c.recipientHospitalId === user.hospitalId);
        
        if (isCandidate && !dismissedCases.includes(doc.id)) {
          const matchInfo = candidates.find(c => c.recipientHospitalId === user.hospitalId);
          alerts.push({
            caseId: doc.id,
            ...caseData,
            recipientMatch: matchInfo
          });
        }
      });
      setIncomingAlerts(alerts);
    });

    return unsubscribe;
  }, [user, dismissedCases]);

  // 2. Real-time listener for active dispatches accepted by this recipient hospital
  useEffect(() => {
    if (!user?.hospitalId) return;

    const q = query(
      collection(db, 'cases'),
      where('acceptedRecipientHospitalId', '==', user.hospitalId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cases = [];
      snapshot.forEach((doc) => {
        cases.push({ caseId: doc.id, ...doc.data() });
      });
      cases.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setMyCases(cases);
    });

    return unsubscribe;
  }, [user]);

  // Accept organ offer
  const handleAcceptMatch = async (caseId) => {
    try {
      const caseRef = doc(db, 'cases', caseId);
      await updateDoc(caseRef, {
        status: 'accepted',
        acceptedRecipientHospitalId: user.hospitalId,
        acceptedRecipientHospitalName: user.hospitalName,
        recipientConfirmed: true
      });
    } catch (error) {
      console.error('Error accepting match:', error);
      alert(`Accept action failed: ${error.message}`);
    }
  };

  // Decline/Dismiss alert
  const handleDeclineMatch = (caseId) => {
    if (window.confirm("Are you sure you want to decline this organ match? It will clear it from your dashboard queue.")) {
      setDismissedCases(prev => [...prev, caseId]);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-blue-55 text-blue-750 border border-blue-200 animate-pulse">Awaiting Donor Conf</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-purple-55 text-purple-750 border border-purple-200 font-semibold">Match Confirmed</span>;
      case 'transport':
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-55 text-emerald-750 border border-emerald-200 animate-pulse font-semibold">In Transit</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-green-55 text-green-750 border border-green-200 font-semibold">Delivered</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-medical-dark text-slate-800 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-medical-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-medical-accent animate-pulse"></span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500">Live Coordination Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
              {user?.hospitalName} <span className="text-blue-600 font-normal">Recipient Dashboard</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Coordinator: <strong className="text-slate-700">{user?.name}</strong> | Facility ID: {user?.hospitalId}
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link to="/admin" className="px-4 py-2 text-xs font-semibold bg-white border border-medical-border text-slate-600 hover:text-slate-950 rounded-lg transition-colors shadow-sm">
              Data Console
            </Link>
            <button 
              onClick={logout}
              className="px-4 py-2 text-xs font-semibold bg-red-50 border border-red-200 text-red-650 hover:bg-red-100 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Incoming Alerts (Left Column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-medical-border shadow-md">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-brand-600 animate-pulse-slow" />
                Live Matching Alerts ({incomingAlerts.length})
              </h2>

              {incomingAlerts.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-lg text-slate-400">
                  <Bell className="h-10 w-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="text-sm">No new matching organ offers. Real-time updates will show here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingAlerts.map((alert) => {
                    const match = alert.recipientMatch;
                    return (
                      <div key={alert.caseId} className="p-4 bg-slate-50 border border-slate-200 hover:border-brand-500 rounded-xl transition-all shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-200 font-mono">
                            {alert.organType}
                          </span>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-455 block">Vertex AI Rank</span>
                            <span className="text-sm font-extrabold text-brand-600 font-mono">{match.rankScore}</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs mb-4">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Blood Group:</span>
                            <span className="font-bold text-slate-800 font-mono">{alert.bloodGroup}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Transit Distance:</span>
                            <span className="font-bold text-slate-800">{match.travelDistanceKm} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Estimated Transit:</span>
                            <span className="font-bold text-medical-accent">{match.travelTimeMinutes} mins ({match.transitType})</span>
                          </div>
                          <div className="flex justify-between pt-1.5 border-t border-slate-200 text-[10px]">
                            <span className="text-slate-500 uppercase font-semibold">Contact Info:</span>
                            <span className="text-yellow-600 font-bold flex items-center gap-0.5">
                              <ShieldAlert className="h-3 w-3" /> LOCKED (Requires Mutual Accept)
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-slate-250">
                          <button
                            onClick={() => handleAcceptMatch(alert.caseId)}
                            className="flex-1 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="h-4.5 w-4.5" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineMatch(alert.caseId)}
                            className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-xs transition-colors flex items-center justify-center cursor-pointer"
                            title="Decline Offer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active Dispatches (Right 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-medical-border p-6 shadow-md">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Active Recipient Dispatches ({myCases.length})
              </h2>

              {myCases.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-lg text-slate-400">
                  <Activity className="h-10 w-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="text-sm">No active dispatches. Accept a matching alert on the left to start.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myCases.map((c) => {
                    const match = c.rankedCandidates.find(rc => rc.recipientHospitalId === user.hospitalId);
                    
                    return (
                      <div key={c.caseId} className="p-4 bg-slate-50/40 border border-medical-border rounded-xl hover:border-blue-500/40 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm animate-fade-in">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                              {c.organType}
                            </span>
                            <span className="text-xs text-slate-550">
                              Donor Group: <strong className="text-slate-800 font-mono">{c.bloodGroup}</strong>
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-850 mt-1.5">
                            Source Facility: {c.donorHospitalName}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Transit: {match?.travelDistanceKm || 'N/A'} km ({match?.travelTimeMinutes || 'N/A'} mins via {match?.transitType || 'N/A'})
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto gap-2">
                          {getStatusBadge(c.status)}
                          <Link 
                            to={`/case/${c.caseId}`}
                            className="text-xs text-brand-600 hover:text-brand-800 font-bold flex items-center gap-0.5 transition-colors self-end mt-1"
                          >
                            Open Tracker <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
