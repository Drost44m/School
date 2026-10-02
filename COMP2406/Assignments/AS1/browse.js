// browse.js - pet-type button group for browse.html
// Relies on `shelters` from shelterData.js (loaded first).

const shelterSelect = document.getElementById("shelterSelect");
const typeButtons = document.querySelectorAll("#typeButtons button");

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

// Only one button can be selected at a time (radio-button behaviour)
function selectTypeButton(type) {
  typeButtons.forEach((button) => {
    const isSelected = button.dataset.type === type;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", isSelected);
  });
}

// Enable only the buttons for pet types the chosen shelter actually has,
// then reset the selection to "All"
function updateTypeButtons() {
  const shelter = shelters.find((s) => s.id === shelterSelect.value);
  if (!shelter) return;

  const availableTypes = new Set(shelter.pets.map((pet) => buttonGroupFor(pet.type)));

  typeButtons.forEach((button) => {
    if (button.dataset.type === "all") {
      button.disabled = shelter.pets.length === 0;
    } else {
      button.disabled = !availableTypes.has(button.dataset.type);
    }
  });

  selectTypeButton("all");
}

typeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!button.disabled) {
      selectTypeButton(button.dataset.type);
    }
  });
});

shelterSelect.addEventListener("change", updateTypeButtons);

// first shelter is selected when the page loads
updateTypeButtons();
