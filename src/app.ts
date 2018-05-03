import { createServer, Server } from "http";
import { authenticate, dashboard, ide, login, register } from "./endpoints";
import express from "express";
import socketIo from "socket.io";
import path from "path";
import { Connection, createConnection } from "typeorm";
import passport from "passport";
import { urlencoded } from "body-parser";
import expressSession from "express-session";
import { User } from "./models/User";

const app = express();

const PORT = process.env.PORT || 3000;

const io = socketIo();
io.on("connect", (socket: socketIo.Socket) => {
    console.log("Client connected");
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

app.set("port", PORT);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

app.use(urlencoded({ extended: false }));
app.use(expressSession({ secret: "this is a secret", saveUninitialized: false }));

// Database initialization
export let DB: Connection;
createConnection().then(connection => {
    DB = connection;
}).catch((err) => console.log(err));

// Passport setup
import "./config/passport";
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/authenticate", authenticate);
app.get("/dashboard", dashboard);
app.get("/ide", ide);

app.post("/login", login);
app.post("/register", register);

app.get("/", function(req, res) {
    res.redirect("/dashboard");
});

export default app;
