// Get pet information from URL query parameters
const params = new URLSearchParams(window.location.search);
const petId = params.get("petId");
const shelterId = params.get("shelterId");
const petName = params.get("petName");
const petType = params.get("petType");
const petBreed = params.get("petBreed");
const adoptionFee = params.get("adoptionFee");
const processingFee = params.get("processingFee");

const petInfoSection = document.getElementById("petApplicationInfo");
const submitBtn = document.getElementById("submitBtn");
const agreement1 = document.getElementById("agreement1");
const agreement2 = document.getElementById("agreement2");


// Insert the chosen pet's information at the top of the form 
if (petId && shelterId && petName && petType && petBreed && adoptionFee && processingFee) {
    const total = parseInt(adoptionFee) + parseInt(processingFee);
    petInfoSection.innerHTML = `
        <h2>Applying to Adopt: ${petName}</h2> 
        <p>Type: ${petType} | Breed: ${petBreed}</p>
        <p>Adoption Fee: $${adoptionFee} + Processing Fee: $${processingFee} = Total (before taxes): $${total}</p>`;
} else {
    // Handle case where petId is invalid
    petInfoSection.innerHTML = "<p class=\"error\">Incomplete Pet .</p>";
}

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

    // Gather the application into one object
    const application = {
        petId: petId,
        shelterId: shelterId,
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        residents: document.getElementById("residents").value,
        currentPets: document.getElementById("currentPets").value,
        experience: document.getElementById("experience").value,
        location: document.getElementById("location").value,
        donation: document.getElementById("donation").value
    };

    // Send it to the server, and only show the thank you once the server has accepted it
    fetch("/submit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(application)
    })
        .then(response => {
            if (!response.ok)
                throw new Error(`Application submission failed (${response.status})`);
            return response.json();
        })
        .then(() => {
            form.innerHTML = `
                <h2>Application Submitted Successfully!</h2>
                <p>Thank you for applying to adopt a pet. Our team will review your application and contact you soon.</p>
                <a href="/" class="return-home-button">Return to Home</a>`;
        })
        .catch(err => {
            console.error(err);
            alert("Sorry, your application could not be submitted. Please try again.");
        });
});
