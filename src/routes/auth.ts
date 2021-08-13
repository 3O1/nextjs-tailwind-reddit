import { Request, Response, Router } from "express";
import { validate } from "class-validator";

import { User } from "../entities/User";

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    // TODO: Validate data

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

    // TODO: Create user
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

const router = Router();
router.post("/register", register);

export default router;
