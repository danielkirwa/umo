function loadUsersWithProtocolStatus(selectedStatus = "Not yet given") {
  console.log(selectedStatus);
  const enduserRef = firebase.database().ref("enduser");
  enduserRef.once('value', (snapshot) => {
    const tableBody = document.querySelector("#no-protocol-users tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    snapshot.forEach((userEmailSnap) => {
      const userEntries = userEmailSnap.val();

      for (let key in userEntries) {
        const user = userEntries[key];
        const protocol = (user.protocol || user.protocal || "").toLowerCase();

        if (protocol.includes(selectedStatus.toLowerCase())) {
          const fullName = `${user.firstName} ${user.lastName}`;
          const age = calculateAge(user.dateOfBirth);

          const row = document.createElement("tr");
          row.setAttribute("data-key", key);
          row.setAttribute("data-user-email", userEmailSnap.key);

          row.innerHTML = `
            <tr></tr>
            <td><a href="#" onclick="assignProtocol('${userEmailSnap.key}', '${key}')">${fullName} (Age: ${age})</a></td>
          `;

          tableBody.appendChild(row);
        }
      }
    });
  });
}
function updateUserCountsInDropdown() {
  const enduserRef = firebase.database().ref("enduser");
  const counts = {
    "Not yet given": 0,
    "Active": 0,
    "Completed": 0
  };

  enduserRef.once("value", (snapshot) => {
    snapshot.forEach((userEmailSnap) => {
      const userEntries = userEmailSnap.val();
      for (let key in userEntries) {
        const user = userEntries[key];
        const protocol = (user.protocol || user.protocal || "").toLowerCase();

        if (protocol.includes("not yet given".toLowerCase())) counts["Not yet given"]++;
        else if (protocol.includes("active")) counts["Active"]++;
        else if (protocol.includes("completed")) counts["Completed"]++;
      }
    });

    // Update the dropdown text
    const select = document.getElementById("user-type-select");
    Array.from(select.options).forEach(option => {
      const status = option.value;
      option.textContent = option.textContent.replace(/\s\d*$/, ''); // Remove previous count if any
      option.textContent += ` ${counts[status]}`;
    });
  });
}

// Default load
loadUsersWithProtocolStatus("Not yet given");
updateUserCountsInDropdown();


function calculateAge(dob) {
  const birthDate = new Date(dob);
  const ageDiff = Date.now() - birthDate.getTime();
  return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
}

document.getElementById("user-type-select").addEventListener("change", function() {
  const selectedValue = this.value;
  loadUsersWithProtocolStatus(selectedValue);
});


// Example handler when admin clicks to assign protocol
function assignProtocol(userEmailKey, endUserKey) {
  const url = `protocolchart.html?user=${encodeURIComponent(userEmailKey)}&enduser=${encodeURIComponent(endUserKey)}`;
  window.location.href = url; // You can also use window.open(url, "_blank") if you prefer a new tab
}

//loadUsersWithNoProtocol();

// selected user type filter 
 const selectElement = document.getElementById("user-type-select");
  const displayElement = document.getElementById("usertypefilter");

  // Load saved value on page load
  window.addEventListener("DOMContentLoaded", () => {
    const savedValue = localStorage.getItem("selectedUserType");
    if (savedValue) {
      selectElement.value = savedValue;
      //displayElement.textContent = savedValue;
    }
  });

  // Save and update value when changed
  selectElement.addEventListener("change", function () {
    const selectedValue = this.value;
    localStorage.setItem("selectedUserType", selectedValue);
   // displayElement.textContent = selectedValue;
  });



function logout(){
  // body...
  firebase.auth().signOut().then(function() {
  // Sign-out successful.
  window.location.href='../auth.html';
}).catch(function(error) {
  // An error happened.
  //myAlert(failed, "Failed to log out refresh and try again")
});
}

// check if user is authenticated
auth.onAuthStateChanged(function(user){
      if(user){
         email = user.email;
        //alert("Active user" + email);
         //usernamedisplay.innerHTML = email;
      }else{
        //alert("No Active user");
        window.location.href='../auth.html';
      }
    })