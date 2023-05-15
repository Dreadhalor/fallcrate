const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  connectFirestoreEmulator,
  terminate,
} = require('firebase/firestore');
const data = require('./achievements.json');
// console.log(data);

const config = {
  apiKey: 'AIzaSyCQ5KQFFuFYTRhqZD0U6o82ZbZE1QgLsGQ',
  authDomain: 'fallcrate-8ee30.firebaseapp.com',
  projectId: 'fallcrate-8ee30',
};

const app = initializeApp(config);
const db = getFirestore(app);

if (process.argv[2] !== '--prod') {
  // Connect to Firestore Emulator
  connectFirestoreEmulator(db, 'localhost', 8080);
}

const importData = async () => {
  try {
    const achievementsCollectionRef = collection(
      db,
      'games',
      'fallcrate',
      'achievements'
    );
    const promises = Object.keys(data).map(async (key) => {
      const docRef = doc(achievementsCollectionRef, key);
      await setDoc(docRef, data[key]);
    });
    await Promise.all(promises);
    console.log('Data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await terminate(db); // Close the Firestore instance or it will hang in the terminal
  }
};

importData();
