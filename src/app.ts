import { authenticate, dashboard, ide, register } from "./endpoints";
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
createConnection().then(async connection => {
    DB = connection;
    const user1: User = await User.createNewUser("user1", "12345");
    const user2: User = await User.createNewUser("user2", "12345");
    const user3: User = await User.createNewUser("user3", "12345");
    const user4: User = await User.createNewUser("user4", "12345");
    await User.createNewUser("user5", "12345");

    const script1u1: Script = await user1.createNewScript("script1u1");
    const script2u1: Script = await user1.createNewScript("script2u2");
    const script3u1: Script = await user1.createNewScript("script3u3");

    const script1u2: Script = await user2.createNewScript("script1u2");
    const script2u2: Script = await user2.createNewScript("script2u2");

    await script1u1.addUserToScript(user1.username, user3.username, Privilege.CONTRIBUTOR);
    await script1u1.addUserToScript(user3.username, user3.username, Privilege.CONTRIBUTOR);
    console.log("Finished seeding successfully");
    console.log("user1", await user1.getUserScripts());
    console.log("user3", await user3.getUserScripts());
    console.log("user4", await user4.getUserScripts());

    console.log("access of user1 and pro1", await user1.getUserScript(1));
    console.log("access of user1 and pro4", await user1.getUserScript(4));
}).catch((err) => console.log(err));

// Passport setup
import "./config/passport";
import {Privilege} from "./models/Privilege";
import {Script} from "./models/Script";
import {User} from "./models/User";
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/authenticate", authenticate);
app.post("/login",
  passport.authenticate("local", { successRedirect: "/",
                                   failureRedirect: "/authenticate" }));
app.post("/register", register);

app.get("/", function(req, res) {
    res.redirect("/dashboard");
});
app.get("/dashboard", dashboard);
app.get("/ide", ide);

export default app;
