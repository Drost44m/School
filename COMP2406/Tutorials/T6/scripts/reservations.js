
const restLocation = document.getElementById('location');
const date = document.getElementById('date');
const time = document.getElementById('time');
const guests = document.getElementById('guests');
const submit = document.querySelector('input[type="submit"]');


// Populate the Select box with the location options
for (let i=0; i<locations.length; i++) {
    const loc = locations[i];
    const option = document.createElement("option");
    option.value = loc.name1 + " – " + loc.name2;
    option.textContent = loc.name1 + " – " + loc.name2;
    restLocation.appendChild(option);
}

function updateState() {
    const selected = (restLocation.value !== "");

    date.disabled = !selected;
    time.disabled = !selected;
    guests.disabled = !selected;
    submit.disabled = !selected;
}

restLocation.addEventListener('change', updateState);
updateState();


// Prevent past dates
date.addEventListener('input', () => {
    const today = new Date().toISOString().split("T")[0];
    if (date.value < today)
        date.setCustomValidity("Date cannot be in the past");
    else
        date.setCustomValidity("");
    date.reportValidity();
});


// Reservations may only be made for a time between 11AM and 10PM
const earliest = 11 * 60;  // 11AM
const latest   = 22 * 60;  // 10PM

function timeToMinutes(t) {
    const [hours, minutes] = t.split(":").map(Number);
    return hours * 60 + minutes;
}

time.addEventListener('input', () => {
    if (!time.value) return; // handle empty string
    
    const mins = timeToMinutes(time.value);

    if (mins < earliest || mins > latest) {
        time.setCustomValidity("Please select a valid time range");
        time.style.color = 'red';
    } else {
        time.setCustomValidity("");
        time.style.color = 'black';
    }
});

// XmlHTTPRequest() version
/*document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(this));
    
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://httpbin.org/post");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = "json";
    
    xhr.onload = function () {
        if (xhr.status === 200) {
            const responseObject = xhr.response;
            console.log(xhr.response.json);//JSON.parse(responseObject.data));
        } else {
            console.error("Request failed. Status:", xhr.status);
        }
    };

    xhr.onerror = function () {
        console.error("Network error occurred");
    };

    xhr.send(JSON.stringify(data));
});*/

// fetch().then().catch() version
/*document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(this));

    fetch("https://httpbin.org/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Page Not Found");
            } else if (response.status === 500) {
                throw new Error("There is a Server Problem");
            } else {
                throw new Error("Request failed with status: " + response.status);
            }
        }
        return response.json(); // This could throw an error
    })
    .then(data => {
        console.log(data.json);
    })
    .catch(error => {
        if (error.name === "TypeError") {
            console.error("Network error (no connection or server unreachable)");
        } else {
            console.error("Request error:", error.message);
        }
    });
});*/

// async/await version
document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(this));

    try {
        const response = await fetch("https://httpbin.org/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Page Not Found");
            } else if (response.status === 500) {
                throw new Error("There is a Server Problem");
            } else {
                throw new Error("Request failed with status: ", response.status);
            }
        }
        const result = await response.json(); // This could throw an error
        console.log(result.json);
    } catch(error) {
        if (error.name === "TypeError") {
            console.error("Network error (no connection or server unreachable)");
        } else {
            console.error("Request error:", error.message);
        }
    }
});

document.getElementById("location").addEventListener("change", async function (e) {
    const p = document.getElementById("patio-message");
    if (this.selectedIndex > 0) 
        p.classList.remove("hidden");
    else {
        p.classList.add("hidden");
        p.textContent = "";
    }

    // Get the location and its coordinates
    try {
        const theLocation = locations[this.selectedIndex - 1];
        const lat = theLocation.latitude;
        const lon = theLocation.longitude;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=2`;
        
        const result = await fetch(url);
        const data = await result.json();
        const temp = data.daily.temperature_2m_max[1];
        const rain = data.daily.precipitation_sum[1];

        if (rain > 1) 
            p.textContent = "🌧 Patio Tomorrow: May be Closed (rain expected)";
        else if (temp > 18) 
            p.textContent = "🌞 Patio Tomorrow: Fun in the Sun (max " + temp + "°C)";
        else if (temp >= 8) 
            p.textContent = "🧥 Patio Tomorrow: Light Jacket Weather (max " + temp + "°C)";
        else 
            p.textContent = "🥶 Patio Tomorrow: Closed (max " + temp + "°C)";
    } catch(error) {
        p.textContent = "";
        p.classList.add("hidden");
    }
});
