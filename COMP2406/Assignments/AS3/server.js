const express = require("express");
const app = express();
let path = require("path");
let fs = require("fs");
const multer = require("multer");
app.set("view engine", "pug");                   // Set up PUG as the view engine
app.set("views", path.join(__dirname, "views")); // Tell Express where the views are

const aboutData = require("./data/aboutData.json");

let PORT = 3000;

// The directory that holds the shelter data (each shelter is in its own JSON file)
const sheltersDir = path.join(__dirname, "data/shelters");

// Add every .json file found in that directory to the shelters array
let shelters = [];
let shelterFiles = {}; // Remembers which file each shelter is saved in (shelter id -> file name)
const files = fs.readdirSync(sheltersDir);
for (let i=0; i<files.length; i++) {
    if (files[i].endsWith(".json")) {
        const shelter = require(path.join(sheltersDir, files[i]));
        shelters.push(shelter);
        shelterFiles[shelter.id] = files[i];
    }
}

// The file that holds the next unique shelter and pet IDs
const nextIDsFile = path.join(__dirname, "data/nextIDs.json");

//  all submitted applications.
// Each application will be assigned a unique ID starting at 1 (e.g., "a1").
const applications = [];


// Save a shelter (including its pets) to its JSON file
function saveShelter(shelter) {
    fs.writeFileSync(path.join(sheltersDir, shelterFiles[shelter.id]), JSON.stringify(shelter, null, 2));
}

// Setup for receiving pet image files: they are saved in the images folder with
// the date/time added to the name so that it is unique, and only images are accepted
const storage = multer.diskStorage({
    destination: (request, file, callback) => callback(null, path.join(__dirname, "images")),
    filename: (request, file, callback) => {
        const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
        callback(null, Date.now() + "-" + safeName);
    }
});
const fileFilter = (request, file, callback) => {
    if (file.mimetype.startsWith("image/"))
        callback(null, true);
    else {
        request.badImage = true; // The route will report this
        callback(null, false);
    }
};
const upload = multer({ storage, fileFilter });

const petTypes = ["Cat", "Dog", "Bird", "Reptile", "Other"];

// Check the pet fields sent in a request body. Returns an error message, or
// undefined if all is ok. If ok, the pet fields are put into the given pet object.
function readPetFields(body, pet) {
    const name = String(body.name || "").trim();
    const breed = String(body.breed || "").trim();
    const health = String(body.health || "").trim();
    const traits = String(body.traits || "").trim();
    const age = String(body.age || "").trim();
    const fee = String(body.adoptionFee || "").trim();

    if (!name || !breed || !health || !traits || !age || !fee)
        return "The name, breed, age, adoption fee, health and traits must not be blank.";
    if (!petTypes.includes(body.type))
        return "The pet type is not valid.";
    if (isNaN(Number(age)) || Number(age) < 0)
        return "The age must be a number that is 0 or more.";
    if (isNaN(Number(fee)) || Number(fee) < 0)
        return "The adoption fee must be a number that is 0 or more.";

    pet.name = name;
    pet.type = body.type;
    pet.breed = breed;
    pet.age = Number(age);
    pet.adoptionFee = Number(fee);
    pet.health = health;
    pet.traits = traits.split(",").map(t => t.trim()).filter(t => t !== "");
    return undefined;
}

// Find and return the pet with the given Id from the given shelter Id
function findPet(shelterId, petId) {
    const shelter = shelters.find(shelter => shelter.id === shelterId);
    if (shelter)
        return shelter.pets.find(pet => pet.id === petId);
    else
        return undefined;
}


// Parse incoming JSON request bodies
app.use(express.json());

// Parse incoming URL-encoded form submissions
app.use(express.urlencoded({ extended: true }));

//Serve Static files
app.use(express.static(__dirname));


// Handle the GET / route to the main landing page
app.get("/", (request, response) => {
    response.render("index", { title: "New Home Animal Rescue", css: "landing.css", active: "home" });
});

// Handle the GET /about route to the About Us page
app.get("/about", (request, response) => {
    response.render("about", { title: "New Home - About", css: "about.css", active: "about", about: aboutData });
});

// Handle the GET /browse route to the Browse Pets page
app.get("/browse", (request, response) => {
    const list = shelters.map(shelter => ({ id: shelter.id, name: shelter.name }));
    response.render("browse", { title: "New Home - Browse", css: "browse.css", active: "browse", shelters: list });
});

// Handle the GET /details route to the pet details page
app.get("/details", (request, response) => {
    const shelterId = request.query.shelterId;
    const petId = request.query.petId;
    let error = undefined;
    let pet = undefined;
    let processingFee = 30; // default 30 if missing
    let totalFee = 0;

    if (!shelterId || !petId) {
        error = "Missing pet ID and/or shelter ID.";
    } else {
        const shelter = shelters.find(shelter => shelter.id === shelterId);
        pet = findPet(shelterId, petId);
        if (!shelter || !pet) {
            error = "Pet Not Found. Either shelter ID or pet ID is invalid.";
            pet = undefined;
        } else {
            if (shelter.processingFee)
                processingFee = shelter.processingFee;
            totalFee = Number(pet.adoptionFee) + Number(processingFee);

            // Count this view and save it so the count survives a server restart
            pet.views = (pet.views || 0) + 1;
            saveShelter(shelter);
        }
    }
    response.render("pet", { title: "New Home - Pet Details", css: "pet.css", active: "browse",
        pet: pet, error: error, shelterId: shelterId, processingFee: processingFee, totalFee: totalFee });
});

// Handle the GET /apply route to the application page (pet info comes in the query parameters)
app.get("/apply", (request, response) => {
    const q = request.query;
    let total = 0;
    let valid = false;
    if (q.petId && q.petName && q.petType && q.petBreed && q.adoptionFee && q.processingFee) {
        valid = true;
        total = parseInt(q.adoptionFee) + parseInt(q.processingFee);
    }
    response.render("apply", { title: "New Home - Application", css: "apply.css", active: "browse",
        valid: valid, pet: q, total: total });
});

// Handle the GET /admin/applications route to the Applications page
app.get("/admin/applications", (request, response) => {
    const appData = [];
    for (let i=0; i<applications.length; i++) {
        const application = applications[i];
        const pet = findPet(application.shelterId, application.petId);
        appData.push({ date: application.date, applicationId: application.applicationId,
                       shelterId: application.shelterId, petId: application.petId,
                       petType: pet ? pet.type : "", status: application.status });
    }
    response.render("applications", { title: "Applications - New Home Animal Rescue", css: "applications.css",
        active: "applications", applications: appData });
});

// Handle the GET /admin/shelters route: JSON or the Shelters page depending on the Accept header
app.get("/admin/shelters", (request, response) => {
    if (request.accepts(["html", "json"]) === "json") {
        const list = shelters.map(shelter => ({ id: shelter.id, name: shelter.name, city: shelter.city,
                                                processingFee: shelter.processingFee, petCount: shelter.pets.length }));
        response.send({ count: list.length, shelters: list });
    }
    else
        response.render("shelters", { title: "New Home - Shelters", css: "shelters.css", active: "shelters", shelters: shelters });
});

// Handle the POST /admin/shelters route to add a new shelter
app.post("/admin/shelters", (request, response) => {
    const name = request.body.name;
    const city = request.body.city;
    const processingFee = request.body.processingFee;

    // Make sure the name, city and fee are all valid
    if (typeof name !== "string" || name.trim() === "")
        return response.status(400).send("Shelter name must not be blank.");
    if (typeof city !== "string" || city.trim() === "")
        return response.status(400).send("Shelter city must not be blank.");
    if (processingFee === undefined || String(processingFee).trim() === "" || isNaN(Number(processingFee)) || Number(processingFee) < 0)
        return response.status(400).send("Shelter processing fee must be a number that is 0 or more.");

    // Get the next shelter ID from the file and then increase it in the file
    const nextIDs = JSON.parse(fs.readFileSync(nextIDsFile, "utf-8"));
    const shelter = { id: "s" + nextIDs.nextShelterId, name: name.trim(), city: city.trim(),
                      processingFee: Number(processingFee), pets: [] };
    nextIDs.nextShelterId++;
    fs.writeFileSync(nextIDsFile, JSON.stringify(nextIDs));

    // Save the shelter in its own file (named with its ID) and add it to the shelters
    const fileName = shelter.id + ".json";
    fs.writeFileSync(path.join(sheltersDir, fileName), JSON.stringify(shelter, null, 2));
    shelters.push(shelter);

    response.status(201).send("Shelter " + shelter.id + " added");
});

// Handle the DELETE /admin/shelters/:id route to delete a shelter
app.delete("/admin/shelters/:id", (request, response) => {
    const id = request.params.id;
    const shelter = shelters.find(shelter => shelter.id === id);
    if (!shelter)
        return response.status(404).send("Shelter Not Found. Invalid ID.");

    // Remove the shelter (its file is left alone for now)
    shelters = shelters.filter(shelter => shelter.id !== id);
    delete shelterFiles[id];

    response.send("Shelter " + id + " deleted");
});

// Handle the GET /admin/shelters/:sID route: JSON of the whole shelter or the Shelter Info page
app.get("/admin/shelters/:sID", (request, response) => {
    const shelter = shelters.find(shelter => shelter.id === request.params.sID);
    if (!shelter)
        return response.status(404).send("Shelter Not Found. Invalid ID.");

    if (request.accepts(["html", "json"]) === "json")
        response.send(shelter);
    else
        response.render("shelterInfo", { title: "New Home - Shelter Info", css: "shelterInfo.css", active: "shelters", shelter: shelter });
});

// Handle the PUT /admin/shelters/:sID route to update a shelter's id, name, city and processing fee
app.put("/admin/shelters/:sID", (request, response) => {
    const shelter = shelters.find(shelter => shelter.id === request.params.sID);
    if (!shelter)
        return response.status(404).send("Shelter Not Found. Invalid ID.");

    const id = String(request.body.id || "").trim();
    const name = String(request.body.name || "").trim();
    const city = String(request.body.city || "").trim();
    const fee = String(request.body.processingFee === undefined ? "" : request.body.processingFee).trim();

    if (!id || !name || !city || !fee)
        return response.status(400).send("The ID, name, city and processing fee must not be blank.");
    if (!/^[A-Za-z0-9_-]+$/.test(id))
        return response.status(400).send("The ID can only contain letters, numbers, - and _.");
    if (isNaN(Number(fee)) || Number(fee) < 0)
        return response.status(400).send("The processing fee must be a number that is 0 or more.");
    if (id !== shelter.id && shelters.find(other => other.id === id))
        return response.status(400).send("That shelter ID is already in use.");

    // If the ID changed, the shelter's file is renamed (files are named by shelter ID)
    if (id !== shelter.id) {
        const newFile = id + ".json";
        if (fs.existsSync(path.join(sheltersDir, newFile)))
            return response.status(400).send("That shelter ID cannot be used.");
        fs.renameSync(path.join(sheltersDir, shelterFiles[shelter.id]), path.join(sheltersDir, newFile));
        delete shelterFiles[shelter.id];
        shelterFiles[id] = newFile;

        // Keep the submitted applications pointing at this shelter
        applications.forEach(application => {
            if (application.shelterId === shelter.id)
                application.shelterId = id;
        });
    }
    shelter.id = id;
    shelter.name = name;
    shelter.city = city;
    shelter.processingFee = Number(fee);
    saveShelter(shelter);

    response.send("Shelter " + id + " updated");
});

// Handle the POST /admin/shelters/:sID/pets route to add a pet to a shelter (with an optional image)
app.post("/admin/shelters/:sID/pets", upload.single("image"), (request, response) => {
    // Remove an uploaded image if the pet cannot be added
    const fail = (status, message) => {
        if (request.file)
            fs.unlinkSync(request.file.path);
        return response.status(status).send(message);
    };
    const shelter = shelters.find(shelter => shelter.id === request.params.sID);
    if (!shelter)
        return fail(404, "Shelter Not Found. Invalid ID.");
    if (request.badImage)
        return fail(400, "Only image files are allowed.");

    const pet = {};
    const error = readPetFields(request.body, pet);
    if (error)
        return fail(400, error);

    // Get the next pet ID from the file and then increase it in the file
    const nextIDs = JSON.parse(fs.readFileSync(nextIDsFile, "utf-8"));
    pet.id = "p" + nextIDs.nextPetId;
    nextIDs.nextPetId++;
    fs.writeFileSync(nextIDsFile, JSON.stringify(nextIDs));

    if (request.file)
        pet.image = "images/" + request.file.filename;
    else
        pet.image = String(request.body.image || "").trim() || "images/unknownPet.jpg";
    pet.views = 0;
    pet.daysAtShelter = 1;

    shelter.pets.push(pet);
    saveShelter(shelter);
    response.status(201).send("Pet " + pet.id + " added");
});

// Handle the PUT /admin/shelters/:sID/pets/:pID route to update a pet (with an optional new image)
app.put("/admin/shelters/:sID/pets/:pID", upload.single("image"), (request, response) => {
    const fail = (status, message) => {
        if (request.file)
            fs.unlinkSync(request.file.path);
        return response.status(status).send(message);
    };
    const shelter = shelters.find(shelter => shelter.id === request.params.sID);
    if (!shelter)
        return fail(404, "Shelter Not Found. Invalid ID.");
    const pet = shelter.pets.find(pet => pet.id === request.params.pID);
    if (!pet)
        return fail(404, "Pet Not Found. Invalid ID.");
    if (request.badImage)
        return fail(400, "Only image files are allowed.");

    // Check everything first, using a copy so that nothing changes if there is a problem
    const changes = {};
    const error = readPetFields(request.body, changes);
    if (error)
        return fail(400, error);

    Object.assign(pet, changes);
    if (request.file)
        pet.image = "images/" + request.file.filename;
    else if (String(request.body.image || "").trim())
        pet.image = String(request.body.image).trim();
    saveShelter(shelter);
    response.send("Pet " + pet.id + " updated");
});

// Handle the DELETE /admin/shelters/:sID/pets/:pID route to delete a pet from a shelter
app.delete("/admin/shelters/:sID/pets/:pID", (request, response) => {
    const shelter = shelters.find(shelter => shelter.id === request.params.sID);
    if (!shelter)
        return response.status(404).send("Shelter Not Found. Invalid ID.");
    const pet = shelter.pets.find(pet => pet.id === request.params.pID);
    if (!pet)
        return response.status(404).send("Pet Not Found. Invalid ID.");

    shelter.pets = shelter.pets.filter(pet => pet.id !== request.params.pID);
    saveShelter(shelter);
    response.send("Pet " + request.params.pID + " deleted");
});

// Handle the POST /submit-application route to handle a new application
app.post("/submit-application", (request, response) => {
    // Get the application, which is in the request body
    const application = request.body;
    if (!application || !application.petId || !application.shelterId)
        return response.status(400).send("Invalid application data");

    // Add the current date/time, a unique ID and a status, then store it
    application.date = new Date().toLocaleString("en-CA", {
                                year: "numeric", month: "2-digit", day: "2-digit",
                                hour: "2-digit", minute: "2-digit" });
    application.applicationId = "a" + (applications.length + 1); // This is ok since we will never remove
    application.status = "Unprocessed";
    applications.push(application);

    // Send a response
    response.send("Application received");
});

// Handle the GET /shelters route to get a JSON array of the basic shelter data, or one whole shelter if an id is given
app.get("/shelters", (request, response) => {
    if (request.query.id) {
        const shelter = shelters.find(shelter => shelter.id === request.query.id);
        if (shelter)
            return response.send(shelter);
        else
            return response.status(404).send("Shelter Not Found");
    }
    response.send(shelters.map(shelter => ({ id: shelter.id, name: shelter.name, city: shelter.city, processingFee: shelter.processingFee })));
});

// Handle the GET /shelters/pets route to get a single pet's JSON data
app.get("/shelters/pets", (request, response) => {
    if (request.query.shelterId && request.query.petId) {
        const pet = findPet(request.query.shelterId, request.query.petId);
        if (pet)
            response.send(pet);
        else
            response.status(404).send("Pet Not Found. Either shelter ID or pet ID is invalid.");
    }
    else
        response.status(404).send("Missing pet ID and/or shelter ID.");
});

// Handle the GET /admin/applications-details route to get a single application's JSON data
app.get("/admin/applications-details", (request, response) => {
    if (request.query.id) {
        const application = applications.find(application => application.applicationId === request.query.id);
        if (application)
            response.send(application);
        else
            response.status(404).send("Application not Found. Invalid ID.");
    }
    else
        response.status(404).send("Application not Found. Missing ID.");
});

// Handle the PUT /admin/applications-update route to update an application's status
app.put("/admin/applications-update", (request, response) => {
    const applicationId = request.body.applicationId;
    const status = request.body.status;
    if (!applicationId || !status)
        return response.status(400).send("Missing application status update data");

    const application = applications.find(application => application.applicationId === applicationId);
    if (application) {
        application.status = status;
        response.send("Application " + applicationId + " updated");
    }
    else
        response.status(404).send("Application not Found. Invalid ID.");
});


// Handle all unknown URL routes
app.use((request, response) => {
    response.status(404).send("Page not found");
});
app.listen(PORT);
console.log(`Server running at http://localhost:${PORT}`);
