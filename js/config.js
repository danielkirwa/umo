
const firebaseConfig = {
  apiKey: "AIzaSyDMFR4rgENh-1cy1hHIZmJvSLjiXy-Ytc4",
    authDomain: "umo1-3750d.firebaseapp.com",
    projectId: "umo1-3750d",
    databaseURL: "https://umo1-3750d-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "umo1-3750d.firebasestorage.app",
    messagingSenderId: "472764687247",
    appId: "1:472764687247:web:c1063ea7d766963472e1fa",
    measurementId: "G-ZP63SFJ4H2"

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