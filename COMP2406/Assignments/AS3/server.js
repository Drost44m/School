const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const pug = require('pug');

// Data for the About page
const aboutData = require('./data/aboutData.json');

// Submitted applications
let applications = []; // None so far

// Load the shelter data upon startup
let shelters = [];

// Get all the files in the shelters directory (assumed to be JSON)
const files = fs.readdirSync(path.join(__dirname, 'data/shelters'));

// Read each .json file and extract/add the JSON data to the shelters array
for (let i=0; i<files.length; i++) {
    if (files[i].endsWith('.json')) {
        const data = fs.readFileSync(path.join(__dirname, 'data/shelters', files[i]), 'utf-8');
        shelters.push(JSON.parse(data));
    }
}

// Return the Content-type based on the file type. This is needed for static file serving.
function getMimeType(file) {
    const ext = path.extname(file).toLowerCase();
    switch(ext) {
        case '.js': return 'application/javascript';
        case '.css': return 'text/css';
        case '.jpg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.svg': return 'image/svg+xml';
        case '.json': return 'application/json';
        case '.html': return 'text/html';
        default: return 'text/plain';
    }
}

// This function serves all the static files 
function serveStatic(filePath, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('File not found');
        } else {
            res.writeHead(200, {'Content-Type': getMimeType(filePath)});
            res.end(data);
        }
    });
}

// Helper function to read a request body
function readRequestBody(req, callback) {
	let body = ""
	req.on('data', (chunk) => {
		body += chunk;
	})
	// Once the entire body is ready, process the request
	req.on('end', () => {
		callback(body);
	});
}

// Find and return the pet with the given Id from the given shelter Id
function findPet(shelterId, petId) {
    const shelter = shelters.find(shelter => (shelter.id === shelterId));
    if (shelter)
        return shelter.pets.find(pet => (pet.id === petId));
    else
        return undefined;
}

// Render a PUG page from the views folder and send it
function renderPage(res, view, data) {
    try {
        const html = pug.renderFile(path.join(__dirname, 'views', view + '.pug'), data);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    } catch(e) {
        console.error(e);
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Error rendering page');
    }
}

// Handle all incoming endpoint requests
function handleRequest(req, res) {
    const parsed = url.parse(req.url, true); // true parses query string
    const pathname = parsed.pathname;
    let query = parsed.query;

    // Handle all incoming GET requests
    if (req.method === 'GET') {
        //console.log(">>> Method: " + req.method);
        //console.log(">>> Pathname: " + pathname);

        // Handle requests for the home page
        if ((pathname === '/') || (pathname === '/home') || (pathname === '/index.html'))
            return renderPage(res, 'index', {title: 'New Home Animal Rescue', css: 'landing.css', active: 'home'});

        // Handle requests for the Browse Pets page
        if (pathname === '/browse') {
            const shelterId = query.shelterId;
            const shelter = shelters.find(s => (s.id === shelterId));
            const pets = [];
            const types = [{type: 'All', label: 'All', count: 0},
                           {type: 'Cat', label: 'Cats', count: 0},
                           {type: 'Dog', label: 'Dogs', count: 0},
                           {type: 'Bird', label: 'Birds', count: 0},
                           {type: 'Reptile', label: 'Reptiles', count: 0},
                           {type: 'Other', label: 'Other', count: 0}];
            let activeType = 'All';
            if (shelter) {
                // Only use the type if it is one of the buttons
                if (types.find(t => (t.type === query.type)))
                    activeType = query.type;
                for (let i=0; i<shelter.pets.length; i++) {
                    const pet = shelter.pets[i];
                    types[0].count++;
                    const typeEntry = types.find(t => (t.type === pet.type));
                    if (typeEntry)
                        typeEntry.count++;
                    if ((activeType === 'All') || (activeType === pet.type))
                        pets.push(pet);
                }
            }
            return renderPage(res, 'browse', {title: 'New Home - Browse', css: 'browse.css', active: 'browse',
                shelters: shelters, shelterId: shelter ? shelter.id : undefined, pets: pets, types: types, activeType: activeType});
        }

        // Handle requests for the About Us page
        if (pathname === '/about') 
            return renderPage(res, 'about', {title: 'New Home - About', css: 'about.css', active: 'about', about: aboutData});
        
        // Handle requests for the applications page
        if (pathname === '/admin/applications') {
            const appData = [];
            for (let i=0; i<applications.length; i++) {
                const app = applications[i];
                const pet = findPet(app.shelterId, app.petId);
                appData.push({date: app.date, applicationId: app.applicationId, shelterId: app.shelterId,
                              petId: app.petId, petType: pet ? pet.type : '', status: app.status});
            }
            return renderPage(res, 'applications', {title: 'Applications - New Home Animal Rescue', css: 'applications.css',
                active: 'applications', applications: appData});
        }

        // Handle requests for the pet details page
        if (pathname === '/details') {
            const pet = findPet(query.shelterId, query.petId);
            const shelter = shelters.find(s => (s.id === query.shelterId));
            let processingFee = 30;
            if (shelter && shelter.processingFee)
                processingFee = shelter.processingFee;
            const totalFee = pet ? Number(pet.adoptionFee) + Number(processingFee) : 0;
            return renderPage(res, 'pet', {title: 'New Home - Pet Details', css: 'pet.css', active: 'browse',
                pet: pet, shelterId: query.shelterId, processingFee: processingFee, totalFee: totalFee});
        }

        // Handle requests for the application form page
        if (pathname === '/apply') {
            const pet = findPet(query.shelterId, query.petId);
            const shelter = shelters.find(s => (s.id === query.shelterId));
            let processingFee = 30;
            if (shelter && shelter.processingFee)
                processingFee = shelter.processingFee;
            const totalFee = pet ? Number(pet.adoptionFee) + Number(processingFee) : 0;
            return renderPage(res, 'apply', {title: 'New Home - Application', css: 'apply.css', active: 'browse',
                pet: pet, processingFee: processingFee, totalFee: totalFee});
        }
        
        // Handle an API request for one pet's data
        if (pathname === '/shelters/pets') { 
            if ((query.shelterId) && (query.petId)) { 
                const pet = findPet(query.shelterId, query.petId);
                if (pet)
                    return res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify(pet));
                else
                    return res.writeHead(404).end('Pet Not Found. Either shelter ID or pet ID is invalid.'); 
            }
            else 
                return res.writeHead(404).end('Missing pet ID and/or shelter ID.'); 
        }
        // Handle an API request for basic shelter data (i.e., not the pet info)
        if (pathname === '/shelters') {             
            if (query.id) { // Handle request for one shelter's data
                const shelter = shelters.find(shelter => (shelter.id === query.id));
                if (shelter) 
                    return res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify(shelter));
                else
                    return res.writeHead(404).end('Shelter Not Found');
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify(shelters.map(shelter => ({ id: shelter.id, name: shelter.name, city: shelter.city, processingFee: shelter.processingFee }))));
        }
        // Handle an API request for one application's details
        if (pathname === '/applications-details') { 
            if (query.id) { 
                const app = applications.find(a => (a.applicationId === query.id));
                if (app) 
                    return res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify(app));
                else
                    return res.writeHead(404).end('Application not Found. Invalid ID.');
            }
            return res.writeHead(404).end('Application not Found. Missing ID.');
        }
        // Handle an API request for overall applications data
        if (pathname === '/applications-data') {  
            const appData = [];    
            for (let i=0; i<applications.length; i++) {
                const app = applications[i];
                const pet = findPet(app.shelterId, app.petId);
                let oneApp = {}; 
                oneApp.date = app.date;
                oneApp.applicationId = app.applicationId;
                oneApp.shelterId = app.shelterId;
                oneApp.petId = app.petId;
                if (pet)
                    oneApp.petType = pet.type;
                oneApp.status = app.status;
                appData.push(oneApp);
            }
            return res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify(appData));
        }
        
        return serveStatic(path.join(__dirname, '.' + pathname), res);
    }
    // Handle incoming submitted application
    if (req.method === 'POST' && pathname === '/submit-application') {
        readRequestBody(req, (body) => {
            try {
                // Get the application and add it to the submitted applications
                const application = JSON.parse(body); 

                // Add the current date/time, a unique ID and a status
                application.date = new Date().toLocaleString('en-CA', { 
                                            year: 'numeric', month: '2-digit', day: '2-digit',
                                            hour: '2-digit', minute: '2-digit' });
                application.applicationId = "a" + (applications.length + 1); // This is ok since we will never remove
                application.status = "Unprocessed";
                applications.push(application);

                res.writeHead(200, {'Content-Type': 'text/plain'});
                return res.end('Application received');
            } catch(e) {
                console.error(e);
                res.writeHead(400, {'Content-Type': 'text/plain'});
                return res.end('Invalid application data');
            }
        });
        return;
    }
    // Handle incoming API request for an application status update
    if (req.method === 'PUT' && pathname === '/applications-update') {
        readRequestBody(req, (body) => {
            try {
                // Get the application ID and its updated status from the request body
                const {applicationId, status} = JSON.parse(body); 

                // Update the status as long as the ID is valid and the status is available
                if (applicationId && status) {
                    const aId = parseInt(applicationId.slice(1), 10);
                    if (aId <= applications.length)
                        applications[aId-1].status = status;
                }
                res.writeHead(200, {'Content-Type': 'text/plain'});
                return res.end("Application " + applicationId + " updated");
            } catch(e) {
                console.error(e);
                res.writeHead(400, {'Content-Type': 'text/plain'});
                return res.end('Missing application status update data');
            }
        });
        return;
    }
    // Handle anything else as an error
    res.writeHead(404).end('Not Found');
}

// Start the server
http.createServer(handleRequest).listen(3000);
console.log('Adoption Company Server running on http://localhost:3000');
