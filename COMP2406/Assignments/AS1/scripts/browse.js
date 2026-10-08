// browse.js - populates browse.html from shelterData.js
// Relies on `shelters` from shelterData.js (loaded first).

// Grab the elements we'll need from the page
const shelterSelect = document.getElementById("shelterSelect");
const typeButtonsContainer = document.getElementById("typeButtons");
const typeButtons = document.querySelectorAll("#typeButtons button");
const petGrid = document.getElementById("petGrid");

// Maps a pet's `type` in the data to one of the button groups
function buttonGroupFor(petType) {
  switch (petType) {
    case "Cat":
      return "cat";
    case "Dog":
      return "dog";
    case "Bird":
    case "Parrot":
      return "bird";
    case "Reptile":
      return "reptile";
    default:
      return "other";
  }
}

// Add one <option> per shelter to the drop-down list
function populateShelterOptions() {
  shelters.forEach((shelter) => {
    const option = document.createElement("option");
    option.value = shelter.id;
    option.textContent = shelter.name;
    shelterSelect.appendChild(option);
  });
}

// Only one button can be selected at a time (radio-button behaviour)
function selectTypeButton(type) {
  typeButtons.forEach((button) => {
    const isSelected = button.dataset.type === type;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", isSelected);
  });
}

// Show one card per pet (filtered by type, unless type is "all")
function renderPets(shelter, type) {
  petGrid.textContent = "";

  const pets = type === "all"
    ? shelter.pets
    : shelter.pets.filter((pet) => buttonGroupFor(pet.type) === type);

  pets.forEach((pet) => {
    const card = document.createElement("div");

    const image = document.createElement("img");
    image.src = pet.image;
    image.alt = pet.name;

    const heading = document.createElement("h2");
    heading.textContent = pet.name;

    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.textContent = "View Details";
    // Send the pet's id and the shelter's id to pet.html
    detailsButton.addEventListener("click", () => {
      window.location.href = `pet.html?id=${pet.id}&shelter=${shelter.id}`;
    });

    card.append(image, heading, detailsButton);
    petGrid.appendChild(card);
  });
}

// Enable only the buttons for pet types the chosen shelter actually has,
// then reset the selection to "All" and show that shelter's pets
function updateTypeButtons() {
  const shelter = shelters.find((s) => s.id === shelterSelect.value);

  if (!shelter) {
    typeButtonsContainer.hidden = true;
    petGrid.textContent = "";
    return;
  }

  typeButtonsContainer.hidden = false;

  const availableTypes = new Set(shelter.pets.map((pet) => buttonGroupFor(pet.type)));

  typeButtons.forEach((button) => {
    if (button.dataset.type === "all") {
      button.disabled = shelter.pets.length === 0;
    } else {
      button.disabled = !availableTypes.has(button.dataset.type);
    }
  });

  selectTypeButton("all");
  renderPets(shelter, "all");
}

// Clicking an (enabled) type button selects it and shows its pets
typeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.disabled) return;

    selectTypeButton(button.dataset.type);

    const shelter = shelters.find((s) => s.id === shelterSelect.value);
    if (shelter) renderPets(shelter, button.dataset.type);
  });
});

shelterSelect.addEventListener("change", updateTypeButtons);

// Set everything up when the page first loads
populateShelterOptions();

// Returning from pet.html (via "Back to Browsing") re-selects that shelter;
// arriving fresh (e.g. the nav "Browse Pets" link) leaves nothing selected.
const params = new URLSearchParams(window.location.search);
const shelterIdParam = params.get("shelter");
if (shelterIdParam && shelters.some((s) => s.id === shelterIdParam)) {
  shelterSelect.value = shelterIdParam;
  updateTypeButtons();
}
