import { db, doc, setDoc, collection, getDocs, addDoc } from '../firebase';
import { rankCandidates } from './ranking';

export const MOCK_HOSPITALS = [
  {
    hospitalId: 'hosp_metro',
    name: 'Metro General Hospital',
    address: '550 1st Ave, New York, NY 10016',
    lat: 40.741895,
    lng: -73.974251,
    contactPhone: '+1 (555) 101-2001',
    coordinatorName: 'Dr. Sarah Jenkins'
  },
  {
    hospitalId: 'hosp_mercy',
    name: 'Mercy Health Center',
    address: '3400 Spruce St, Philadelphia, PA 19104',
    lat: 39.950796,
    lng: -75.193855,
    contactPhone: '+1 (555) 202-3002',
    coordinatorName: 'Dr. Marcus Vance'
  },
  {
    hospitalId: 'hosp_stjude',
    name: 'St. Jude Medical Center',
    address: '262 Danny Thomas Pl, Memphis, TN 38105',
    lat: 35.154388,
    lng: -90.038487,
    contactPhone: '+1 (555) 303-4003',
    coordinatorName: 'Dr. Allison Cameron'
  },
  {
    hospitalId: 'hosp_city_boston',
    name: 'City Medical Center Boston',
    address: '725 Albany St, Boston, MA 02118',
    lat: 42.335967,
    lng: -71.071562,
    contactPhone: '+1 (555) 404-5004',
    coordinatorName: 'Dr. Gregory House'
  },
  {
    hospitalId: 'hosp_valley_la',
    name: 'Valley Hospital LA',
    address: '10833 Le Conte Ave, Los Angeles, CA 90095',
    lat: 34.066078,
    lng: -118.445582,
    contactPhone: '+1 (555) 505-6006',
    coordinatorName: 'Dr. Miranda Bailey'
  },
  {
    hospitalId: 'hosp_univ_baltimore',
    name: 'University Research Hospital',
    address: '22 S Greene St, Baltimore, MD 21201',
    lat: 39.288287,
    lng: -76.623124,
    contactPhone: '+1 (555) 606-7007',
    coordinatorName: 'Dr. John Watson'
  }
];

export const MOCK_RECIPIENTS = [
  // Hearts (Time-critical, viability ~4-6h)
  {
    recipientId: 'rec_1',
    name: 'Patient Heart A+',
    hospitalId: 'hosp_mercy',
    hospitalName: 'Mercy Health Center',
    organNeeded: 'heart',
    bloodGroup: 'A+',
    urgencyScore: 92,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 30
  },
  {
    recipientId: 'rec_2',
    name: 'Patient Heart O-',
    hospitalId: 'hosp_city_boston',
    hospitalName: 'City Medical Center Boston',
    organNeeded: 'heart',
    bloodGroup: 'O-',
    urgencyScore: 85,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 5
  },
  {
    recipientId: 'rec_3',
    name: 'Patient Heart AB+',
    hospitalId: 'hosp_stjude',
    hospitalName: 'St. Jude Medical Center',
    organNeeded: 'heart',
    bloodGroup: 'AB+',
    urgencyScore: 98,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 12
  },
  // Kidneys (Less time-critical, viability ~24-36h)
  {
    recipientId: 'rec_4',
    name: 'Patient Kidney O+',
    hospitalId: 'hosp_metro',
    hospitalName: 'Metro General Hospital',
    organNeeded: 'kidney',
    bloodGroup: 'O+',
    urgencyScore: 74,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 90
  },
  {
    recipientId: 'rec_5',
    name: 'Patient Kidney A-',
    hospitalId: 'hosp_valley_la',
    hospitalName: 'Valley Hospital LA',
    organNeeded: 'kidney',
    bloodGroup: 'A-',
    urgencyScore: 95,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 15
  },
  {
    recipientId: 'rec_6',
    name: 'Patient Kidney B+',
    hospitalId: 'hosp_univ_baltimore',
    hospitalName: 'University Research Hospital',
    organNeeded: 'kidney',
    bloodGroup: 'B+',
    urgencyScore: 62,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 45
  },
  // Livers (Viability ~12-15h)
  {
    recipientId: 'rec_7',
    name: 'Patient Liver B-',
    hospitalId: 'hosp_city_boston',
    hospitalName: 'City Medical Center Boston',
    organNeeded: 'liver',
    bloodGroup: 'B-',
    urgencyScore: 89,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 20
  },
  {
    recipientId: 'rec_8',
    name: 'Patient Liver O+',
    hospitalId: 'hosp_mercy',
    hospitalName: 'Mercy Health Center',
    organNeeded: 'liver',
    bloodGroup: 'O+',
    urgencyScore: 81,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 8
  },
  {
    recipientId: 'rec_9',
    name: 'Patient Liver AB-',
    hospitalId: 'hosp_metro',
    hospitalName: 'Metro General Hospital',
    organNeeded: 'liver',
    bloodGroup: 'AB-',
    urgencyScore: 90,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 60
  },
  // Lungs (Viability ~6-8h)
  {
    recipientId: 'rec_10',
    name: 'Patient Lung O-',
    hospitalId: 'hosp_univ_baltimore',
    hospitalName: 'University Research Hospital',
    organNeeded: 'lung',
    bloodGroup: 'O-',
    urgencyScore: 88,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 3
  },
  {
    recipientId: 'rec_11',
    name: 'Patient Lung A+',
    hospitalId: 'hosp_stjude',
    hospitalName: 'St. Jude Medical Center',
    organNeeded: 'lung',
    bloodGroup: 'A+',
    urgencyScore: 76,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 40
  },
  {
    recipientId: 'rec_12',
    name: 'Patient Lung B+',
    hospitalId: 'hosp_valley_la',
    hospitalName: 'Valley Hospital LA',
    organNeeded: 'lung',
    bloodGroup: 'B+',
    urgencyScore: 83,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 14
  },
  // More Hearts
  {
    recipientId: 'rec_13',
    name: 'Patient Heart B+',
    hospitalId: 'hosp_metro',
    hospitalName: 'Metro General Hospital',
    organNeeded: 'heart',
    bloodGroup: 'B+',
    urgencyScore: 79,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 25
  },
  // More Kidneys
  {
    recipientId: 'rec_14',
    name: 'Patient Kidney AB+',
    hospitalId: 'hosp_univ_baltimore',
    hospitalName: 'University Research Hospital',
    organNeeded: 'kidney',
    bloodGroup: 'AB+',
    urgencyScore: 50,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 120
  },
  // More Lungs
  {
    recipientId: 'rec_15',
    name: 'Patient Lung O+',
    hospitalId: 'hosp_mercy',
    hospitalName: 'Mercy Health Center',
    organNeeded: 'lung',
    bloodGroup: 'O+',
    urgencyScore: 91,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 10
  }
];

export const seedDatabase = async () => {
  console.log('[Seeder] Starting database seed...');
  
  // 1. Seed Hospitals
  for (const hospital of MOCK_HOSPITALS) {
    await setDoc(doc(db, 'hospitals', hospital.hospitalId), hospital);
  }
  console.log(`[Seeder] Seeded ${MOCK_HOSPITALS.length} hospitals.`);

  // 2. Seed Recipients Waitlist
  for (const recipient of MOCK_RECIPIENTS) {
    await setDoc(doc(db, 'recipients', recipient.recipientId), recipient);
  }
  console.log(`[Seeder] Seeded ${MOCK_RECIPIENTS.length} recipients.`);

  // 3. Clear Active Cases
  if (localStorage.getItem('organlink_coll_cases')) {
    localStorage.setItem('organlink_coll_cases', JSON.stringify({}));
  }
  
  // 4. Seed Default Active Cases for Metro General Hospital (hosp_metro)
  const defaultCases = [
    {
      caseId: 'case_default_heart',
      organType: 'heart',
      bloodGroup: 'A+',
      donorHospitalId: 'hosp_metro',
      donorHospitalName: 'Metro General Hospital',
      viabilityHours: 6,
      status: 'matching',
      acceptedRecipientHospitalId: null,
      acceptedRecipientHospitalName: null,
      donorConfirmed: false,
      recipientConfirmed: false,
      contactRevealed: false,
      createdAt: Date.now() - 30 * 60 * 1000 // 30 mins ago
    },
    {
      caseId: 'case_default_kidney',
      organType: 'kidney',
      bloodGroup: 'O+',
      donorHospitalId: 'hosp_metro',
      donorHospitalName: 'Metro General Hospital',
      viabilityHours: 24,
      status: 'accepted',
      acceptedRecipientHospitalId: 'hosp_mercy',
      acceptedRecipientHospitalName: 'Mercy Health Center',
      donorConfirmed: false,
      recipientConfirmed: true,
      contactRevealed: false,
      createdAt: Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago
    }
  ];

  for (const c of defaultCases) {
    const donorHosp = MOCK_HOSPITALS.find(h => h.hospitalId === c.donorHospitalId);
    const donorOrg = {
      organType: c.organType,
      bloodGroup: c.bloodGroup,
      viabilityHours: c.viabilityHours,
      lat: donorHosp.lat,
      lng: donorHosp.lng
    };

    // Calculate ranked matches dynamically so the metrics are fully accurate
    const topCandidates = await rankCandidates(donorOrg, MOCK_RECIPIENTS, MOCK_HOSPITALS);
    
    c.rankedCandidates = topCandidates;
    c.viabilityExpiresAt = c.createdAt + (c.viabilityHours * 60 * 60 * 1000);

    // Save to DB
    await setDoc(doc(db, 'cases', c.caseId), c);
  }

  console.log('[Seeder] Seeded default active cases.');
  console.log('[Seeder] Seeding completed successfully!');
};
