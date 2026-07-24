import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as firebaseSignIn, 
  createUserWithEmailAndPassword as firebaseCreateUser,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuth,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  doc as firebaseDoc, 
  collection as firebaseCollection, 
  getDoc as firebaseGetDoc, 
  getDocs as firebaseGetDocs, 
  addDoc as firebaseAddDoc, 
  setDoc as firebaseSetDoc, 
  updateDoc as firebaseUpdateDoc, 
  query as firebaseQuery, 
  where as firebaseWhere, 
  onSnapshot as firebaseOnSnapshot,
  orderBy as firebaseOrderBy,
  limit as firebaseLimit
} from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isFirebaseConfigured = apiKey && apiKey !== '' && !apiKey.startsWith('your_');

let authInstance;
let dbInstance;
let useMock = !isFirebaseConfigured;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);

    setPersistence(authInstance, browserLocalPersistence).catch((err) => {
      console.warn("Firebase Auth persistence error:", err);
    });
  } catch (error) {
    console.error("Failed to initialize real Firebase, falling back to mock:", error);
    useMock = true;
  }
}

console.log(`[OrganLink DB] Using ${useMock ? 'SIMULATED LOCAL STORAGE' : 'REAL FIREBASE'} Mode`);

// --- REAL-TIME CUSTOM EVENT BUS FOR MOCK MODE ---
const mockDbListeners = new Set();
const notifyMockDbChange = (collectionName) => {
  // Notify other tabs
  localStorage.setItem('organlink_db_sync_trigger', `${collectionName}_${Date.now()}`);
  // Notify current tab
  mockDbListeners.forEach(listener => listener(collectionName));
};

window.addEventListener('storage', (e) => {
  if (e.key === 'organlink_db_sync_trigger') {
    const val = e.newValue || '';
    const collectionName = val.split('_')[0];
    mockDbListeners.forEach(listener => listener(collectionName));
  }
});

// --- HELPER STORAGE UTILITIES FOR MOCK MODE ---
const getStorageCollection = (name) => {
  const data = localStorage.getItem(`organlink_coll_${name}`);
  return data ? JSON.parse(data) : {};
};

const saveStorageCollection = (name, data) => {
  localStorage.setItem(`organlink_coll_${name}`, JSON.stringify(data));
  notifyMockDbChange(name);
};

// --- MOCK IMPLEMENTATIONS ---
const mockAuth = {
  currentUser: null
};

// Listeners for Auth state change in mock mode
const authListeners = new Set();
const triggerAuthStateChanged = (user) => {
  mockAuth.currentUser = user;
  authListeners.forEach(cb => cb(user));
};

// Initialize auth state from local storage on startup
if (useMock) {
  const cachedUid = localStorage.getItem('organlink_auth_uid');
  if (cachedUid) {
    const users = getStorageCollection('users');
    const userProfile = users[cachedUid];
    if (userProfile) {
      mockAuth.currentUser = { uid: cachedUid, email: userProfile.email, ...userProfile };
    }
  }
}

// Exportable Firebase Interface Wrappers
export const auth = useMock ? mockAuth : authInstance;
export const db = useMock ? {} : dbInstance;
export const isUsingMock = useMock;

export const signInWithEmailAndPassword = async (authObj, email, password) => {
  if (!useMock) {
    return firebaseSignIn(authInstance, email, password);
  }
  
  const users = getStorageCollection('users');
  let userEntry = Object.values(users).find(u => u.email === email);
  
  if (!userEntry) {
    // Auto-provision user on the fly if email doesn't exist
    const uid = 'user_' + Math.random().toString(36).substr(2, 9);
    const isRecipient = email.toLowerCase().includes('recipient');
    
    userEntry = {
      uid,
      email,
      password,
      role: isRecipient ? 'recipient' : 'donor',
      hospitalId: isRecipient ? 'hosp_mercy' : 'hosp_metro',
      hospitalName: isRecipient ? 'Mercy Health Center' : 'Metro General Hospital',
      name: isRecipient ? 'Dr. Demo Recipient' : 'Dr. Demo Donor',
      phone: isRecipient ? '+1 (555) 202-3002' : '+1 (555) 101-2001',
      createdAt: Date.now()
    };
    
    users[uid] = userEntry;
    saveStorageCollection('users', users);
    console.log(`[OrganLink DB] Auto-provisioned user: ${email}`);
  } else if (userEntry.password !== password) {
    // If user exists but typed a different password, update password to what they typed
    userEntry.password = password;
    users[userEntry.uid] = userEntry;
    saveStorageCollection('users', users);
    console.log(`[OrganLink DB] Auto-aligned password for: ${email}`);
  }
  
  const user = { uid: userEntry.uid, email: userEntry.email, ...userEntry };
  localStorage.setItem('organlink_auth_uid', user.uid);
  triggerAuthStateChanged(user);
  return { user };
};

export const createUserWithEmailAndPassword = async (authObj, email, password) => {
  if (!useMock) {
    return firebaseCreateUser(authInstance, email, password);
  }

  const users = getStorageCollection('users');
  const userEntry = Object.values(users).find(u => u.email === email);
  if (userEntry) {
    throw new Error("auth/email-already-in-use: Email already registered.");
  }

  const uid = 'user_' + Math.random().toString(36).substr(2, 9);
  const newUser = { uid, email, password };
  users[uid] = newUser;
  saveStorageCollection('users', users);
  
  const user = { uid, email };
  localStorage.setItem('organlink_auth_uid', uid);
  triggerAuthStateChanged(user);
  return { user };
};

export const signOut = async (authObj) => {
  if (!useMock) {
    return firebaseSignOut(authInstance);
  }
  localStorage.removeItem('organlink_auth_uid');
  triggerAuthStateChanged(null);
};

export const onAuthStateChanged = (authObj, callback) => {
  if (!useMock) {
    return firebaseOnAuth(authInstance, callback);
  }
  authListeners.add(callback);
  // Trigger callback with current user immediately
  callback(mockAuth.currentUser);
  return () => {
    authListeners.delete(callback);
  };
};

// --- FIRESTORE WRAPPERS ---

export const doc = (dbRef, collectionName, docId) => {
  if (!useMock) return firebaseDoc(dbInstance, collectionName, docId);
  return { type: 'doc', collection: collectionName, id: docId };
};

export const collection = (dbRef, collectionName) => {
  if (!useMock) return firebaseCollection(dbInstance, collectionName);
  return { type: 'collection', collection: collectionName };
};

export const query = (collectionRef, ...constraints) => {
  if (!useMock) return firebaseQuery(collectionRef, ...constraints);
  return { type: 'query', collection: collectionRef.collection, constraints };
};

// Firestore constraints mockup
export const where = (field, op, val) => {
  if (!useMock) return firebaseWhere(field, op, val);
  return { type: 'where', field, op, val };
};

export const orderBy = (field, dir = 'asc') => {
  if (!useMock) return firebaseOrderBy(field, dir);
  return { type: 'orderBy', field, dir };
};

export const limit = (n) => {
  if (!useMock) return firebaseLimit(n);
  return { type: 'limit', value: n };
};

export const getDoc = async (docRef) => {
  if (!useMock) return firebaseGetDoc(docRef);
  
  const collectionData = getStorageCollection(docRef.collection);
  const data = collectionData[docRef.id];
  return {
    exists: () => !!data,
    data: () => data,
    id: docRef.id
  };
};

export const getDocs = async (queryOrCollectionRef) => {
  if (!useMock) return firebaseGetDocs(queryOrCollectionRef);

  const collectionName = queryOrCollectionRef.collection;
  const collectionData = getStorageCollection(collectionName);
  let docs = Object.values(collectionData);

  // Apply query filters if it's a query
  if (queryOrCollectionRef.type === 'query') {
    const constraints = queryOrCollectionRef.constraints || [];
    for (const c of constraints) {
      if (c.type === 'where') {
        docs = docs.filter(docItem => {
          const itemVal = docItem[c.field];
          if (c.op === '==') return itemVal === c.val;
          if (c.op === '!=') return itemVal !== c.val;
          if (c.op === 'in') return Array.isArray(c.val) && c.val.includes(itemVal);
          // Simple fallbacks for range filters if needed
          if (c.op === '>=') return itemVal >= c.val;
          if (c.op === '<=') return itemVal <= c.val;
          return true;
        });
      }
    }
  }

  return {
    docs: docs.map(d => ({
      data: () => d,
      id: d.id || d.uid || d.recipientId || d.caseId || d.hospitalId
    })),
    empty: docs.length === 0,
    size: docs.length
  };
};

export const addDoc = async (collectionRef, data) => {
  if (!useMock) return firebaseAddDoc(collectionRef, data);

  const collectionName = collectionRef.collection;
  const collectionData = getStorageCollection(collectionName);
  const newId = 'doc_' + Math.random().toString(36).substr(2, 9);
  const newDoc = { ...data, id: newId, createdAt: Date.now() };
  
  // Custom case / user logic
  if (collectionName === 'cases') newDoc.caseId = newId;
  if (collectionName === 'recipients') newDoc.recipientId = newId;
  if (collectionName === 'hospitals') newDoc.hospitalId = newId;

  collectionData[newId] = newDoc;
  saveStorageCollection(collectionName, collectionData);
  return { id: newId };
};

export const setDoc = async (docRef, data, options = {}) => {
  if (!useMock) return firebaseSetDoc(docRef, data, options);

  const collectionName = docRef.collection;
  const docId = docRef.id;
  const collectionData = getStorageCollection(collectionName);
  
  let mergedData = data;
  if (options.merge && collectionData[docId]) {
    mergedData = { ...collectionData[docId], ...data };
  }

  // Ensure ID fields are matching
  if (collectionName === 'users') mergedData.uid = docId;
  if (collectionName === 'cases') mergedData.caseId = docId;

  collectionData[docId] = mergedData;
  saveStorageCollection(collectionName, collectionData);
};

export const updateDoc = async (docRef, data) => {
  if (!useMock) return firebaseUpdateDoc(docRef, data);

  const collectionName = docRef.collection;
  const docId = docRef.id;
  const collectionData = getStorageCollection(collectionName);

  if (!collectionData[docId]) {
    throw new Error(`Document not found: ${collectionName}/${docId}`);
  }

  collectionData[docId] = { ...collectionData[docId], ...data };
  saveStorageCollection(collectionName, collectionData);
};

export const onSnapshot = (queryOrDocRef, callback) => {
  if (!useMock) return firebaseOnSnapshot(queryOrDocRef, callback);

  const triggerUpdate = async () => {
    if (queryOrDocRef.type === 'doc') {
      const snap = await getDoc(queryOrDocRef);
      callback(snap);
    } else {
      const snap = await getDocs(queryOrDocRef);
      callback(snap);
    }
  };

  // Run immediately
  triggerUpdate();

  // Register listener for database updates
  const dbListener = (updatedCollection) => {
    if (updatedCollection === queryOrDocRef.collection) {
      triggerUpdate();
    }
  };
  mockDbListeners.add(dbListener);

  // Return unsubscribe
  return () => {
    mockDbListeners.delete(dbListener);
  };
};
