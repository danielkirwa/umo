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
         document.getElementById("user-title").innerText = `${user.firstName} ${user.lastName}`;
        document.getElementById("protocol-details").innerHTML = `
          <p><strong>Assignee :</strong> </p>
          <p><strong>Age:</strong> ${age}</p>
          <p><strong>Sex:</strong> ${user.sex}</p>
          <p><strong>Program Started on :</strong> 12/12/2024</p>
             <p><strong>Program Ended on :</strong> 12/12/2025</p>
             <p><strong>Number Of Performed Sessions :</strong> 23</p>
          <div class="mt-4">
               <p><strong>Session List:</strong></p>
               <div class="space-y-2 mt-2">
                 <div class="border rounded-lg p-3 bg-gray-50 shadow-sm">
                   <p><strong>Session Number:</strong> 1</p>
                   <p><strong>Duration:</strong> 30 mins</p>
                   <p><strong>Date:</strong> 12/01/2025 10:00AM</p>
                   <p><strong>Protocol:</strong>Protocol 1</p>
                 </div>
                 <div class="border rounded-lg p-3 bg-gray-50 shadow-sm">
                   <p><strong>Session Number:</strong> 2</p>
                   <p><strong>Duration:</strong> 25 mins</p>
                   <p><strong>Date:</strong> 14/01/2025 2:00PM</p>
                   <p><strong>Protocol:</strong>Protocol 1</p>
                 </div>
                 <!-- Add more session cards here dynamically if needed -->
               </div>
             </div>
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

// hide ans show window


// Add event listeners
window.addEventListener("DOMContentLoaded", function () {
  const protocolWindow = document.getElementById("protocolwindow");
  const closebtn =  document.getElementById("close-btn");
  const saveprotocolbtn =  document.getElementById("save-protocol-btn");
  const isOpen = localStorage.getItem("protocolWindowOpen");

  if (isOpen == "true") {
    protocolWindow.classList.remove("hidden");
    closebtn.classList.remove("hidden");
    saveprotocolbtn.classList.remove("hidden");
  }else{
    protocolWindow.classList.add("hidden");
    closebtn.classList.add("hidden");
    saveprotocolbtn.classList.add("hidden");
  }

});
document.getElementById("add-protocol-btn").addEventListener("click", function () {
  document.getElementById("protocolwindow").classList.remove("hidden");
  document.getElementById("close-btn").classList.remove("hidden");
  document.getElementById("save-protocol-btn").classList.remove("hidden");
  localStorage.setItem("protocolWindowOpen", "true");
});
document.getElementById("close-btn").addEventListener("click", function () {
  document.getElementById("protocolwindow").classList.add("hidden");
  document.getElementById("close-btn").classList.add("hidden");
  document.getElementById("save-protocol-btn").classList.add("hidden");
  localStorage.setItem("protocolWindowOpen", "false");
});


// get new protocol for the user

// Run on page load and any change in radio button
window.addEventListener('DOMContentLoaded', () => {
  updateRadioColors();
});

// Color logic on change
document.querySelectorAll('input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', () => {
    updateRadioColors();
  });
});

// Color uptrain (green) and downtrain (red)
function updateRadioColors() {
  document.querySelectorAll('.card').forEach(card => {
    card.querySelectorAll('.protocol-item').forEach(item => {
      item.querySelectorAll('input[type="radio"]').forEach(radio => {
        const label = radio.parentElement;
        label.style.color = ''; // reset

        if (radio.checked) {
          label.style.color = radio.value === 'Uptrain' ? 'green' : 'red';
        }
      });
    });
  });
}

// Function to extract selected data for all checked channels
function getSelectedChannelData() {
  const data = [];

  document.querySelectorAll('.card').forEach(card => {
    const checkbox = card.querySelector('input[type="checkbox"]');

    if (checkbox && checkbox.checked) {
      const channelId = checkbox.id;
      const channelNumber = checkbox.dataset.channel;

      const dropdown = card.querySelector('select');
      const dropdownValue = dropdown ? dropdown.value : null;

      const selectedRadios = {};
      card.querySelectorAll('.protocol-item').forEach(item => {
        const radios = item.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
          if (radio.checked) {
            const name = radio.name;
            selectedRadios[name] = radio.value;
          }
        });
      });

      data.push({
        channelId,
        channelNumber,
        dropdownValue,
        protocols: selectedRadios
      });
    }
  });

  return data;
}

function saveProtocolToFirebase(parentEmail, childName, protocolMeta, channelsData) {
  const db = firebase.database();
  const sanitizedEmail = parentEmail.replace(/\./g, "_dot_").replace(/@/g, "_at_");
  const protocolsRef = db.ref(`endUsers/${sanitizedEmail}/childAccounts/${childName}/protocols`);
  const newProtocolRef = protocolsRef.push();
  const protocolId = newProtocolRef.key;

  // Convert frontend channel data into backend structure
  const channelsObj = {};
  channelsData.forEach((channel, index) => {
    const chKey = `channel_${channel.channelNumber}`;
    const mapped = {};

    Object.entries(channel.protocols).forEach(([name, value]) => {
      // Example: "protocolc32": "Uptrain" → "Gamma": 1
      // This assumes names are structured like "protocolc32"
      let label = name.replace(/^\D+/, ""); // extract number
      label = parseInt(label) % 10; // get band number (just example logic)
      const bandNames = ["Delta", "Theta", "Alpha", "SMR", "Beta1", "Beta2", "Gamma"];
      const band = bandNames[label] || `Unknown${label}`;
      mapped[band] = value === "Uptrain" ? 1 : 0;
    });

    channelsObj[chKey] = mapped;
  });

  const protocolData = {
    duration: protocolMeta.duration,
    startDate: protocolMeta.startDate,
    stopDate: protocolMeta.stopDate,
    description: protocolMeta.description,
    status: protocolMeta.status || "active",
    channels: channelsObj,
    sessions: {}
  };

  return newProtocolRef.set(protocolData)
    .then(() => {
      console.log("✅ Protocol saved:", protocolId);
      alert("Protocol saved successfully!");
    })
    .catch(error => {
      console.error("❌ Error saving protocol:", error);
      alert("Error saving protocol");
    });
}

// Example usage:

let saveprotocolbtn = document.getElementById('save-protocol-btn');
saveprotocolbtn.addEventListener('click', () => {
 // const selectedData = getSelectedChannelData();
//console.log(selectedData);
   const parentEmail = userEmailKey // replace with actual dynamic user
  const childName = endUserKey // replace dynamically too
  const channelsData = getSelectedChannelData();

  const protocolMeta = {
    duration: "30",
    startDate: "24-4-2025",
    stopDate: "23-5-2025",
    description: "New added",
    status: "Active"
  };

  if (!protocolMeta.duration || !protocolMeta.startDate || !protocolMeta.stopDate) {
    alert("Please fill in all protocol fields.");
    return;
  }

  if (channelsData.length === 0) {
    alert("Select at least one channel with protocols.");
    return;
  }

  saveProtocolToFirebase(parentEmail, childName, protocolMeta, channelsData);
})


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