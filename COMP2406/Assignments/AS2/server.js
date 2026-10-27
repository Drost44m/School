const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const SHELTER_DIR = path.join(__dirname, 'data', 'shelters');
let shelters = [];
let applications = [];
const STATUSES = ['Unprocessed', 'Pending', 'Rejected', 'Approved'];
let nextApplicationId = 1;

// Read every .json file in the shelters directory into the shelters array
function loadShelters(callback) {
    fs.readdir(SHELTER_DIR, (err, files) => {
        if (err) return callback(err);
        const jsonFiles = files.filter(f => path.extname(f).toLowerCase() === '.json');
        if (jsonFiles.length === 0) return callback(null, []);

        const loaded = new Array(jsonFiles.length);
        let remaining = jsonFiles.length;
        let failed = false;
        jsonFiles.forEach((file, i) => {
            fs.readFile(path.join(SHELTER_DIR, file), 'utf8', (err, data) => {
                if (failed) return;
                try {
                    if (err) throw err;
                    loaded[i] = JSON.parse(data);
                } catch (e) {
                    failed = true;
                    return callback(e);
                }
                if (--remaining === 0) callback(null, loaded);
            });
        });
    });
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


// Handle all incoming endpoint requests
function handleRequest(req, res) {
    const parsed = url.parse(req.url, true);
    let pathname = parsed.pathname;

    // Handle all incoming GET requests
    if (req.method === 'GET') {
        // For now ... just server all static files and replace '/' with 'index.html'
        // Shelter data: summaries of all shelters, or one full shelter by ?id=
        if (pathname === '/shelters') {
            if (parsed.query.id !== undefined) {
                const shelter = shelters.find(sh => sh.id === parsed.query.id);
                if (!shelter) {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    return res.end('Shelter not found');
                }
                res.writeHead(200, {'Content-Type': 'application/json'});
                return res.end(JSON.stringify(shelter));
            }
            const summaries = shelters.map(({id, name, city, processingFee}) => ({id, name, city, processingFee}));
            res.writeHead(200, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify(summaries));
        }

        // A single pet, found by ?petId= within the shelter given by ?shelterId=
        if (pathname === '/shelters/pets') {
            const shelter = shelters.find(sh => sh.id === parsed.query.shelterId);
            const pet = shelter && shelter.pets.find(p => p.id === parsed.query.petId);
            if (!pet) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                return res.end('Pet not found');
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify(pet));
        }

        // Summary of every submitted application
        if (pathname === '/applications-data') {
            const summaries = applications.map(a => {
                const shelter = shelters.find(sh => sh.id === a.shelterId);
                const pet = shelter && shelter.pets.find(p => p.id === a.petId);
                return {
                    applicationId: a.applicationId,
                    submitted: a.submitted,
                    shelterId: a.shelterId,
                    petId: a.petId,
                    petType: pet ? pet.type : 'Unknown',
                    status: a.status
                };
            });
            res.writeHead(200, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify(summaries));
        }

        // Full details of one application, by ?id=
        if (pathname === '/applications-details') {
            const application = applications.find(a => a.applicationId === parsed.query.id);
            if (!application) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                return res.end('Application not found');
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify(application));
        }

        const pages = {
            '/apply': '/apply.html',
            '/details': '/pet.html',
            '/': '/index.html',
            '/browse': '/browse.html',
            '/about': '/about.html',
            '/applications': '/applications.html'
        };
        if (pages[pathname])
            pathname = pages[pathname];
        const filePath = path.join(__dirname, pathname);
        return serveStatic(filePath, res);
    }

    // Receive a submitted adoption application
    if (req.method === 'POST' && pathname === '/submit-application') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            let data;
            try {
                data = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                return res.end('Invalid JSON');
            }

            // The pet must exist in the shelter named by the application
            const shelter = shelters.find(sh => sh.id === data.shelterId);
            if (!shelter || !shelter.pets.some(p => p.id === data.petId)) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                return res.end('Pet not found');
            }

            const application = Object.assign({}, data, {
                applicationId: 'a' + nextApplicationId++,
                submitted: new Date().toISOString(),
                status: 'Unprocessed'
            });
            applications.push(application);

            res.writeHead(200, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({ applicationId: application.applicationId }));
        });
        return;
    }

    // Update the status of an application
    if (req.method === 'PUT' && pathname === '/applications-update') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            let data;
            try {
                data = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                return res.end('Invalid JSON');
            }

            if (!STATUSES.includes(data.status)) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                return res.end('Invalid status');
            }
            const application = applications.find(a => a.applicationId === data.applicationId);
            if (!application) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                return res.end('Application not found');
            }

            application.status = data.status;
            res.writeHead(200, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({ applicationId: application.applicationId, status: application.status }));
        });
        return;
    }

    // Handle anything else as an error
    return res.writeHead(404).end('Not Found');
}


// Start server only once all shelters have been loaded
loadShelters((err, data) => {
    if (err) {
        console.error('Failed to load shelters:', err);
        process.exit(1);
    }
    shelters = data;
    http.createServer(handleRequest).listen(3000, () => {
        console.log(`Loaded ${shelters.length} shelters`);
        console.log('Pet Adoption Server running on http://localhost:3000');
    });
});
