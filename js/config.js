
const firebaseConfig = {
  apiKey: "AIzaSyCiEna14ln6wb0SyBP_PoigtFLY8BCt53M",
  authDomain: "umoapp-56692.firebaseapp.com",
  projectId: "umoapp-56692",
  databaseURL: "https://umoapp-56692-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "umoapp-56692.firebasestorage.app",
  messagingSenderId: "607388353425",
  appId: "1:607388353425:web:69ead4b55a6654ddd59030",
  measurementId: "G-RW318E5EMP"
};

// Initialize Firebase
   firebase.initializeApp(firebaseConfig);
   const auth = firebase.auth();
   
function logout(){
  // body...
  firebase.auth().signOut().then(function() {
  // Sign-out successful.
  window.location.href='index.html';
}).catch(function(error) {
  // An error happened.
  //myAlert(failed, "Failed to log out refresh and try again")
});
}