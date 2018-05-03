import { createServer, Server } from "http";
import { authenticate, dashboard, ide, login, register } from "./endpoints";
import express from "express";
import socketIo from "socket.io";
import path from "path";
import { Connection, createConnection } from "typeorm";
import passport, { Strategy } from "passport";
import passportLocal from "passport-local";
// TODO remove the require statements with import
import morgan from "morgan";
const cookieParser = require("cookie-parser")();
import { urlencoded } from "body-parser";
// const expressSession = require("express-session")({ secret: "keyboard cat", resave: false, saveUninitialized: false });
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

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

app.use(urlencoded({ extended: false }));
app.use(morgan("combined"));
app.use(cookieParser);
app.use(expressSession{ secret: "keyboard cat", resave: false, saveUninitialized: false }));

// Database initialization
export let DB: Connection;
createConnection().then( async connection => {
    DB = connection;
    console.log("connected successfully");
}).catch((err) => console.log(err));


// passport setup
const LocalStrategy = passportLocal.Strategy;
const localStrategy: Strategy = new LocalStrategy ((username: string, password: string, done) => {
    User.authenticate(username, password).then((user: User) => {
        if (user != undefined) {
            return done(null, user);
        } else {
            return done(undefined, false, {message: "Incorrect credential"});
        }
    }).catch((err) => {
        console.error("Error authenticating the user", err);
        return done(err);
    });
});

passport.use(localStrategy);

passport.serializeUser((user: User, done) => {
    done(undefined, user.username);
});

passport.deserializeUser((username: string, done) => {
    User.getUser(username).then((user: User) => {
        done(undefined, user);
    });
});

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
