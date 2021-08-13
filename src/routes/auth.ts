import { Request, Response, Router } from "express";
import { isEmpty, validate } from "class-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookie from "cookie";

import { User } from "../entities/User";

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
    const token = jwt.sign({ username }, process.env.JWT_SECRET);

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
  } catch (err) {}
};

/**
 * /me route
 *
 *  user can send request to this route
 *  - lets user know if authenticated & who they are
 *
 * @throws {Error('Unathenticated')} if token and/or user is null
 */

const me = async (req: Request, res: Response) => {
  try {
    /**
     * cookie-parser middleware to pass cookies from the request easily
     */
    const token = req.cookies.token;

    if (!token) throw new Error("Unathenticated");

    /**
     * extract username from token
     *  - throw error if user is not found
     *  - return user object if no errors/user found
     */
    const { username }: any = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ username });
    if (!user) throw new Error("Unauthorized");

    return res.json(user);
  } catch (err) {
    console.log(err);
    /**
     * STATUS_CODE 401 = authorization errors
     */
    return res.status(401).json({ error: err.message });
  }
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
router.get("/me", me);
router.get("/logout", logout);

export default router;
