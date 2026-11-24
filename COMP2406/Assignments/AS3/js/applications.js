// Send the application status update to the server
function updateStatus(appId, newStatus) {
    let data = {};
    data.applicationId = appId;
    data.status = newStatus;

    fetch("/admin/applications-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .catch(error => {
        alert("Error submitting status update: " + error);
    });
}

// Put a value into the element with the given id
function setText(id, value) {
    document.getElementById(id).textContent = value;
}

// Fill in the (already existing) details elements with the application and pet data
function showApplicationDetails(pet, details) {
    setText("d-date", details.date);
    setText("d-status", details.status);
    setText("d-petId", details.petId);
    setText("d-shelterId", details.shelterId);

    setText("p-name", pet.name);
    setText("p-type", pet.type);
    setText("p-breed", pet.breed);
    setText("p-age", pet.age);
    setText("p-days", pet.daysAtShelter);
    document.getElementById("p-image").src = "/" + pet.image;
    document.getElementById("p-image").alt = pet.name;

    setText("a-name", details.name || "");
    setText("a-email", details.email || "");
    setText("a-phone", details.phone || "");
    setText("a-address", details.address || "");
    setText("a-residents", details.residents || "");
    setText("a-currentPets", details.currentPets || "");
    setText("a-experience", details.experience || "");
    setText("a-location", details.location || "");
    setText("a-donation", details.donation || "");

    document.querySelector(".details-card").classList.remove("hidden");
}

const viewBtns = document.querySelectorAll('.view-btn');
viewBtns.forEach(viewBtn => {
    viewBtn.addEventListener('click', () => {
        // Check if this button is already active
        const isActive = viewBtn.classList.contains('active');

        // Remove active class from all view buttons
        viewBtns.forEach(btn => btn.classList.remove('active'));

        if (isActive) {
            // If it was active, just hide the details
            document.querySelector(".details-card").classList.add("hidden");
            return;
        }
        viewBtn.classList.add('active');
        const row = viewBtn.parentElement.parentElement;
        const shelterId = row.children[2].textContent;
        const petId = row.children[3].textContent;

        // Get the pet data, then the application data
        fetch("/shelters/pets?shelterId=" + shelterId + "&petId=" + petId)
            .then(res => res.json())
            .then(pet => {
                fetch("/admin/applications-details?id=" + viewBtn.dataset.id)
                    .then(res => res.json())
                    .then(details => showApplicationDetails(pet, details))
                    .catch(err => console.error("Error accessing application information:", err));
            })
            .catch(err => console.error("Error accessing pet information:", err));
    });
});

// Handle the status dropdown lists
const selects = document.querySelectorAll('.status-select');
selects.forEach(select => {
    select.addEventListener('change', () => {
        const statusCell = select.parentElement;
        const all = ["status-Unprocessed", "status-Pending", "status-Approved", "status-Rejected"];
        statusCell.classList.remove(...all);
        select.classList.remove(...all);
        statusCell.classList.add("status-" + select.value);
        select.classList.add("status-" + select.value);
        updateStatus(select.dataset.id, select.value);
    });
});
