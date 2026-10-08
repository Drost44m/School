// apply.js - populates the pet-info panel from the incoming query parameters,
// gates "Submit Application" on the two agreement checkboxes, and swaps the
// form for a confirmation message on submit

// Grab the elements we'll need from the page
const applicationForm = document.getElementById("applicationForm");
const submitButton = applicationForm.querySelector('button[type="submit"]');
const petInfo = document.getElementById("petInfo");
const careCheckbox = applicationForm.querySelector('input[name="careAgreement"]');
const noGuaranteeCheckbox = applicationForm.querySelector('input[name="noGuarantee"]');

// Read the pet and fee details sent from pet.html
const params = new URLSearchParams(window.location.search);
const petName = params.get("petName") || "";
const petType = params.get("petType") || "";
const petBreed = params.get("petBreed") || "";
const adoptionFee = Number(params.get("adoptionFee")) || 0;
const processingFee = Number(params.get("processingFee")) || 0;
const total = adoptionFee + processingFee;

// Show that pet's info at the top of the form
const petNameHeading = document.createElement("h2");
petNameHeading.textContent = petName;

const petTypeParagraph = document.createElement("p");
petTypeParagraph.textContent = `Type: ${petType}`;

const petBreedParagraph = document.createElement("p");
petBreedParagraph.textContent = `Breed: ${petBreed}`;

const feesParagraph = document.createElement("p");
feesParagraph.append(
  `Adoption Fee: $${adoptionFee}`,
  document.createElement("br"),
  `Processing Fee: $${processingFee}`,
  document.createElement("br"),
  `Total: $${total}`
);

petInfo.append(petNameHeading, petTypeParagraph, petBreedParagraph, feesParagraph);

// Submit button only turns on once both checkboxes are checked
function updateSubmitButton() {
  submitButton.disabled = !(careCheckbox.checked && noGuaranteeCheckbox.checked);
}

careCheckbox.addEventListener("change", updateSubmitButton);
noGuaranteeCheckbox.addEventListener("change", updateSubmitButton);
updateSubmitButton();

// When the form is submitted, replace it with a thank-you message
applicationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const confirmation = document.createElement("div");
  confirmation.className = "section application-confirmation";

  const heading = document.createElement("h1");
  heading.textContent = "Application Submitted!";

  const message = document.createElement("p");
  message.textContent =
    `Thank you for applying to adopt ${petName || "this pet"}. Our team will review your ` +
    "application and will be in touch with you soon.";

  // "Return to Home" sends the user back to the landing page
  const returnHomeButton = document.createElement("button");
  returnHomeButton.type = "button";
  returnHomeButton.textContent = "Return to Home";
  returnHomeButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  confirmation.append(heading, message, returnHomeButton);
  applicationForm.replaceWith(confirmation);
});
