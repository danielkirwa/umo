let loadedUsers = []; // for search
let savedValue = "Not yet given";

// Load users by protocol status
function loadUsersWithProtocolStatus(selectedStatus = "Not yet given") {
  const enduserRef = firebase.database().ref("enduser");
  enduserRef.once('value', (snapshot) => {
    const tableBody = document.querySelector("#no-protocol-users tbody");
    tableBody.innerHTML = "";
    loadedUsers = [];

    snapshot.forEach((userEmailSnap) => {
      const userEntries = userEmailSnap.val();

      for (let key in userEntries) {
        const user = userEntries[key];
        const protocol = (user.protocol || user.protocal || "").toLowerCase();

        if (protocol.includes(selectedStatus.toLowerCase())) {
          const fullName = `${user.firstName} ${user.lastName}`;
          const age = calculateAge(user.dateOfBirth);

          loadedUsers.push({
            key,
            emailKey: userEmailSnap.key,
            fullName,
            age
          });
        }
      }
    });

    renderUsers(loadedUsers);
  });
}

// Render filtered users
function renderUsers(usersToDisplay) {
  const tableBody = document.querySelector("#no-protocol-users tbody");
  tableBody.innerHTML = "";

  usersToDisplay.forEach(user => {
    const row = document.createElement("tr");
    row.setAttribute("data-key", user.key);
    row.setAttribute("data-user-email", user.emailKey);

    row.innerHTML = `
      <td><a href="#" onclick="assignProtocol('${user.emailKey}', '${user.key}')">${user.fullName} (Age: ${user.age})</a></td>
    `;

    tableBody.appendChild(row);
  });
}

// Search functionality
document.getElementById("user-search2").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const filteredUsers = loadedUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm)
  );
  renderUsers(filteredUsers);
});

// Dropdown event
document.getElementById("user-type-select").addEventListener("change", function () {
  const selectedValue = this.value;
  localStorage.setItem("selectedUserType", selectedValue);
  loadUsersWithProtocolStatus(selectedValue);
});

// Load selected filter from local storage on page load
window.addEventListener("DOMContentLoaded", () => {
  const selectElement = document.getElementById("user-type-select");
  const savedValue = localStorage.getItem("selectedUserType");

  if (savedValue && selectElement) {
    selectElement.value = savedValue;
    loadUsersWithProtocolStatus(savedValue);
  } else {
    loadUsersWithProtocolStatus("Not yet given");
  }

  updateUserCountsInDropdown();
});

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const ageDiff = Date.now() - birthDate.getTime();
  return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
}

function assignProtocol(userEmailKey, endUserKey) {
  const url = `protocolchart.html?user=${encodeURIComponent(userEmailKey)}&enduser=${encodeURIComponent(endUserKey)}`;
  window.location.href = url;
}

// Update dropdown counts
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

        if (protocol.includes("not yet given")) counts["Not yet given"]++;
        else if (protocol.includes("active")) counts["Active"]++;
        else if (protocol.includes("completed")) counts["Completed"]++;
      }
    });

    const select = document.getElementById("user-type-select");
    Array.from(select.options).forEach(option => {
      const status = option.value;
      option.textContent = option.textContent.replace(/\s\d*$/, ''); // Clear old counts
      option.textContent += ` (${counts[status]})`;
    });
  });
}

// Authentication check
auth.onAuthStateChanged(function(user) {
  if (user) {
    const email = user.email;
    const sanitizedEmail = sanitizeEmail(email);
    firebase.database().ref("users/" + sanitizedEmail + "/Role").once("value")
      .then((snapshot) => {
        const role = snapshot.val();
        if (role === "Admin") {
          // allow access
        } else if (role === "Assignee") {
          window.location.href = "../dashboard.html";
        } else {
          window.location.href = "auth.html";
        }
      })
      .catch(() => {
        window.location.href = "../welcomedashboard.html";
      });
  } else {
    window.location.href = '../auth.html';
  }
});

// Logout
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = '../auth.html';
  }).catch((error) => {
    alert("Failed to log out. Please refresh and try again.");
  });
}

// Sanitize email
function sanitizeEmail(email) {
  return email.replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

// Load system users dropdown and table
const usersRef = firebase.database().ref("users/");
const dropdown = document.getElementById("system-user-type-select");
const tbody = document.getElementById("users-tbody");

function populateRoleDropdown() {
  usersRef.once("value", (snapshot) => {
    const roleCounts = {};
    let totalUsers = 0;

    snapshot.forEach((child) => {
      const role = child.val().Role || "Unassigned";
      roleCounts[role] = (roleCounts[role] || 0) + 1;
      totalUsers++;
    });

    dropdown.innerHTML = `<option value=" ">All Users (${totalUsers})</option>`;
    for (const role in roleCounts) {
      const option = document.createElement("option");
      option.value = role;
      option.textContent = `${role} (${roleCounts[role]})`;
      dropdown.appendChild(option);
    }
  });
}

function loadUsersByRole(role) {
  usersRef.once("value", (snapshot) => {
    tbody.innerHTML = "";

    snapshot.forEach((child) => {
      const user = child.val();
      if (role === " " || user.Role === role) {
        const fullName = `${user.firstName} ${user.lastName}`;
        const userParams = new URLSearchParams({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          dob: user.dob
        });

        const row = document.createElement("tr");
        row.innerHTML = `<td><a href="users.html?${userParams.toString()}">${fullName}</a></td>`;
        tbody.appendChild(row);
      }
    });
  });
}

dropdown.addEventListener("change", () => {
  const selectedRole = dropdown.value.trim();
  loadUsersByRole(selectedRole);
});

populateRoleDropdown();
