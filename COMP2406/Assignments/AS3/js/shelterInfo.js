const shelterId = document.querySelector(".shelter-info-main").dataset.shelterId;

const detailsSection = document.getElementById("petDetailsSection");
const petIdInput = document.getElementById("petId");
const petTypeInput = document.getElementById("petType");
const petNameInput = document.getElementById("petName");
const petBreedInput = document.getElementById("petBreed");
const petAgeInput = document.getElementById("petAge");
const petFeeInput = document.getElementById("petFee");
const petHealthInput = document.getElementById("petHealth");
const petTraitsInput = document.getElementById("petTraits");
const petImage = document.getElementById("petImage");
const petImageName = document.getElementById("petImageName");
const imageFile = document.getElementById("imageFile");
const savePetBtn = document.getElementById("savePetBtn");

const DEFAULT_IMAGE = "images/unknownPet.jpg";

// Remember the newly chosen image file (if any) and whether we are adding a new pet
let localFile = null;
let addingPet = false;

// ----- Shelter Information section -----
document.getElementById("saveShelterBtn").addEventListener("click", () => {
    const data = {
        id: document.getElementById("shelterId").value.trim(),
        name: document.getElementById("shelterName").value.trim(),
        city: document.getElementById("shelterCity").value.trim(),
        processingFee: document.getElementById("shelterFee").value.trim()
    };
    if (data.id === "" || data.name === "" || data.city === "" || data.processingFee === "") {
        alert("The ID, name, city and processing fee must not be blank.");
        return;
    }

    fetch("/admin/shelters/" + shelterId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => {
        res.text().then(message => {
            if (res.ok) {
                alert("Shelter changes saved.");
                // The page address contains the ID, so go to the (possibly new) address
                window.location.href = "/admin/shelters/" + data.id;
            }
            else
                alert("Changes were not saved: " + message);
        });
    })
    .catch(error => alert("Error saving changes: " + error));
});

// ----- List of Pets section -----

// Show the given image in the details section
function showImage(src) {
    petImage.src = src;
}

// Selecting a row shows that pet in the Pet Details section
document.querySelectorAll("#petTableBody tr").forEach(row => {
    row.addEventListener("click", () => {
        addingPet = false;
        localFile = null;
        imageFile.value = "";
        savePetBtn.textContent = "Save Changes";

        petIdInput.value = row.dataset.id;
        petTypeInput.value = row.dataset.type;
        petNameInput.value = row.dataset.name;
        petBreedInput.value = row.dataset.breed;
        petAgeInput.value = row.dataset.age;
        petFeeInput.value = row.dataset.fee;
        petHealthInput.value = row.dataset.health;
        petTraitsInput.value = row.dataset.traits;
        petImageName.value = row.dataset.image;
        showImage("/" + row.dataset.image);
        detailsSection.classList.remove("hidden");
    });
});

// Removing a pet
document.querySelectorAll("#petTableBody .remove-icon").forEach(icon => {
    icon.addEventListener("click", (event) => {
        event.stopPropagation(); // Don't also select the row
        const row = icon.parentElement.parentElement;
        if (!confirm("Are you sure you want to delete " + row.dataset.name + "?"))
            return;

        fetch("/admin/shelters/" + shelterId + "/pets/" + row.dataset.id, { method: "DELETE" })
        .then(res => {
            res.text().then(message => {
                if (res.ok) {
                    alert("Pet deleted successfully.");
                    window.location.reload();
                }
                else
                    alert("Pet was not deleted: " + message);
            });
        })
        .catch(error => alert("Error deleting pet: " + error));
    });
});

// New Pet button: show an empty Pet Details section
document.getElementById("newPetBtn").addEventListener("click", () => {
    addingPet = true;
    localFile = null;
    imageFile.value = "";
    savePetBtn.textContent = "Add Pet";

    petIdInput.value = "";
    petTypeInput.value = "Cat";
    petNameInput.value = "";
    petBreedInput.value = "";
    petAgeInput.value = "";
    petFeeInput.value = "";
    petHealthInput.value = "";
    petTraitsInput.value = "";
    petImageName.value = DEFAULT_IMAGE;
    showImage("/" + DEFAULT_IMAGE);
    detailsSection.classList.remove("hidden");
});

// ----- Pet Details section -----

// Choose New Image button opens the file chooser
document.getElementById("chooseImageBtn").addEventListener("click", () => {
    imageFile.click();
});

// Preview the chosen image using a temporary URL, then free it once loaded
imageFile.addEventListener("change", () => {
    if (imageFile.files.length === 0)
        return;
    localFile = imageFile.files[0];
    petImageName.value = localFile.name;
    const fileURL = URL.createObjectURL(localFile);
    petImage.onload = () => {
        URL.revokeObjectURL(fileURL);
        petImage.onload = null;
    };
    petImage.src = fileURL;
});

// Cancel just hides the section
document.getElementById("cancelPetBtn").addEventListener("click", () => {
    detailsSection.classList.add("hidden");
});

// Save Changes / Add Pet
savePetBtn.addEventListener("click", () => {
    // Make sure nothing is blank
    const values = [petNameInput.value, petBreedInput.value, petAgeInput.value, petFeeInput.value,
                    petHealthInput.value, petTraitsInput.value, petImageName.value];
    for (let i=0; i<values.length; i++) {
        if (values[i].trim() === "") {
            alert("None of the pet fields can be blank. Please fill in everything.");
            return;
        }
    }

    // The data (and image, if one was chosen) is sent as form data
    const formData = new FormData();
    formData.append("name", petNameInput.value.trim());
    formData.append("type", petTypeInput.value);
    formData.append("breed", petBreedInput.value.trim());
    formData.append("age", petAgeInput.value.trim());
    formData.append("adoptionFee", petFeeInput.value.trim());
    formData.append("health", petHealthInput.value.trim());
    formData.append("traits", petTraitsInput.value.trim());
    if (localFile)
        formData.append("image", localFile);
    else
        formData.append("image", petImageName.value.trim()); // Just the name of the image already used

    let url = "/admin/shelters/" + shelterId + "/pets";
    let method = "POST";
    if (!addingPet) {
        url += "/" + petIdInput.value;
        method = "PUT";
    }

    fetch(url, { method: method, body: formData })
    .then(res => {
        res.text().then(message => {
            if (res.ok) {
                alert(addingPet ? "Pet added successfully." : "Pet changes saved.");
                window.location.reload(); // Refresh the table (this also hides the details)
            }
            else
                alert((addingPet ? "Pet was not added: " : "Changes were not saved: ") + message);
        });
    })
    .catch(error => alert("Error saving pet: " + error));
});
