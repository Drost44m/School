// Handle PUT
document.querySelectorAll(".save").forEach(button => {
    button.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        const row = e.target.closest("tr"); // get the row with this button in it

        // Create an object with the item values
        const inputs = row.querySelectorAll("input, textarea");
        const updatedItem = {};
        inputs.forEach(input => {
            updatedItem[input.name] = input.value;
        });
        updatedItem.price = parseFloat(updatedItem.price); // convert to number

        // Now send the updated item to the server
        try {
            const response = await fetch(`/api/menu/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedItem)
            });
            if (response.ok) 
                alert("Update of Menu Item was successful");
            else 
                alert("Update failed");
        } catch (err) {
            console.error("Error updating item:", err);
        }
    });
});

// Handle DELETE
document.querySelectorAll(".delete").forEach(button => {
    button.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;

        if (!confirm("Are you sure you want to delete this item?"))
            return;
        try {
            const response = await fetch(`/api/menu/${id}`, { method: "DELETE" });
            if (response.ok) {
                const row = e.target.closest("tr"); // get the row with this button in it
                row.remove(); // remove from table immediately
            } else 
                alert("Delete failed");
        } catch (err) {
            console.error("Error deleting item:", err);
        }
    });
});