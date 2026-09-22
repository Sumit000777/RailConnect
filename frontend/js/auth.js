/**
 * auth.js
 * Shared by login.html and signup.html — whichever form exists on the
 * current page is the one that gets wired up.
 */
(function () {
  const msgBox = document.getElementById("formMsg");

  function showMsg(text, type) {
    msgBox.textContent = text;
    msgBox.className = `form-msg show ${type}`;
  }

  // If already logged in, skip straight to the dashboard.
  if (RMS.getToken()) {
    window.location.href = "dashboard.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("submitBtn");
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      submitBtn.disabled = true;
      submitBtn.textContent = "Logging in…";

      const { ok, status, data } = await RMS.api("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (ok) {
        RMS.setSession(data.token, data.user);
        showMsg("Login successful. Redirecting…", "success");
        window.location.href = "dashboard.html";
        return;
      }

      if (status === 404) {
        showMsg("No account found with this email. Redirecting you to sign up…", "error");
        setTimeout(() => {
          window.location.href = `signup.html?email=${encodeURIComponent(email)}`;
        }, 1800);
      } else {
        showMsg(data.message || "Login failed. Please try again.", "error");
      }

      submitBtn.disabled = false;
      submitBtn.textContent = "Log In";
    });
  }

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    const prefillEmail = RMS.qs("email");
    if (prefillEmail) document.getElementById("email").value = prefillEmail;

    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("submitBtn");
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (password !== confirmPassword) {
        showMsg("Passwords do not match.", "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Creating account…";

      const { ok, data } = await RMS.api("/api/auth/signup", {
        method: "POST",
        body: { name, email, phone, password },
      });

      if (ok) {
        RMS.setSession(data.token, data.user);
        showMsg("Account created. Redirecting to your dashboard…", "success");
        window.location.href = "dashboard.html";
        return;
      }

      showMsg(data.message || "Could not create account. Please try again.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    });
  }
})();
