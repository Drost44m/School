// Make sure to reset the cart after a back button press
window.addEventListener("pageshow", () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartButton = document.getElementById("view-cart");
    cartButton.textContent = `View Cart (${cart.length})`;
});
// Restaurant menu data
let categories = [];
let menuItems = [];
 
// GET the menu item data from the server via /api/menu
async function loadMenu() {
    try {
        const response = await fetch("/api/menu");
        if (!response.ok)
            throw new Error("Could not load menu");
        const menuData = await response.json();
        categories = menuData.categories;
        menuItems = menuData.menuItems;
    } catch (error) {
        console.error(error.message);
    }
}

async function main() {
    await loadMenu(); // Load menu when page starts
    // This will hold the ID of all menu items added to the cart
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartButton = document.getElementById("view-cart");
    cartButton.textContent = `View Cart (${cart.length})`;

    for (let catName of categories) {
        const cat = document.createElement('div');

        cat.classList.add("menu-category");
        if (catName === 'Drinks')
            cat.classList.add("drink");

        const h2 = document.createElement('h2');
        const arrow = document.createElement('span');
        arrow.textContent = "▸";
        arrow.classList.add("arrow");
        const text = document.createTextNode(" " + catName);
        h2.append(arrow, text);

        const ul = document.createElement('ul');

        cat.appendChild(h2);
        cat.appendChild(ul);


        // Find all menu items that belong to this category
        let catItems = menuItems.filter(item => item.category === catName);
        for (let item of catItems) {
            const li = document.createElement('li');
            const img = document.createElement('img');
            const div = document.createElement('div');
            const name = document.createElement('span');
            const price = document.createElement('span');
            const desc = document.createElement('p');

            img.src = item.image;
            img.alt = "menu item " + item.name;
            name.className = 'name';
            name.textContent = item.name;
            price.className = 'price';
            price.textContent = "$" + item.price;
            desc.textContent = item.description;

            // Build the structure inside the <li>
            li.appendChild(img);
            li.appendChild(div);

            // Build the structure inside the <div>
            div.appendChild(name);
            div.appendChild(price);
            div.appendChild(desc);

            // Add the <li> to the page inside the first <ul>
            ul.appendChild(li);

            // Fake order test
            const order = document.createElement('a');
            order.id = item.id;
            order.textContent = "Add to Cart";
            order.classList.add("order-button");
            order.addEventListener("click", () => {
                let cart = JSON.parse(localStorage.getItem("cart")) || [];
                cart.push(item);
                localStorage.setItem("cart", JSON.stringify(cart));
                cartButton.textContent = `View Cart (${cart.length})`;
            });
            div.appendChild(order);
        }

        ul.classList.add("hidden");
        h2.addEventListener("click", () => {
            ul.classList.toggle("hidden");
            h2.classList.toggle("open");
        });

        const footer = document.querySelector('footer');
        footer.before(cat);
    }
}
main();
