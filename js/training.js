var success = "&#9989; Success";
var failed = "&#10060; Failed";
var warning = "&#10071; Warning";
const urlParams = new URLSearchParams(window.location.search);
    const userKey = urlParams.get("user");
    const endUserKey = urlParams.get("key");

    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        window.location.href = 'auth.html';
        return;
      }

      const ref = firebase.database().ref(`enduser/${userKey}/${endUserKey}`);
      ref.once('value').then(snapshot => {
        const data = snapshot.val();
        if (!data) return;

        const age = calculateAge(data.dateOfBirth);
        document.getElementById("user-title").innerHTML = `&nbsp&nbsp;&nbsp; ${data.firstName} ${data.lastName}`;

       document.getElementById("details").innerHTML = `
             <p><strong>Age:</strong> ${age}</p>
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

      });
    });

    function calculateAge(dob) {
      const birthDate = new Date(dob);
      const diff = Date.now() - birthDate.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    // save message to the database
    function submitText() {
  const messageText = document.getElementById("messageInput").value.trim();
  if (messageText === "") {
    myAlert(failed, "Please type a message.");
    return;
  }

  const db = firebase.database();
  const timestamp = new Date().toISOString();

  // Replace these dynamically in your actual code
  const parentEmailSanitized = userKey; // e.g., 'john_at_gmail_dot_com'
 // const endUserKey = endUserKey; // e.g., 'Brian'

  const messagesRef = db.ref(`message/${parentEmailSanitized}/childAccounts/${endUserKey}/Messages`);
  const newMessageRef = messagesRef.push();

  const messageData = {
    text: messageText,
    sender: "endUser",
    timestamp: timestamp
  };

  newMessageRef.set(messageData)
    .then(() => {
     // console.log("✅ Message sent.");
      myAlert(success, "Message sent");
      document.getElementById("messageInput").value = "";
    })
    .catch(error => {
      //console.error("❌ Error sending message:", error);
      myAlert(failed, "Fail to sent message");
      //alert("Failed to send message.");
    });
}

//load message

function loadMessages(parentKey, childKey) {
  const db = firebase.database();
  const messagesRef = db.ref(`message/${parentKey}/childAccounts/${childKey}/Messages`);

  messagesRef.on("value", snapshot => {
    const messages = snapshot.val();
    const container = document.getElementById("submittedText");
    container.innerHTML = ""; // Clear previous messages

    if (messages) {
      // Convert to array and sort by timestamp
      const sortedMessages = Object.entries(messages).sort((a, b) => {
        return new Date(a[1].timestamp) - new Date(b[1].timestamp);
      });

      sortedMessages.forEach(([id, msg]) => {
  const msgDiv = document.createElement("div");
  const time = new Date(msg.timestamp).toLocaleString(); // Format date/time

  msgDiv.className = msg.sender === "endUser" 
    ? "bg-blue-100 text-blue-800 p-2 rounded mb-2 self-end text-right"
    : "bg-green-100 text-green-800 p-2 rounded mb-2 self-start text-left";

  msgDiv.innerHTML = `<div class="flex flex-col text-sm text-gray-800">
  <span>${msg.text}</span>
  <span class="text-xs text-gray-500">${time}</span>
</div>`;
  container.appendChild(msgDiv);
});

    } else {
      container.innerHTML = "<p class='text-gray-500'>No messages yet.</p>";
    }
  });
}
loadMessages(userKey, endUserKey);




// load protocol

    // load protocol
const container = document.getElementById('active-protocol');
function loadProtocols(parentKey, childKey) {
  const db = firebase.database();
  const protocolsRef = db
    .ref(`endUsers/${parentKey}/childAccounts/${childKey}/protocols`)
    .orderByChild("status")
    .equalTo("active");

  protocolsRef.on("value", snapshot => {
    container.innerHTML = ""; // Clear old content
    const data = snapshot.val();
    if (data) {
      Object.entries(data).forEach(([protocolId, protocolData]) => {
        const card = renderProtocolCard(protocolId, protocolData);
        container.appendChild(card);
      });
    } else {
      container.innerHTML = '<p>No active protocols found.</p>';
    }
  });
}


function renderProtocolCard(protocolId, protocolData) {
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

loadProtocols(userKey, endUserKey);



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
// check if user is authenticated
    auth.onAuthStateChanged(function(user){
      if(user){
         email = user.email;
        //alert("Active user" + email);
         usernamedisplay.innerHTML = email;
      }else{
        //alert("No Active user");
        window.location.href='auth.html';
      }
    })