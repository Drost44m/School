// CHeck if there is a shelterID (from a page's back button press)
const params = new URLSearchParams(window.location.search);
const savedShelterId = params.get("shelterId");

const shelterDropdown = document.getElementById("shelterDropdown");
const petContainer = document.getElementById("petContainer");
const petTypeBar = document.getElementById("petTypeBar");

// Request the full data (including pets) of one shelter from the server
function fetchShelter(shelterId) {
    return fetch(`/shelters?id=${encodeURIComponent(shelterId)}`)
        .then(response => {
            if (!response.ok)
                throw new Error(`Shelter request failed (${response.status})`);
            return response.json();
        });
}

// Show the pets of a freshly fetched shelter, replacing any previous shelter data
function showShelter(shelter) {
    currentShelter = shelter;
    currentPets = shelter.pets;
    activeType = "All";
    renderPets(currentPets);
    updatePetTypeButtons(shelter);
}

// Populate list of shelters (id, name, city and processingFee only), then restore any saved selection
fetch("/shelters")
    .then(response => {
        if (!response.ok)
            throw new Error(`Shelter list request failed (${response.status})`);
        return response.json();
    })
    .then(shelterList => {
        shelterList.forEach(shelter => {
            const option = document.createElement("option");
            option.value = shelter.id;
            option.textContent = shelter.name;
            shelterDropdown.appendChild(option);
        });
        resetPage();
    })
    .catch(err => console.error(err));

// Reset the page to a fresh start or to the selected shelter incoming as a parameter
function resetPage() {
    if (savedShelterId) {
        shelterDropdown.value = savedShelterId;
        if (shelterDropdown.value === savedShelterId) {
            fetchShelter(savedShelterId)
                .then(showShelter)
                .catch(err => console.error(err));
        }
    }
    else {
        shelterDropdown.value = "";                     // reset dropdown
        petContainer.innerHTML = "";                    // clear pets
        petTypeBar.classList.add("hidden");             // hide type bar
        petTypeBar.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));
    }
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
    
        // Add click listener to open the details page for this pet
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
    // SHow the buttons now, they were hidden on start up
    petTypeBar.classList.remove("hidden");
}

// Assume no pets to start and "All" as the active type
let currentShelter = null;
let currentPets = [];
let activeType = "All";


// Handle shelter selection
shelterDropdown.addEventListener("change", () => {
    const shelterId = shelterDropdown.value;

    // If there is no shelter selected, default to a rest page
    if (!shelterId) {
        resetPage();
        return;
    }

    // Request the selected shelter from the server, discarding the previous one
    fetchShelter(shelterId)
        .then(showShelter)
        .catch(err => console.error(err));
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

    // Adjust the pet array to be filtered based on the active type button
    const filtered = currentPets.filter(p => {
        return ((activeType === "All") || (activeType === p.type)) ;
    });

    // Re-render the pet cards 
    renderPets(filtered);
});

// The page starts blank; resetPage() runs once the shelter list has loaded
