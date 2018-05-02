import { createServer, Server } from "http";
import { getAuthenticate, getDashboard, getIDE } from "./endpoints";
import express from "express";
import socketIo from "socket.io";
import path from "path";
import { Connection, createConnection } from "typeorm";
import { User } from "./models/User";
import { Project } from "./models/Project";
import { Privilege } from "./models/Privilege";

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


app.get("/authenticate", getAuthenticate);
app.get("/dashboard", getDashboard);
app.get("/ide", getIDE);

export let DB: Connection;
createConnection().then( async connection => {
    DB = connection;
    console.log("connected successfully");
    const repo = DB.getRepository(User);
    const user1: User = await User.createNewUser("Mahmoud1", "MK1", "12345");
    const user2: User = await User.createNewUser("Mahmoud2", "MK2", "12345");
    const project: Project = await user1.createNewProject("pro1");
    await project.addUserToProject(user1.username, user2.username, Privilege.CONTRIBUTOR);
}).catch((error) => console.log(error));

export default app;
