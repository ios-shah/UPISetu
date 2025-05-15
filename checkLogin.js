// This script ensures the user is logged in or else redirects them to the login page.

(function() {
  const userEmail = localStorage.getItem("upi_user_email");
  
  // If there's no user email in localStorage, the user is not logged in.
  if (!userEmail) {
    // Redirect to the login page
    window.location.href = "index.html";
  }
})();
// This script ensures the user is logged in or else redirects them to the login page.

(function() {
  const userEmail = localStorage.getItem("upi_user_email");
  
  // If there's no user email in localStorage, the user is not logged in.
  if (!userEmail) {
    // Redirect to the login page
    window.location.href = "index.html";
  }
})();
