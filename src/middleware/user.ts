import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "../entities/User";

/**
 * Check for token inside the request's cookie
 *
 * If not token is found or username on token isn't found,
 * an error is thrown & sent back to the client.
 *
 * @param req: Request from express
 * @param res: Response form express
 * @param next: NextFunction
 */
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * cookie-parser middleware to pass cookies from the request easily
     */
    const token = req.cookies.token;

    if (!token) return next();

    /**
     * extract username from token
     *  - throw error if user is not found
     *  - return user object if no errors/user found
     */
    const { username }: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findOne({ username });

    /**
     * res.locals.object is what express recommends to send back middleware
     *
     * @returns next() function if there aren't any errors thrown
     */
    res.locals.user = user;

    return next();
  } catch (err) {
    console.log(err);
    /**
     * STATUS_CODE 401 = authorization errors
     */
    return res.status(401).json({ error: "Unauthenticated" });
  }
};
