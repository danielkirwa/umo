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
        document.getElementById("user-title").textContent = `Training - ${data.firstName} ${data.lastName}`;

        document.getElementById("details").innerHTML = `
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Age:</strong> ${age}</p>
          <p><strong>Program Started on :</strong> 12/12/2024</p>
          <p><strong>Program- Endeds on :</strong> 12/12/2025</p>
          <p><strong>Number Of Performed Session :</strong> 23</p>
          <p><strong>Session List:</strong> List will show here(Duration, Date-time and protocol)</p>

          
        `;
      });
    });

    function calculateAge(dob) {
      const birthDate = new Date(dob);
      const diff = Date.now() - birthDate.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    }