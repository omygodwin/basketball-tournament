import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

const firebaseConfig = {
  apiKey:            "AIzaSyDteMx6A0f0jf0peeAvEMWTMvUVPOCYynA",
  authDomain:        "roseruthclinic.firebaseapp.com",
  databaseURL:       "https://roseruthclinic-default-rtdb.firebaseio.com",
  projectId:         "roseruthclinic",
  storageBucket:     "roseruthclinic.firebasestorage.app",
  messagingSenderId: "739476924225",
  appId:             "1:739476924225:web:9777db16912272a95ba3c0",
  measurementId:     "G-WW7QMN54D3"
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  console.error('Firebase init error:', e);
}

export const resultsRef = db ? ref(db, 'tournament/results') : null;
export { db, onValue, set };
