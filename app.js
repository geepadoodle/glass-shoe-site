/* SoleFit — Data & Privacy Rights request form.
   Progressive enhancement: without JS the form still submits via its mailto action.
   With JS we validate accessibly and open the user's email client with a prefilled
   request, plus a visible fallback link. No data is sent anywhere from the browser.

   To wire a real backend instead of mailto: POST the same fields to a server endpoint
   (e.g. a Supabase edge function that verifies the account email and queues a deletion),
   and replace `openMailClient()` with that fetch + success/error handling. */

(function () {
  "use strict";

  var CONTACT = "turtle91021.gnps@gmail.com";
  var form = document.getElementById("request-form");
  if (!form) return;

  var email = document.getElementById("email");
  var emailError = document.getElementById("email-error");
  var typeError = document.getElementById("type-error");
  var formStatus = document.getElementById("form-status");

  function setError(el, field, message) {
    el.textContent = message;
    if (field) field.setAttribute("aria-invalid", "true");
  }
  function clearError(el, field) {
    el.textContent = "";
    if (field) field.removeAttribute("aria-invalid");
  }
  function getRequestType() {
    var checked = form.querySelector('input[name="requestType"]:checked');
    return checked ? checked.value : "";
  }
  function validEmail(value) {
    // Intentionally permissive — server-side verification is the real check.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  // Clear errors as the user fixes things.
  email.addEventListener("input", function () { clearError(emailError, email); });
  form.querySelectorAll('input[name="requestType"]').forEach(function (r) {
    r.addEventListener("change", function () { clearError(typeError, null); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError(emailError, email);
    clearError(typeError, null);
    formStatus.textContent = "";

    var firstInvalid = null;
    var requestType = getRequestType();

    if (!email.value.trim()) {
      setError(emailError, email, "Enter your account email so we can verify the request.");
      firstInvalid = firstInvalid || email;
    } else if (!validEmail(email.value)) {
      setError(emailError, email, "That doesn't look like a valid email address.");
      firstInvalid = firstInvalid || email;
    }

    if (!requestType) {
      setError(typeError, null, "Choose what you'd like us to do.");
      if (!firstInvalid) {
        firstInvalid = form.querySelector('input[name="requestType"]');
      }
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    openMailClient(email.value.trim(), requestType, document.getElementById("details").value.trim());
  });

  function openMailClient(userEmail, requestType, details) {
    var subject = "SoleFit data request: " + requestType;
    var lines = [
      "Request: " + requestType,
      "Account email: " + userEmail,
      "",
      "Details: " + (details || "(none)"),
      "",
      "— Sent from the SoleFit Data & Privacy Rights page."
    ];
    var href = "mailto:" + CONTACT +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));

    // Open the user's email client with everything prefilled.
    window.location.href = href;

    // Accessible confirmation + a manual fallback if no mail client opened.
    formStatus.innerHTML =
      "Your email app should open with the request ready to send. " +
      "If it doesn't, email <a href=\"" +
      href.replace(/"/g, "&quot;") +
      "\">" + CONTACT + "</a> with your account email and request.";
    formStatus.focus && formStatus.setAttribute("tabindex", "-1");
    if (formStatus.focus) formStatus.focus();
  }
})();
