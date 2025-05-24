import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Add this import

const firebaseConfig = {
    apiKey: "AIzaSyCoOw8s4mD541LGgT4n7idQHgyY2is3BIk",
    authDomain: "task-planner-75366.firebaseapp.com",
    projectId: "task-planner-75366",
    storageBucket: "task-planner-75366.firebasestorage.app",
    messagingSenderId: "603927987249",
    appId: "1:603927987249:web:0b8c0164cc612e68630110",
    measurementId: "G-8XPQLRVRY8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
const db = getFirestore(app); 

export { auth, db }; 
export default app;