import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signInWithEmailAndPassword as dbSignIn,
  createUserWithEmailAndPassword as dbSignUp,
  signOut as dbSignOut,
  doc,
  getDoc,
  setDoc,
  isUsingMock
} from '../firebase';
import { seedDatabase } from '../utils/seeder';

const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Self-healing: auto-seed database on startup if empty in mock mode
    if (isUsingMock) {
      const hospitals = localStorage.getItem('organlink_coll_hospitals');
      if (!hospitals || hospitals === '{}') {
        console.log('[AuthContext] Mock database is empty. Auto-seeding...');
        seedDatabase().catch(err => console.error("Auto-seeding error:", err));
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Retrieve user profile from users collection in Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userDoc.data()
            });
          } else {
            // Profile document doesn't exist yet, setting minimal state
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email
            });
          }
        } catch (error) {
          console.error("Error retrieving user profile:", error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const res = await dbSignIn(auth, email, password);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signUp = async (email, password, name, phone, role, hospitalId, hospitalName) => {
    setLoading(true);
    try {
      const res = await dbSignUp(auth, email, password);
      const uid = res.user.uid;
      
      const userProfile = {
        uid,
        email,
        name,
        phone,
        role, // 'donor' or 'recipient'
        hospitalId,
        hospitalName,
        createdAt: Date.now()
      };

      // Write user profile to Firestore
      await setDoc(doc(db, 'users', uid), userProfile);
      
      setUser(userProfile);
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    await dbSignOut(auth);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
