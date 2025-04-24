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

       document.getElementById("details").innerHTML = `
             <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
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