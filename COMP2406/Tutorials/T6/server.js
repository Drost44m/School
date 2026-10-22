let http = require('http');
let fs = require('fs');
let path = require("path");
const locations = require("./data/locations");
const {categories, menuItems} = require("./data/menu");
let PORT = 3000;
const mimeTypes = {
    ".html": "text/html",
    ".css":  "text/css",
    ".js":   "application/javascript",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".ico":  "image/x-icon"
};
let nextReservationID = 1;
const reservations = [];
// Store the orders, each one will be assigned a unique ID starting at 1.
let nextOrderID = 1;
const orders = [];

// Serve a static file
function serveStaticFile(filePath, response) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === "ENOENT") {
                response.writeHead(404);
                response.end("File Not Found");
            }
            else {
                response.writeHead(500);
                response.end("Cannot Read File");
            }
        } else {
            const ext = path.extname(filePath);
            response.writeHead(200, {'Content-Type': mimeTypes[ext]});
            response.end(data);
        }
    });
}
 // Helper function to read a request body
 function readRequestBody(req, callback) {
    let body = ""
    req.on('data', (chunk) => {
        body += chunk.toString();
    })
    // Once the entire body is ready, process the request
    req.on('end', () => {
        callback(body);
    });
}

function requestListener(request, response) {
    const url = new URL(request.url, `http://${request.headers.host}`); //url.pathname maybe needed here too
    

    // Handle the route: /api/menu
    if ((request.method === "GET") && (url.pathname === "/api/menu")) {
        const id = url.searchParams.get("id");
        let result;
        if (!id)
            result = { categories: categories, menuItems: menuItems };
        else
            result = menuItems.find(item => item.id === id);
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(result));
    }
     // Handle the route: /api/locations
    if ((request.method === "GET") && (url.pathname === "/api/locations")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(locations));
    }
    // Handle a GET request for an HTML page
    if (request.method === "GET") {
        const routes = {
            "/": "index.html",
            "/cart": "cart.html",
            "/menu": "menu.html",
            "/locations": "locations.html",
            "/contact": "contact.html",
            "/reservations": "reservations.html"
        };
        // Check if request is for a page and map it to the correct filename
        let filePath = routes[url.pathname];
 
        // If the filePath is undefined, this must be a non-HTML resource
        if (!filePath)
            filePath = url.pathname;
 
        filePath = path.join(__dirname, filePath);  

        serveStaticFile(filePath, response);
    }
    //Handle the POST request
    if (request.method === "POST") {
        // Handle the processing of the request body
        readRequestBody(request, (body) => {
            // Convert the JSON string into an object
            const incomingData = JSON.parse(body);
            if(url.pathname === "/") {
                // Give the reservation an ID and then store it
                incomingData.id = nextReservationID++;
                reservations.push(incomingData);
                console.log("Current reservations:", reservations);
                // Send a response
                serveStaticFile(path.join(__dirname, "reservationResponse.html"), response);
            }
            if(url.pathname === "/order") {
                //Give the order an ID and the store it. 
                orders.push({id: nextOrderID++, items: incomingData});
                console.log("Current orders:", orders);
                // Send a response
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify(
                    {
                        "success": true,
                        "message": "Order placed successfully",
                        "data": orders[orders.length - 1]
                    }
                ));
            }
        });
        return;
    }

}

http.createServer(requestListener).listen(PORT);
console.log(`Server is running on http://localhost:${PORT}`);