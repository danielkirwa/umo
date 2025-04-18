
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");
let usernamedisplay = document.getElementById('usernamedisplay');
hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("show");
});

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