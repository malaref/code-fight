import socketIo from "socket.io";
import errorHandler from "errorhandler";

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

const io = socketIo(server);
io.on("connect", (socket: socketIo.Socket) => {
    // TODO Authenticate the connection
    console.log("Client connected");
    socket.on("chat", (message) => {
        console.log("Message received: %s", message);
        io.emit("chat", message);
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

export default server;
