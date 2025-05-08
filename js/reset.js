var success = "&#9989; Success";
var failed = "&#10060; Failed";
var warning = "&#10071; Warning";
const mailField = document.getElementById('login-email');
const labels = document.getElementById('lbreset');
const btnreset = document.getElementById('btnreset');


//auth.languageCode = 'DE_de';

auth.useDeviceLanguage();

const resetPasswordFunction = () => {
    const email = mailField.value;

    auth.sendPasswordResetEmail(email)
    .then(() => {
        myAlert(success, "<b style=\"color:greed;\">Reset link have been successfully sent to the email below check your inbox and  follow instruction</b>" + email);
        mailField.value = "";
    })
    .catch(error => {
        let message = error.message;
        myAlert(failed, message)
        mailField.value = "";
    })
}


btnreset.addEventListener('click', resetPasswordFunction);

//Animations
mailField.addEventListener('focus', () => {
    labels.item(0).className = "focused-field";
});

mailField.addEventListener('blur', () => {
    if(!mailField.value)
        labels.item(0).className = "unfocused-field";
});

// auht page set up 
function authPageRegister(){
    localStorage.setItem("authPage", "1");
}

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
