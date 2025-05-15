var success = "&#9989; Success";
var failed = "&#10060; Failed";
var warning = "&#10071; Warning";
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");
let usernamedisplay = document.getElementById('usernamedisplay');
hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("show");
});

// add new end user
  document.getElementById("add-user-form").addEventListener("submit", function (e) {
    e.preventDefault();

    // Get current logged-in user's email
    const user = firebase.auth().currentUser;
    if (!user) {
      alert("You must be logged in to add an end user.");
      return;
    }

    // Sanitize email
    const sanitizedEmail = user.email.replace(/\./g, "_dot_").replace(/@/g, "_at_");

    // Get form values
    const firstName = document.getElementById("child-first-name").value.trim();
    const lastName = document.getElementById("child-last-name").value.trim();
    const dob = document.getElementById("child-dob").value;
    const sex = document.getElementById("child-sex").value;

    const leftHanded = document.getElementById("left-handed").checked;
    const rightHanded = document.getElementById("right-handed").checked;

    const behaviorDesc = document.getElementById("behavior-desc").value.trim();

    // Create handedness string
    let handedness = "";
    if (leftHanded && rightHanded) handedness = "Both";
    else if (leftHanded) handedness = "Left";
    else if (rightHanded) handedness = "Right";
    else handedness = "Not specified";

    // Unique key for this end user
    const endUserKey = `${firstName}_${lastName}`.replace(/\s+/g, "_");

    // Prepare data
    const endUserData = {
      firstName,
      lastName,
      dateOfBirth: dob,
      sex,
      handedness,
      behaviorDescription: behaviorDesc,
      protocol: "Not yet given",
      createdAt: new Date().toISOString()
    };

    // Save to Realtime Database
    firebase.database().ref(`enduser/${sanitizedEmail}/${endUserKey}`).set(endUserData)
      .then(() => {
        //alert("End user added successfully!");
        document.getElementById("add-user-form").reset();
        closeModal(); // If you have a function to close modal
      })
      .catch((error) => {
        console.error("Error saving end user:", error);
        alert("Failed to save end user. Try again.");
      });
  });

// load protocal
  function endUserProtocal(key) {
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    alert("No authenticated user found.");
    return;
  }

  const sanitizedEmail = currentUser.email.replace(/\./g, "_dot_").replace(/@/g, "_at_");

  firebase.database().ref("enduser/" + sanitizedEmail + "/" + key).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        const fullName = data.firstName + " " + data.lastName;
        const age = calculateAge(data.dateOfBirth);
        const protocol = data.protocol;

        document.getElementById("train-name").innerText = fullName;
        document.getElementById("train-age").innerText = age;
        document.getElementById("train-protocol").innerText = protocol;
        document.getElementById("trainModal").style.display = "block";
      } else {
        alert("End user not found.");
      }
    })
    .catch(error => {
      console.error("Error fetching end user data:", error);
      alert("Failed to load training data.");
    });
}

function closeTrainModal() {
  document.getElementById("trainModal").style.display = "none";
}

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}



// load all my end users
  function loadEndUsers() {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("You must be logged in to view end users.");
    return;
  }

  const sanitizedEmail = user.email.replace(/\./g, "_dot_").replace(/@/g, "_at_");
  const enduserRef = firebase.database().ref(`enduser/${sanitizedEmail}`);

  enduserRef.on('value', (snapshot) => {
    const tableBody = document.querySelector("#enduser-table tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    snapshot.forEach((childSnapshot) => {
  const key = childSnapshot.key;
  const data = childSnapshot.val();

  const row = document.createElement("tr");
  row.setAttribute("data-key", key); // attach the key

  let newAge = `(${calculateAge(data.dateOfBirth)}) | Subscription ends on __ | Performed sessions _`;
  let listName = data.firstName + " " + data.lastName + " ";

  row.innerHTML = `
    <td>${listName + newAge}</td>
  `;

  // Make the row clickable
  row.addEventListener("click", function () {
  const selectedKey = this.getAttribute("data-key");
  const fullName = `${data.firstName}-${data.lastName}`.replace(/\s+/g, '');
  const userKey = sanitizedEmail;

  const url = `training.html?user=${userKey}&key=${selectedKey}`;
  window.location.href = url;
});

  document.querySelector("#enduser-table tbody").appendChild(row);
});

  });
}

// delete end user code
function deleteEndUser(key) {
  const user = firebase.auth().currentUser;
  const sanitizedEmail = user.email.replace(/\./g, "_dot_").replace(/@/g, "_at_");

  if (confirm("Are you sure you want to delete this end user?")) {
    firebase.database().ref(`enduser/${sanitizedEmail}/${key}`).remove()
      .then(() => alert("End user deleted successfully."))
      .catch((error) => alert("Failed to delete: " + error.message));
  }
}

// check logged in user

auth.onAuthStateChanged(function(user) {
  if (user) {
    const email = user.email;
    const userId = email.replace(/\./g, "_dot_").replace(/@/g, "_at_"); // use the same sanitization as during registration

    // Fetch the user data from Realtime Database
    firebase.database().ref("users/" + userId).once("value")
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const fullName = `${userData.firstName} ${userData.lastName}`;

          // Now display the full name
          usernamedisplay.innerHTML = fullName;
        } else {
          //console.log("User data not found in Realtime Database");
          myAlert(failed, "User data not found in Realtime Database.");

        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        //myAlert(failed, "Error fetching user data.");
      });
loadEndUsers();
  } else {
    // Not logged in
    window.location.href = 'auth.html';
  }
});

// pop up add user
 document.getElementById("add-user-btn").onclick = function () {
      document.getElementById("addUserModal").style.display = "block";
    }

    function closeModal() {
      document.getElementById("addUserModal").style.display = "none";
    }

    window.onclick = function (event) {
      let modal = document.getElementById("addUserModal");
      if (event.target === modal) {
        closeModal();
      }
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