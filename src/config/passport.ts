import passport from "passport";
import passportLocal from "passport-local";

import { User } from "../models/User";
import { Request, Response, NextFunction } from "express";

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser((user: User, done) => {
  done(undefined, user.username);
});

passport.deserializeUser((username: string, done) => {
  User.getUser(username).then((user: User | undefined) => {
      done(undefined, user);
  });
});

passport.use(new LocalStrategy(
    (username: string, password: string, done) => {
        User.authenticate(username, password).then((user: User | undefined) => {
            if (user != undefined) {
                return done(null, user);
            } else {
                return done(null, false, {message: "Incorrect credential"});
            }
        }).catch((err) => {
            console.error("Error authenticating the user", err);
            return done(err);
        });
    }
));
