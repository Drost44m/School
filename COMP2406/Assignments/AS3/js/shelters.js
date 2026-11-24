// Handle the Add Shelter button
document.getElementById("addShelterBtn").addEventListener("click", () => {
    const name = document.getElementById("shelterName").value.trim();
    const city = document.getElementById("shelterCity").value.trim();
    const fee = document.getElementById("shelterFee").value.trim();

    // Nothing is sent to the server if anything is blank
    if (name === "") {
        alert("The shelter name must not be blank.");
        return;
    }
    if (city === "") {
        alert("The shelter city must not be blank.");
        return;
    }
    if (fee === "") {
        alert("The shelter processing fee must not be blank.");
        return;
    }

    fetch("/admin/shelters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, city: city, processingFee: fee })
    })
    .then(res => {
        res.text().then(message => {
            if (res.ok) {
                alert("Shelter added successfully.");
                window.location.reload(); // Show the new shelter in the list
            }
            else
                alert("Shelter was not added: " + message);
        });
    })
    .catch(error => {
        alert("Error adding shelter: " + error);
    });
});

// Handle clicking on any of the remove images
const removeIcons = document.querySelectorAll(".remove-icon");
removeIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        // Make sure the user really wants to delete this shelter
        if (!confirm("Are you sure you want to delete " + icon.dataset.name + "?"))
            return;

        fetch("/admin/shelters/" + icon.dataset.id, { method: "DELETE" })
        .then(res => {
            res.text().then(message => {
                if (res.ok) {
                    alert("Shelter deleted successfully.");
                    window.location.reload(); // Show the list without the shelter
                }
                else
                    alert("Shelter was not deleted: " + message);
            });
        })
        .catch(error => {
            alert("Error deleting shelter: " + error);
        });
    });
});
