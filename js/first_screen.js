function initializeFirstScreen() {
    // Create the first screen overlay
    const firstScreen = document.createElement("div");
    firstScreen.id = "first-screen";
    firstScreen.innerHTML = `
        <h1>Dynamically Priced Parking in El Paso, Texas</h1>
        <p>Press <b>Enter</b> to continue</p>
    `;

    console.log("testing first screen")

    // Append the overlay to the body
    document.body.appendChild(firstScreen);

    // Function to slide the screen up and trigger callback
    function removeScreen(event) {
        if (event.key === "Enter") {
            console.log("Enter key pressed - Sliding first screen out"); // Debugging log
            
            firstScreen.classList.add("slide-up"); // Apply slide-up animation
            
            // Remove event listener after activation
            document.removeEventListener("keydown", removeScreen);
    }
    }

    // Add event listener for Enter key press
    document.addEventListener("keydown", removeScreen);
}

// Export function to be used in main.js
export { initializeFirstScreen };
