"use strict";

// ================================
// Mouse Over / Out Events
// ================================
const hoverBox = document.getElementById("hoverBox");

if (hoverBox) {
    hoverBox.addEventListener("mouseover", function() {
        hoverBox.style.backgroundColor = "skyblue";
    });

    hoverBox.addEventListener("mouseout", function() { // fixed typo "moouseout"
        hoverBox.style.backgroundColor = "lightgray";
    });
}

// ================================
// Simple Counter
// ================================
let counter = 0;
const counterDisplay = document.getElementById("counter");
const button = document.getElementById("increaseBtn"); // fixed ID capitalization

if (button && counterDisplay) {
    button.addEventListener("click", function() {
        counter++;
        counterDisplay.textContent = counter;
    });
}

// ================================
// Form Validation
// ================================
const form = document.getElementById("emailForm");
const message = document.getElementById("FormMessage"); // fixed capitalization

if (form && message) {
    form.addEventListener("submit", function(event) {
        event.preventDefault(); // prevent page refresh

        const email = document.getElementById("emailInput").value.trim();

        if (email.includes("@")) {
            message.textContent = "Valid Email";
            message.style.color = "green";
        } else {
            message.textContent = "Invalid Email";
            message.style.color = "red";
        }
    });
}

// ================================
// Timer Example
// ================================
const timerText = document.getElementById("timerText"); // fixed capitalization
if (timerText) {
    setTimeout(function() {
        timerText.textContent = "3 seconds passed!";
    }, 3000);
}

// ================================
// Prevent Default Link Navigation
// ================================
const link = document.getElementById("myLink");
if (link) {
    link.addEventListener("click", function(event) { // added 'event' parameter
        event.preventDefault();
        alert("Navigation prevented!");
    });
}