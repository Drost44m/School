
const express = require("express");
const app = express();
const path = require("path");
const PORT = 3000;

app.set("view engine", "pug");                   // Set up PUG as the view engine
app.set("views", path.join(__dirname, "views")); // Tell Express where the views are

const locations = require("./data/locations");
let {categories, menuItems} = require("./data/menu");

let {specials} = require("./data/specials");

// This array will store all submitted reservations.
// Each reservation will be assigned a unique ID starting at 1.
let nextReservationID = 1;
const reservations = [];

// Store the orders, each one will be assigned a unique ID starting at 1.
let nextOrderID = 1;
const orders = [];

// Parse incoming JSON request bodies
app.use(express.json());

// Serve static files
app.use(express.static(__dirname)); // Safer to use public folder and then app.use(express.static(path.join(__dirname, "public")));

// Handle the GET / route to the main landing page
app.get("/", (request, response) => {
    response.render("index");
});
// Handle the GET /contact route for the Contact Us page
 app.get("/contact", (request, response) => { response.render("contact"); });

// Handle the GET /menu route to the Menu page
app.get("/menu", (request, response) => {
    response.render("menu", { categories: categories, menuItems: menuItems });
});

// Handle the GET /menu/specials route to get the specials menu
app.get("/menu/specials", (request, response) => {
    response.render("specials", { specials: specials });
});

// Handle the GET /locations route to the Locations page
app.get("/locations", (request, response) => {
    response.render("locations", { locations: locations });
});

// Handle the GET /reservations route to the Reservations page
app.get("/reservations", (request, response) => {
    response.render("reservations", { locations: locations });
});

// Handle the GET /admin route to the Admin page
app.get("/admin", (request, response) => {
    response.render("admin", { categories: categories, menuItems: menuItems } );
});

// Handle the GET /cart route to the Cart page
app.get("/cart", (request, response) => { response.render("cart"); });

// Handle the POST / route to the handle a new reservation
app.post("/reservations", (request, response) => { 
    // Get the reservation, which is in the request body
    const reservation = request.body; 

    // Give the reservation an ID and then store it
    reservation.id = nextReservationID++;
    reservations.push(reservation);
    console.log("Current reservations:", reservations);
    response.render("reservationResponse");
});

// Handle the POST /order route to  handle a new menu order
app.post("/orders", (request, response) => { 
    // Get the order, which is in the request body
    const order = request.body; 

    // Give the order an ID and then store it
    orders.push( { id: nextOrderID++, items: order });
    console.log("Current orders:", orders);

    // Send a response
    response.send({
            "success": true,
            "message": "Order confirmed",
            "data": order
    });
});

// Handle the GET /api/menu route to get the full JSON menu
app.get("/api/menu", (request, response) => {
    response.send({ categories: categories, menuItems: menuItems });
});

// Handle the GET /api/menu/specials route to get the specials menu
app.get("/api/menu/specials", (request, response) => {
    response.send({ specials: specials });
});

// Handle the GET /api/menu/:id route to get single JSON menu item
app.get("/api/menu/:id", (request, response) => {
    const id = request.params.id;
    const item = menuItems.find(item => item.id === id);
    if (item)
        response.send(item);
    else 
        response.status(404).send( { error: "Invalid menu item ID" } );
});

// Handle the GET /api/locations route to get a JSON array of locations
app.get("/api/locations", (request, response) => {
    response.send(locations);
});

// Handle the DELETE /api/menu/:id route to get delete a single menu item
app.delete("/api/menu/:id", (request, response) => {
    const id = request.params.id;
    const item = menuItems.find(item => item.id === id);
    if (item) {
        menuItems = menuItems.filter(item => item.id !== id);
        response.status(204).send();
    }
    else 
        response.status(404).send( { error: "Invalid menu item ID" } );
});

// Handle the PUT /api/menu/:id route to update some of a menu item's data
app.put("/api/menu/:id", (request, response) => {
    const id = request.params.id;
    const item = menuItems.find(item => item.id === id);

    if (item) {
        for (let key in request.body)
            item[key] = request.body[key];
        response.send(item);
    }
    else 
        response.status(404).send({ error: "Invalid menu item ID" });
});

// Handle all unknown URL routes
app.use((request, response) => {
    response.status(404).send("Page not found");
});

app.listen(PORT);
console.log(`Server running at http://localhost:${PORT}`);
