// Check if there is a shelterID (from a page's back button press)
const params = new URLSearchParams(window.location.search);
const savedShelterId = params.get("shelterId");

const shelterDropdown = document.getElementById("shelterDropdown");
const petContainer = document.getElementById("petContainer");
const petTypeBar = document.getElementById("petTypeBar");

// Assume no pets to start and "All" as the active type
let currentPets = [];
let activeType = "All";

// Start with a blank page or with the shelter previously selected
resetPage();

// Reset the page to a fresh start or to the selected shelter incoming as a parameter
function resetPage() {
    if (savedShelterId) {
        shelterDropdown.value = savedShelterId;
        showShelter(savedShelterId);
    }
    else {
        shelterDropdown.value = "";                     // reset dropdown
        petContainer.innerHTML = "";                    // clear pets
        petTypeBar.classList.add("hidden");             // hide type bar
        petTypeBar.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));
    }
}

// Get the shelter from the server, then show its pets and the type buttons
function showShelter(shelterId) {
    fetch("/shelters?id=" + shelterId)
        .then(res => res.json())
        .then(shelter => {
            currentPets = shelter.pets;
            activeType = "All";
            renderPets(currentPets);
            updatePetTypeButtons(shelter);
        })
        .catch(err => {
            console.error("Error accessing shelter information:", err);
            shelterDropdown.value = "";
            petContainer.innerHTML = "";
            petTypeBar.classList.add("hidden");
        });
}

// Return a histogram array of [pet types with their counts]
function getPetTypes(pets) {
    const types = { Cat:0, Dog:0, Bird:0, Reptile:0, Other:0 };
    pets.forEach(p => {
        types[p.type]++;
    });
    return types;
}

// Render the pets on page, grouped as little cards
function renderPets(pets) {
    petContainer.innerHTML = "";
    pets.forEach(p => {
        const card = document.createElement("div");
        card.className = "pet-card";
        card.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <button>View Details</button>`;

        // Add click listener to open the details page with the IDs
        const btn = card.querySelector("button");
        btn.addEventListener("click", () => {
            window.location.href = `/details?petId=${p.id}&shelterId=${shelterDropdown.value}`;
        });

        // Add the card to the page
        petContainer.appendChild(card);
    });
}

// Update the set of pet type buttons
function updatePetTypeButtons(shelter) {
    const counts = getPetTypes(shelter.pets);
    const buttons = petTypeBar.querySelectorAll("button");

    buttons.forEach(btn => {
        const type = btn.dataset.type;
        btn.classList.remove("active"); // make not active by default

        // Make sure that 'All' is selected/active by default and enabled
        if (type === "All") {
            btn.classList.add("active");
            btn.classList.remove("disabled");
        } else {
            // Disable types with no pets, otherwise enable
            if (counts[type] === 0)
                btn.classList.add("disabled");
            else
                btn.classList.remove("disabled");
        }
    });
    // Show the buttons now, they were hidden on start up
    petTypeBar.classList.remove("hidden");
}

// Handle shelter selection
shelterDropdown.addEventListener("change", () => {
    const shelterId = shelterDropdown.value;

    // If there is no shelter selected, show a blank page
    if (!shelterId) {
        petContainer.innerHTML = "";
        petTypeBar.classList.add("hidden");
        return;
    }
    showShelter(shelterId);
});

// Handle Pet type button selection
petTypeBar.addEventListener("click", e => {
    // Don't allow selection of disabled buttons
    if (e.target.tagName !== "BUTTON" || e.target.classList.contains("disabled"))
        return;

    // Set the type to whatever was clicked on
    activeType = e.target.dataset.type;

    // Highlight the active button, and unhighlight the others
    petTypeBar.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");

    // Show only the pets of the active type
    const filtered = currentPets.filter(p => {
        return ((activeType === "All") || (activeType === p.type)) ;
    });
    renderPets(filtered);
});
