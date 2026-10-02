// apply.js - keep "Submit Application" disabled until the form is valid

const applicationForm = document.getElementById("applicationForm");
const submitButton = applicationForm.querySelector('button[type="submit"]');

function updateSubmitButton() {
  submitButton.disabled = !applicationForm.checkValidity();
}

// "input" covers text fields; "change" covers selects and checkboxes
applicationForm.addEventListener("input", updateSubmitButton);
applicationForm.addEventListener("change", updateSubmitButton);

updateSubmitButton();
