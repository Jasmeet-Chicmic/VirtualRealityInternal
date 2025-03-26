import { UI_PATHS } from "../sources";

export default class UIManager {
    constructor() {
        this.initialScreen();
    }

    initialScreen() {
        // Create overlay div
        const overlay = document.createElement("div");
        overlay.classList.add("overlay");

        // Create an image inside the overlay
        const image = document.createElement("img");
        image.src = UI_PATHS.INITIAL_SCREEN; // Path to image
        image.classList.add("overlay-image");

        // Append image to overlay
        overlay.appendChild(image);

        // Append overlay to body
        document.body.appendChild(overlay);

        // Start fade-out after 1 second
        setTimeout(() => {
            overlay.classList.add("fade-out");
        }, 1000);

        // Remove overlay after fade-out completes
        setTimeout(() => {
            overlay.remove();
        }, 2000); // Wait for transition to complete before removing
    }
}
