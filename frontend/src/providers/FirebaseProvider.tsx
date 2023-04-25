import { FirebaseAppProvider } from 'reactfire';
import { getStorage, connectStorageEmulator } from 'firebase/storage'; // Firebase v9+\
// import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { StorageProvider, useFirebaseApp } from 'reactfire';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCQ5KQFFuFYTRhqZD0U6o82ZbZE1QgLsGQ',
  authDomain: 'fallcrate-8ee30.firebaseapp.com',
  projectId: 'fallcrate-8ee30',
  storageBucket: 'fallcrate-8ee30.appspot.com',
  messagingSenderId: '1024715562189',
  appId: '1:1024715562189:web:63664db55b61d66fe39d84',
  measurementId: 'G-4QJPNN8VCG',
};

type Props = {
  children: React.ReactNode;
};

function FirebaseComponents({ children }: Props) {
  const app = useFirebaseApp();
  const storage = getStorage(app);
  // const db = getFirestore(app);

  if (location.hostname === 'localhost') {
    // Point to the emulators running on localhost.
    connectStorageEmulator(storage, 'localhost', 9199);
    // connectFirestoreEmulator(db, 'localhost', 8080);
  }

  return <StorageProvider sdk={storage}>{children}</StorageProvider>;
}

const FirebaseProvider = ({ children }: Props) => {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <FirebaseComponents>{children}</FirebaseComponents>
    </FirebaseAppProvider>
  );
};

export default FirebaseProvider;
