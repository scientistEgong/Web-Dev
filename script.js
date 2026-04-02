"use strict";

// ================================
// Variables
// ================================
const age = 21;
const department = "Computer Engineering";

console.log("Age:", age);
console.log("Department:", department);

// ================================
// Function to calculate sum
// ================================
function calculateSum(num1, num2) {
    const sum = num1 + num2;
    alert("The sum is: " + sum);
}

// Call the function
calculateSum(5, 7);

// ================================
// Check if number is even or odd
// ================================
let numberInput = prompt("Enter a number:");
const number = Number(numberInput.trim()); // convert input to number and trim whitespace

if (!isNaN(number)) { // validate number input
    if (number % 2 === 0) {
        alert("The number is even");
    } else {
        alert("The number is odd");
    }
} else {
    alert("Invalid input! Please enter a numerical value.");
}

// ================================
// Loop through an array
// ================================
const fruits = ["Apple", "Orange", "Mango", "Banana"];

for (let i = 0; i < fruits.length; i++) {
    console.log(fruits[i]);
}

// Alternative modern approach using forEach
fruits.forEach(fruit => console.log(fruit));