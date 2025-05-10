import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCoOw8s4mD541LGgT4n7idQHgyY2is3BIk",
    authDomain: "task-planner-75366.firebaseapp.com",
    projectId: "task-planner-75366",
    storageBucket: "task-planner-75366.firebasestorage.app",
    messagingSenderId: "603927987249",
    appId: "1:603927987249:web:0b8c0164cc612e68630110",
    measurementId: "G-8XPQLRVRY8"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };
export default app;
