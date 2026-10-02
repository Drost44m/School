for (let catName of categories) {
    const cat = document.createElement('div');
    cat.classList.add("menu-category");
    if(catName === "Drinks")    
        cat.classList.add("drink");
 
 
    const h2 = document.createElement('h2');
    h2.textContent = catName;
 
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
        img.alt = 'menu item';
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
    } 

     // Create the list of items
    /*let listOfItems = "";
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
    `;*/
    ul.classList.add("hidden");
    h2.addEventListener("click", (e) => {
        ul.classList.toggle("hidden");
    });
 
    const footer = document.querySelector('footer');
    footer.before(cat);
}




