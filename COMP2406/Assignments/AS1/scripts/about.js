// about.js - populates about.html from aboutData.js

// Grab the placeholder elements from the page
const missionText = document.getElementById("missionText");
const teamDescription = document.getElementById("teamDescription");
const teamTableBody = document.getElementById("teamTableBody");

// Fill in the simple text pieces
missionText.textContent = aboutData.mission;
teamDescription.textContent = aboutData.teamDescription;

// Adds one <td> with the given text to a row
function addCell(row, text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.appendChild(cell);
}

// Add one table row per team member, however many there are
aboutData.team.forEach((member) => {
  const row = document.createElement("tr");
  addCell(row, member.name);
  addCell(row, member.role);
  addCell(row, member.experience);
  addCell(row, member.qualifications);
  teamTableBody.appendChild(row);
});
