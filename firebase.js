// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDh3AgexQ7HVkDp1YtqFgvpPizVrHTuoGU",
    authDomain: "qrcode-d2c90.firebaseapp.com",
    projectId: "qrcode-d2c90",
    storageBucket: "qrcode-d2c90.firebasestorage.app",
    messagingSenderId: "308360169174",
    appId: "1:308360169174:web:4b6f3c82bcb5705a9beb77",
    measurementId: "G-CNRKP3PCJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);