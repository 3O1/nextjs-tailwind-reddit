import { Request, Response, Router } from "express";
import { isEmpty, validate } from "class-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookie from "cookie";

import User from "../entities/User";
import auth from "../middleware/auth";

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    // check if username & email are taken
    let errors: any = {};
    const emailUser = await User.findOne({ email });
    const usernameUser = await User.findOne({ username });

    // can write errors.msg for consistent error JSON objects
    if (emailUser) errors.email = "Email is already taken";
    if (usernameUser) errors.username = "Username is already taken";

    // if top errors exist -> send errors back to client
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // Create user
    const user = new User({ email, username, password });

    // before saving to db - validate
    errors = await validate(user);
    if (errors.length > 0) return res.status(400).json({ errors });

    await user.save();
    // TODO: Return user
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    let errors: any = {};

    if (isEmpty(username)) errors.username = "Username cannot be empty";
    if (isEmpty(password)) errors.password = "Password cannot be empty";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: "username not found" });

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      // can either tell user whats invalid or be vague
      return res.status(401).json({ password: "Password is incorrect" });
    }

    // sign & return token | secret as base62?
    const token = jwt.sign({ username }, process.env.JWT_SECRET!);

    /**
     * set() used to set headers when sending back a response
     *
     * Tells client to take whatever value is in the header &
     * store it in the client machine as a cookie
     *
     */
    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        /**
         * @param httpOnly: cookie cannot be accessed by JS -> more secure
         * 
         * @param secure: cookie can only be transferred through https
         *  - in prod set to true
         *  - false by default
         *  - process.env.NODE_ENV === 'prod'
         *    - if env set to prod -> only https

         * @param sameSite: cookie should only come from our domain
         *  - `strict`
         * @param maxAge: expire time of the cookie
         * @param path: tells program where the cookie is valid
         * - '/' valid across entire application
         */
        httpOnly: true,
        secure: process.env.NODE_ENV === "prod",
        sameSite: "strict",
        maxAge: 3600, // 1 hour
        path: "/",
      })
    );

    return res.json(user);
  } catch (err) {
    /**
     * In prod want to send error to sentry
     *
     * Did validation already, if there is an error it's a server error
     */
    console.log(err);
    return res.json({ error: "Something went wrong" });
  }
};

/**
 * /me route after the middleware, won't reach here if anything in the auth fails
 *  - have a user if we reach here & return it
 *
 *  - lets user know if authenticated & who they are
 *  @returns the user in the response.locals.object value from the auth middleware
 *
 */

const me = (_: Request, res: Response) => {
  return res.json(res.locals.user);
};

/**
 * Logout
 *
 *  Can't tell client to delete the cookie
 *
 *  - Set a cookie with the exact same name &
 *  - give it an empty value & immediate expire time
 *
 * @param value set to ''
 * @param [options]
 *  - expires: immediately
 * @returns 200 - success: true
 *
 * Omit request parameter if not used with `_: Request`
 */

const logout = (_: Request, res: Response) => {
  res.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "prod",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    })
  );

  return res.status(200).json({ success: true });
};

const router = Router();
router.post("/register", register);
router.post("/login", login);
/**
 * passing auth middleare before /me & /logout route
 *
 * By passing the auth middleware for the logout, prevents unauthenticated users from making a request to logout
 */
router.get("/me", auth, me);
router.get("/logout", auth, logout);

export default router;
