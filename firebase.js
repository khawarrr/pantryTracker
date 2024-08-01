// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB03kEM_VRqAA8BZ6eeVLMYqBKh_EX_CX4",
  authDomain: "inventory-management-10e9b.firebaseapp.com",
  projectId: "inventory-management-10e9b",
  storageBucket: "inventory-management-10e9b.appspot.com",
  messagingSenderId: "34318785622",
  appId: "1:34318785622:web:f66c3777e638a74b9f6ff7",
  measurementId: "G-1EHZ1QZ8HT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { firestore };
