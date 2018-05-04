import { Request, Response } from "express";
import { User } from "./models/User";

export function authenticate (req: Request, res: Response) {
    if (req.user != undefined) {
        res.redirect("/dashboard");
    } else {
        res.render("pages/authenticate", {
            title: "Authenticate"
        });
    }
}

export async function dashboard(req: Request, res: Response) {
    if (req.user == undefined) {
        res.redirect("/authenticate");
    } else {
        res.render("pages/dashboard", {
            title: "Dashboard",
            scripts: await req.user.getUserScripts()
        });
    }
}

export function ide(req: Request, res: Response) {
    if (req.user == undefined) {
        res.redirect("/authenticate");
    } else {
        res.render("pages/ide", {
            title: "IDE"
        });
    }
}

export function register(req: Request, res: Response) {
    if (req.user != undefined) {
        res.redirect("/dashboard");
    } else {
        User.createNewUser(req.body.username, req.body.password).then((user) => res.redirect("/"));
    }
}
