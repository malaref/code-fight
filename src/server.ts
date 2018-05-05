import errorHandler from "errorhandler";

import sockets from "./sockets";
import app from "./app";


// Error Handler. Provides full stack - for development only, remove for production
app.use(errorHandler());


// Start Express server.
const server = app.listen(app.get("port"), () => {
    console.log(
      "  App is running at http://localhost:%d in %s mode",
      app.get("port"),
      app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
});

// Sockets
sockets(server);

export default server;
