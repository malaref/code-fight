import { createServer, Server } from "http";
import express from "express";
import socketIo from "socket.io";
import path from "path";

const app = express();

const PORT = process.env.PORT || 3000;

const io = socketIo();
io.on("connect", (socket: socketIo.Socket) => {
    console.log("Connected client on port %s.", PORT);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

app.set("port", PORT);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

export default app;
