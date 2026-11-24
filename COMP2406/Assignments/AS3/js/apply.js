// Get the pet and shelter IDs from URL query parameters
const params = new URLSearchParams(window.location.search);
const petId = params.get("petId");
const shelterId = params.get("shelterId");

const submitBtn = document.getElementById("submitBtn");
const agreement1 = document.getElementById("agreement1");
const agreement2 = document.getElementById("agreement2");

// This is the adoption application form
let application = {};        // Will change below to have this format:
/* { 
      "petId": "p4"
      "shelterId": "s2"
      "name": "John Doe",
      "email": "JohnDoe@email.com",
      "phone": "(555)555-5555",
      "address": "23 Elm St., Ottawa ON K7H9J3",
      "residents": 3,
      "currentPets": "We have an Iguana and two budgies.",
      "experience": "Some",
      "location": "indoor",
      "donation": 10, 
    } */

// Enable Submit button only when both checkboxes are checked 
function updateSubmitState() {
    submitBtn.disabled = !(agreement1.checked && agreement2.checked);
}
agreement1.addEventListener("change", updateSubmitState);
agreement2.addEventListener("change", updateSubmitState);
updateSubmitState();


// Handle form submission
const form = document.getElementById("adoptionForm");
form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Prepare the application data object
    application.petId = petId;
    application.shelterId = shelterId;
    application.name = document.getElementById("name").value;
    application.email = document.getElementById("email").value;
    application.phone = document.getElementById("phone").value;
    application.address = document.getElementById("address").value;
    application.residents = document.getElementById("residents").value;
    application.currentPets = document.getElementById("currentPets").value;
    application.experience = document.getElementById("experience").value;
    application.location = document.getElementById("location").value;
    application.donation = document.getElementById("donation").value;

    // Send the application data to the server
    fetch("/submit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(application)
    })
    .then(res => {
        // Replace form with success message
        form.innerHTML = `
            <h2>Application Submitted Successfully!</h2>
            <p>Thank you for applying to adopt a pet. Our team will review your application and contact you soon.</p>
            <a href="/" class="return-home-button">Return to Home</a>`;
    })
    .catch(error => {
        alert("Error submitting application: " + error);
    });
});
