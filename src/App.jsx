import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  LogOut, 
  Search, 
  Clock, 
  Heart, 
  Eye, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  Building2, 
  User, 
  ShieldCheck,
  Navigation,
  ArrowLeft,
  Layers
} from 'lucide-react';

// Custom Organ Icons
const KidneyIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-amber-600">
    <path d="M7.5 3.5C9.5 3.5 11 5 11 7c0 1.2-.5 2.2-1.2 2.8.5.5 1.2 1.2 1.2 2.2 0 2.5-2 4.5-4.5 4.5S2 14.5 2 12c0-1 .7-1.7 1.2-2.2-.7-.6-1.2-1.6-1.2-2.8 0-2 1.5-3.5 3.5-3.5zm9 0c2 0 3.5 1.5 3.5 3.5 0 1.2-.5 2.2-1.2 2.8.5.5 1.2 1.2 1.2 2.2 0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5c0-1 .7-1.7 1.2-2.2-.7-.6-1.2-1.6-1.2-2.8 0-2 1.5-3.5 3.5-3.5z" />
  </svg>
);

const LiverIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-orange-700">
    <path d="M12 4C5.5 4 2 8 2 12s4.5 8 10 8 10-4 10-8-3.5-8-10-8zm-2 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
  </svg>
);

const LungIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
    <path d="M6 3c-1.5 0-3 1.5-3 3v10c0 3 2.5 5 5 5h1c1.5 0 2-1 2-2V8c0-1.5-.5-3-2-3H6z" />
    <path d="M18 3c1.5 0 3 1.5 3 3v10c0 3-2.5 5-5 5h-1c-1.5 0-2-1-2-2V8c0-1.5.5-3 2-3h3z" />
    <path d="M12 3v5" />
  </svg>
);

const PancreasIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
    <path d="M3 12h18M5 9c0 2 1.5 3 3 3s3-1 3-3M13 15c0-2 1.5-3 3-3s3 1 3 3" />
  </svg>
);

const RenderOrganIcon = ({ organ }) => {
  switch (organ) {
    case 'Heart':
      return <Heart className="w-5 h-5 text-red-500" fill="#EF4444" />;
    case 'Cornea':
      return <Eye className="w-5 h-5 text-sky-500" />;
    case 'Kidney':
      return <KidneyIcon />;
    case 'Liver':
      return <LiverIcon />;
    case 'Lung':
      return <LungIcon />;
    case 'Pancreas':
      return <PancreasIcon />;
    default:
      return <Activity className="w-5 h-5 text-gray-500" />;
  }
};

// Mock Hospitals List
const MOCK_HOSPITALS = [
  "Apollo Central Hospital",
  "SAHE Medical Center",
  "Krishna District Hospital",
  "Fortis Healthcare Institute",
  "Manipal Hospital Bangalore",
  "AIIMS New Delhi",
  "CMC Vellore",
  "KGMU Lucknow"
];

// Fixed Hospital coordinate mapping for the simulated GIS tracker
const HOSPITAL_COORDINATES = {
  "Apollo Central Hospital": { x: 180, y: 120 },
  "SAHE Medical Center": { x: 580, y: 100 },
  "Krishna District Hospital": { x: 320, y: 320 },
  "Fortis Healthcare Institute": { x: 160, y: 300 },
  "Manipal Hospital Bangalore": { x: 500, y: 280 },
  "AIIMS New Delhi": { x: 380, y: 70 },
  "CMC Vellore": { x: 600, y: 260 },
  "KGMU Lucknow": { x: 80, y: 220 }
};

// Initial mock data of 18 records with detailed parameters
const INITIAL_COORDINATIONS = [
  {
    id: "TX-901",
    organ: "Heart",
    bloodGroup: "O+",
    donorHospital: "SAHE Medical Center",
    recipientHospital: "Apollo Central Hospital",
    distance: 42,
    transportTime: "1h 10m",
    viabilityLimit: 5 * 3600,
    timeRemaining: 1840, // ~30 mins (Critical, Red)
    patientNote: "Patient: Amit Sen (Age 52) — Stage 4 coronary heart disease (ICU)",
    status: "Transport In Progress",
    progress: 0.45,
    priorityScore: 94,
    recipientUnit: "ICU Bed 12",
    attendingPhysician: "Dr. R. Sharma",
    preservationMethod: "Cold ischemia — static cold storage",
    organId: "ORG-901-H",
    retrievalTime: "08:15 AM"
  },
  {
    id: "TX-902",
    organ: "Kidney",
    bloodGroup: "A+",
    donorHospital: "Manipal Hospital Bangalore",
    recipientHospital: "Fortis Healthcare Institute",
    distance: 18,
    transportTime: "0h 35m",
    viabilityLimit: 30 * 3600,
    timeRemaining: 86400, // 24 hours (Stable, Green)
    patientNote: "Patient: Priya Sharma (Age 41) — End-stage renal disease",
    status: "Match Confirmed",
    progress: 0.0,
    priorityScore: 89,
    recipientUnit: "OT Room 3",
    attendingPhysician: "Dr. A. Bhasin",
    preservationMethod: "Hypothermic machine perfusion",
    organId: "ORG-902-K",
    retrievalTime: "Pending Retrieval"
  },
  {
    id: "TX-903",
    organ: "Liver",
    bloodGroup: "B-",
    donorHospital: "AIIMS New Delhi",
    recipientHospital: "KGMU Lucknow",
    distance: 510,
    transportTime: "6h 15m",
    viabilityLimit: 10 * 3600,
    timeRemaining: 4200, // 1h 10m (Critical, Red)
    patientNote: "Patient: Rajesh Kumar (Age 47) — Acute hepatic coma",
    status: "Transport In Progress",
    progress: 0.75,
    priorityScore: 97,
    recipientUnit: "ICU Isolation Bed 3",
    attendingPhysician: "Dr. K. Saxena",
    preservationMethod: "Cold ischemia — static cold storage",
    organId: "ORG-903-L",
    retrievalTime: "06:30 AM"
  },
  {
    id: "TX-904",
    organ: "Lung",
    bloodGroup: "AB+",
    donorHospital: "CMC Vellore",
    recipientHospital: "Apollo Central Hospital",
    distance: 140,
    transportTime: "2h 45m",
    viabilityLimit: 6 * 3600,
    timeRemaining: 8100, // 2h 15m (High, Amber)
    patientNote: "Patient: Sneha Patil (Age 35) — Severe pulmonary fibrosis (Ventilator)",
    status: "Match Confirmed",
    progress: 0.0,
    priorityScore: 92,
    recipientUnit: "ICU Bed 9",
    attendingPhysician: "Dr. G. Nair",
    preservationMethod: "Cold ischemia — static cold storage",
    organId: "ORG-904-U",
    retrievalTime: "Retrieval In Progress"
  },
  {
    id: "TX-905",
    organ: "Pancreas",
    bloodGroup: "O-",
    donorHospital: "Krishna District Hospital",
    recipientHospital: "CMC Vellore",
    distance: 320,
    transportTime: "4h 20m",
    viabilityLimit: 12 * 3600,
    timeRemaining: 34200, // 9.5 hours (Stable, Green)
    patientNote: "Patient: Vikram Nair (Age 29) — Type 1 Diabetes kidney-pancreas list",
    status: "Match Confirmed",
    progress: 0.0,
    priorityScore: 86,
    recipientUnit: "Ward 4B - Bed 1",
    attendingPhysician: "Dr. S. John",
    preservationMethod: "Cold ischemia — static cold storage",
    organId: "ORG-905-P",
    retrievalTime: "Pending Retrieval"
  },
  {
    id: "TX-906",
    organ: "Cornea",
    bloodGroup: "A-",
    donorHospital: "KGMU Lucknow",
    recipientHospital: "SAHE Medical Center",
    distance: 680,
    transportTime: "8h 30m",
    viabilityLimit: 96 * 3600,
    timeRemaining: 316800, // 88 hours (Stable, Green)
    patientNote: "Patient: Jyoti Das (Age 64) — Severe bilateral corneal scarring",
    status: "Transport In Progress",
    progress: 0.15,
    priorityScore: 78,
    recipientUnit: "Daycare OT Bed 2",
    attendingPhysician: "Dr. P. Roy",
    preservationMethod: "Static cold storage (Moist chamber)",
    organId: "ORG-906-C",
    retrievalTime: "05:00 AM"
  },
  {
    id: "TX-907",
    organ: "Heart",
    bloodGroup: "B+",
    donorHospital: "Fortis Healthcare Institute",
    recipientHospital: "AIIMS New Delhi",
    distance: 25,
    transportTime: "0h 50m",
    viabilityLimit: 5 * 3600,
    timeRemaining: 14400, // 4 hours (Stable, Green)
    patientNote: "Patient: Rohan Mehra (Age 45) — Congestive heart failure (NYHA Class IV)",
    status: "Match Confirmed",
    progress: 0.0,
    priorityScore: 91,
    recipientUnit: "ICU Bed 2",
    attendingPhysician: "Dr. M. Prasad",
    preservationMethod: "Cold ischemia — static cold storage",
    organId: "ORG-907-H",
    retrievalTime: "Retrieval In Progress"
  },
  {
    id: "TX-908",
    organ: "Kidney",
    bloodGroup: "O+",
    donorHospital: "CMC Vellore",
    recipientHospital: "Manipal Hospital Bangalore",
    distance: 190,
    transportTime: "3h 10m",
    viabilityLimit: 30 * 3600,
    timeRemaining: 21600, // 6 hours (High, Amber)
    patientNote: "Patient: Meera Joshi (Age 55) — Chronic glomerulonephritis",
    status: "Transport In Progress",
    progress: 0.58,
    priorityScore: 88,
    recipientUnit: "Ward 5C - Bed 8",
    attendingPhysician: "Dr. H. Gowda",
    preservationMethod: "Hypothermic machine perfusion",
    organId: "ORG-908-K",
    retrievalTime: "07:00 AM"
  },
  {
    id: "TX-909",
    organ: "Liver",
    bloodGroup: "AB-",
    donorHospital: "Apollo Central Hospital",
    recipientHospital: "SAHE Medical Center",
    distance: 15,
    transportTime: "0h 30m",
    viabilityLimit: 10 * 3600,
    timeRemaining: 27000, 
    patientNote: "Patient: Sandeep Gill (Age 60) — End-stage liver cirrhosis",
    status: "Delivered",
    progress: 1.0,
    priorityScore: 95,
    recipientUnit: "ICU Isolation Bed 1",
    attendingPhysician: "Dr. T. Verghese",
    preservationMethod: "Normothermic machine perfusion",
    organId: "ORG-909-L",
    retrievalTime: "04:30 AM"
  },
  {
    id: "TX-910",
    organ: "Lung",
    bloodGroup: "O-",
    donorHospital: "Manipal Hospital Bangalore",
    recipientHospital: "Krishna District Hospital",
    distance: 280,
    transportTime: "3h 50m",
    viabilityLimit: 6 * 3600,
    timeRemaining: 2100, // 35m (Critical, Red)
    patientNote: "Patient: Anita Rao (Age 32) — Primary pulmonary hypertension",
    status: "Transport In Progress",
    progress: 0.88,
    priorityScore: 98,
    recipientUnit: "ICU Bed 11",
    attendingPhysician: "Dr. N. Reddy",
    preservationMethod: "Cold ischemia — static cold storage",
    organId: "ORG-910-U",
    retrievalTime: "06:15 AM"
  },
  {
    id: "TX-911",
    organ: "Pancreas",
    bloodGroup: "B+",
    donorHospital: "AIIMS New Delhi",
    recipientHospital: "Fortis Healthcare Institute",
    distance: 28,
    transportTime: "0h 55m",
    viabilityLimit: 12 * 3600,
    timeRemaining: 12600, // 3.5 hours (High, Amber)
    patientNote: "Patient: Devendra Singh (Age 50) — Chronic pancreatitis with failure",
    status: "Match Confirmed",
    progress: 0.0,
    priorityScore: 84,
    recipientUnit: "Ward 2A - Bed 4",
    attendingPhysician: "Dr. V. Lal",
    preservationMethod: "Cold ischemia — static cold storage",
    organId: "ORG-911-P",
    retrievalTime: "Retrieval Scheduled"
  },
  {
    id: "TX-912",
    organ: "Cornea",
    bloodGroup: "O+",
    donorHospital: "Krishna District Hospital",
    recipientHospital: "KGMU Lucknow",
    distance: 420,
    transportTime: "5h 45m",
    viabilityLimit: 96 * 3600,
    timeRemaining: 14400, // 4 hours remaining (Critical for Cornea, Red)
    patientNote: "Patient: Harish Patel (Age 23) — Chemical injury ocular trauma",
    status: "Transport In Progress",
    progress: 0.35,
    priorityScore: 82,
    recipientUnit: "Daycare OT Bed 1",
    attendingPhysician: "Dr. A. Misra",
    preservationMethod: "Static cold storage (Moist chamber)",
    organId: "ORG-912-C",
    retrievalTime: "03:45 AM"
  },
  {
    id: "TX-913",
    organ: "Heart",
    bloodGroup: "A-",
    donorHospital: "SAHE Medical Center",
    recipientHospital: "Manipal Hospital Bangalore",
    distance: 75,
    transportTime: "1h 40m",
    viabilityLimit: 5 * 3600,
    timeRemaining: 6840, // 1.9 hours (High, Amber)
    patientNote: "Patient: Kavita Iyer (Age 38) — Dilated cardiomyopathy",
    status: "Transport In Progress",
    progress: 0.50,
    priorityScore: 93,
    recipientUnit: "ICU Bed 1",
    attendingPhysician: "Dr. P. Hegde",
    preservationMethod: "Cold ischemia — static cold storage",
    organId: "ORG-913-H",
    retrievalTime: "07:30 AM"
  },
  {
    id: "TX-914",
    organ: "Kidney",
    bloodGroup: "B-",
    donorHospital: "KGMU Lucknow",
    recipientHospital: "AIIMS New Delhi",
    distance: 505,
    transportTime: "6h 30m",
    viabilityLimit: 30 * 3600,
    timeRemaining: 97200, // 27 hours (Stable, Green)
    patientNote: "Patient: Alok Verma (Age 58) — Polycystic kidney disease",
    status: "Match Confirmed",
    progress: 0.0,
    priorityScore: 87,
    recipientUnit: "Ward 5D - Bed 3",
    attendingPhysician: "Dr. S. Gupta",
    preservationMethod: "Hypothermic machine perfusion",
    organId: "ORG-914-K",
    retrievalTime: "Pending Retrieval"
  },
  {
    id: "TX-915",
    organ: "Liver",
    bloodGroup: "A+",
    donorHospital: "Fortis Healthcare Institute",
    recipientHospital: "CMC Vellore",
    distance: 350,
    transportTime: "4h 45m",
    viabilityLimit: 10 * 3600,
    timeRemaining: 15480, // 4.3 hours (High, Amber)
    patientNote: "Patient: Sunita Gupta (Age 49) — Hepatocellular carcinoma candidate",
    status: "Match Confirmed",
    progress: 0.0,
    priorityScore: 90,
    recipientUnit: "ICU Bed 6",
    attendingPhysician: "Dr. M. Chandy",
    preservationMethod: "Normothermic machine perfusion",
    organId: "ORG-915-L",
    retrievalTime: "Retrieval In Progress"
  },
  {
    id: "TX-916",
    organ: "Lung",
    bloodGroup: "O+",
    donorHospital: "Apollo Central Hospital",
    recipientHospital: "Manipal Hospital Bangalore",
    distance: 290,
    transportTime: "4h 10m",
    viabilityLimit: 6 * 3600,
    timeRemaining: 16200, // 4.5 hours
    patientNote: "Patient: Manish Joshi (Age 57) — Emphysema / COPD",
    status: "Delivered",
    progress: 1.0,
    priorityScore: 88,
    recipientUnit: "Ward 3E - Bed 2",
    attendingPhysician: "Dr. R. Gowda",
    preservationMethod: "Cold ischemia — static cold storage",
    organId: "ORG-916-U",
    retrievalTime: "03:10 AM"
  },
  {
    id: "TX-917",
    organ: "Pancreas",
    bloodGroup: "AB+",
    donorHospital: "SAHE Medical Center",
    recipientHospital: "AIIMS New Delhi",
    distance: 240,
    transportTime: "3h 25m",
    viabilityLimit: 12 * 3600,
    timeRemaining: 39600, // 11 hours (Stable, Green)
    patientNote: "Patient: Preeti Reddy (Age 34) — Severe chronic pancreatitis",
    status: "Match Confirmed",
    progress: 0.0,
    priorityScore: 83,
    recipientUnit: "OT Room 1",
    attendingPhysician: "Dr. S. Kapoor",
    preservationMethod: "Cold ischemia — static cold storage",
    organId: "ORG-917-P",
    retrievalTime: "Pending Retrieval"
  },
  {
    id: "TX-918",
    organ: "Cornea",
    bloodGroup: "B+",
    donorHospital: "Manipal Hospital Bangalore",
    recipientHospital: "Fortis Healthcare Institute",
    distance: 12,
    transportTime: "0h 25m",
    viabilityLimit: 96 * 3600,
    timeRemaining: 270000, // 75 hours
    patientNote: "Patient: Ranganathan Swamy (Age 68) — Fuchs' dystrophy",
    status: "Delivered",
    progress: 1.0,
    priorityScore: 81,
    recipientUnit: "Ward 4A - Bed 7",
    attendingPhysician: "Dr. J. Balaji",
    preservationMethod: "Static cold storage (Moist chamber)",
    organId: "ORG-918-C",
    retrievalTime: "02:40 AM"
  }
];

// Helper to format countdown
const formatCountdown = (totalSeconds) => {
  if (totalSeconds <= 0) return "00:00:00 [EXPIRED]";
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Helper to calculate remaining time dynamically from progress
const getRemainingTimeText = (totalTimeStr, progress) => {
  if (progress >= 1.0) return "Arrived";
  const match = totalTimeStr.match(/(\d+)h\s*(\d+)m/);
  if (!match) return totalTimeStr;
  const hrs = parseInt(match[1]);
  const mins = parseInt(match[2]);
  const totalMins = hrs * 60 + mins;
  const remainingMins = Math.round(totalMins * (1 - progress));
  const rHrs = Math.floor(remainingMins / 60);
  const rMins = remainingMins % 60;
  return rHrs > 0 ? `${rHrs}h ${rMins}m` : `${rMins} min`;
};

// Blood Group Compatibility Helper
const getCompatibleDonorGroups = (patientBg) => {
  const cleanBg = patientBg.trim();
  switch (cleanBg) {
    case 'O+': return ['O+', 'O-'];
    case 'O-': return ['O-'];
    case 'A+': return ['A+', 'A-', 'O+', 'O-'];
    case 'A-': return ['A-', 'O-'];
    case 'B+': return ['B+', 'B-', 'O+', 'O-'];
    case 'B-': return ['B-', 'O-'];
    case 'AB+': return ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    case 'AB-': return ['AB-', 'A-', 'B-', 'O-'];
    default: return ['O-'];
  }
};

// Viability windows in seconds
const VIABILITY_LIMITS = {
  Heart: 5 * 3600,
  Lung: 6 * 3600,
  Liver: 10 * 3600,
  Pancreas: 12 * 3600,
  Kidney: 30 * 3600,
  Cornea: 96 * 3600
};

export default function App() {
  // Navigation & Auth State
  const [view, setView] = useState('login'); // 'login' | 'dashboard' | 'request' | 'matches' | 'detail'
  const [user, setUser] = useState(null); // { hospitalId, staffId }
  const [loginForm, setLoginForm] = useState({ hospitalId: '', staffId: '', password: '' });
  
  // App data State
  const [coordinations, setCoordinations] = useState(INITIAL_COORDINATIONS);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  // Filters State
  const [organFilter, setOrganFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Urgency');
  const [searchTerm, setSearchTerm] = useState('');

  // Request form state
  const [requestForm, setRequestForm] = useState({
    patientName: '',
    age: '',
    bloodGroup: 'O+',
    organType: 'Heart',
    urgencyLevel: 'Critical',
    requestingHospital: ''
  });

  // Selected candidate matches & flow control
  const [candidateMatches, setCandidateMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Loading states
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Live Timer tick + Simulated Progress Increment
  useEffect(() => {
    const interval = setInterval(() => {
      setCoordinations(prev => 
        prev.map(c => {
          if (c.status === 'Delivered') return c;
          
          const nextTime = Math.max(0, c.timeRemaining - 1);
          if (nextTime <= 0) {
            return { ...c, timeRemaining: 0 };
          }

          let nextProgress = c.progress || 0;
          let nextStatus = c.status;

          // Animate transport cases smoothly in-memory (0.25% per second)
          if (c.status === 'Transport In Progress') {
            nextProgress = Math.min(1.0, nextProgress + 0.0025);
            if (nextProgress >= 1.0) {
              nextStatus = 'Delivered';
            }
          }

          return { 
            ...c, 
            timeRemaining: nextTime, 
            progress: nextProgress, 
            status: nextStatus 
          };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Set default hospital in form when user changes
  useEffect(() => {
    if (user && user.hospitalId) {
      setRequestForm(prev => ({ ...prev, requestingHospital: user.hospitalId }));
    }
  }, [user]);

  // Determine urgency dynamically based on percentage of viability remaining
  const calculateUrgency = (item) => {
    if (item.status === 'Delivered') return 'Stable';
    if (item.timeRemaining <= 0) return 'Expired';
    const pct = item.timeRemaining / item.viabilityLimit;
    if (pct < 0.15) return 'Critical';
    if (pct < 0.40) return 'High';
    if (item.urgencyLevel) return item.urgencyLevel;
    return 'Stable';
  };

  // Login handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginForm.hospitalId || !loginForm.staffId || !loginForm.password) {
      alert("Please fill in all clinical credentials.");
      return;
    }
    setIsAuthenticating(true);
    setTimeout(() => {
      setUser({
        hospitalId: loginForm.hospitalId,
        staffId: loginForm.staffId
      });
      setIsAuthenticating(false);
      setView('dashboard');
    }, 1000);
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setView('login');
    setSelectedCaseId(null);
    setLoginForm({ hospitalId: '', staffId: '', password: '' });
  };

  // Form submit handler - Find donor hospital matches
  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!requestForm.patientName || !requestForm.age) {
      alert("Please specify patient demographics.");
      return;
    }
    
    setView('request-loading');

    setTimeout(() => {
      // Find candidate matches excluding requesting hospital
      const potentialDonors = MOCK_HOSPITALS.filter(h => h !== requestForm.requestingHospital);
      const compatibleBgs = getCompatibleDonorGroups(requestForm.bloodGroup);

      // Generate 3 mock donor matches
      const generatedMatches = potentialDonors.slice(0, 3).map((hospital, index) => {
        const bgIndex = index % compatibleBgs.length;
        const donorBg = compatibleBgs[bgIndex];
        
        const distance = Math.round(20 + index * 85 + Math.random() * 20);
        const hours = Math.floor(distance / 70);
        const mins = Math.round((distance % 70) * 0.85);
        const transportTime = `${hours}h ${mins}m`;

        return {
          hospital,
          donorBg,
          distance,
          transportTime
        };
      });

      generatedMatches.sort((a, b) => a.distance - b.distance);
      setCandidateMatches(generatedMatches);
      setView('matches');
    }, 2000);
  };

  // Confirm and dispatch handler
  const handleConfirmDispatch = (match) => {
    setSelectedMatch(match);
    setView('confirming-loading');

    setTimeout(() => {
      const newCoordId = `TX-${Math.floor(200 + Math.random() * 800)}`;
      const organLimit = VIABILITY_LIMITS[requestForm.organType];

      const newCoord = {
        id: newCoordId,
        organ: requestForm.organType,
        bloodGroup: match.donorBg,
        donorHospital: match.hospital,
        recipientHospital: requestForm.requestingHospital,
        distance: match.distance,
        transportTime: match.transportTime,
        viabilityLimit: organLimit,
        timeRemaining: organLimit,
        patientNote: `Patient: ${requestForm.patientName} (Age ${requestForm.age}) — ${requestForm.urgencyLevel} case`,
        status: "Transport In Progress",
        progress: 0.0,
        priorityScore: Math.floor(84 + Math.random() * 15),
        recipientUnit: "ICU Bed " + Math.floor(1 + Math.random() * 15),
        attendingPhysician: "Dr. A. Nair",
        preservationMethod: "Cold ischemia — static cold storage",
        organId: `ORG-${Math.floor(100 + Math.random() * 900)}-${requestForm.organType[0]}`,
        retrievalTime: "Retrieved Just Now",
        urgencyLevel: requestForm.urgencyLevel
      };

      setCoordinations(prev => [newCoord, ...prev]);
      setView('success-splash');

      setTimeout(() => {
        setView('dashboard');
        setRequestForm({
          patientName: '',
          age: '',
          bloodGroup: 'O+',
          organType: 'Heart',
          urgencyLevel: 'Critical',
          requestingHospital: user?.hospitalId || ''
        });
        setSelectedMatch(null);
      }, 2000);

    }, 1500);
  };

  // Open detail panel
  const handleOpenDetail = (id) => {
    setSelectedCaseId(id);
    setView('detail');
  };

  // Bezier Path calculations for GIS Map visual
  const getControlPoint = (p0, p2) => {
    const midX = (p0.x + p2.x) / 2;
    const midY = (p0.y + p2.y) / 2;
    const dx = p2.x - p0.x;
    const dy = p2.y - p0.y;
    // Perpendicular offset for curved route visual
    const nx = -dy * 0.22;
    const ny = dx * 0.22;
    return { x: midX + nx, y: midY + ny };
  };

  const getBezierPoint = (t, p0, p1, p2) => {
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return { x, y };
  };

  // Filtered and sorted list for dashboard
  const getFilteredAndSorted = () => {
    return coordinations
      .filter(item => {
        if (organFilter !== 'All' && item.organ !== organFilter) return false;
        if (searchTerm.trim() !== '') {
          const term = searchTerm.toLowerCase();
          return (
            item.id.toLowerCase().includes(term) ||
            item.organ.toLowerCase().includes(term) ||
            item.bloodGroup.toLowerCase().includes(term) ||
            item.donorHospital.toLowerCase().includes(term) ||
            item.recipientHospital.toLowerCase().includes(term) ||
            item.patientNote.toLowerCase().includes(term)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'Urgency') {
          const weight = (item) => {
            if (item.status === 'Delivered') return 0;
            const urg = calculateUrgency(item);
            if (urg === 'Critical') return 4;
            if (urg === 'High') return 3;
            if (urg === 'Stable') return 2;
            return 1; // Expired
          };
          return weight(b) - weight(a);
        }
        if (sortOrder === 'Time Remaining') {
          if (a.status === 'Delivered') return 1;
          if (b.status === 'Delivered') return -1;
          return a.timeRemaining - b.timeRemaining;
        }
        if (sortOrder === 'Distance') {
          return a.distance - b.distance;
        }
        if (sortOrder === 'Organ Type') {
          return a.organ.localeCompare(b.organ);
        }
        return 0;
      });
  };

  const filteredCoordinations = getFilteredAndSorted();

  // Statistics
  const totalActive = coordinations.filter(c => c.status !== 'Delivered').length;
  const totalCritical = coordinations.filter(c => calculateUrgency(c) === 'Critical' && c.status !== 'Delivered').length;
  const totalHospitals = new Set(coordinations.flatMap(c => [c.donorHospital, c.recipientHospital])).size;
  
  const activeCoordinations = coordinations.filter(c => c.status !== 'Delivered');
  const avgDistance = activeCoordinations.length > 0 
    ? Math.round(activeCoordinations.reduce((acc, c) => acc + c.distance, 0) / activeCoordinations.length) 
    : 0;
  const avgHours = (avgDistance / 68).toFixed(1);

  // Detail Case Lookup
  const selectedCase = coordinations.find(c => c.id === selectedCaseId);

  return (
    <div className="app-container">
      {/* ----------------- PAGE 1: LOGIN ----------------- */}
      {view === 'login' && (
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">
                <Activity size={28} className="animate-blink" />
              </div>
              <h1 className="login-title">OrganLink</h1>
              <p className="login-subtitle">Real-Time Transplant Coordination Network</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="hospitalId">Hospital Node ID</label>
                <select 
                  id="hospitalId"
                  className="input-field" 
                  value={loginForm.hospitalId}
                  onChange={(e) => setLoginForm({ ...loginForm, hospitalId: e.target.value })}
                  disabled={isAuthenticating}
                >
                  <option value="">Select Hospital Node</option>
                  {MOCK_HOSPITALS.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="staffId">Staff Identification ID</label>
                <input 
                  type="text" 
                  id="staffId"
                  placeholder="e.g. ST-4091" 
                  className="input-field"
                  value={loginForm.staffId}
                  onChange={(e) => setLoginForm({ ...loginForm, staffId: e.target.value })}
                  disabled={isAuthenticating}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Security Password</label>
                <input 
                  type="password" 
                  id="password"
                  placeholder="••••••••" 
                  className="input-field"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  disabled={isAuthenticating}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ marginTop: '28px' }}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <>
                    <span className="spinner-white"></span>
                    Authenticating Staff...
                  </>
                ) : (
                  "Authenticate Staff"
                )}
              </button>
            </form>

            <div className="login-note">
              Authorized Medical Personnel Only. Access is logged & audited in accordance with hospital network protocols.
            </div>
          </div>
        </div>
      )}

      {/* ----------------- CORE APPLICATION INTERFACE (LOGGED IN) ----------------- */}
      {view !== 'login' && (
        <div className="dashboard-layout">
          {/* Top Navigation Bar */}
          <header className="top-bar">
            <div className="brand" style={{ cursor: 'pointer' }} onClick={() => setView('dashboard')}>
              <div className="brand-logo">
                <Activity size={18} />
              </div>
              <span className="brand-name">OrganLink</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="hospital-badge">
                <Building2 size={14} className="text-primary-blue" />
                <span>{user?.hospitalId}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '4px' }}>({user?.staffId})</span>
              </div>

              <div className="sync-status">
                <span className="sync-dot animate-pulse-ring"></span>
                <span>Live Sync Active</span>
              </div>

              <button onClick={handleLogout} className="btn-secondary" title="Log Out">
                <LogOut size={14} />
                <span>Exit</span>
              </button>
            </div>
          </header>

          {/* Main Workspace */}
          <main className="main-content">
            
            {/* ----------------- PAGE 2: DASHBOARD ----------------- */}
            {view === 'dashboard' && (
              <>
                {/* Statistics Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-title">Active Coordinations</span>
                    <span className="stat-value">{totalActive}</span>
                    <span className="stat-meta">In-transit & Confirmed cases</span>
                  </div>

                  <div className="stat-card" style={{ borderLeft: '3px solid var(--status-red)' }}>
                    <span className="stat-title" style={{ color: 'var(--status-red)' }}>Critical Urgency</span>
                    <span className="stat-value" style={{ color: 'var(--status-red)' }}>{totalCritical}</span>
                    <span className="stat-meta">Viability remaining &lt; 15%</span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-title">Avg Transport Time</span>
                    <span className="stat-value">{avgHours} hrs</span>
                    <span className="stat-meta">Logistics-calculated duration</span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-title">Hospitals Connected</span>
                    <span className="stat-value">{totalHospitals}</span>
                    <span className="stat-meta">Active regional nodes</span>
                  </div>
                </div>

                {/* Filter and Control Row */}
                <div className="filter-bar">
                  <div className="filters-left">
                    <div className="search-wrapper">
                      <Search size={14} className="search-icon-svg" />
                      <input 
                        type="text" 
                        placeholder="Search organ, hospital, patient ID..." 
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <select 
                      className="filter-select"
                      value={organFilter}
                      onChange={(e) => setOrganFilter(e.target.value)}
                    >
                      <option value="All">All Organs</option>
                      <option value="Heart">Heart</option>
                      <option value="Kidney">Kidney</option>
                      <option value="Liver">Liver</option>
                      <option value="Lung">Lung</option>
                      <option value="Pancreas">Pancreas</option>
                      <option value="Cornea">Cornea</option>
                    </select>

                    <select 
                      className="sort-select"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="Urgency">Sort by: Urgency</option>
                      <option value="Time Remaining">Sort by: Time Remaining</option>
                      <option value="Distance">Sort by: Distance</option>
                      <option value="Organ Type">Sort by: Organ Type</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => setView('request')} 
                    className="btn-primary"
                    style={{ width: 'auto', padding: '10px 18px' }}
                  >
                    <Plus size={16} />
                    <span>Request Coordination</span>
                  </button>
                </div>

                {/* Grid List of Cards */}
                {filteredCoordinations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    No matching coordination records found.
                  </div>
                ) : (
                  <div className="coordination-grid">
                    {filteredCoordinations.map((item) => {
                      const urgency = calculateUrgency(item);
                      const isDelivered = item.status === 'Delivered';
                      
                      let cardBorderClass = 'card-stable';
                      let timerBgClass = 'stable';
                      if (urgency === 'Critical') {
                        cardBorderClass = 'card-critical';
                        timerBgClass = 'critical';
                      } else if (urgency === 'High') {
                        cardBorderClass = 'card-high';
                        timerBgClass = 'high';
                      }

                      return (
                        <div 
                          key={item.id} 
                          className={`coordination-card ${cardBorderClass}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleOpenDetail(item.id)}
                        >
                          {/* Card Header */}
                          <div className="card-header">
                            <div className="organ-info">
                              <div className="organ-icon-wrapper">
                                <RenderOrganIcon organ={item.organ} />
                              </div>
                              <div>
                                <div className="organ-name">{item.organ}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                  ID: {item.id}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <span className="blood-badge">{item.bloodGroup}</span>
                              <span className={`status-badge ${isDelivered ? 'badge-delivered' : item.status === 'Transport In Progress' ? 'badge-transport' : 'badge-confirmed'}`}>
                                {item.status}
                              </span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="card-body">
                            {/* Route Node Visualizer */}
                            <div className="route-info">
                              <div className="hospital-node donor">
                                <div className="node-label">Donor Hospital</div>
                                <div className="node-name" title={item.donorHospital}>
                                  {item.donorHospital}
                                </div>
                              </div>
                              
                              <div className="route-arrow">
                                {isDelivered ? (
                                  <CheckCircle2 size={16} style={{ color: 'var(--status-green)' }} />
                                ) : (
                                  <Truck size={16} className="animate-blink" style={{ color: 'var(--status-amber)' }} />
                                )}
                              </div>

                              <div className="hospital-node recipient">
                                <div className="node-label">Recipient Hospital</div>
                                <div className="node-name" title={item.recipientHospital}>
                                  {item.recipientHospital}
                                </div>
                              </div>
                            </div>

                            {/* Distance & Time details */}
                            <div className="meta-row">
                              <div className="meta-item">
                                <Navigation size={12} />
                                <span>{item.distance} km</span>
                              </div>
                              <div className="meta-item">
                                <Clock size={12} />
                                <span>Est. Transport: {item.transportTime}</span>
                              </div>
                            </div>

                            {/* Viability countdown block */}
                            <div className={`countdown-section ${timerBgClass}`}>
                              <span className="countdown-label">
                                {isDelivered ? 'Delivery Confirmation Complete' : 'Time Remaining to Non-Viability'}
                              </span>
                              <div className="viability-timer">
                                {isDelivered ? '--:--:--' : formatCountdown(item.timeRemaining)}
                              </div>
                            </div>

                            {/* Patient diagnosis card note */}
                            <div className="patient-note">
                              <User size={12} style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.patientNote}>
                                {item.patientNote}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ----------------- PAGE 2.5: DETAIL CASE VIEW & LIVE MAP TRACKER ----------------- */}
            {view === 'detail' && selectedCase && (() => {
              const urgency = calculateUrgency(selectedCase);
              const isDelivered = selectedCase.status === 'Delivered';
              
              // Resolve map coordinates
              const coordDonor = HOSPITAL_COORDINATES[selectedCase.donorHospital] || { x: 100, y: 100 };
              const coordRecipient = HOSPITAL_COORDINATES[selectedCase.recipientHospital] || { x: 500, y: 200 };
              const controlPoint = getControlPoint(coordDonor, coordRecipient);
              const ambCoord = getBezierPoint(selectedCase.progress || 0, coordDonor, controlPoint, coordRecipient);

              // Timeline completed stamps
              const isConfirmed = selectedCase.status === 'Match Confirmed' || selectedCase.status === 'Transport In Progress' || isDelivered;
              const isRetrieved = selectedCase.status === 'Transport In Progress' || isDelivered;
              const isDispatched = selectedCase.status === 'Transport In Progress' || isDelivered;
              const isInTransit = selectedCase.status === 'Transport In Progress' || isDelivered;

              let themeColor = 'var(--status-green)';
              let headerBadgeClass = 'badge-confirmed';
              if (urgency === 'Critical') {
                themeColor = 'var(--status-red)';
                headerBadgeClass = 'card-critical';
              } else if (urgency === 'High') {
                themeColor = 'var(--status-amber)';
                headerBadgeClass = 'card-high';
              }

              return (
                <div className="detail-view-container">
                  {/* Detail view header */}
                  <div className="detail-header-card">
                    <div className="detail-header-left">
                      <button onClick={() => setView('dashboard')} className="btn-secondary" style={{ padding: '8px 12px' }}>
                        <ArrowLeft size={16} />
                        <span>Dashboard</span>
                      </button>
                      <h2 className="detail-header-title">
                        <RenderOrganIcon organ={selectedCase.organ} />
                        <span>{selectedCase.organ} Case Details</span>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>
                          ID: {selectedCase.id}
                        </span>
                      </h2>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span className={`status-badge ${headerBadgeClass}`} style={{ borderLeft: 'none', padding: '6px 12px' }}>
                        Urgency: {urgency}
                      </span>
                      <span className={`status-badge ${isDelivered ? 'badge-delivered' : selectedCase.status === 'Transport In Progress' ? 'badge-transport' : 'badge-confirmed'}`} style={{ padding: '6px 12px' }}>
                        {selectedCase.status}
                      </span>
                    </div>
                  </div>

                  {/* Detail Grid */}
                  <div className="detail-grid">
                    {/* Left Column: Demographics & Stepper */}
                    <div className="detail-info-pane">
                      {/* Patient Details */}
                      <div className="detail-section-card">
                        <h3 className="detail-section-title">
                          <User size={16} />
                          <span>Recipient Patient Details</span>
                        </h3>
                        <div className="info-item-grid">
                          <div className="info-item">
                            <span className="info-item-label">Patient Demographics</span>
                            <span className="info-item-value">
                              {selectedCase.patientNote.split('—')[0].replace('Patient: ', '') || "Simulated Patient"}
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="info-item-label">Blood Group</span>
                            <span className="info-item-value">{selectedCase.bloodGroup}</span>
                          </div>
                          <div className="info-item" style={{ gridColumn: 'span 2' }}>
                            <span className="info-item-label">Attending Facility</span>
                            <span className="info-item-value">
                              {selectedCase.recipientHospital} ({selectedCase.recipientUnit || "ICU Ward 2"})
                            </span>
                          </div>
                          <div className="info-item" style={{ gridColumn: 'span 2' }}>
                            <span className="info-item-label">Clinical Indication / Diagnosis</span>
                            <span className="info-item-value" style={{ fontStyle: 'italic' }}>
                              {selectedCase.patientNote.split('—')[1] || "Urgent Transplant Indicated"}
                            </span>
                          </div>
                        </div>

                        {/* Priority score badge */}
                        <div className="score-container">
                          <div className="score-badge-circle">
                            {selectedCase.priorityScore || 92}
                          </div>
                          <div className="score-details">
                            <span className="score-label">Priority Matching Score</span>
                            <span className="score-disclaimer">Demo scoring model based on urgency & transport latency</span>
                          </div>
                        </div>
                      </div>

                      {/* Donor Details */}
                      <div className="detail-section-card">
                        <h3 className="detail-section-title">
                          <Building2 size={16} />
                          <span>Donor Organ Profile</span>
                        </h3>
                        <div className="info-item-grid">
                          <div className="info-item">
                            <span className="info-item-label">Donor Facility</span>
                            <span className="info-item-value">{selectedCase.donorHospital}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-item-label">Organ ID</span>
                            <span className="info-item-value">{selectedCase.organId || "ORG-MOCK"}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-item-label">Retrieval Time</span>
                            <span className="info-item-value">{selectedCase.retrievalTime}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-item-label">Preservation Method</span>
                            <span className="info-item-value" style={{ fontSize: '12px' }}>
                              {selectedCase.preservationMethod}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Coordination Timeline Stepper */}
                      <div className="detail-section-card">
                        <h3 className="detail-section-title">
                          <Layers size={16} />
                          <span>Logistics Timeline</span>
                        </h3>
                        <div className="timeline-list">
                          <div className={`timeline-step ${isConfirmed ? 'completed' : 'active'}`}>
                            <div className="timeline-bullet">
                              <CheckCircle2 size={14} />
                            </div>
                            <div className="timeline-content">
                              <span className="timeline-step-title">Match Confirmed</span>
                              <span className="timeline-step-time">System verification: Completed</span>
                            </div>
                          </div>

                          <div className={`timeline-step ${isRetrieved ? 'completed' : isConfirmed ? 'active' : 'upcoming'}`}>
                            <div className="timeline-bullet">
                              <Activity size={14} />
                            </div>
                            <div className="timeline-content">
                              <span className="timeline-step-title">Organ Retrieved</span>
                              <span className="timeline-step-time">
                                {isRetrieved ? `Completed at ${selectedCase.retrievalTime}` : 'Awaiting confirmation'}
                              </span>
                            </div>
                          </div>

                          <div className={`timeline-step ${isDispatched ? 'completed' : isRetrieved ? 'active' : 'upcoming'}`}>
                            <div className="timeline-bullet">
                              <Navigation size={14} />
                            </div>
                            <div className="timeline-content">
                              <span className="timeline-step-title">Transport Dispatched</span>
                              <span className="timeline-step-time">
                                {isDispatched ? 'Logistics courier engaged' : 'Awaiting dispatch trigger'}
                              </span>
                            </div>
                          </div>

                          <div className={`timeline-step ${isDelivered ? 'completed' : isInTransit ? 'active' : 'upcoming'}`}>
                            <div className="timeline-bullet">
                              <Truck size={14} />
                            </div>
                            <div className="timeline-content">
                              <span className="timeline-step-title">In Transit</span>
                              <span className="timeline-step-time">
                                {isDelivered ? 'Transit finalized' : isInTransit ? `En-route (Est: ${selectedCase.transportTime})` : 'Awaiting transit start'}
                              </span>
                            </div>
                          </div>

                          <div className={`timeline-step ${isDelivered ? 'completed' : 'upcoming'}`}>
                            <div className="timeline-bullet">
                              <ShieldCheck size={14} />
                            </div>
                            <div className="timeline-content">
                              <span className="timeline-step-title">Delivered</span>
                              <span className="timeline-step-time">
                                {isDelivered ? 'Received at facility OT' : 'Pending arrival'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Live GIS Map radar */}
                    <div className="gis-map-card">
                      <div className="gis-map-header">
                        <span className="gis-map-title">
                          <Navigation size={16} className="text-primary-blue" />
                          <span>Simulated Live GIS Transit Tracker</span>
                        </span>
                        
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 600 }}>
                          <span style={{ color: 'var(--text-muted)' }}>
                            Total Dist: <strong style={{ color: 'var(--text-main)' }}>{selectedCase.distance} km</strong>
                          </span>
                          <span style={{ color: themeColor }}>
                            {isDelivered ? 'Status: Delivered' : `Viability remaining: ${formatCountdown(selectedCase.timeRemaining)}`}
                          </span>
                        </div>
                      </div>

                      {/* Map Viewport */}
                      <div className="gis-map-viewport">
                        {/* Scanning radar line */}
                        <div className="gis-radar-line"></div>

                        {/* Telemetry HUD card overlay */}
                        <div className="gis-map-telemetry">
                          <div className="telemetry-row">
                            <span className="telemetry-label">Transit Progress:</span>
                            <span className="telemetry-value" style={{ color: isDelivered ? 'var(--status-green)' : '#38bdf8' }}>
                              {Math.round((selectedCase.progress || 0) * 100)}%
                            </span>
                          </div>
                          <div className="telemetry-row">
                            <span className="telemetry-label">Dist Remaining:</span>
                            <span className="telemetry-value">
                              {isDelivered ? '0.0' : (selectedCase.distance * (1 - (selectedCase.progress || 0))).toFixed(1)} km
                            </span>
                          </div>
                          <div className="telemetry-row">
                            <span className="telemetry-label">ETA Remaining:</span>
                            <span className="telemetry-value" style={{ color: 'var(--status-amber)' }}>
                              {getRemainingTimeText(selectedCase.transportTime, selectedCase.progress || 0)}
                            </span>
                          </div>
                        </div>

                        {/* Vector SVG Map elements */}
                        <svg className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }} viewBox="0 0 700 400">
                          {/* Grid outline borders */}
                          <rect x="5" y="5" width="690" height="390" fill="none" stroke="rgba(11, 79, 130, 0.2)" strokeWidth="1.5" />
                          
                          {/* City roads mockup path backgrounds (decorative) */}
                          <path d="M 50 100 L 200 150 L 300 100 L 500 150 L 650 100" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
                          <path d="M 100 300 L 250 200 L 400 350 L 550 200" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
                          <path d="M 380 20 L 380 380" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />
                          <path d="M 20 200 L 680 200" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />

                          {/* The active transport path */}
                          <path 
                            d={`M ${coordDonor.x} ${coordDonor.y} Q ${controlPoint.x} ${controlPoint.y} ${coordRecipient.x} ${coordRecipient.y}`} 
                            fill="none" 
                            stroke="#1e3a5f" 
                            strokeWidth="4" 
                            strokeLinecap="round"
                          />
                          <path 
                            d={`M ${coordDonor.x} ${coordDonor.y} Q ${controlPoint.x} ${controlPoint.y} ${coordRecipient.x} ${coordRecipient.y}`} 
                            fill="none" 
                            stroke="#38bdf8" 
                            strokeWidth="2" 
                            strokeDasharray="4 4" 
                            strokeLinecap="round"
                          />

                          {/* Donor Hospital Node (Source) */}
                          <g transform={`translate(${coordDonor.x}, ${coordDonor.y})`}>
                            <circle r="12" fill="rgba(11, 79, 130, 0.4)" stroke="var(--primary-blue)" strokeWidth="1.5" />
                            <circle r="4" fill="var(--primary-blue)" />
                            <text y="-18" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                              Donor Node
                            </text>
                            <text y="24" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">
                              {selectedCase.donorHospital.split(' ')[0]}
                            </text>
                          </g>

                          {/* Recipient Hospital Node (Destination) */}
                          <g transform={`translate(${coordRecipient.x}, ${coordRecipient.y})`}>
                            <circle r="12" fill="rgba(46, 139, 99, 0.3)" stroke="var(--status-green)" strokeWidth="1.5" className="animate-blink" />
                            <circle r="4" fill="var(--status-green)" />
                            <text y="-18" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                              Recipient Node
                            </text>
                            <text y="24" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">
                              {selectedCase.recipientHospital.split(' ')[0]}
                            </text>
                          </g>

                          {/* Ambulance Transport Indicator (Marker) */}
                          {!isDelivered && (
                            <g transform={`translate(${ambCoord.x}, ${ambCoord.y})`}>
                              <circle r="18" fill="rgba(217, 146, 42, 0.2)" stroke="var(--status-amber)" strokeWidth="1.5" className="animate-pulse-ring" />
                              <rect x="-8" y="-8" width="16" height="16" rx="3" fill="var(--status-amber)" />
                              <Truck size={10} className="text-white" style={{ position: 'absolute', transform: 'translate(-5px, -5px)' }} />
                            </g>
                          )}
                        </svg>

                        {/* Map legend */}
                        <div className="gis-legend">
                          <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: 'var(--primary-blue)' }}></span>
                            <span>Donor Source Node</span>
                          </div>
                          <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: 'var(--status-green)' }}></span>
                            <span>Recipient Destination Node</span>
                          </div>
                          <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: 'var(--status-amber)' }}></span>
                            <span>Ambulance Dispatch Tracker</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ----------------- PAGE 3: REQUEST COORDINATION FORM ----------------- */}
            {view === 'request' && (
              <div className="form-view-container">
                <div className="form-title-bar">
                  <h2 className="form-title">Initiate Match Confirmation</h2>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Logistics Step 1 of 2
                  </span>
                </div>

                <form onSubmit={handleRequestSubmit}>
                  <div className="form-group">
                    <label htmlFor="patientName">Patient Name (Simulated Demographic)</label>
                    <input 
                      type="text" 
                      id="patientName"
                      placeholder="e.g. Amit Sharma"
                      className="input-field"
                      value={requestForm.patientName}
                      onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label htmlFor="age">Patient Age</label>
                      <input 
                        type="number" 
                        id="age"
                        placeholder="e.g. 45"
                        className="input-field"
                        value={requestForm.age}
                        onChange={(e) => setRequestForm({ ...requestForm, age: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="bloodGroup">Blood Group Required</label>
                      <select 
                        id="bloodGroup"
                        className="input-field"
                        value={requestForm.bloodGroup}
                        onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label htmlFor="organType">Organ Type Needed</label>
                      <select 
                        id="organType"
                        className="input-field"
                        value={requestForm.organType}
                        onChange={(e) => setRequestForm({ ...requestForm, organType: e.target.value })}
                      >
                        <option value="Heart">Heart (~5h viability)</option>
                        <option value="Lung">Lung (~6h viability)</option>
                        <option value="Liver">Liver (~10h viability)</option>
                        <option value="Pancreas">Pancreas (~12h viability)</option>
                        <option value="Kidney">Kidney (~30h viability)</option>
                        <option value="Cornea">Cornea (~96h viability)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="urgencyLevel">Urgency Level</label>
                      <select 
                        id="urgencyLevel"
                        className="input-field"
                        value={requestForm.urgencyLevel}
                        onChange={(e) => setRequestForm({ ...requestForm, urgencyLevel: e.target.value })}
                      >
                        <option value="Critical">Critical Urgency</option>
                        <option value="High">High Urgency</option>
                        <option value="Stable">Stable Urgency</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="requestingHospital">Requesting Hospital Node</label>
                    <input 
                      type="text" 
                      id="requestingHospital"
                      className="input-field"
                      value={requestForm.requestingHospital}
                      disabled
                      style={{ backgroundColor: '#F1F5F9', color: '#64748B', cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      onClick={() => setView('dashboard')} 
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      style={{ width: 'auto' }}
                    >
                      Locate Compatible Donors
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ----------------- COMPATIBILITY VERIFICATION SCREEN ----------------- */}
            {view === 'request-loading' && (
              <div className="form-view-container">
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <div className="loading-text">Verifying Compatibility & Locating Donor Hospital...</div>
                  <div className="loading-subtext">
                    Cross-checking blood groups and calculating geographical routing matrix.
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- PAGE 3: CANDIDATE MATCHES LIST ----------------- */}
            {view === 'matches' && (
              <div className="form-view-container">
                <div className="form-title-bar">
                  <h2 className="form-title">Compatible Donor Nodes Found</h2>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Logistics Step 2 of 2
                  </span>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-main)' }}>
                    Transplant matching criteria: <strong>{requestForm.organType}</strong> for Patient blood group <strong>{requestForm.bloodGroup}</strong>.
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                    Matches represent donor hospitals containing compatible matches identified via regional allocation protocols. Ranked below by transport proximity.
                  </p>
                </div>

                <div className="matches-container">
                  {candidateMatches.map((candidate, idx) => (
                    <div 
                      key={candidate.hospital} 
                      className={`candidate-card ${idx === 0 ? 'recommended' : ''}`}
                    >
                      <div className="candidate-details">
                        {idx === 0 && (
                          <span className="candidate-badge-rec">
                            Recommended Route
                          </span>
                        )}
                        <span className="candidate-hospital">{candidate.hospital}</span>
                        <div className="candidate-meta" style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Navigation size={12} className="text-primary-blue" />
                            {candidate.distance} km
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} className="text-primary-blue" />
                            Est. Transport: {candidate.transportTime}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>
                            Donor Blood: {candidate.donorBg}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleConfirmDispatch(candidate)}
                        className="btn-primary"
                        style={{ width: 'auto', padding: '10px 14px', fontSize: '13px' }}
                      >
                        <span>Confirm & Dispatch</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="form-actions" style={{ marginTop: '32px' }}>
                  <button 
                    type="button" 
                    onClick={() => setView('request')} 
                    className="btn-secondary"
                  >
                    Back to Form
                  </button>
                </div>
              </div>
            )}

            {/* ----------------- DISPATCH CONFIRMATION LOADING ----------------- */}
            {view === 'confirming-loading' && (
              <div className="form-view-container">
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <div className="loading-text">Securing Node Allocation & Confirming Match...</div>
                  <div className="loading-subtext">
                    Broadcasting dispatch instructions to <strong>{selectedMatch?.hospital}</strong> transport logistics center.
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- DISPATCH SUCCESS SPLASH ----------------- */}
            {view === 'success-splash' && (
              <div className="form-view-container">
                <div className="success-card">
                  <div className="success-icon-wrapper">
                    <ShieldCheck size={36} />
                  </div>
                  <h2 className="success-title">Coordination Confirmed</h2>
                  <p className="success-desc">
                    Match confirmed with {selectedMatch?.hospital}. Transport dispatch sequence has initiated. Viability countdown tracking active.
                  </p>
                  <div className="sync-status" style={{ justifyContent: 'center', fontSize: '13px' }}>
                    <span className="sync-dot animate-pulse-ring"></span>
                    <span>Broadcasting live status coordinates to regional network</span>
                  </div>
                </div>
              </div>
            )}

          </main>

          {/* bottom Disclaimer footer */}
          <footer className="disclaimer-footer">
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <strong>Disclaimer:</strong> OrganLink coordinates transport logistics and tracking after a match is identified through existing clinical and national allocation systems (such as NOTTO/NOS). All hospital names, patient details, and records shown are simulated demo data for prototype purposes only.
            </div>
          </footer>
        </div>
      )}

      {/* Real-time AI Support Assistant Widget */}
      <ChatWidget 
        coordinations={coordinations} 
        calculateUrgency={calculateUrgency} 
        formatCountdown={formatCountdown} 
      />
    </div>
  );
}

/* ----------------- LOCAL CHAT ENGINE & COMPONENT ----------------- */

const generateLocalResponse = (question, coordinations, calculateUrgency, formatCountdown) => {
  const q = question.toLowerCase().trim();

  // 1. Specific Case ID Lookup (e.g., TX-901)
  const caseIdMatch = q.match(/tx-\d+/);
  if (caseIdMatch) {
    const caseId = caseIdMatch[0].toUpperCase();
    const item = coordinations.find(c => c.id.toUpperCase() === caseId);
    if (item) {
      const urgency = calculateUrgency(item);
      const isDelivered = item.status === 'Delivered';
      const timerText = isDelivered ? 'Arrived & Delivered' : formatCountdown(item.timeRemaining);
      return `Case ${caseId} (${item.organ}) is currently under status "${item.status}" with ${urgency} urgency. It is traveling from ${item.donorHospital} to ${item.recipientHospital} (${item.distance} km). Time remaining: ${timerText}.`;
    } else {
      return `I couldn't find an active case with ID ${caseId} in our in-memory records. Please check the ID (e.g. TX-901) and try again.`;
    }
  }

  // 2. Active critical cases query
  if (q.includes('critical') || q.includes('urgency') || q.includes('high priority')) {
    const criticalCases = coordinations.filter(c => calculateUrgency(c) === 'Critical' && c.status !== 'Delivered');
    if (criticalCases.length > 0) {
      const caseList = criticalCases.map(c => `${c.id} (${c.organ} at ${c.recipientHospital})`).join(', ');
      return `There are currently ${criticalCases.length} active critical cases in the system: ${caseList}. These require immediate transport priority.`;
    } else {
      return `Currently, there are no cases marked with Critical urgency on the active waitlist. All cases have stable viability times.`;
    }
  }

  // 3. Expiry queries
  if (q.includes('expiry') || q.includes('expire') || q.includes('viability time')) {
    const nearingExpiry = coordinations.filter(c => c.status !== 'Delivered' && (c.timeRemaining / c.viabilityLimit) < 0.40);
    if (nearingExpiry.length > 0) {
      const list = nearingExpiry.map(c => `${c.id} (${c.organ} - ${Math.round(c.timeRemaining / 60)}m viability remaining)`).join(', ');
      return `The following cases are nearing their viability limit (<40% remaining): ${list}. Please verify transit tracking status.`;
    } else {
      return `All active organ dispatches currently have a secure viability window (>40% of their limit remaining).`;
    }
  }

  // 4. Heuristics/Urgency Calculation
  if (q.includes('calculate') || q.includes('formula') || q.includes('score') || q.includes('heuristics')) {
    return `The matching priority score is calculated using three metrics: Medical Urgency (45% weight), Transport Feasibility (35% weight), and Blood Group Compatibility Fit (20% weight). Matches are automatically discarded if estimated transit duration exceeds the viability window.`;
  }

  // 5. General "How does it work"
  if (q.includes('how does') || q.includes('what is') || q.includes('about') || q.includes('support')) {
    return `OrganLink is a real-time coordination dashboard for hospital networks. It manages logistics, tracking, and mutual coordinator confirmation gates once an organ match is identified. Clinical matching is governed by regional transplant organizations.`;
  }

  // 6. Stats/Totals
  if (q.includes('active') || q.includes('count') || q.includes('how many')) {
    const active = coordinations.filter(c => c.status !== 'Delivered');
    const critical = coordinations.filter(c => calculateUrgency(c) === 'Critical' && c.status !== 'Delivered');
    return `There are currently ${active.length} active coordinations en-route, with ${critical.length} flagged at Critical urgency. A total of ${new Set(coordinations.flatMap(c => [c.donorHospital, c.recipientHospital])).size} hospital nodes are active in the network.`;
  }

  // Default Fallback
  return `I am the OrganLink Assistant. You can ask me to "Check status of TX-901", "Show active critical cases", "Which cases are nearing expiry?", or ask about our matching heuristic formulas.`;
};

function ChatWidget({ coordinations, calculateUrgency, formatCountdown }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello, I am the OrganLink Assistant. I can look up live case statuses, count active/critical matches, or explain our transport viability math. How can I assist you?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isRealAiEnabled = geminiKey && geminiKey !== '' && !geminiKey.startsWith('your_');

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    if (isRealAiEnabled) {
      try {
        const systemInstruction = `You are the OrganLink Assistant, a helpful and professional clinical logistics agent for a hospital transplant network.
Here is the current live network data in JSON format:
${JSON.stringify(coordinations, null, 2)}

Instructions:
1. If the user asks about specific case IDs (like TX-901), search this JSON data and answer precisely.
2. If the user asks about counts (like active cases, critical cases), compute it from this JSON data.
3. If they ask general questions about OrganLink or medical logistics, answer clearly based on the app's scope (OrganLink manages transit tracking and mutual confirmation gates, NOT clinical matching).
4. If they ask any other general questions outside OrganLink's scope, answer them politely and professionally using your general knowledge, but maintain your persona as the OrganLink Assistant.
5. Keep all responses concise (2-4 sentences) and professional.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemInstruction}\n\nUser Question: ${text}` }]
              }
            ]
          })
        });

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I encountered an issue processing that query. Please try again.";
        
        setIsTyping(false);
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: replyText,
          timestamp: new Date()
        }]);
      } catch (err) {
        console.error("Gemini API call failed, falling back to local engine:", err);
        const replyText = generateLocalResponse(text, coordinations, calculateUrgency, formatCountdown);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: `[API Error] ${replyText}`,
          timestamp: new Date()
        }]);
      }
    } else {
      setTimeout(() => {
        const replyText = generateLocalResponse(text, coordinations, calculateUrgency, formatCountdown);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: replyText,
          timestamp: new Date()
        }]);
      }, 1000);
    }
  };

  return (
    <div className="chat-widget-container">
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)} aria-label="Open support chat">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="sync-dot animate-pulse-ring" style={{ backgroundColor: isRealAiEnabled ? 'var(--status-green)' : 'var(--status-amber)', width: '8px', height: '8px' }}></div>
              <div>
                <div className="chat-header-title">OrganLink Assistant</div>
                <div className="chat-header-subtitle">{isRealAiEnabled ? 'Gemini 2.5-Flash Active' : 'Offline Logistics Mode'}</div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Close support chat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-msg ${m.sender}`}>
                {m.text}
              </div>
            ))}

            {isTyping && (
              <div className="chat-msg assistant">
                <div className="typing-indicator-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}

            {messages.length === 1 && !isTyping && (
              <div className="chat-quick-replies">
                <button className="chat-quick-reply-btn" onClick={() => handleSend('Check status of TX-901')}>
                  🔍 Check status of TX-901
                </button>
                <button className="chat-quick-reply-btn" onClick={() => handleSend('How is urgency score calculated?')}>
                  📊 How is urgency score calculated?
                </button>
                <button className="chat-quick-reply-btn" onClick={() => handleSend('Show active critical cases')}>
                  🚨 Show active critical cases
                </button>
              </div>
            )}

            {!isRealAiEnabled && (
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', backgroundColor: '#F1F5F9', padding: '8px', borderRadius: '8px', marginTop: 'auto', border: '1px solid var(--border-color)', lineHeight: '1.4' }}>
                🔑 <strong>Conversational AI Mode:</strong> Add your <code>VITE_GEMINI_API_KEY</code> in the local <code>.env</code> file to enable chat on any custom topic!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); handleSend(input); }}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Ask about active cases, viability limits..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
            />
            <button type="submit" className="chat-send-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

