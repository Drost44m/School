// Get the cart items from the local storage (which was set by the menu-page.js srcipt)
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Add the item names and their prices to the table and calculate totals
function renderCart() {
    const tableBody = document.getElementById("cart-items");

    tableBody.innerHTML = "";
    let subtotal = 0;
    for (const item of cart) {
        subtotal += item.price;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="text-align:left;">${item.name}</td>
            <td style="text-align:right;">$${item.price.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    }
    const hst = subtotal * 0.13;
    const total = subtotal + hst;
    document.getElementById("hst").textContent = `$${hst.toFixed(2)}`;
    document.getElementById("cart-total").textContent = `$${total.toFixed(2)}`;
}

// Handle the placing of an order
function placeOrder() {
    const message = document.getElementById("order-message");

    // Send the order to the server via route:  POST /order
    // ...

    // Clear the cart
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));

    // Display a message to explain what happened
    message.textContent = "Order placed successfully!";
    message.classList.remove("hidden");
    document.getElementById("place-order-btn").classList.add("hidden");
}

// Start things off by displaying the cart contents and setting up the Place Order button handler
async function init() {
    if (cart.length === 0) {
        const message = document.getElementById("order-message");
        message.textContent = "Your cart is empty!";
        message.classList.remove("hidden");
        document.getElementById("place-order-btn").classList.add("hidden");
    }
    else {
        renderCart();
        document.getElementById("place-order-btn").addEventListener("click", placeOrder);
    }
}
init();