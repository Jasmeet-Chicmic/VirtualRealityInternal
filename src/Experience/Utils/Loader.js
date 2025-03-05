export default class Loader {
    constructor() {
        this.loaderElement = document.querySelector(".loader");
        this.init();
    }

    init() {
        window.addEventListener("load", () => this.hideLoader());
    }

    showLoader() {
        this.loaderElement.classList.remove("hidden");
    }

    hideLoader() {
        this.loaderElement.classList.add("hidden");
    }
}

