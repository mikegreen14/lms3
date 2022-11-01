/* main.js
new entry point for the application, uses module pattern
TODO-Implement this.  Include in index.html, removing all other application includes
*/
import AppController from "./controllers/app_controller.js";
import appViewModel from "./views/view_models/app_view_model.js"

//async IIFE allows us to use await
(async function() {
    let app = new AppController(appViewModel);
	await app.render();
})();