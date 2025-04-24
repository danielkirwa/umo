function loadUsersWithNoProtocol() {
  const enduserRef = firebase.database().ref("enduser");

  enduserRef.once('value', (snapshot) => {
    const tableBody = document.querySelector("#no-protocol-users tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    snapshot.forEach((userEmailSnap) => {
      const userEntries = userEmailSnap.val();

      for (let key in userEntries) {
        const user = userEntries[key];
        const protocol = (user.protocol || user.protocal || "").toLowerCase(); // Catch both spellings

        if (protocol.includes("not yet")) {
          const fullName = `${user.firstName} ${user.lastName}`;
          const age = calculateAge(user.dateOfBirth);

          const row = document.createElement("tr");
          row.setAttribute("data-key", key);
          row.setAttribute("data-user-email", userEmailSnap.key);

          row.innerHTML = `
            <td><a href="#" onclick="assignProtocol('${userEmailSnap.key}', '${key}')">${fullName} (Age: ${age})</a></td>
          `;

          tableBody.appendChild(row);
        }
      }
    });
  });
}

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const ageDiff = Date.now() - birthDate.getTime();
  return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
}

// Example handler when admin clicks to assign protocol
function assignProtocol(userEmailKey, endUserKey) {
  alert(`Assign protocol to ${endUserKey} under ${userEmailKey}`);
  // Redirect or open modal logic can go here
}
loadUsersWithNoProtocol();