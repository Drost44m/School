Node.js Tutorial 6   (Tutorials/T6/server.js + scripts/*.js)
==============================================

Files used as examples:
  Tutorials/T6/server.js               the non-express server
  Tutorials/T6/scripts/reservations.js client POST of JSON (fetch)
  Tutorials/T6/scripts/cart-page.js    client POST of JSON (fetch)
  Tutorials/T6/reservations.html       the <form>


1. SKELETON OF A NON-EXPRESS SERVER
-----------------------------------
    let http = require('http');
    let fs   = require('fs');
    let path = require('path');

    function requestListener(request, response) {
        // build a URL object so we can use .pathname and .searchParams
        const url = new URL(request.url, `http://${request.headers.host}`);
        // request.method   -> "GET" / "POST"
        // url.pathname     -> "/menu"          (no query string)
        // url.searchParams -> ?id=AR1  ->  url.searchParams.get("id")
    }
    http.createServer(requestListener).listen(3000);

Rules of thumb
  - Every request MUST end with response.end(...) or the browser hangs forever.
  - Use `return response.end(...)` so you don't fall through to later ifs.
  - Check BOTH method and pathname:  if (request.method === "GET" && url.pathname === "/api/menu")


2. SERVING STATIC FILES (+ reading files, fixing the file path)
---------------------------------------------------------------
T6 server.js lines 7-14 and 22-39:

    const mimeTypes = {
        ".html": "text/html",
        ".css":  "text/css",
        ".js":   "application/javascript",
        ".png":  "image/png",
        ".jpg":  "image/jpeg",
        ".ico":  "image/x-icon"
    };

    function serveStaticFile(filePath, response) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === "ENOENT") {          // file does not exist
                    response.writeHead(404);
                    response.end("File Not Found");
                } else {                              // permissions, is a directory, etc.
                    response.writeHead(500);
                    response.end("Cannot Read File");
                }
            } else {
                const ext = path.extname(filePath);   // ".css"
                response.writeHead(200, {'Content-Type': mimeTypes[ext]});
                response.end(data);                   // data is a Buffer - do NOT toString() images
            }
        });
    }

Adjusting the path (lines 73-91)
  - Browser asks for "/"  or "/menu" (pretty URLs)  -> map to a real file with a routes object.
  - Browser asks for "/styles/style.css", "/images/banner.jpg", "/scripts/x.js"
    -> the pathname already IS the relative file path, so use it as-is.

    const routes = {
        "/":             "index.html",
        "/cart":         "cart.html",
        "/menu":         "menu.html",
        "/locations":    "locations.html",
        "/contact":      "contact.html",
        "/reservations": "reservations.html"
    };
    let filePath = routes[url.pathname];       // undefined if not a page
    if (!filePath)
        filePath = url.pathname;               // static resource: "/styles/style.css"
    filePath = path.join(__dirname, filePath); // absolute path, independent of where node was launched
    serveStaticFile(filePath, response);

  - __dirname  = folder containing server.js.
  - path.join(__dirname, "/styles/style.css")  ->  ".../T6/styles/style.css"  (handles the slashes)
  - path.extname("a/b/style.css") -> ".css"   (used to pick the Content-Type)
  - HTML links in the page are relative to the site root, e.g.
        <link rel="stylesheet" href="styles/style.css">
    so the browser requests GET /styles/style.css and the else-branch above serves it.


3. SENDING JSON TO THE CLIENT (GET API routes)
----------------------------------------------
T6 server.js lines 57-71:

    if (request.method === "GET" && url.pathname === "/api/menu") {
        const id = url.searchParams.get("id");        // /api/menu?id=AR1
        let result;
        if (!id) result = { categories, menuItems };
        else     result = menuItems.find(item => item.id === id);
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(result));  // object -> string, because end() needs a string/Buffer
    }

  - Set header  "Content-Type": "application/json"
  - Send with   JSON.stringify(obj)
  - Client side: `const data = await (await fetch("/api/menu")).json();`


4. RECEIVING JSON FROM THE CLIENT (POST): READING THE BODY IN CHUNKS
--------------------------------------------------------------------
The body arrives in pieces. Collect them on 'data', and only use them on 'end'.
T6 server.js lines 41-50:

    function readRequestBody(req, callback) {
        let body = "";
        req.on('data', (chunk) => {      // fires 0..n times; chunk is a Buffer
            body += chunk.toString();    // append every piece
        });
        req.on('end', () => {            // fires ONCE when the whole body has arrived
            callback(body);              // now the string is complete
        });
    }

Using it (lines 94-123):

    if (request.method === "POST") {
        readRequestBody(request, (body) => {
            const incomingData = JSON.parse(body);      // string -> object (throws if invalid JSON!)

            if (url.pathname === "/") {                 // reservation form
                incomingData.id = nextReservationID++;
                reservations.push(incomingData);
                serveStaticFile(path.join(__dirname, "reservationResponse.html"), response);
            }
            if (url.pathname === "/order") {            // cart
                orders.push({ id: nextOrderID++, items: incomingData });
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify({
                    success: true,
                    message: "Order placed successfully",
                    data: orders[orders.length - 1]
                }));
            }
        });
        return;
    }

Safer version (what to write on a test): wrap JSON.parse and answer 400 on bad input / 404 on unknown route
    readRequestBody(request, (body) => {
        let data;
        try { data = JSON.parse(body); }
        catch (e) {
            response.writeHead(400, { "Content-Type": "text/plain" });
            return response.end("Bad Request: invalid JSON");
        }
        if (url.pathname === "/order") { ... return; }
        response.writeHead(404);
        response.end("Not Found");              // <-- otherwise unknown POST routes hang forever
    });

Summary of the round trip
    CLIENT                                          SERVER
    JSON.stringify(obj) -> body                     body += chunk  (on 'data')
    header Content-Type: application/json           on 'end': JSON.parse(body) -> object
                                                    do work
    response.json()  <-  body  <-                    writeHead(200,{Content-Type}) ; end(JSON.stringify(result))


5. CLIENT SIDE: SENDING JSON WITH fetch (async/await)
-----------------------------------------------------
Tutorials/T6/scripts/cart-page.js  (placeOrder):

    const order = cart.map(item => item.id);              // ["AR1","AR3",...]
    const response = await fetch("/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },  // tell the server it's JSON
        body: JSON.stringify(order)                       // body must be a string
    });
    if (!response.ok) { ... }                             // ok = status 200-299
    const result = await response.json();                 // parse JSON response (or .text() for HTML)

Tutorials/T6/scripts/reservations.js  (form submit):

    document.querySelector("form").addEventListener("submit", async function (e) {
        e.preventDefault();                               // stop the browser's normal form submit
        const data = Object.fromEntries(new FormData(this));  // form fields -> {name:..., phone:...}
        try {
            const response = await fetch("http://localhost:3000", { method:"POST",
                headers:{ "Content-Type":"application/json" }, body: JSON.stringify(data) });
            if (!response.ok) throw new Error("Request failed with status: " + response.status);
            const html = await response.text();           // server replied with an HTML page
            document.body.innerHTML = html;
        } catch (error) {
            if (error.name === "TypeError") console.error("Network error");   // server unreachable
            else console.error(error.message);
        }
    });

  - fetch only rejects on NETWORK failure; 404/500 still "succeed" -> always check response.ok / response.status.
  - Old style for reference: XMLHttpRequest (xhr.open / setRequestHeader / onload / send(JSON.stringify(data))).
  - Server answers JSON -> client uses response.json().  Server answers HTML -> response.text().


6. COMMON STATUS CODES
----------------------
  200 OK                    success (GET page/JSON, POST handled)
  201 Created               success, a new resource was created (often for POST)
  204 No Content            success, nothing to send back
  301/302 Redirect          Location header says where to go
  400 Bad Request           client sent bad data (e.g. invalid JSON, missing field)
  401 / 403                 not logged in / not allowed
  404 Not Found             file or route doesn't exist (err.code === "ENOENT")
  500 Internal Server Error server-side failure (fs error, template error, thrown exception)

    response.writeHead(404, {"Content-Type": "text/plain"});   // status + headers, call ONCE, before end
    response.end("File Not Found");


7. <form> AND COMMON HTML TAGS (Tutorials/T6/reservations.html)
---------------------------------------------------------------
    <form>                                    (action/method omitted: JS handles submit with fetch)
      <label for="name">Name:</label>         label's `for` matches the input's `id`
      <input type="text"     name="name"   id="name"   required>
      <input type="tel"      name="phone"  pattern="1? ?\([0-9]{3}\) ?[0-9]{3}-[0-9]{4}" placeholder="..." required>
      <input type="date"     name="date">
      <input type="time"     name="time">
      <input type="number"   name="guests" min="1" max="30" value="2">
      <input type="checkbox" name="agreement" required>
      <select name="location" id="location" required>
          <option value="">-- Choose an Option --</option>
          <option value="Ottawa – Downtown">Ottawa – Downtown</option>
      </select>
      <input type="submit" value="Book Reservation">
    </form>

  - Plain HTML form without JS:  <form action="/order" method="POST">  (sends url-encoded, NOT JSON)
  - `name` attribute = the key in FormData / the submitted data.   `id` = for JS/labels/CSS.
  - Other tags used in these pages: <header> <footer> <h1>-<h2> <p> <a href> <img src alt> <div>
    <span> <ul>/<li> <table>/<tr>/<td> <hr> <br> <link rel="stylesheet" href> <script src>.




Template Engines Tutorial 7   (Tutorials/T7/server.js, views/*.ejs, views/*.pug)
==============================================

Install:  npm install ejs pug   (package.json already has both)
Folder layout:  views/index.pug, views/menu.pug ... + views/partials/header.pug, footer.pug (same for .ejs)


1. RENDERING TEMPLATES FROM THE SERVER
--------------------------------------
T7 server.js lines 62-74 (pug):

    let pug = require("pug");

    function renderPage(templatePath, response, data = {}) {
        pug.renderFile(templatePath, data, function (err, html) {
            if (err) {
                console.error(err);
                response.writeHead(500);
                response.end("Internal Server Error");
            } else {
                response.writeHead(200, { "Content-Type": "text/html" });
                response.end(html);
            }
        });
    }

    // route that passes data into the template
    if (url.pathname === "/menu")
        renderPage(path.join(__dirname, "views/menu.pug"), response, { categories, menuItems });
    if (url.pathname === "/locations")
        renderPage(path.join(__dirname, "views/locations.pug"), response, { locations });

EJS is identical except:
    let ejs = require("ejs");
    ejs.renderFile(templatePath, data, function (err, html) { ... same body ... });

  - The `data` object's keys become variables inside the template (categories, menuItems, locations ...).
  - Static routes (/styles/..., /images/..., /scripts/...) still go through serveStaticFile.
  - Pages that need no data (index, cart, contact) are just renderPage(path, response).


2. HTML  ->  EJS  ->  PUG   (side by side)
------------------------------------------

2a. Tags / attributes / text / ids / classes
  HTML
      <h1>Welcome to The Laughing Ladle!</h1>
      <img src="images/inside-restaurant.jpg" id="restaurant-img" alt="interior">
      <div class="promo">
          <p id="good-deal">Get 20% off</p>
          <a href="/reservations" id="book-reservation-link">Make a Reservation</a>
      </div>
  EJS   (identical to HTML; EJS = HTML + <% %> tags)
  PUG   (indentation = nesting, no closing tags)
      h1 Welcome to The Laughing Ladle!
      img#restaurant-img(src="images/inside-restaurant.jpg", alt="interior")
      div.promo
          p#good-deal Get 20% off
          a(href="/reservations", id="book-reservation-link") Make a Reservation

  Pug syntax cheat sheet
      tag                       -> <tag></tag>          (div is the default if you write just .promo)
      tag.cls1.cls2#myid        -> class and id shorthand
      tag(a="1", b="x")         -> attributes in parentheses, comma separated; boolean attr:  input(required)
      tag text here             -> text on the same line
      tag                       -> multi-line text with a pipe:
          | line one
          | line two
      p.                        -> block of plain text (everything indented under is text)
      // comment                -> rendered as HTML comment
      //- comment               -> NOT rendered
      doctype html              -> <!DOCTYPE html>
      Indent with consistent spaces (never mix tabs/spaces). Child must be indented under its parent.

2b. Output a variable
  EJS    <%= item.name %>          escaped output (use for normal values)
         <%- item.html %>          RAW / unescaped (use for includes and JSON)
         <%# comment %>            comment
  PUG    span.name= item.name      "=" escaped output as the tag's content
         span.name #{item.name}    interpolation inside text (escaped)
         span.price $#{item.price}
         span.raw !{item.html}     "!{}" unescaped interpolation;   "!=" unescaped content
         a(href=item.link)         attribute value is plain JS (no quotes, no #{})
         img(src=item.image, alt="menu item " + item.name)     JS expression for the attribute
  EJS attribute:  <img src="<%= item.image %>" alt="menu item <%= item.name %>">

2c. Embedded JavaScript (control flow)
  EJS: every JS line is wrapped in <% ... %>, braces must be opened AND closed in separate tags.
      <% for (let catName of categories) { %>
          <h2><%= catName %></h2>
      <% } %>

      <% if (typeof showCartButton !== 'undefined') { %>
          <a href="/cart">View Cart</a>
      <% } %>

      <% let catItems = menuItems.filter(item => item.category === catName); %>   (plain statement)

  PUG: a line beginning with "-" is JS code; indentation replaces the braces.
      - for (let catName of categories)
          h2= catName

      if typeof showCartButton !== "undefined"      (if/else/unless/each are built in, no "-" needed)
          a(href="/cart") View Cart
      else
          p No cart

      each item in menuItems                        (Pug's own loop; also  each item, index in arr)
          li= item.name

      - var title = "Menu"                          (declare a variable)
      - let catItems = menuItems.filter(item => item.category === catName)

  Conditional class (T7 menu):
      EJS:  <div class="menu-category <%= catName === 'Drinks' ? 'drink' : '' %>">
      PUG:  div.menu-category(class= catName === 'Drinks' ? 'drink' : '')

2d. Looping example: locations table, 3 per row  (T7 views/locations.*)
  EJS
      <table id="locationsTable">
          <% for (let rowStart = 0; rowStart < locations.length; rowStart += 3) { %>
          <tr>
              <% for (let i = rowStart; i < rowStart + 3 && i < locations.length; i++) { %>
                  <% const loc = locations[i]; %>
                  <td>
                      <h2><%= loc.name1 %> <br> <%= loc.name2 %></h2>
                      <p id="details<%= i %>">
                          <%= loc.street %> <br> <%= loc.cityProv %> <br> Phone: <%= loc.phone %>
                      </p>
                  </td>
              <% } %>
          </tr>
          <% } %>
      </table>
  PUG
      table(id="locationsTable")
          - for (let rowStart = 0; rowStart < locations.length; rowStart += 3)
              tr
                  - for (let i = rowStart; i < rowStart + 3 && i < locations.length; i++)
                      - const loc = locations[i]
                      td
                          h2
                              = loc.name1
                              br
                              = loc.name2
                          p(id="details" + i)
                              = loc.street
                              br
                              = loc.cityProv
                              br
                              = "Phone: " + loc.phone

2e. Select box populated by the server (T7 views/reservations.*)
  EJS
      <select name="location" id="location" required>
          <option value="">-- Choose an Option --</option>
          <% for (let loc of locations) { %>
              <option value="<%= loc.name1 %> – <%= loc.name2 %>"><%= loc.name1 %> – <%= loc.name2 %></option>
          <% } %>
      </select>
  PUG
      select(name="location", id="location", required)
          option(value="") -- Choose an Option --
          each loc in locations
              option(value=loc.name1 + " – " + loc.name2)= loc.name1 + " – " + loc.name2

2f. Passing server data to the CLIENT-SIDE script  (T7 locations/reservations)
  The page's browser script needs the data -> dump it as JSON inside a <script> tag, UNESCAPED.
  EJS
      <script>
          const locations = <%- JSON.stringify(locations) %>;
      </script>
  PUG
      script.
          const locations = !{JSON.stringify(locations)}
  (`script.` with the trailing dot = the indented lines are raw JS text.  `!{}` = unescaped.
   Using #{} / <%= %> here would turn quotes into &quot; and break the JS.)

2g. Data stored in an attribute (T7 menu "Add to Cart")
  EJS   <a class="order-button add-to-cart" data-item="<%= JSON.stringify(item) %>">Add to Cart</a>
  PUG   a.order-button.add-to-cart(data-item=JSON.stringify(item)) Add to Cart
  (attribute values ARE escaped, which is what you want here; client reads JSON.parse(el.dataset.item))


3. PARTIALS / INCLUDES / REUSING HEADER + FOOTER  (T7 views/partials/)
----------------------------------------------------------------------
Pass per-page values INTO the header, then include.

  EJS (menu.ejs)
      <%- include("partials/header", { title: "The Laughing Ladle – Menu", style: "styles/menu.css", showCartButton: 1 }) %>
          ... page body ...
      <%- include("partials/footer", { script: "scripts/menu-page.js" }) %>

      partials/header.ejs
          <title><%= title %></title>
          <link rel="stylesheet" href="styles/style.css">
          <% if (typeof style !== 'undefined') { %>
              <link rel="stylesheet" href="<%= style %>">
          <% } %>
      partials/footer.ejs
          <% if (typeof script !== 'undefined') { %>
              <script src="<%= script %>"></script>
          <% } %>
          </body></html>

  PUG (menu.pug) - variables are declared BEFORE the include, and the include sees them
      - var title = "The Laughing Ladle – Menu"
      - var style = "styles/menu.css"
      - var showCartButton = 1
      include partials/header

      h1 Menu
      ...

      - var script = "scripts/menu-page.js"
      include partials/footer

      partials/header.pug
          doctype html
          html(lang="en")
              head
                  meta(charset="UTF-8")
                  title= title
                  link(rel="stylesheet", href="styles/style.css")
                  if typeof style !== "undefined"
                      link(rel="stylesheet", href=style)
              body
                  header ...
      partials/footer.pug
          footer
              ...
              if typeof script !== "undefined"
                  script(src=script)

  - `typeof x !== 'undefined'` is the safe way to test an OPTIONAL variable (plain `if (x)` throws a ReferenceError).
  - EJS include uses <%- (raw) because the included HTML must not be escaped.
  - Note: in EJS the header opens <html><body> and the footer closes them; pug does it by indentation, so the
    pug header/footer and page share the same implicit nesting through include.


4. CONVERSION CHECKLIST (what to do on the test)
------------------------------------------------
  1. Start with the shared <head>/<header>: replace hard-coded title and stylesheet with variables.
  2. Replace the repeated header/footer with include(...) calls.
  3. Anything the client JS used to build with createElement (select options, table rows, menu lists)
     -> loop in the template with the data passed from the server.
  4. If the browser script still needs the data -> `const x = <%- JSON.stringify(x) %>` / `!{JSON.stringify(x)}`.
  5. In the server: replace serveStaticFile for pages with renderPage(path, response, {data}).
     Keep serveStaticFile for css/js/images.
  6. Remove the <script src="data/locations.js"> tag if the template provides the data inline.


5. ISSUES I FOUND IN YOUR OWN T6/T7 FILES (fix these before you reuse them as references)
----------------------------------------------------------------------------------------
  - T6/T7 server.js: a POST to an unknown path never calls response.end() -> request hangs.
    Add a final `response.writeHead(404); response.end("Not Found");`.  Same for JSON.parse failing (send 400).
  - T6/T7 server.js: the GET block has no `return` at the end, so the code falls through to `if (POST)`.
    Harmless (method differs) but `return` is cleaner.
  - T7 views/reservations.pug: option(value="=loc.name1 – =loc.name2") is a literal string, "=" is not evaluated
    inside quotes.  Use option(value=loc.name1 + " – " + loc.name2).
  - T7 views/reservations.ejs: the line "// Populate the Select box..." inside <select> is plain HTML text, it is
    not a comment.  Use <%# ... %> or <!-- ... -->.
  - T7 views/locations.ejs: inner loop `i<rowStart+3` has no `&& i<locations.length` (the pug version does).  If the
    count isn't a multiple of 3, `loc` is undefined and the page throws.
  - T7 views/menu.ejs: title says "Locations" (should be "Menu").
  - T7 views/reservations.pug: the <script.> block is indented inside the <form>; fine but put it at root level.
  - T7 server.js: mimeTypes has ".pug" but never needs it; templates are rendered, not sent.
