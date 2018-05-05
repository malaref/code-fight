import { Request, Response } from "express";
import { User } from "./models/User";

export function authenticate (req: Request, res: Response) {
    if (req.user != undefined) {
        res.redirect("/");
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

export function register(req: Request, res: Response) {
    if (req.user != undefined) {
        res.redirect("/");
    } else {
        User.createNewUser(req.body.username, req.body.password).then((user) => res.redirect("/"));
    }
}

export function logout(req: Request, res: Response) {
    if (req.user == undefined) {
        res.redirect("/");
    } else {
        req.logout();
        res.redirect("/");
    }
}

export function newScript(req: Request, res: Response) {
    if (req.user == undefined) {
        res.sendStatus(401);
    } else {
        req.user.createNewScript(req.body.name);
        res.redirect("/dashboard");
    }
}

export async function getScript(req: Request, res: Response) {
    if (req.user == undefined) {
        res.sendStatus(401);
    } else {
        const script = await req.user.getUserScript(req.params.id);
        if (script == undefined) {
            res.sendStatus(401);
        } else {
            res.render("pages/editor", {
                title: "Editor - " + script.name,
                script_id: script.id
            });
        }
    }
}

export function deleteScript(req: Request, res: Response) {
    if (req.user == undefined) {
        res.sendStatus(401);
    } else {
        // TODO uncomment this line
        // req.user.deleteScript(req.params.id);
        res.redirect("/dashboard");
    }
}
