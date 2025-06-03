// Get keys from URL
const urlParams = new URLSearchParams(window.location.search);
const userEmailKey = urlParams.get("user");
const endUserKey = urlParams.get("enduser");
let globalStartDate = "";
let globalEnddate = "";
let globalAssignee = "";

// Check if keys are present
if (!userEmailKey || !endUserKey) {
  document.getElementById("protocol-details").innerText = "Missing user info in URL.";
} else {
  // Reference to the specific user
  document.addEventListener("DOMContentLoaded", () => {
  const endUserRef = firebase.database().ref(`enduser/${userEmailKey}/${endUserKey}`);

  endUserRef.once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        const user = snapshot.val();
        const age = calculateAge(user.dateOfBirth);

        document.getElementById("user-title").innerText = `${user.firstName} ${user.lastName}`;
        document.getElementById("protocol-details").innerHTML = `
          <p id="user-full-name"> <strong> </strong> </p>
          <p><strong>Age:</strong> ${age}</p>
          <p><strong>Sex:</strong> ${user.sex}</p>
          <p><strong>Program beginning :</strong><input type="date" id="sd" value="${user.programEndDate}" required /></p>
          <p><strong>Program End :</strong><input type="date" id="spd" value="${user.programStartDate}" required /></p>
          <p><strong>Number Of Performed Sessions :</strong> 23</p>
          <p>
            <button id="saveDatesBtn" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save Dates</button>
          </p>
        `;

        // Button now exists – safe to add listener
        document.getElementById("saveDatesBtn").addEventListener("click", () => {
          const startDate = document.getElementById("sd").value;
          const endDate = document.getElementById("spd").value;

          if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
          }

          endUserRef.update({
            programStartDate: startDate,
            programEndDate: endDate
          }).then(() => {
            updateProtocolDates(userEmailKey, endUserKey, startDate, endDate);
          }).catch((error) => {
            console.error("Error updating dates:", error);
            alert("Failed to update dates.");
          });
        });
      } else {
        document.getElementById("protocol-details").innerText = "User not found.";
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      document.getElementById("protocol-details").innerText = "Failed to load user data.";
    });
});


}

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const ageDiff = Date.now() - birthDate.getTime();
  return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
}

// update protocol dates
function updateProtocolDates(parentEmail, childName, newStartDate, newStopDate) {
  const db = firebase.database();
  const sanitizedEmail = parentEmail.replace(/\./g, "_dot_").replace(/@/g, "_at_");
  const endUserRef = db.ref(`enduser/${sanitizedEmail}/${childName}`);

  const updates = {
    startDate: newStartDate,
    stopDate: newStopDate
  };

  endUserRef.update(updates)
    .then(() => {
      console.log("Start and stop dates updated successfully");
      // Optionally show success alert here
    })
    .catch((error) => {
      console.error("Error updating protocol dates:", error);
      alert("Failed to update dates");
    });
}




// hide ans show window
// message and chat option 
function loadMessagesForAdmin(parentKey, childKey) {
  const db = firebase.database();
  const messagesRef = db.ref(`message/${parentKey}/childAccounts/${childKey}/Messages`);
  const container = document.getElementById("messagesContainer");

  messagesRef.once("value", snapshot => {
    container.innerHTML = ""; // Clear previous
    const data = snapshot.val();

    if (!data) {
      container.innerHTML = "<p>No messages found.</p>";
      return;
    }

    Object.entries(data).forEach(([msgId, msgData]) => {
      const div = document.createElement("div");
      div.className = "bg-gray-100 p-4 rounded-lg border";
      const time = new Date(msgData.timestamp).toLocaleString();
      div.innerHTML = `
        <p class="text-gray-800 whitespace-pre-wrap mb-2">${msgData.text}</p>
        <p class="text-xs text-gray-500 mb-2">Sent: ${time}</p>
        ${msgData.reply ? `
          <p class="text-green-700">Reply: ${msgData.reply.replyText}</p>
          <p class="text-xs text-green-500">Replied at: ${msgData.reply.replyTime}</p>
        ` : `
          <button onclick="selectMessageForReply('${msgId}', \`${msgData.text.replace(/`/g, "\\`")}\`)" 
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
            Reply
          </button>
        `}
      `;

      container.appendChild(div);
    });
  });
}
const submittedTextDiv = document.getElementById("submittedTextholder");
//submittedTextDiv.style.display = "none";
function selectMessageForReply(messageId, originalText) {
 // const submittedTextDiv = document.getElementById("submittedText");

  if (originalText !== "") {
    //submittedTextDiv.innerText = originalText;
    submittedTextDiv.classList.remove("hidden");
    console.log('hello');
  } else {
    //submittedTextDiv.innerText = "";
    submittedTextDiv.classList.add("hidden");
  }

 // document.getElementById("replyDisplay").innerText = "";
  document.getElementById("replyBtn").setAttribute("onclick", `submitReply('${messageId}')`);
}


function submitReply(messageId) {
  console.log("was cliked");
  const replyText = document.getElementById("replyInput").value.trim();
  if (!replyText) return alert("Please enter a reply.");

  const replyData = {
    replyText,
    replyTime: new Date().toLocaleString()
  };

  const db = firebase.database();
  const messageRef = db.ref(`message/${userEmailKey}/childAccounts/${endUserKey}/Messages/${messageId}`);

  messageRef.update({ reply: replyData })
    .then(() => {
      //alert("Reply sent.");
      document.getElementById("replyInput").value = "";
      loadMessagesForAdmin(userEmailKey, endUserKey); // refresh messages
    })
    .catch(err => {
      console.error("Error sending reply:", err);
      alert("Failed to send reply.");
    });
}

loadMessagesForAdmin(userEmailKey, endUserKey);
// end of chat and reply option

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
function hideprotocolwindow() {
  // body...
  document.getElementById("protocolwindow").classList.add("hidden");
  document.getElementById("close-btn").classList.add("hidden");
  document.getElementById("save-protocol-btn").classList.add("hidden");
  localStorage.setItem("protocolWindowOpen", "false");
}
// selection order
 const checkboxes = Array.from(document.querySelectorAll('.channel-select'));

checkboxes.forEach((checkbox, index) => {
  const card = checkbox.closest('.card');
  const dropdown = card.querySelector('.custom-select');
  const radios = card.querySelectorAll('input[type="radio"]');

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      // Check previous
      for (let i = 0; i < index; i++) {
        if (!checkboxes[i].checked) {
          checkbox.checked = false;
          alert(`You must select Channel ${i + 1} first.`);
          return;
        }
      }

      // Enable dropdown
      dropdown.disabled = false;
    } else {
      // Disable dropdown and radios if unchecked
      dropdown.disabled = true;
      dropdown.selectedIndex = 0;

      radios.forEach(r => {
        r.checked = false;
        r.disabled = true;
      });

      // Uncheck all later checkboxes
      for (let i = index + 1; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
        const cardLater = checkboxes[i].closest('.card');
        const dropdownLater = cardLater.querySelector('.custom-select');
        const radiosLater = cardLater.querySelectorAll('input[type="radio"]');

        dropdownLater.disabled = true;
        dropdownLater.selectedIndex = 0;
        radiosLater.forEach(r => {
          r.checked = false;
          r.disabled = true;
        });
      }
    }
  });

  // Handle enabling radio buttons only after dropdown selection
  dropdown.addEventListener('change', () => {
    if (dropdown.value !== '') {
      radios.forEach(r => r.disabled = false);
    } else {
      radios.forEach(r => {
        r.checked = false;
        r.disabled = true;
      });
    }
    updateOptions(); // maintain unique dropdown values
  });
});

  // stream selection order
   const selects = document.querySelectorAll('.custom-select');

  function updateOptions() {
    const selectedValues = new Set();

    // Collect selected values from all selects
    selects.forEach(select => {
      if (select.value) {
        selectedValues.add(select.value);
      }
    });

    // Reset all options first
    selects.forEach(select => {
      const currentValue = select.value;

      Array.from(select.options).forEach(option => {
        option.disabled = false;

        // Disable if selected in another select
        if (selectedValues.has(option.value) && option.value !== currentValue) {
          option.disabled = true;
        }
      });
    });
  }

  selects.forEach(select => {
    select.addEventListener('change', updateOptions);
  });

  // Initial update in case of preset values
  updateOptions();

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

  const channelsObj = {};
  channelsData.forEach((channel) => {
    const chKey = `channel_${channel.channelNumber}`;
    const mapped = {};
    Object.entries(channel.protocols).forEach(([name, value]) => {
      let label = name.replace(/^\D+/, "");
      label = parseInt(label) % 10;
      const bandNames = ["Unknown","Delta", "Theta", "Alpha", "SMR", "Beta1", "Beta2", "Gamma"];
      const band = bandNames[label] || `Unknown${label}`;
      mapped[band] = value === "Uptrain" ? 1 : 0;
    });
     // Include stream name from dropdownValue
    channelsObj[chKey] = {
    stream: channel.dropdownValue,  // <- here
    bands: mapped
  };
    
  });

  const protocolData = {
    duration: protocolMeta.duration,
    startDate: protocolMeta.startDate,
    stopDate: protocolMeta.stopDate,
    description: protocolMeta.description,
    status: "active",
    channels: channelsObj,
    sessions: {}
  };

  // Step 1: Deactivate all existing protocols
  return protocolsRef.once('value')
    .then(snapshot => {
      const updates = {};
      snapshot.forEach(child => {
        updates[`${child.key}/status`] = "inactive";
      });
      return protocolsRef.update(updates);
    })
    .then(() => {
      // Step 2: Save new protocol as active
      return newProtocolRef.set(protocolData);
    })
    .then(() => {
      //console.log("✅ Protocol saved:", protocolId);
      // Also update main enduser node with protocol = "Active"
      const endUserPath = `enduser/${sanitizedEmail}/${childName}`;
      firebase.database().ref(endUserPath).update({ protocol: "Active" });
      //alert("Protocol saved successfully!");
      hideprotocolwindow();
    })
    .catch(error => {
      //console.error("❌ Error saving protocol:", error);
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
    startDate: " ",
    stopDate: " ",
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
/// load Assingee name here

document.addEventListener("DOMContentLoaded", function () {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      const email = user.email;
      const sanitizedEmail = email.replace(/\./g, "_dot_").replace(/@/g, "_at_");

      // Fetch user's full name from the Realtime Database
      firebase.database().ref("users/" + userEmailKey).once("value")
        .then(snapshot => {
          const userData = snapshot.val();
          if (userData) {
            const fullName = `${userData.firstName} ${userData.lastName}`;
            console.log("Full Name:", fullName);

            // OPTIONAL: display on page if needed
            const nameDisplay = document.getElementById("user-full-name");
            if (nameDisplay) {
              nameDisplay.textContent = "Assignee : " + fullName;
            }
          } else {
            console.warn("User data not found in database.");
          }
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
        });

    } else {
      console.warn("No user is logged in.");
    }
  });
});



// remember to use if protocal date become specific to it
// load protocol
const container = document.getElementById('active-protocol');
function loadProtocols(parentKey, childKey) {
  const db = firebase.database();
  const protocolsRef = db
    .ref(`endUsers/${parentKey}/childAccounts/${childKey}/protocols`)
    .orderByChild("status")
    .equalTo("active");

  protocolsRef.on("value", snapshot => {
    container.innerHTML = ""; // Clear previous content
    const data = snapshot.val();

    if (data) {
      Object.entries(data).forEach(([protocolId, protocolData]) => {
        const card = renderProtocolCard(protocolId, protocolData); // This function should already expect `stream` and `bands`
        container.appendChild(card);

        // Optional resets
        globalEnddate = "";
        globalStartDate = "";
        hideprotocolwindow();
      });
    } else {
      container.innerHTML = '<p>No active protocols found.</p>';
      hideprotocolwindow();
    }
  });
}


// completed or closed protocol
const container1 = document.getElementById('closed-protocol');
function loadClosedProtocols(parentKey, childKey) {
  const db = firebase.database();
  const protocolsRef = db
    .ref(`endUsers/${parentKey}/childAccounts/${childKey}/protocols`)
    .orderByChild("status")
    .equalTo("inactive");

  protocolsRef.on("value", snapshot => {
    container1.innerHTML = ""; // Clear old content
    const data = snapshot.val();
    if (data) {
      Object.entries(data).forEach(([protocolId, protocolData]) => {
        const card = renderClosedProtocolCard(protocolId, protocolData);
        container1.appendChild(card);
        hideprotocolwindow();
      });
    } else {
      container1.innerHTML = '<p>No completed protocols.</p>';
      hideprotocolwindow();
    }
  });
}


// remove the xx to revert to old version
function renderProtocolCardXX(protocolId, protocolData) {
  const card = document.createElement('div');
  card.className = 'protocol-card';
  card.style.border = '1px solid #ccc';
  card.style.padding = '10px';
  card.style.marginBottom = '15px';
  card.style.borderRadius = '10px';
  card.style.backgroundColor = '#fafafa';

  const header = document.createElement('h3');
  /*header.textContent = `🧠 ${protocolId.toUpperCase()} — ${protocolData.status || 'Unknown'}`;
  card.appendChild(header);*/

  const info = document.createElement('p');
  /*info.innerHTML = `
   <strong>Description:</strong> ${protocolData.description || 'N/A'}<br>
     <strong>Duration:</strong> ${protocolData.duration || 'N/A'}<br> 
    <strong>Start:</strong> ${protocolData.startDate || 'N/A'}<br>
    <strong>Stop:</strong> ${protocolData.stopDate || 'N/A'}
  `;*/
  card.appendChild(info);

  // Channels
  const channels = protocolData.channels || {};
  Object.entries(channels).forEach(([channelKey, protocolItems]) => {
    const channelDiv = document.createElement('span');
    channelDiv.style.marginTop = '10px';

    const title = document.createElement('strong');
    title.textContent = ` Ch${channelKey.replace('channel_', '')}`;
    channelDiv.appendChild(title);

    const ul = document.createElement('span');
   const desiredOrder = ["Delta", "Theta", "Alpha", "SMR", "Beta1", "Beta2", "Gamma"];

desiredOrder.forEach((bandName) => {
  const value = protocolItems[bandName];
  if (value !== undefined) {
    const li = document.createElement('label');
    let symbol = '';

    if (bandName.toLowerCase() === 'delta') {
      symbol = '&delta;';
    } else if (bandName.toLowerCase() === 'theta') {
      symbol = '&theta;';
    } else if (bandName.toLowerCase() === 'alpha') {
      symbol = '&alpha;';
    } else if (bandName.toLowerCase() === 'smr') {
      symbol = 'SMR';
    } else if (bandName.toLowerCase() === 'beta1') {
      symbol = '&beta;1';
    } else if (bandName.toLowerCase() === 'beta2') {
      symbol = '&beta;2';
    } else if (bandName.toLowerCase() === 'gamma') {
      symbol = '&gamma;';
    }

    li.innerHTML = `<span style="color: ${value == 1 ? 'green' : 'red'};">${symbol}</span>`;
    ul.appendChild(li);
  }
});


    channelDiv.appendChild(ul);
    card.appendChild(channelDiv);
  });

  return card;
}

function renderProtocolCard(protocolId, protocolData) {
  const card = document.createElement('div');
  card.className = 'protocol-card';
  card.style.border = '1px solid #ccc';
  card.style.padding = '10px';
  card.style.marginBottom = '15px';
  card.style.borderRadius = '10px';
  card.style.backgroundColor = '#fafafa';

  const info = document.createElement('p');
  card.appendChild(info); // Optional: description, duration, etc.

  // Channels
  const channels = protocolData.channels || {};
  const containerLine = document.createElement('div');
  containerLine.style.display = 'flex';
  containerLine.style.flexWrap = 'wrap'; // keeps it responsive
  containerLine.style.gap = '20px';

  const desiredOrder = ["Delta", "Theta", "Alpha", "SMR", "Beta1", "Beta2", "Gamma"];
  const bandSymbols = {
    delta: '&delta;',
    theta: '&theta;',
    alpha: '&alpha;',
    smr: 'SMR',
    beta1: '&beta;1',
    beta2: '&beta;2',
    gamma: '&gamma;'
  };

  Object.entries(channels).forEach(([channelKey, protocolItems]) => {
    const stream = protocolItems.stream || 'N/A';
    const bands = protocolItems.bands || {};

    const line = document.createElement('span');
    line.style.whiteSpace = 'nowrap'; // Keep all in one line

    const chLabel = document.createElement('strong');
    chLabel.innerHTML = `Ch${channelKey.replace('channel_', '')} Str: ${stream} `;
    line.appendChild(chLabel);

    // Add bands inline
    desiredOrder.forEach(bandName => {
      const value = bands[bandName];
      if (value !== undefined) {
        const span = document.createElement('span');
        span.innerHTML = `<span style="margin-left:5px; color: ${value == 1 ? 'green' : 'red'};">${bandSymbols[bandName.toLowerCase()]}</span>`;
        line.appendChild(span);
      }
    });

    containerLine.appendChild(line);
  });

  card.appendChild(containerLine);
  return card;
}


function renderClosedProtocolCard(protocolId, protocolData) {
  const card = document.createElement('div');
  card.className = 'protocol-card';
  card.style.border = '1px solid #ccc';
  card.style.padding = '10px';
  card.style.marginBottom = '15px';
  card.style.borderRadius = '10px';
  card.style.backgroundColor = '#fafafa';

  const info = document.createElement('p');
  card.appendChild(info); // Optional: description, duration, etc.

  // Channels
  const channels = protocolData.channels || {};
  const containerLine = document.createElement('div');
  containerLine.style.display = 'flex';
  containerLine.style.flexWrap = 'wrap'; // keeps it responsive
  containerLine.style.gap = '20px';

  const desiredOrder = ["Delta", "Theta", "Alpha", "SMR", "Beta1", "Beta2", "Gamma"];
  const bandSymbols = {
    delta: '&delta;',
    theta: '&theta;',
    alpha: '&alpha;',
    smr: 'SMR',
    beta1: '&beta;1',
    beta2: '&beta;2',
    gamma: '&gamma;'
  };

  Object.entries(channels).forEach(([channelKey, protocolItems]) => {
    const stream = protocolItems.stream || 'N/A';
    const bands = protocolItems.bands || {};

    const line = document.createElement('span');
    line.style.whiteSpace = 'nowrap'; // Keep all in one line

    const chLabel = document.createElement('strong');
    chLabel.innerHTML = `Ch${channelKey.replace('channel_', '')} Stream: ${stream} `;
    line.appendChild(chLabel);

    // Add bands inline
    desiredOrder.forEach(bandName => {
      const value = bands[bandName];
      if (value !== undefined) {
        const span = document.createElement('span');
        span.innerHTML = `<span style="margin-left:5px; color: ${value == 1 ? 'green' : 'red'};">${bandSymbols[bandName.toLowerCase()]}</span>`;
        line.appendChild(span);
      }
    });

    containerLine.appendChild(line);
  });

  card.appendChild(containerLine);
  return card;
}



// remove xx to revert to old version
function renderClosedProtocolCardxx(protocolId, protocolData) {
  const card = document.createElement('div');
  card.className = 'protocol-card';
  card.style.border = '1px solid #ccc';
  card.style.padding = '10px';
  card.style.marginBottom = '15px';
  card.style.borderRadius = '10px';
  card.style.backgroundColor = '#fafafa';

  const header = document.createElement('h3');
  header.textContent = `${protocolData.status}`;
  card.appendChild(header);

  const info = document.createElement('p');
  /*info.innerHTML = `
    <strong>Description:</strong> ${protocolData.description || 'N/A'}<br>
    <strong>Duration:</strong> ${protocolData.duration || 'N/A'}<br>
    <strong>Start:</strong> ${protocolData.startDate || 'N/A'}<br>
    <strong>Stop:</strong> ${protocolData.stopDate || 'N/A'}
  `;*/
  card.appendChild(info);

  // Channels
  const channels = protocolData.channels || {};
  Object.entries(channels).forEach(([channelKey, protocolItems]) => {
    const channelDiv = document.createElement('span');
    channelDiv.style.marginTop = '10px';

    const title = document.createElement('strong');
    title.textContent = ` Ch${channelKey.replace('channel_', '')}`;
    channelDiv.appendChild(title);

    const ul = document.createElement('span');
    Object.entries(protocolItems).forEach(([band, value]) => {
  const li = document.createElement('label');
  let symbol = '';

  // Replace band name with custom symbol
  if (band.toLowerCase().includes('alpha')) {
    symbol = '&alpha;';
  } else if (band.toLowerCase().includes('beta1')) {
    symbol = '&beta;1';
  } else if (band.toLowerCase().includes('beta2')) {
    symbol = '&beta;2';
  } else if (band.toLowerCase().includes('theta')) {
    symbol = '&theta;';
  } else if (band.toLowerCase().includes('gamma')) {
    symbol = '&gamma;';
  } else if (band.toLowerCase().includes('smr')) {
    symbol = 'SMR';
  } else if (band.toLowerCase().includes('delta')) {
    symbol = '&delta;';
  }else {
    symbol = ''; // fallback symbol for unknown bands
  }
  //li.innerHTML = `${symbol}: <span style="color: ${value == 1 ? 'green' : 'red'};">${symbol}</span>`;
  li.innerHTML = `<span style="color: ${value == 1 ? 'green' : 'red'};">${symbol}</span>`;
  ul.appendChild(li);
});


    channelDiv.appendChild(ul);
    card.appendChild(channelDiv);
  });

  return card;
}

loadProtocols(userEmailKey, endUserKey);
loadClosedProtocols(userEmailKey, endUserKey);

// check if user is authenticated
auth.onAuthStateChanged(function(user) {
  if (user) {
    const email = user.email;
    const sanitizedEmail = sanitizeEmail(email);

    firebase.database().ref("users/" + sanitizedEmail + "/Role").once("value")
      .then((snapshot) => {
        const role = snapshot.val();

        if (role === "Admin") {
          //window.location.href = "adashboard.html";
        } else if (role === "Assignee") {
          window.location.href = "../dashboard.html";
        }else if (role === "SuperAdmin") {
          
        } else {
          window.location.href = "auth.html";
        }
      })
      .catch((error) => {
       // console.error("Failed to fetch role:", error);
        // Optional fallback or error page
        window.location.href = "../welcomedashboard.html";
      });
  } else {
    window.location.href = '../auth.html';
  }
});
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