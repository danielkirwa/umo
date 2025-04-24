// Get keys from URL
const urlParams = new URLSearchParams(window.location.search);
const userEmailKey = urlParams.get("user");
const endUserKey = urlParams.get("enduser");

// Check if keys are present
if (!userEmailKey || !endUserKey) {
  document.getElementById("protocol-details").innerText = "Missing user info in URL.";
} else {
  // Reference to the specific user
  const endUserRef = firebase.database().ref(`enduser/${userEmailKey}/${endUserKey}`);

  endUserRef.once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        const user = snapshot.val();
        const age = calculateAge(user.dateOfBirth);

        document.getElementById("protocol-details").innerHTML = `
          <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
          <p><strong>Age:</strong> ${age}</p>
          <p><strong>Sex:</strong> ${user.sex}</p>
          <p><strong>Protocol:</strong> ${user.protocol || user.protocal || "Not yet set"}</p>
        `;
      } else {
        document.getElementById("protocol-details").innerText = "User not found.";
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      document.getElementById("protocol-details").innerText = "Failed to load user data.";
    });
}

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const ageDiff = Date.now() - birthDate.getTime();
  return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
}
