"use strict";

// ================================
// Change Paragraph Color
// ================================
const paragraph = document.querySelector("#myParagraph");
if (paragraph) {
    paragraph.style.color = "blue";
}

// ================================
// Create a New List Item Dynamically
// ================================
const existingList = document.querySelector("#existingList");

if (existingList) {
    const newItem = document.createElement("li");
    newItem.textContent = "New Dynamic Item";
    existingList.appendChild(newItem);
}

// ================================
// Toggle Visibility of an Element
// ================================
const toggleBox = document.querySelector(".toggleBox");
const toggleBtn = document.querySelector("#toggleBtn");

if (toggleBtn && toggleBox) {
    toggleBtn.addEventListener("click", function () {   // fixed "Click" → "click"
        toggleBox.classList.toggle("hidden");
    });
}

// ================================
// Fetch Input from Form and Display
// ================================
const form = document.querySelector("#myForm");
const outputDiv = document.querySelector("#output");

if (form && outputDiv) {
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page refresh
        const inputValue = document.querySelector("#nameInput").value.trim();
        outputDiv.textContent = "Hello " + inputValue + "!";
    });
}

// ================================
// Handle Missing Elements Gracefully
// ================================
const missingElement = document.querySelector("#doesNotExist"); // removed invalid selector "#.doesNotExist"

if (!missingElement) {
    console.warn("Element not found!");
}