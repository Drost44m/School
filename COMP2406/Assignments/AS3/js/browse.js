// Pressing any button with a data-href (type buttons and "View Details") goes to that page
const buttons = document.querySelectorAll("button[data-href]");
buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (btn.classList.contains("disabled"))
            return;
        window.location.href = btn.dataset.href;
    });
});

// Choosing a shelter reloads the page with that shelter selected
const shelterDropdown = document.getElementById("shelterDropdown");
shelterDropdown.addEventListener("change", () => {
    if (shelterDropdown.value)
        window.location.href = "/browse?shelterId=" + shelterDropdown.value;
    else
        window.location.href = "/browse";
});
