let loadedUsers = []; // For protocol-based users
let loadedSystemUsers = []; // For system users

// === PROTOCOL USERS (LEFT SIDE) ===

function loadUsersWithProtocolStatus(selectedStatus = "Not yet given") {
  const enduserRef = firebase.database().ref("enduser");
  const tableBody = document.querySelector("#no-protocol-users tbody");
  tableBody.innerHTML = "";
  loadedUsers = [];

  enduserRef.once('value', (snapshot) => {
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

    renderEndUsers(loadedUsers);
  });
}

function renderEndUsers(usersToDisplay) {
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

// Search for protocol users
document.getElementById("user-search1").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const filteredUsers = loadedUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm)
  );
  renderEndUsers(filteredUsers);
});

// Dropdown for protocol users
document.getElementById("user-type-select").addEventListener("change", function () {
  const selectedValue = this.value;
  localStorage.setItem("selectedUserType", selectedValue);
  loadUsersWithProtocolStatus(selectedValue);
});

window.addEventListener("DOMContentLoaded", () => {
  const savedValue = localStorage.getItem("selectedUserType") || "Not yet given";
  document.getElementById("user-type-select").value = savedValue;
  loadUsersWithProtocolStatus(savedValue);
  updateUserCountsInDropdown();
});

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
      option.textContent = option.textContent.replace(/\s\(\d+\)/, '') + ` (${counts[status]})`;
    });
  });
}

function assignProtocol(userEmailKey, endUserKey) {
  const url = `protocolchart.html?user=${encodeURIComponent(userEmailKey)}&enduser=${encodeURIComponent(endUserKey)}`;
  window.location.href = url;
}

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const ageDiff = Date.now() - birthDate.getTime();
  return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
}


// === ASSIGNEE USERS TABLE ===
const usersRef = firebase.database().ref("users/");

let assigneeUsers = [];
let adminUsers = [];

// Get DOM elements using new unique IDs
const assigneeTbody = document.getElementById("users-tbody-assignee");
const adminTbody = document.getElementById("users-tbody-admin");
const assigneeSearch = document.getElementById("user-search-assignee");
const adminSearch = document.getElementById("user-search-admin");

function fetchAndRenderUsers() {
  usersRef.once("value", (snapshot) => {
    assigneeUsers = [];
    adminUsers = [];

    snapshot.forEach((child) => {
      const user = child.val();
      const fullName = `${user.firstName} ${user.lastName}`;
      const userData = { ...user, fullName };

      if (user.Role === "Assignee") {
        assigneeUsers.push(userData);
      } else if (user.Role === "Admin") {
        adminUsers.push(userData);
      }
    });

    renderUsers(assigneeUsers, assigneeTbody);
    renderUsers(adminUsers, adminTbody);
  });
}

function renderUsers(userList, tbodyElement) {
  if (!tbodyElement) {
    console.error("tbodyElement not found");
    return;
  }

  tbodyElement.innerHTML = "";
  userList.forEach((user) => {
    const userParams = new URLSearchParams({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      dob: user.dob
    });

    const row = document.createElement("tr");
    row.innerHTML = `<td><a href="users.html?${userParams.toString()}">${user.fullName}</a></td>`;
    tbodyElement.appendChild(row);
  });
}

// === SEARCH HANDLERS ===
assigneeSearch.addEventListener("input", () => {
  const searchTerm = assigneeSearch.value.toLowerCase();
  const filtered = assigneeUsers.filter(user => user.fullName.toLowerCase().includes(searchTerm));
  renderUsers(filtered, assigneeTbody);
});

adminSearch.addEventListener("input", () => {
  const searchTerm = adminSearch.value.toLowerCase();
  const filtered = adminUsers.filter(user => user.fullName.toLowerCase().includes(searchTerm));
  renderUsers(filtered, adminTbody);
});

// Initial fetch
fetchAndRenderUsers();

// === AUTH ===

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
        } else if (role === "SuperAdmin") {
          
        }else {
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

function sanitizeEmail(email) {
  return email.replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = '../auth.html';
  }).catch((error) => {
    alert("Failed to log out. Please refresh and try again.");
  });
}
