import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, addDoc, onSnapshot, query, where, doc, getDocs, updateDoc } from '../firebase';
import { rankCandidates } from '../utils/ranking';
import { Heart, Activity, Clock, Award, Shield, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DonorDashboard() {
  const { user, logout } = useAuth();
  const [organType, setOrganType] = useState('heart');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [viabilityHours, setViabilityHours] = useState('6');
  
  const [activeCases, setActiveCases] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [matchingStatus, setMatchingStatus] = useState('');

  // 1. Fetch current donor hospital coordinates details
  useEffect(() => {
    if (!user?.hospitalId) return;
    const fetchHosp = async () => {
      const snap = await getDocs(query(collection(db, 'hospitals'), where('hospitalId', '==', user.hospitalId)));
      if (!snap.empty) {
        setHospitalInfo(snap.docs[0].data());
      }
    };
    fetchHosp();
  }, [user]);

  // 2. Real-time listener for active cases submitted by this donor hospital
  useEffect(() => {
    if (!user?.hospitalId) return;

    const q = query(
      collection(db, 'cases'),
      where('donorHospitalId', '==', user.hospitalId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cases = [];
      snapshot.forEach((doc) => {
        cases.push({ caseId: doc.id, ...doc.data() });
      });
      // Sort cases by creation time descending
      cases.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setActiveCases(cases);
    });

    return unsubscribe;
  }, [user]);

  // 3. Handle organ submission, matching, and ranking
  const handleRegisterOrgan = async (e) => {
    e.preventDefault();
    if (!hospitalInfo) {
      alert("Error: Hospital details not loaded yet.");
      return;
    }
    setLoading(true);
    setMessage('');
    setMatchingStatus('Filtering waitlist & running compatibility checks...');

    try {
      const donorOrg = {
        organType,
        bloodGroup,
        viabilityHours: parseFloat(viabilityHours),
        lat: hospitalInfo.lat,
        lng: hospitalInfo.lng
      };

      // Query all recipients (waitlist)
      setMatchingStatus('Retrieving recipient waitlist...');
      const recSnap = await getDocs(collection(db, 'recipients'));
      const waitlist = [];
      recSnap.forEach(d => waitlist.push(d.data()));

      // Query all hospitals for location references
      setMatchingStatus('Retrieving hospital coordinates...');
      const hospSnap = await getDocs(collection(db, 'hospitals'));
      const allHospitals = [];
      hospSnap.forEach(d => allHospitals.push(d.data()));

      // Execute ranking algorithm
      setMatchingStatus('Executing transit routing & Vertex AI mock scoring...');
      const topCandidates = await rankCandidates(donorOrg, waitlist, allHospitals);

      if (topCandidates.length === 0) {
        setMatchingStatus('');
        alert("No compatible recipients found within the transport viability window.");
        setLoading(false);
        return;
      }

      // Save case to Firestore
      setMatchingStatus('Creating live transit case...');
      const newCase = {
        organType,
        bloodGroup,
        donorHospitalId: user.hospitalId,
        donorHospitalName: user.hospitalName,
        viabilityHours: donorOrg.viabilityHours,
        viabilityExpiresAt: Date.now() + (donorOrg.viabilityHours * 60 * 60 * 1000),
        status: 'matching',
        rankedCandidates: topCandidates,
        acceptedRecipientHospitalId: null,
        acceptedRecipientHospitalName: null,
        donorConfirmed: false,
        recipientConfirmed: false,
        contactRevealed: false,
        createdAt: Date.now()
      };

      await addDoc(collection(db, 'cases'), newCase);
      
      setMessage('Organ listed successfully! Real-time alerts dispatched.');
      setOrganType('heart');
      setBloodGroup('O+');
      setViabilityHours('6');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error(error);
      alert(`Submission failed: ${error.message}`);
    } finally {
      setMatchingStatus('');
      setLoading(false);
    }
  };

  // Donor confirms the match after recipient has accepted it
  const handleDonorConfirm = async (caseId) => {
    try {
      const caseRef = doc(db, 'cases', caseId);
      await updateDoc(caseRef, {
        donorConfirmed: true,
        contactRevealed: true,
        status: 'confirmed'
      });
    } catch (error) {
      console.error('Error confirming match:', error);
      alert(error.message);
    }
  };

  // Dispatch transit start
  const handleStartTransport = async (caseId) => {
    try {
      await updateDoc(doc(db, 'cases', caseId), { status: 'transport' });
    } catch (err) {
      alert(err.message);
    }
  };

  // Mark case as completed
  const handleDeliver = async (caseId) => {
    try {
      await updateDoc(doc(db, 'cases', caseId), { status: 'delivered' });
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'matching':
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-yellow-50 text-yellow-750 border border-yellow-200 animate-pulse">Matching Waitlist</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-blue-50 text-blue-750 border border-blue-200">Pending Donor Conf</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-purple-50 text-purple-750 border border-purple-200 font-semibold">Match Confirmed</span>;
      case 'transport':
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-50 text-emerald-750 border border-emerald-200 animate-pulse font-semibold">In Transit</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-green-50 text-green-750 border border-green-200 font-semibold">Delivered</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-medical-dark text-slate-800 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-medical-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-medical-neon-green animate-pulse"></span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500">Live Coordination Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
              {user?.hospitalName} <span className="text-brand-600 font-normal">Donor Dashboard</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Coordinator: <strong className="text-slate-700">{user?.name}</strong> | Coordinates: {hospitalInfo ? `${hospitalInfo.lat.toFixed(4)}, ${hospitalInfo.lng.toFixed(4)}` : 'Loading...'}
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
          
          {/* Organ Entry Form Card */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-medical-border shadow-md self-start">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-brand-600" />
              Report Available Organ
            </h2>

            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="h-4.5 w-4.5" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleRegisterOrgan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Organ Type</label>
                <select
                  value={organType}
                  onChange={(e) => setOrganType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-sm text-slate-800 focus:outline-none transition-colors"
                >
                  <option value="heart">Heart</option>
                  <option value="kidney">Kidney</option>
                  <option value="liver">Liver</option>
                  <option value="lung">Lung</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Donor Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-sm text-slate-800 focus:outline-none transition-colors"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Viability Window (Hours)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Clock className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    required
                    value={viabilityHours}
                    onChange={(e) => setViabilityHours(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-sm text-slate-800 placeholder-slate-350 focus:outline-none transition-colors"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block leading-normal">
                  Typical viability: Heart (4-6h), Lung (6-8h), Liver (12-15h), Kidney (24-36h).
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-sm font-bold rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Processing Match...' : 'Run Compatibility Match'}
              </button>
            </form>

            {matchingStatus && (
              <div className="mt-4 p-3 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-800 animate-pulse font-medium">
                {matchingStatus}
              </div>
            )}
          </div>

          {/* Active Cases / Live Feeds */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-medical-border p-6 shadow-md">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-medical-accent" />
                Active Donor Dispatches ({activeCases.length})
              </h2>

              {activeCases.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-lg text-slate-400">
                  <Heart className="h-10 w-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="text-sm">No active dispatches. Use the form on the left to report an organ.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeCases.map((c) => {
                    const isExpired = Date.now() > c.viabilityExpiresAt;
                    const hoursLeft = Math.max(0, ((c.viabilityExpiresAt - Date.now()) / (1000 * 60 * 60))).toFixed(1);

                    return (
                      <div key={c.caseId} className="border border-medical-border bg-slate-50/40 rounded-xl overflow-hidden shadow-sm">
                        {/* Header banner */}
                        <div className="p-4 bg-slate-100/50 border-b border-medical-border flex justify-between items-center flex-wrap gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-200 font-mono">
                              {c.organType}
                            </span>
                            <span className="text-xs text-slate-700">
                              Blood Group: <strong className="text-brand-700 font-mono">{c.bloodGroup}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(c.status)}
                            <Link to={`/case/${c.caseId}`} className="text-xs text-brand-600 hover:text-brand-800 font-bold flex items-center gap-0.5">
                              Open Case Tracker <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>

                        {/* Candidate list / workflow panel */}
                        <div className="p-4">
                          {c.status === 'matching' && (
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                  Top Compatibility Matches (Vertex AI Score)
                                </h3>
                                <div className="text-[10px] text-slate-500">
                                  Viability remaining: <span className={isExpired ? 'text-red-650 font-bold' : 'text-orange-655 font-bold'}>{isExpired ? 'Expired' : `${hoursLeft} hrs`}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {c.rankedCandidates.map((candidate, idx) => (
                                  <div key={candidate.recipientId} className="p-4 bg-white border border-slate-200 rounded-lg text-xs shadow-sm hover:border-brand-300 transition-colors">
                                    <div className="flex justify-between items-start mb-2.5">
                                      <div className="flex items-center gap-2.5">
                                        <span className="h-5.5 w-5.5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                                          #{idx + 1}
                                        </span>
                                        <div>
                                          <h4 className="font-bold text-slate-850 text-xs">{candidate.recipientHospitalName}</h4>
                                          <p className="text-[10px] text-slate-500 font-medium">
                                            Route: {candidate.travelDistanceKm} km | {candidate.travelTimeMinutes} mins via {candidate.transitType}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="flex items-center gap-1.5 justify-end">
                                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-100 font-bold animate-pulse">
                                            Alert Sent
                                          </span>
                                          <span className="text-xs font-black text-brand-600 font-mono text-sm bg-brand-50 border border-brand-200/50 px-2 py-0.5 rounded">
                                            {candidate.rankScore}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Match & Formula Details */}
                                    <div className="grid grid-cols-3 gap-2.5 p-2 bg-slate-50 rounded border border-slate-200/60 text-[10px] text-slate-600">
                                      <div>
                                        <span className="block text-slate-400 font-semibold uppercase text-[8px]">Urgency Score</span>
                                        <span className="font-bold text-red-600">{candidate.urgencyScore} / 100</span>
                                        <span className="block text-[8px] text-slate-450 mt-0.5">Weight: 45%</span>
                                      </div>
                                      <div>
                                        <span className="block text-slate-400 font-semibold uppercase text-[8px]">Transport Buffer</span>
                                        <span className="font-bold text-slate-700">{candidate.feasibilityScore}%</span>
                                        <span className="block text-[8px] text-slate-450 mt-0.5">Weight: 35%</span>
                                      </div>
                                      <div>
                                        <span className="block text-slate-400 font-semibold uppercase text-[8px]">ABO Compatibility</span>
                                        <span className="font-bold text-blue-600">{candidate.bloodGroup} ({candidate.compatibilityScore === 100 ? 'Perfect' : 'Compatible'})</span>
                                        <span className="block text-[8px] text-slate-450 mt-0.5">Weight: 20%</span>
                                      </div>
                                    </div>
                                    <div className="text-[8px] text-slate-400 mt-1.5 text-right font-mono italic">
                                      Formula: (Urgency × 0.45) + (Transit Buffer × 0.35) + (ABO Fit × 0.20)
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {c.status === 'accepted' && (
                            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                              <div>
                                <h4 className="font-bold text-brand-900 flex items-center gap-1.5 text-sm">
                                  <Award className="h-5 w-5 text-brand-600" />
                                  Match Accepted by Recipient Hospital
                                </h4>
                                <p className="text-xs text-brand-800 mt-1">
                                  {c.rankedCandidates.find(rc => rc.recipientHospitalId === c.acceptedRecipientHospitalId)?.recipientHospitalName || 'Recipient Hospital'} has accepted the organ. Proceed with donor verification to reveal contact coordinates.
                                </p>
                              </div>
                              <button
                                onClick={() => handleDonorConfirm(c.caseId)}
                                className="w-full md:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-md"
                              >
                                Confirm Mutual Match
                              </button>
                            </div>
                          )}

                          {c.status === 'confirmed' && (
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                              <div>
                                <h4 className="font-bold text-purple-900 flex items-center gap-1.5 text-sm">
                                  <Shield className="h-5 w-5 text-purple-600" />
                                  Mutual Confirmation Complete
                                </h4>
                                <p className="text-xs text-purple-800 mt-1">
                                  All contact lines are unlocked. Prepare transport team and activate dispatch.
                                </p>
                              </div>
                              <button
                                onClick={() => handleStartTransport(c.caseId)}
                                className="w-full md:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-md"
                              >
                                Dispatch Transport Team
                              </button>
                            </div>
                          )}

                          {c.status === 'transport' && (
                            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                              <div>
                                <h4 className="font-bold text-sky-900 flex items-center gap-1.5 text-sm">
                                  <Clock className="h-5 w-5 text-sky-655 animate-pulse" />
                                  Organ is In-Transit
                                </h4>
                                <p className="text-xs text-sky-850 mt-1">
                                  Transit tracking is active. Mark as delivered once the transplant team confirms receipt at target facility.
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeliver(c.caseId)}
                                className="w-full md:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-all shadow-md"
                              >
                                Mark as Delivered
                              </button>
                            </div>
                          )}

                          {c.status === 'delivered' && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                              <p className="text-xs text-green-700 font-bold flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="h-4.5 w-4.5" />
                                Coordination Completed — Organ Delivered
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                Case has been archived. Thank you for your coordination.
                              </p>
                            </div>
                          )}
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
