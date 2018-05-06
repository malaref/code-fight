import { authenticate, register, logout, dashboard, newScript, getScript, deleteScript, runScript, shareScript, getUsers } from "./endpoints";
import express from "express";
import path from "path";
import { Connection, createConnection } from "typeorm";
import passport from "passport";
import { urlencoded } from "body-parser";
import expressSession from "express-session";

const app = express();

const PORT = process.env.PORT || 3000;

app.set("port", PORT);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

app.use(urlencoded({ extended: false }));
app.use(expressSession({ secret: "this is a secret", resave: true, saveUninitialized: true }));

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
app.post("/register", register);
app.post("/login",
  passport.authenticate("local", { successRedirect: "/",
                                   failureRedirect: "/authenticate" }));
app.post("/logout", logout);
app.get("/logout", logout);

app.get("/", function(req, res) {
    res.redirect("/dashboard");
});
app.get("/dashboard", dashboard);

app.post("/script/new", newScript);
app.get("/script/:id", getScript);
app.post("/script/:id/delete", deleteScript);
app.post("/script/:id/run", runScript);
app.post("/script/:id/share", shareScript);

app.post("/users", getUsers);

export default app;
