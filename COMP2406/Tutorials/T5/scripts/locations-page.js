const table = document.getElementById("locationsTable");
// Go through each table row

for (let rowStart=0; rowStart<locations.length; rowStart+=3) {
    const row = document.createElement("tr");
    // Go through each location in the row (assumes 6 locations)
    for (let i=rowStart; i<rowStart+3; i++) {
        const loc = locations[i];
        const cell = document.createElement("td");
        cell.innerHTML = `
            <h2>${loc.name1} <br> ${loc.name2}</h2>
            <p id="details${i}">
                ${loc.street}<br>
                ${loc.cityProv}<br>
                Phone: ${loc.phone}
             </p>
        `;
        row.appendChild(cell);
    }
    table.appendChild(row);
}

fetch("https://api.open-meteo.com/v1/forecast?latitude=45.4215&longitude=-75.6972&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=2")
.then(res => {
    if (!res.ok)
        throw new Error("Request failed");
    return res.json();
})
.then(data => {
    const temp = data.daily.temperature_2m_max[1];
    const rain = data.daily.precipitation_sum[1];
    
    const i = 0; // the first location
    const p = document.getElementById("details"+i);
    const newP = document.createElement("p");
    newP.classList.add("patio");
    if (rain > 1)
        newP.textContent = "🌧 Patio Tomorrow: May be Closed (rain expected)";
    else if (temp > 18)
        newP.textContent = "🌞 Patio Tomorrow: Fun in the Sun (max " + temp + "°C)";
    else if (temp >= 8)
        newP.textContent = "🧥 Patio Tomorrow: Light Jacket Weather (max " + temp + "°C)";
    else
        newP.textContent = "🥶 Patio Tomorrow: Closed (max " + temp + "°C)";
    p.appendChild(newP);
})   
.catch(error => {
    console.error("Fetch error:", error);
});

