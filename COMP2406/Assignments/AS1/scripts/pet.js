// pet.js - populates pet.html from shelterData.js based on the
// `id` (pet) and `shelter` query parameters passed in from browse.html

// Read which pet and shelter to show from the URL
const params = new URLSearchParams(window.location.search);
const petId = params.get("id");
const shelterId = params.get("shelter");

// Look up the matching shelter and pet in the data
const shelter = shelters.find((s) => s.id === shelterId);
const pet = shelter ? shelter.pets.find((p) => p.id === petId) : undefined;

if (pet && shelter) {
  // Fill in the pet's picture and details
  const petImage = document.getElementById("petImage");
  petImage.src = pet.image;
  petImage.alt = pet.name;

  document.getElementById("petName").textContent = pet.name;
  document.getElementById("petSummary").textContent =
    `${pet.age} year old ${pet.breed} (${pet.type})`;
  document.getElementById("petHealth").textContent = `Health: ${pet.health}`;
  document.getElementById("petTraits").textContent = `Traits: ${pet.traits.join(", ")}`;
  document.getElementById("petDays").textContent = `Days at Shelter: ${pet.daysAtShelter}`;

  // Add up the fees and show them, with each one on its own line
  const total = pet.adoptionFee + shelter.processingFee;
  document.getElementById("petFees").append(
    `Adoption Fee: $${pet.adoptionFee}`,
    document.createElement("br"),
    `Processing Fee: $${shelter.processingFee}`,
    document.createElement("br"),
    `Total: $${total}`
  );

  // Keep the shelter selected when the user goes back to browse.html
  document.getElementById("backLink").href = `browse.html?shelter=${shelter.id}`;

  // Send the pet and fee details to apply.html
  document.getElementById("applyButton").addEventListener("click", () => {
    window.location.href =
      `apply.html?petId=${pet.id}&petName=${encodeURIComponent(pet.name)}` +
      `&petType=${encodeURIComponent(pet.type)}&petBreed=${encodeURIComponent(pet.breed)}` +
      `&adoptionFee=${pet.adoptionFee}&processingFee=${shelter.processingFee}`;
  });
}
