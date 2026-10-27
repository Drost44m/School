// Get the pet and shelter IDs from the URL, e.g., /details?petId=p12&shelterId=s3
const params = new URLSearchParams(window.location.search);
const petId = params.get("petId");
const shelterId = params.get("shelterId");
const petContainer = document.getElementById("petDetailsContainer");
const backButton = document.getElementById("back-button");

// Request the pet and the basic shelter data, rendering only once both have arrived
function loadPage() {
    if (!petId || !shelterId) {
        showError();
        return;
    }

    const petRequest = fetch(`/shelters/pets?petId=${encodeURIComponent(petId)}&shelterId=${encodeURIComponent(shelterId)}`)
        .then(response => {
            if (!response.ok)
                throw new Error(`Pet request failed (${response.status})`);
            return response.json();
        });

    const shelterRequest = fetch("/shelters")
        .then(response => {
            if (!response.ok)
                throw new Error(`Shelter request failed (${response.status})`);
            return response.json();
        })
        .then(list => {
            const shelter = list.find(s => s.id === shelterId);
            if (!shelter)
                throw new Error("Shelter not found");
            return shelter;
        });

    Promise.all([petRequest, shelterRequest])
        .then(([pet, shelter]) => renderPetPage(pet, shelter))
        .catch(err => {
            console.error(err);
            showError();
        });
}

function showError() {
    petContainer.innerHTML = "<p class=\"error\">Pet not found.</p>";
}

// Render the pet details page by inserting the image and pet data into the static HTML 
function renderPetPage(pet, shelter) {
    // Build up the traits list
    const traitsList = pet.traits.length
        ? `<ul>${pet.traits.map(t => `<li>${t}</li>`).join("")}</ul>`
        : "<br>";

    // Compute processing fee from shelter
    const processingFee = shelter.processingFee || 30; // default 30 if missing
    const totalFee = Number(pet.adoptionFee) + Number(processingFee);

    // Set the link for the back button
    backButton.innerHTML = `<a href="/browse?shelterId=${shelterId}" class="back-link">Back to Browsing</a>`;

    // Build up the Pet Card
    const html = `
        <div class="pet-detail-card">
            <img src="${pet.image}" alt="${pet.name}" class="pet-detail-image">
            <h2>${pet.name}</h2>
            <p>${pet.age} year old ${pet.breed} (${pet.type})</p>
            <p><strong>Health:</strong> ${pet.health}</p>
            ${traitsList}
            <p><strong>Days at Shelter:</strong> ${pet.daysAtShelter ?? "N/A"}</p>
            <hr>
            <p><strong>Adoption Fee:</strong> $${pet.adoptionFee}</p>
            <p><strong>Processing Fee:</strong> $${processingFee}</p>
            <p><strong>Total (before taxes):</strong> $${totalFee}</p>
            <a href="/apply?petId=${pet.id}&shelterId=${shelterId}&petName=${encodeURIComponent(pet.name)}&petType=${encodeURIComponent(pet.type)}&petBreed=${encodeURIComponent(pet.breed)}&adoptionFee=${pet.adoptionFee}&processingFee=${processingFee}" 
               class="apply-button">Apply to Adopt this Pet</a>
        </div> `;

    // Insert this new content into the page
    petContainer.innerHTML = html;
}

// Load the data and render
loadPage();
