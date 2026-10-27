const STATUSES = ["Unprocessed", "Pending", "Rejected", "Approved"];

const message = document.getElementById("applicationsMessage");
const table = document.getElementById("applicationsTable");
const tableBody = document.getElementById("applicationsBody");
const detailsSection = document.getElementById("applicationDetails");

// The View button currently toggled on (only one at a time)
let activeViewButton = null;

// Escape text coming from applicants before putting it into HTML
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

// Set the color class of a status dropdown to match its current value
function colorStatusSelect(select) {
    STATUSES.forEach(s => select.classList.remove(`status-${s}`));
    select.classList.add(`status-${select.value}`);
}

// Tell the server about a changed status
function updateStatus(applicationId, status, select, previousStatus) {
    fetch("/applications-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: applicationId, status: status })
    })
        .then(response => {
            if (!response.ok)
                throw new Error(`Status update failed (${response.status})`);
            return response.json();
        })
        .then(() => {
            select.dataset.previous = status;
            // Keep an open details panel in step with the new status
            if (activeViewButton && activeViewButton.dataset.id === applicationId) {
                const shown = document.getElementById("detailsStatus");
                if (shown) shown.textContent = status;
            }
        })
        .catch(err => {
            console.error(err);
            // Put the dropdown back to what the server still has
            select.value = previousStatus;
            colorStatusSelect(select);
            message.textContent = "Could not update the application status.";
            message.className = "applications-message error";
        });
}

// Build one table row for an application
function addRow(app) {
    const row = document.createElement("tr");
    const date = new Date(app.submitted).toLocaleString();

    row.innerHTML = `
        <td>${escapeHtml(date)}</td>
        <td class="id-cell">${escapeHtml(app.applicationId)}<button class="view-button" data-id="${escapeHtml(app.applicationId)}">View</button></td>
        <td>${escapeHtml(app.shelterId)}</td>
        <td>${escapeHtml(app.petId)}</td>
        <td>${escapeHtml(app.petType)}</td>
        <td></td>`;

    // Status dropdown
    const select = document.createElement("select");
    select.className = "status-select";
    STATUSES.forEach(s => {
        const option = document.createElement("option");
        option.value = s;
        option.textContent = s;
        select.appendChild(option);
    });
    select.value = app.status;
    select.dataset.previous = app.status;
    colorStatusSelect(select);
    select.addEventListener("change", () => {
        colorStatusSelect(select);
        updateStatus(app.applicationId, select.value, select, select.dataset.previous);
    });
    row.lastElementChild.appendChild(select);

    // View button
    row.querySelector(".view-button").addEventListener("click", e => toggleDetails(e.target));

    tableBody.appendChild(row);
}

// Show the details of an application, or hide them if its View button is toggled off
async function toggleDetails(button) {
    if (activeViewButton === button) {
        button.classList.remove("active");
        activeViewButton = null;
        detailsSection.classList.add("hidden");
        detailsSection.innerHTML = "";
        return;
    }

    // Switch any previously selected button off
    if (activeViewButton)
        activeViewButton.classList.remove("active");
    activeViewButton = button;
    button.classList.add("active");
    detailsSection.classList.add("hidden");
    detailsSection.innerHTML = "";

    try {
        const appResponse = await fetch(`/applications-details?id=${encodeURIComponent(button.dataset.id)}`);
        if (!appResponse.ok)
            throw new Error(`Application request failed (${appResponse.status})`);
        const application = await appResponse.json();

        const petResponse = await fetch(`/shelters/pets?petId=${encodeURIComponent(application.petId)}&shelterId=${encodeURIComponent(application.shelterId)}`);
        if (!petResponse.ok)
            throw new Error(`Pet request failed (${petResponse.status})`);
        const pet = await petResponse.json();

        // The user may have toggled to another button while waiting
        if (activeViewButton !== button)
            return;
        renderDetails(application, pet);
    } catch (err) {
        console.error(err);
        if (activeViewButton === button) {
            detailsSection.innerHTML = "<p class=\"applications-message error\">Could not load the application details.</p>";
            detailsSection.classList.remove("hidden");
        }
    }
}

function renderDetails(a, pet) {
    detailsSection.innerHTML = `
        <h2>Application ${escapeHtml(a.applicationId)}</h2>
        <div class="details-grid">
            <div class="details-card">
                <h3>Application Information</h3>
                <p><strong>Date Submitted:</strong> ${escapeHtml(new Date(a.submitted).toLocaleString())}</p>
                <p><strong>Status:</strong> <span id="detailsStatus">${escapeHtml(a.status)}</span></p>
                <p><strong>Pet ID:</strong> ${escapeHtml(a.petId)}</p>
                <p><strong>Shelter ID:</strong> ${escapeHtml(a.shelterId)}</p>
            </div>
            <div class="details-card">
                <h3>Pet Requested</h3>
                <img class="details-pet-image" src="${escapeHtml(pet.image)}" alt="${escapeHtml(pet.name)}">
                <p><strong>Name:</strong> ${escapeHtml(pet.name)}</p>
                <p><strong>Type:</strong> ${escapeHtml(pet.type)} | <strong>Breed:</strong> ${escapeHtml(pet.breed)}</p>
                <p><strong>Age:</strong> ${escapeHtml(pet.age)} | <strong>Days at Shelter:</strong> ${escapeHtml(pet.daysAtShelter ?? "N/A")}</p>
            </div>
            <div class="details-card">
                <h3>Applicant Information</h3>
                <p><strong>Name:</strong> ${escapeHtml(a.name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(a.email)}</p>
                <p><strong>Phone:</strong> ${escapeHtml(a.phone)}</p>
                <p><strong>Address:</strong> ${escapeHtml(a.address)}</p>
            </div>
            <div class="details-card">
                <h3>Household Details</h3>
                <p><strong>Residents:</strong> ${escapeHtml(a.residents)}</p>
                <p><strong>Current Pets:</strong> ${escapeHtml(a.currentPets)}</p>
                <p><strong>Experience:</strong> ${escapeHtml(a.experience)}</p>
                <p><strong>Pet Location:</strong> ${escapeHtml(a.location)}</p>
            </div>
        </div>`;
    detailsSection.classList.remove("hidden");
}

// Load all applications when the page loads
fetch("/applications-data")
    .then(response => {
        if (!response.ok)
            throw new Error(`Applications request failed (${response.status})`);
        return response.json();
    })
    .then(applications => {
        if (applications.length === 0) {
            message.textContent = "No applications have been submitted yet.";
            return;
        }
        applications.forEach(addRow);
        table.classList.remove("hidden");
    })
    .catch(err => {
        console.error(err);
        message.textContent = "Sorry, the applications could not be loaded. Please try again later.";
        message.className = "applications-message error";
    });
