import { Request, Response } from "express";
import { User } from "./models/User";
import { Privilege } from "./models/Privilege";

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
        const contributionLevel = (await req.user.getUserPrivilege(req.params.id)).contributionLevel;
        if (script == undefined) {
            res.sendStatus(401);
        } else {
            res.render("pages/editor", {
                title: "Editor - " + script.name,
                script_id: script.id,
                script_code: script.getScriptCode(),
                contributionLevels: [Privilege.VIEWER, Privilege.CONTRIBUTOR],
                read_only: contributionLevel != Privilege.OWNER && contributionLevel != Privilege.CONTRIBUTOR
            });
        }
    }
}

export function deleteScript(req: Request, res: Response) {
    if (req.user == undefined) {
        res.sendStatus(401);
    } else {
        req.user.deleteScript(req.params.id);
        res.redirect("/dashboard");
    }
}

export async function runScript(req: Request, res: Response) {
    if (req.user == undefined) {
        res.sendStatus(401);
    } else {
        const script = await req.user.getUserScript(req.params.id);
        res.send(script.runScript(req.body.stdin));
    }
}

export async function shareScript(req: Request, res: Response) {
    if (req.user == undefined) {
        res.sendStatus(401);
    } else {
        const script = await req.user.getUserScript(req.params.id);
        const success = await script.addUserToScript(req.user.username, req.body.username, req.body.contributionLevel);
        res.send(success ? "Successfully shared with " +  req.body.username : "Could not share with " +  req.body.username);
    }
}

export async function getUsers(req: Request, res: Response) {
    if (req.user == undefined) {
        res.sendStatus(401);
    } else {
        const usernames: String[] = [];
        const users = await User.getAllUsers();
        for (let i = 0; i < users.length; i++) {
            const username = users[i].username;
            if (username.includes(req.body.query)) {
                usernames.push(username);
            }
        }
        res.send(usernames);
    }
}
