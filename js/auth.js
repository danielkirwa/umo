var success = "&#9989; Success";
var failed = "&#10060; Failed";
var warning = "&#10071; Warning";
let btnregister = document.getElementById('btnregister');
  // Toggle between login and register forms
    function toggleForm(formType) {
      const loginForm = document.getElementById('login-form');
      const registerForm = document.getElementById('register-form');

      if (formType === 'register') {
        localStorage.setItem("authPage", "1");
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
      } else {
        localStorage.setItem("authPage", "0");
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
      }
    }
  
  window.addEventListener("DOMContentLoaded", function autoRunOnLoad() {
    const authPage = localStorage.getItem("authPage");
    if (authPage === "1") {
      toggleForm("register");
    } else {
      toggleForm("login");
    }
  });

    function iforgotpassword(){
      window.location.href = 'reset.html';
    }

    // Login function
   let btnlogin = document.getElementById('btnlogin');
let fillerror, fillerror1, fillerror2;

btnlogin.addEventListener('click', () => {
  let username = document.getElementById('login-email').value.trim(); // Assuming email input
  let userpassword = document.getElementById('login-password').value;

  if (username === "" || userpassword === "") {
    fillerror1 = username === "" ? " Enter Email" : "";
    fillerror2 = userpassword === "" ? " Enter Password" : "";
    fillerror = 'Ensure that you:' + fillerror1 + fillerror2;
    myAlert(warning, fillerror); // Your custom alert system
  } else {
    btnlogin.innerHTML = "Please wait...";

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => {
        return firebase.auth().signInWithEmailAndPassword(username, userpassword);
      })
      .then((userCredential) => {
        // Save session (if needed)
        localStorage.setItem("userEmail", username);

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        const WrongPasswordError = 'The password is invalid or the user does not have a password.';
        const NoUserError = 'There is no user record corresponding to this identifier. The user may have been deleted.';
        const errorMsg = error.message;

        if (errorMsg === NoUserError || errorMsg === WrongPasswordError) {
          myAlert(failed, "Check your credentials and try again");
        } else {
          myAlert(failed, "An error occurred. Try again.");
        }

        btnlogin.innerHTML = "Login Now";
      });
  }
});




    // Register function
  function sanitizeEmail(email) {
    return email.replace(/\./g, "_dot_").replace(/@/g, "_at_");
  }

  function register() {
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const dob = document.getElementById("dob").value;
    const address = document.getElementById("address").value.trim();
    const errorDiv = document.getElementById("register-error");

    errorDiv.textContent = "";

    if (!email || !password || !confirmPassword || !firstName || !lastName || !phone || !dob || !address) {
      //errorDiv.textContent = "Please fill out all fields.";
       myAlert(failed,"Please fill out all fields.")
      return;
    }

    if (password !== confirmPassword) {
     
       myAlert(failed,"Passwords do not match")
      return;
    }

  auth.createUserWithEmailAndPassword(email, password)
  .then(userCredential => {
    const userId = sanitizeEmail(email);
    return firebase.database().ref("users/" + userId).set({
      firstName,
      lastName,
      phone,
      dob,
      address,
      email,
      createdAt: new Date().toISOString()
    });
  })
  .then(() => {
    myAlert(success, "Registration done");
    localStorage.setItem("authPage", "0");
    window.location.href = 'auth.html';
  })
  .catch(error => {
    myAlert(success, error.message);
  });

  }



btnregister.addEventListener('click', () =>{
register();
  
})



// alert
function myAlert(title,message) {
  var alertBox = document.getElementById("alertBox");
  var alertTitle = document.getElementById("alertTitle");
  var alertMessage = document.getElementById("alertMessage");
  
  alertTitle.innerHTML = title;
  alertMessage.innerHTML = message;
  alertBox.style.display = "block";
}

function hideAlert() {
  var alertBox = document.getElementById("alertBox");
  alertBox.style.display = "none";
}