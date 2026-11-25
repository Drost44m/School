
// Make sure to reset the cart after a back button press
window.addEventListener("pageshow", () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];    
    const cartButton = document.getElementById("view-cart");
    cartButton.textContent = `View Cart (${cart.length})`;
});

// This will hold the menu items added to the cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartButton = document.getElementById("view-cart");
cartButton.textContent = `View Cart (${cart.length})`;

// Add event handlers to handle the Add to Cart buttons
document.querySelectorAll(".add-to-cart").forEach(orderButton => {
    orderButton.addEventListener("click", () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let item = JSON.parse(orderButton.dataset.item);
        cart.push(item);
        localStorage.setItem("cart", JSON.stringify(cart));
        cartButton.textContent = `View Cart (${cart.length})`;
    });
});

// Add event handlers to handle the expanding/collapsing of the categories
document.querySelectorAll(".menu-category h2").forEach(h2 => {
    h2.addEventListener("click", () => {
        h2.nextElementSibling.classList.toggle("hidden");
        h2.classList.toggle("open");
    });
});
