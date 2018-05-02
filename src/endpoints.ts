import { Request, Response } from "express";


export let getAuthenticate = (req: Request, res: Response) => {
    res.render("pages/authenticate", {
        title: "Authenticate"
    });
};

export let getDashboard = (req: Request, res: Response) => {
    res.render("pages/dashboard", {
        title: "Dashboard"
    });
};

export let getIDE = (req: Request, res: Response) => {
    res.render("pages/ide", {
        title: "IDE"
    });
};
