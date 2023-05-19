const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    collection,
    getDocs,
    connectFirestoreEmulator,
    terminate,
} = require('firebase/firestore');
const fs = require('fs');

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

const exportData = async () => {
    try {
        const achievementsCollectionRef = collection(
            db,
            'games',
            'fallcrate',
            'achievements'
        );

        const snapshot = await getDocs(achievementsCollectionRef);
        const data = {};
        snapshot.forEach(doc => {
            data[doc.id] = doc.data();
        });

        fs.writeFileSync('./achievements-export.json', JSON.stringify(data, null, 2));

        console.log('Data exported successfully!');
    } catch (error) {
        console.error('Error exporting data:', error);
    } finally {
        await terminate(db); // Close the Firestore instance or it will hang in the terminal
    }
};

exportData();
