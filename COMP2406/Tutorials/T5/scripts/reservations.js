
const restLocation = document.getElementById('location');
const date = document.getElementById('date');
const time = document.getElementById('time');
const guests = document.getElementById('guests');
const submit = document.querySelector('input[type="submit"]');


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

//
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
            console.log(responseObject.data);
        } else {
            console.error("Request failed. Status:", xhr.status);
        }
    };

    xhr.onerror = function () {
        console.error("Network error occurred");
    };

    xhr.send(JSON.stringify(data));
});*/

// fetch .then .then .catch
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
        return response.json(); // could return error
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
})*/

document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this));
    
    try {
        const response = await fetch("https://httpbin.org/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
        console.log("The response is: ", response);
        if (!response.ok) {
            console.log("Response is ok");
            if (response.status === 404) {
                throw new Error("Page Not Found");
            } else if (response.status === 500) {
                throw new Error("There is a Server Problem");
            } else {
                console.log("Response.status is ", response.status);
                throw new Error("Request failed with status: " + response.status);
            }
        }
        console.log("response.ok returns: ", response.ok);
        const result = await response.json(); // could return error
        console.log(result.json);

    }catch(error){
        if (error.name === "TypeError") {
            console.error("Network error (no connection or server unreachable)");
        } else {
            console.error("Request error:", error.message);
        }
    };
})




