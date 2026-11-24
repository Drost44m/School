// Send the application status update to the server
function updateStatus(appId, newStatus) {
    let data = {};
    data.applicationId = appId;
    data.status = newStatus;

    // Send the update to the server
    fetch("/applications-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .catch(error => {
        alert("Error submitting status update: " + error);
    });
}

// Add the event listeners to the rows that the server already created
function setupTable() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(viewBtn => {
        viewBtn.addEventListener('click', () => {
            // Check if this button is already active
            const isActive = viewBtn.classList.contains('active');

            // Remove active class from all view buttons and add it back to the clicked button
            viewBtns.forEach(btn => btn.classList.remove('active'));

            if (!isActive) {
                viewBtn.classList.add('active');
                const row = viewBtn.parentElement.parentElement;
                const shelterId = row.children[2].textContent;
                const petId = row.children[3].textContent;

                // Get the specific pet data from the server for pet with specified shelterId and petId
                fetch("/shelters/pets?shelterId=" + shelterId + "&petId=" + petId)
                    .then(res => res.json())
                    .then(pet => {
                        // Now get the application data
                        fetch("/applications-details?id=" + viewBtn.dataset.id)
                            .then(res => res.json())
                            .then(details => {
                                showApplicationDetails(pet, details);
                            })
                            .catch(err => {
                                console.error("Error accessing application information:", err);
                            });
                    })
                    .catch(err => {
                        console.error("Error accessing pet information:", err);
                    });
            } else {
                // If it was active, just clear the details section
                document.getElementById('applicationDetails').innerHTML = '';
            }
        });
    });

    // Add the event listener for the status dropdown lists
    const selects = document.querySelectorAll('.status-select');
    selects.forEach(select => {
        select.addEventListener('change', () => {
            const statusCell = select.parentElement;
            // Remove old status classes from the cell and select, then add the new one
            const all = ["status-Unprocessed", "status-Pending", "status-Approved", "status-Rejected"];
            statusCell.classList.remove(...all);
            select.classList.remove(...all);
            statusCell.classList.add("status-" + select.value);
            select.classList.add("status-" + select.value);
            updateStatus(select.dataset.id, select.value);
        });
    });
}

// This function displays all the application's details below the selected application
function showApplicationDetails(pet, details) {
    const div = document.getElementById('applicationDetails');

    div.innerHTML = `
        <div class="details-card">
            <table class="details-layout">
                <tr>
                    <td class="details-col">
                        <h4>Application Info</h4>
                        <p><strong>Date Submitted:</strong> ${details.date}</p>
                        <p><strong>Status:</strong> ${details.status}</p>
                        <p><strong>Pet ID:</strong> ${details.petId}</p>
                        <p><strong>Shelter ID:</strong> ${details.shelterId}</p>
                    </td>
                    <td class="details-col">
                        <h4>Pet Requested</h4>
                        <table class="pet-requested-layout">
                            <tr>
                                <td class="pet-text">
                                    <p><strong>Name:</strong> ${pet.name}</p>
                                    <p><strong>Type:</strong> ${pet.type}</p>
                                    <p><strong>Breed:</strong> ${pet.breed}</p>
                                    <p><strong>Age:</strong> ${pet.age}</p>
                                    <p><strong>Days at Shelter:</strong> ${pet.daysAtShelter}</p>
                                </td>
                                <td class="pet-image-cell">
                                    <img src="../${pet.image}" alt="${pet.name}" class="pet-image" />
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="details-col" colspan="2">
                        <h4>Applicant Information</h4>
                        <p><strong>Name:</strong> ${details.name || ""}</p>
                        <p><strong>Email:</strong> ${details.email || ""}</p>
                        <p><strong>Phone:</strong> ${details.phone || ""}</p>
                        <p><strong>Address:</strong> ${details.address}</p>

                        <h4>Household Details</h4>
                        <p><strong>Number of Residents:</strong> ${details.residents || ""}</p>
                        <p><strong>Current Pets:</strong> ${details.currentPets || ""}</p>
                        <p><strong>Experience Level:</strong> ${details.experience || ""}</p>
                        <p><strong>Pet Location:</strong> ${details.location || ""}</p>

                        <h4>Support</h4>
                        <p><strong>Donation:</strong> $${details.donation || ""}</p>
                    </td>
                </tr>
            </table>
        </div>
    `;
}

// Set up the page once it has loaded
document.addEventListener('DOMContentLoaded', setupTable);