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
    const achievementsCollectionRef = collection(db, 'games');
    const promises = await Promise.all(
      Object.keys(data).map(async (gameId) => {
        const gameAchievements = data[gameId];
        const achievementPromises = Object.keys(gameAchievements).map(
          async (achievementId) => {
            const docRef = doc(
              achievementsCollectionRef,
              gameId,
              'achievements',
              achievementId
            );
            const achievementData = data[gameId][achievementId];
            return await setDoc(docRef, achievementData);
          }
        );
        return await Promise.all(achievementPromises);
      })
    );

    await Promise.all(promises).then(() => {
      console.log('Data imported successfully!');
    });
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await terminate(db); // Close the Firestore instance or it will hang in the terminal
  }
};

importData();
