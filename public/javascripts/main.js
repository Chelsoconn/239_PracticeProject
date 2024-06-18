import Elements from './mods/elements.js';
import Helpers from './mods/helpers.js';

class App {
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      let bool = true;
      let currentButton;
      let helpersInstance = new Helpers(bool, currentButton, new Elements());
    });
  }
}

let app = new App();
app.init();