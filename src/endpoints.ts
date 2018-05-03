import { Request, Response } from "express";

export let authenticate = (req: Request, res: Response) => {
    res.render("pages/authenticate", {
        title: "Authenticate"
    });
};

export let dashboard = (req: Request, res: Response) => {
    res.render("pages/dashboard", {
        title: "Dashboard"
    });
};

export let ide = (req: Request, res: Response) => {
    res.render("pages/ide", {
        title: "IDE"
    });
};

export let login = (req: Request, res: Response) => {
    console.log(req.body.username);
    console.log(req.body.password);
    res.redirect("/");
};

export let register = (req: Request, res: Response) => {
    console.log(req.body.username);
    console.log(req.body.password);
    res.redirect("/");
};
