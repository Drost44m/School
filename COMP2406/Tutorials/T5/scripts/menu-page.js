
/*for (let catName of categories) {
    const cat = document.createElement('div');

    cat.classList.add("menu-category");
    if (catName === 'Drinks')
        cat.classList.add("drink");

    // Find all menu items that belong to this category
    let catItems = menuItems.filter(item => item.category === catName);

    // Create the list of items
    let listOfItems = "";
    for (let item of catItems) {
        listOfItems += `
            <li>
                <img src="${item.image}" alt="menu item ${item.name}">
                <div>
                    <span class="name">${item.name}</span>
                    <span class="price">$${item.price}</span>
                    <p>${item.description}</p>
                </div>
            </li>
        `;
    }

    // Make the category with the list of items
    cat.innerHTML = `
        <h2>${catName}</h2>
        <ul>
            ${listOfItems}
        </ul>
    `;

    const footer = document.querySelector('footer');
    footer.before(cat);
}*/

// This will hold the ID of all menu items added to the cart
const cart = [];
const cartButton = document.getElementById("view-cart");

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
            cart.push(order.id);
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

 cartButton.addEventListener("click", async function (e) {
    const itemNames = cart.map(id =>
        menuItems.find(item => item.id === id).name).join(", ");
    const cost = cart.reduce((sum, id) => { return sum + menuItems.find(menuItem => menuItem.id === id).price;}, 0);
    let url = `https://httpbin.org/get`;
    url = url + `?items=${encodeURIComponent(itemNames)}`;
    url = url + `&total=$${encodeURIComponent(cost)}`;
    try {
        const response = await fetch(url);
        const params = new URL(response.url).searchParams;
        console.log(params.get("items"));
        console.log(params.get("total"));
    } catch (error) {
        console.error(error);
    }
});
