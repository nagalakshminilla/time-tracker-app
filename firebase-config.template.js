// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6N_wG10H3MNutyfGMSkUvxqZZKKYLZyo",
  authDomain: "time-tracker-app-12287.firebaseapp.com",
  projectId: "time-tracker-app-12287",
  storageBucket: "time-tracker-app-12287.firebasestorage.app",
  messagingSenderId: "73307257024",
  appId: "1:73307257024:web:e191b728f1870c1223d525",
  measurementId: "G-2X1LF6BNJM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);