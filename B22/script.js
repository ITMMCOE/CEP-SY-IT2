


document.addEventListener("DOMContentLoaded", () => {
  const landingPage = document.getElementById("landing-page-content");
  const mainApp = document.getElementById("main-app");
  const loginBtn = document.getElementById("nav-login-btn");
  const signupBtn = document.getElementById("nav-signup-btn");
  const heroBookRideBtn = document.getElementById("hero-book-ride-btn");

  const authModal = document.getElementById("auth-modal-overlay");
  const loginView = document.getElementById("login-view");
  const registerView = document.getElementById("register-view");
  const showRegisterLink = document.getElementById("show-register-link");
  const showLoginLink = document.getElementById("show-login-link");

  // Show login modal
  loginBtn.addEventListener("click", () => {
    authModal.classList.remove("hidden");
    loginView.classList.remove("hidden");
    registerView.classList.add("hidden");
  });

  // Show register modal
  signupBtn.addEventListener("click", () => {
    authModal.classList.remove("hidden");
    registerView.classList.remove("hidden");
    loginView.classList.add("hidden");
  });

  // Switch between login/register
  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginView.classList.add("hidden");
    registerView.classList.remove("hidden");
  });

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    registerView.classList.add("hidden");
    loginView.classList.remove("hidden");
  });

  // Book Ride button
  heroBookRideBtn.addEventListener("click", () => {
    landingPage.classList.add("hidden");
    mainApp.classList.remove("hidden");
  });

  // Logout
  document.getElementById("logout-link").addEventListener("click", (e) => {
    e.preventDefault();
    mainApp.classList.add("hidden");
    landingPage.classList.remove("hidden");
  });

  // Initialize Map
  const map = L.map("map").setView([20.5937, 78.9629], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
});
