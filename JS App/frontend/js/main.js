import { AuthUtils } from "../js/user/auth-utils.js";

console.log("mani");

async function loadComponent(containerId, file) {
  const container = document.getElementById(containerId);
  if (container) {
    try {
      const res = await fetch(`../components/${file}`);
      if (res.ok) {
        container.innerHTML = await res.text();
      } else {
        console.error(`Failed to load ${file}`);
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }
}

function updateNav() {
  const nav = document.getElementById("nav-links");
  const footer = document.getElementById("footer-links");

  const role="rider";
  // const role = localStorage.getItem("userRole") || localStorage.getItem("role");
  console.log("calling");
  
  let headerLinks = "";
  let footerLinks = "";

  if (role === "driver") {
    headerLinks = `
      <a href="index.html">Home</a>
      <a href="html/profile.html">Profile</a>
      <a href="#" class="logout">Logout</a>
    `;
    footerLinks = `
      <a href="index.html">Home</a> |
      <a href="html/start-driving.html">Start Driving</a> |
      <a href="html/ride-requests.html">Ride Requests</a> |
      <a href="html/profile.html">Profile</a> |
      <a href="#" class="logout">Logout</a>
    `;
  } else if (role === "rider") {
    headerLinks = `
      <a href="index.html">Home</a>
      <a href="html/profile.html">Profile</a>
      <a href="#" class="logout">Logout</a>
    `;
    footerLinks = `
      <a href="index.html">Home</a> |
      <a href="html/book-ride.html">Book a Ride</a> |
      <a href="html/ride-history.html">Ride History</a> |
      <a href="html/profile.html">Profile</a> |
      <a href="#" class="logout">Logout</a>
    `;
  } else {
    headerLinks = `
      <a href="index.html">Home</a>
      <a href="html/login.html">Login</a>
      <div class="dropdown">
        <button class="signup-btn">Sign Up</button>
        <div class="dropdown-content">
          <a href="html/register.html?role=rider">Rider</a>
          <a href="html/register.html?role=driver">Driver</a>
        </div>
      </div>
    `;
    footerLinks = `
      <a href="index.html">Home</a> |
      <a href="html/login.html">Login</a> |
      <a href="html/register.html">Sign Up</a> |
      <a href="html/contact.html">Contact</a>
    `;
  }

  if (nav) nav.innerHTML = headerLinks;
  if (footer) footer.innerHTML = footerLinks;

  attachLogoutHandler();
}

function attachLogoutHandler() {
  document.querySelectorAll(".logout").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof AuthUtils !== "undefined") {
        AuthUtils.clearAuthData();
        localStorage.removeItem(AuthUtils.STORAGE_KEYS.userRole);
        AuthUtils.redirectTo("index.html");
      } else {
        localStorage.clear();
        window.location.href = "index.html";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadComponent("header-container", "header.html");
  await loadComponent("footer-container", "footer.html");
  setTimeout(updateNav, 100);
});
