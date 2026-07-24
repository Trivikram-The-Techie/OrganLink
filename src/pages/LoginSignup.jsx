import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, collection, getDocs } from '../firebase';
import { Activity, Shield, Mail, Lock, User, Phone, Landmark, AlertCircle } from 'lucide-react';

export default function LoginSignup() {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('donor'); // 'donor' or 'recipient'
  const [hospitalId, setHospitalId] = useState('');
  
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load hospitals from database for dropdown selection
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'hospitals'));
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ hospitalId: doc.id, ...doc.data() });
        });
        setHospitals(list);
        if (list.length > 0) {
          setHospitalId(list[0].hospitalId);
        }
      } catch (err) {
        console.error('Error fetching hospitals:', err);
      }
    };
    fetchHospitals();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'donor' ? '/donor' : '/recipient');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const selectedHospital = hospitals.find(h => h.hospitalId === hospitalId);
        const hospitalName = selectedHospital ? selectedHospital.name : 'Unknown Hospital';
        
        await signUp(
          email,
          password,
          name,
          phone,
          role,
          hospitalId,
          hospitalName
        );
      }
    } catch (err) {
      console.error(err);
      if (err.message.includes('auth/invalid-credential') || err.message.includes('User not found')) {
        setError('Invalid email or password.');
      } else if (err.message.includes('auth/email-already-in-use')) {
        setError('This email is already registered.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
      setLoading(false);
    }
  };

  // Automated Quick Provision and Login for judges/demo
  const handleQuickLogin = async (type) => {
    setLoading(true);
    setError('');

    const demoCreds = {
      donor: {
        email: 'donor@metro.org',
        password: 'password123',
        name: 'Dr. Sarah Jenkins',
        phone: '+1 (555) 101-2001',
        role: 'donor',
        hospitalId: 'hosp_metro',
        hospitalName: 'Metro General Hospital'
      },
      recipient: {
        email: 'recipient@mercy.org',
        password: 'password123',
        name: 'Dr. Marcus Vance',
        phone: '+1 (555) 202-3002',
        role: 'recipient',
        hospitalId: 'hosp_mercy',
        hospitalName: 'Mercy Health Center'
      }
    };

    const cred = demoCreds[type];

    try {
      await signIn(cred.email, cred.password);
    } catch (err) {
      try {
        console.log(`[Demo] Registering quick user ${cred.email} on the fly...`);
        await signUp(
          cred.email,
          cred.password,
          cred.name,
          cred.phone,
          cred.role,
          cred.hospitalId,
          cred.hospitalName
        );
      } catch (regErr) {
        console.error('[Demo] Error registering quick user:', regErr);
        setError(`Failed to perform Quick Login: ${regErr.message}`);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-medical-dark flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex p-3 bg-brand-100 border border-brand-200 rounded-2xl text-brand-600 mb-3 shadow-sm">
          <Activity className="h-9 w-9 text-medical-accent" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Organ<span className="text-brand-600">Link</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-xs">
          Real-time Organ Coordination & Transportation Dispatch
        </p>
      </div>

      <div className="w-full max-w-md bg-white border border-medical-border rounded-2xl shadow-lg overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-medical-border bg-slate-50">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`w-1/2 py-4 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              isLogin 
                ? 'text-brand-600 border-brand-600 bg-white' 
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`w-1/2 py-4 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              !isLogin 
                ? 'text-brand-600 border-brand-600 bg-white' 
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-600">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Alexander Fleming"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-sm text-slate-850 placeholder-slate-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Direct Contact Phone</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 012-3456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-sm text-slate-850 placeholder-slate-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Account Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-sm text-slate-800 focus:outline-none transition-colors"
                    >
                      <option value="donor">Donor Hospital Staff</option>
                      <option value="recipient">Recipient Hospital Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hospital Facility</label>
                    <select
                      value={hospitalId}
                      onChange={(e) => setHospitalId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-sm text-slate-800 focus:outline-none transition-colors"
                    >
                      {hospitals.length === 0 ? (
                        <option value="">No Seeded Hospitals</option>
                      ) : (
                        hospitals.map(h => (
                          <option key={h.hospitalId} value={h.hospitalId}>{h.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {hospitals.length === 0 && (
                  <p className="text-[11px] text-yellow-600 mt-1">
                    ⚠️ Note: Database is not seeded yet. Go to the <a href="/admin" className="underline text-brand-600 font-semibold">Seed Screen</a> first.
                  </p>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hospital Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="coordinator@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-sm font-bold rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full mx-auto"></div>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Register Coordinator'
              )}
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              ⚡ Demo Quick Access (For Judges)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('donor')}
                className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-brand-500 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all text-center flex flex-col items-center justify-center cursor-pointer shadow-sm"
              >
                <Landmark className="h-4 w-4 text-brand-600 mb-1" />
                <span className="font-bold">Metro Donor</span>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5">donor@metro.org</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('recipient')}
                className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-500 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all text-center flex flex-col items-center justify-center cursor-pointer shadow-sm"
              >
                <Shield className="h-4 w-4 text-blue-600 mb-1" />
                <span className="font-bold">Mercy Recipient</span>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5">recipient@mercy.org</span>
              </button>
            </div>
            <div className="mt-4 text-center">
              <a href="/admin" className="text-xs text-brand-600 hover:text-brand-700 transition-colors font-medium">
                Configure / Seed Database Console →
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
