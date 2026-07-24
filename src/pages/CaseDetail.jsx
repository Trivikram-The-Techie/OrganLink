import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, doc, onSnapshot, updateDoc, getDoc } from '../firebase';
import { 
  Heart, Landmark, Clock, Phone, MapPin, CheckCircle, 
  Lock, Unlock, ShieldAlert, ArrowLeft, Navigation, Plane 
} from 'lucide-react';

export default function CaseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [caseData, setCaseData] = useState(null);
  const [donorHosp, setDonorHosp] = useState(null);
  const [recipientHosp, setRecipientHosp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [progressPercent, setProgressPercent] = useState(100);

  // 1. Listen to Case changes in real-time
  useEffect(() => {
    if (!id) return;
    const caseRef = doc(db, 'cases', id);
    
    const unsubscribe = onSnapshot(caseRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCaseData({ caseId: docSnap.id, ...data });

        // Resolve Donor and Recipient Hospital details from database
        try {
          const dRef = doc(db, 'hospitals', data.donorHospitalId);
          const dSnap = await getDoc(dRef);
          if (dSnap.exists()) setDonorHosp(dSnap.data());

          if (data.acceptedRecipientHospitalId) {
            const rRef = doc(db, 'hospitals', data.acceptedRecipientHospitalId);
            const rSnap = await getDoc(rRef);
            if (rSnap.exists()) setRecipientHosp(rSnap.data());
          }
        } catch (err) {
          console.error("Error loading hospital references:", err);
        }
      } else {
        console.error("Case document not found");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [id]);

  // 2. Viability Timer countdown logic
  useEffect(() => {
    if (!caseData?.viabilityExpiresAt) return;

    const interval = setInterval(() => {
      const diff = caseData.viabilityExpiresAt - Date.now();
      const totalViabilityMs = caseData.viabilityHours * 60 * 60 * 1000;
      
      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        setProgressPercent(0);
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        setProgressPercent(Math.max(0, Math.min(100, (diff / totalViabilityMs) * 100)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [caseData]);

  // Workflow actions
  const handleDonorConfirm = async () => {
    try {
      await updateDoc(doc(db, 'cases', id), {
        donorConfirmed: true,
        contactRevealed: true,
        status: 'confirmed'
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartTransport = async () => {
    try {
      await updateDoc(doc(db, 'cases', id), { status: 'transport' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkDelivered = async () => {
    try {
      await updateDoc(doc(db, 'cases', id), { status: 'delivered' });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-medical-dark text-slate-500">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p>Retrieving case logs...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-dark text-slate-500">
        <div className="text-center p-6 bg-white border border-medical-border rounded-xl">
          <p className="text-red-500 font-bold mb-3">Case Not Found</p>
          <Link to="/" className="text-brand-650 underline text-xs">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Determine active stepper index
  const statusOrder = ['matching', 'accepted', 'confirmed', 'transport', 'delivered'];
  const currentStepIndex = statusOrder.indexOf(caseData.status);

  // Identify recipient hospital candidate metrics
  const activeCandidate = caseData.rankedCandidates.find(
    c => c.hospitalId === caseData.acceptedRecipientHospitalId
  ) || caseData.rankedCandidates[0];

  // Define maps simulation coordinates bounding box helper
  const donorLat = donorHosp?.lat || 40.741895;
  const donorLng = donorHosp?.lng || -73.974251;
  const recLat = recipientHosp?.lat || activeCandidate?.lat || 39.950796;
  const recLng = recipientHosp?.lng || activeCandidate?.lng || -75.193855;

  return (
    <div className="min-h-screen bg-medical-dark text-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Bar */}
        <header className="mb-6 flex justify-between items-center pb-4 border-b border-medical-border">
          <Link 
            to={user?.role === 'donor' ? '/donor' : '/recipient'} 
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="text-[10px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded border border-medical-border">
            CASE ID: {caseData.caseId}
          </div>
        </header>

        {/* Real-time Stepper Tracker */}
        <div className="bg-white p-6 rounded-xl border border-medical-border mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Transit Coordination Pipeline</h2>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${caseData.status === 'delivered' ? 'bg-green-500' : 'bg-brand-500 animate-pulse'}`}></span>
              <span className="text-xs font-bold text-slate-700 capitalize">Status: {caseData.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 relative">
            {[
              { label: 'Match Found', desc: 'Compatibility resolved' },
              { label: 'Recipient Notified', desc: 'Alert pushed' },
              { label: 'Accepted', desc: 'Recipient approved' },
              { label: 'Transport Active', desc: 'Courier dispatched' },
              { label: 'Delivered', desc: 'Successfully received' }
            ].map((step, idx) => {
              let isPassed = false;
              let isCurrent = false;

              if (caseData.status === 'matching') {
                isPassed = idx < 2;
                isCurrent = idx === 1;
              } else if (caseData.status === 'accepted') {
                isPassed = idx < 3;
                isCurrent = idx === 2;
              } else if (caseData.status === 'confirmed') {
                isPassed = idx < 3;
                isCurrent = idx === 2;
              } else if (caseData.status === 'transport') {
                isPassed = idx < 4;
                isCurrent = idx === 3;
              } else if (caseData.status === 'delivered') {
                isPassed = idx <= 4;
                isCurrent = idx === 4;
              }

              return (
                <div key={idx} className="flex flex-col relative z-10">
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                      isCurrent 
                        ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20 animate-pulse' 
                        : isPassed 
                          ? 'bg-brand-50 text-brand-700 border-brand-200' 
                          : 'bg-white text-slate-400 border-slate-200'
                    }`}>
                      {isPassed && idx < currentStepIndex + 2 && idx !== currentStepIndex ? '✓' : idx + 1}
                    </div>
                    <span className={`text-xs font-bold ${isCurrent ? 'text-slate-900' : isPassed ? 'text-slate-700' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 pl-9 leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns - Case Info & Gated Contact Cards */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Organ info */}
            <div className="bg-white p-6 rounded-xl border border-medical-border shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-brand-600 animate-pulse-slow" />
                Organ Specifications
              </h3>
              
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between mb-4">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-450">Viable Organ</p>
                  <p className="text-xl font-black text-slate-850 uppercase">{caseData.organType}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase font-bold text-slate-450">Blood Group</p>
                  <p className="text-xl font-mono font-black text-brand-600">{caseData.bloodGroup}</p>
                </div>
              </div>

              {/* Viability Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Viability Remaining:</span>
                  <span className={`font-bold ${progressPercent < 25 ? 'text-medical-neon-red animate-pulse' : 'text-orange-600'}`}>
                    {timeLeft}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      progressPercent < 25 ? 'bg-medical-neon-red' : progressPercent < 50 ? 'bg-orange-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Created: {new Date(caseData.createdAt).toLocaleTimeString()}</span>
                  <span>Limit: {caseData.viabilityHours} Hrs Total</span>
                </div>
              </div>
            </div>

            {/* Gated Mutual Confirmation Contact Card */}
            <div className="bg-white p-6 rounded-xl border border-medical-border shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  {caseData.contactRevealed ? (
                    <Unlock className="h-5 w-5 text-medical-neon-green" />
                  ) : (
                    <Lock className="h-5 w-5 text-yellow-600" />
                  )}
                  Coordinator Contact Info
                </h3>
                {caseData.contactRevealed ? (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-green-50 text-green-700 border border-green-200">UNLOCKED</span>
                ) : (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-yellow-50 text-yellow-750 border border-yellow-200 animate-pulse">LOCKED</span>
                )}
              </div>

              {!caseData.contactRevealed ? (
                /* LOCKED STATE SCREEN */
                <div className="p-4 bg-slate-50/60 border border-dashed border-slate-200 rounded-lg text-center">
                  <ShieldAlert className="h-8 w-8 text-yellow-600 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs text-slate-700 font-bold">Contact Data Gated</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-normal">
                    Direct phone lines, coordinator names, and pickup instructions are hidden until both hospitals confirm the match.
                  </p>
                  
                  {/* Action prompt based on role */}
                  {user.role === 'donor' && caseData.status === 'accepted' && (
                    <button
                      onClick={handleDonorConfirm}
                      className="mt-4 px-4 py-2 w-full bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Confirm Match & Unlock
                    </button>
                  )}
                  {user.role === 'recipient' && !caseData.recipientConfirmed && (
                    <p className="text-[10px] text-brand-600 font-semibold mt-3 animate-pulse">
                      Waiting for you to Accept this alert.
                    </p>
                  )}
                  {caseData.status === 'accepted' && user.role === 'recipient' && (
                    <p className="text-[10px] text-yellow-600 mt-3 animate-pulse">
                      Awaiting Donor confirmation to unlock...
                    </p>
                  )}
                </div>
              ) : (
                /* UNLOCKED STATE SCREEN */
                <div className="space-y-4 animate-fade-in text-xs">
                  {/* Donor Hospital Details */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-[9px] font-extrabold text-brand-700 uppercase tracking-wide">Pickup Point (Donor)</p>
                    <p className="font-bold text-slate-850 mt-1">{donorHosp?.name || caseData.donorHospitalName}</p>
                    <p className="text-slate-550 mt-0.5">{donorHosp?.address}</p>
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-200/60 text-[10px]">
                      <span className="text-slate-655 flex items-center gap-1 font-semibold"><Phone className="h-3 w-3" /> {donorHosp?.contactPhone}</span>
                      <span className="text-slate-500">Coord: {donorHosp?.coordinatorName}</span>
                    </div>
                  </div>

                  {/* Recipient Hospital Details */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-[9px] font-extrabold text-blue-700 uppercase tracking-wide">Delivery Target (Recipient)</p>
                    <p className="font-bold text-slate-850 mt-1">{recipientHosp?.name || caseData.acceptedRecipientHospitalName}</p>
                    <p className="text-slate-550 mt-0.5">{recipientHosp?.address}</p>
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-200/60 text-[10px]">
                      <span className="text-slate-655 flex items-center gap-1 font-semibold"><Phone className="h-3 w-3" /> {recipientHosp?.contactPhone}</span>
                      <span className="text-slate-500">Coord: {recipientHosp?.coordinatorName}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Controller */}
            <div className="bg-white p-6 rounded-xl border border-medical-border shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-550 mb-3">Case Actions Console</h3>
              <div className="space-y-2">
                {caseData.status === 'accepted' && user.role === 'donor' && (
                  <button
                    onClick={handleDonorConfirm}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold cursor-pointer transition-colors shadow-sm"
                  >
                    Confirm Match (Two-Step)
                  </button>
                )}
                {caseData.status === 'confirmed' && user.role === 'donor' && (
                  <button
                    onClick={handleStartTransport}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-bold cursor-pointer transition-colors shadow-sm"
                  >
                    Start Air/Ground Transit
                  </button>
                )}
                {caseData.status === 'transport' && user.role === 'donor' && (
                  <button
                    onClick={handleMarkDelivered}
                    className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold cursor-pointer transition-colors shadow-sm"
                  >
                    Mark as Delivered
                  </button>
                )}
                <div className="text-[10px] text-slate-455 text-center leading-relaxed">
                  Only the Donor Hospital coordinator can advance cases after mutual confirmation.
                </div>
              </div>
            </div>

          </div>

          {/* Right Columns - Visual Transit Route Map (Keep map canvas slate-900 blueprint style) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-medical-border shadow-sm">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-medical-accent" />
                    Live Transit Routing & Telemetry
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing route between donor and recipient coordinates
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-650 border border-slate-200">
                  {activeCandidate?.transitType || 'Ground Transit'}
                </span>
              </div>

              {/* ROUTE VISUALIZATION SVG MAP (Slate-900 styled blueprint map) */}
              <div className="w-full aspect-[16/10] bg-slate-900 rounded-xl border border-slate-350 relative overflow-hidden flex flex-col justify-between p-4 select-none shadow-inner">
                
                {/* SVG Path drawing */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300">
                  <defs>
                    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="routeLine" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#00f2fe" />
                    </linearGradient>
                  </defs>

                  {/* Mock grid lines */}
                  <path d="M 0 50 L 500 50 M 0 100 L 500 100 M 0 150 L 500 150 M 0 200 L 500 200 M 0 250 L 500 250" stroke="#1e293b" strokeWidth="0.5" opacity="0.4" />
                  <path d="M 100 0 L 100 300 M 200 0 L 200 300 M 300 0 L 300 300 M 400 0 L 400 300" stroke="#1e293b" strokeWidth="0.5" opacity="0.4" />

                  {/* Route path */}
                  <path 
                    d="M 100 220 Q 250 80 400 140" 
                    fill="none" 
                    stroke="url(#routeLine)" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeDasharray="6, 4"
                    className={caseData.status === 'transport' ? 'animate-pulse' : ''}
                  />

                  {/* Blinking Donor Anchor */}
                  <circle cx="100" cy="220" r="15" fill="url(#glow)" className="animate-pulse" />
                  <circle cx="100" cy="220" r="5" fill="#14b8a6" />

                  {/* Blinking Recipient Anchor */}
                  <circle cx="400" cy="140" r="15" fill="url(#glow)" className="animate-pulse" />
                  <circle cx="400" cy="140" r="5" fill="#00f2fe" />

                  {/* Animated Vessel */}
                  {caseData.status === 'transport' && (
                    <g className="vessel-group">
                      <circle cx="250" cy="120" r="10" fill="#39ff14" opacity="0.3" className="animate-ping" />
                      <circle cx="250" cy="120" r="5" fill="#39ff14" />
                      <text x="260" y="115" fill="#39ff14" fontSize="9" fontWeight="bold" fontFamily="monospace">ETA EN ROUTE</text>
                    </g>
                  )}
                </svg>

                {/* Markers overlay */}
                <div className="absolute top-[200px] left-[115px] bg-slate-800 text-white px-2 py-1 rounded border border-slate-700 text-[9px] shadow">
                  <p className="font-bold">Donor Point</p>
                  <p className="text-gray-400 font-mono">{donorLat.toFixed(3)}, {donorLng.toFixed(3)}</p>
                </div>

                <div className="absolute top-[100px] left-[270px] bg-slate-800 text-white px-2 py-1 rounded border border-slate-700 text-[9px] shadow">
                  <p className="font-bold">Recipient Target</p>
                  <p className="text-gray-400 font-mono">{recLat.toFixed(3)}, {recLng.toFixed(3)}</p>
                </div>

                {/* Telemetry panel */}
                <div className="mt-auto bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-800 grid grid-cols-3 gap-4 text-xs relative z-10 text-white shadow">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block">Distance</span>
                    <strong className="text-sm font-mono">{activeCandidate?.travelDistanceKm || 'N/A'} km</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block">Transit Time</span>
                    <strong className="text-sm text-brand-400 font-mono">{activeCandidate?.travelTimeMinutes || 'N/A'} min</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block">Vessel Mode</span>
                    <span className="text-xs text-medical-accent font-semibold flex items-center gap-1">
                      {activeCandidate?.travelDistanceKm > 150 ? (
                        <><Plane className="h-3.5 w-3.5" /> Air Ambulance</>
                      ) : (
                        <><Navigation className="h-3.5 w-3.5" /> Ground Unit</>
                      )}
                    </span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 bg-yellow-950/80 border border-yellow-800/80 rounded px-2 py-0.5 text-[8px] text-yellow-400 font-bold tracking-wide">
                  SIMULATED TRAVEL PATH
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                💡 <strong>Google Maps Integration notice:</strong> When a valid <code>VITE_GOOGLE_MAPS_API_KEY</code> is loaded, coordinates resolve using official Distance Matrix APIs to retrieve traffic-aware ETAs. Currently showing estimated straight-line travel projection (Haversine formula at 80 km/h ground speed or 250 km/h air speed, plus preparation overheads).
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
