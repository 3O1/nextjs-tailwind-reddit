import { Request, Response, Router } from "express";
import { isEmpty } from "class-validator";
import { getRepository } from "typeorm";

import User from "../entities/User";
import Sub from "../entities/Sub";
import auth from "../middleware/auth";

/**
 *
 * @param req {Request}
 * @param res {Response}
 *
 * User has to be authenticated in order to create a sub
 */
const createSub = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;

  const user: User = res.locals.user;

  try {
    /**
     * Validation
     *
     * Validate that the name & title aren't empty
     * use class-validator
     */

    let errors: any = {};

    if (isEmpty(name)) errors.name = "Name must not be empty";
    if (isEmpty(title)) errors.title = "Title must not be empty";

    /**
     * Even if the name & title aren't empty,
     * need to check if there is already a sub in the db with that name
     *
     *  - sub can be uppercase or lowercase
     *  - bring both to lowercase & compare them
     */

    const sub = await getRepository(Sub)
      .createQueryBuilder("sub")
      .where("lower(sub.name) = :name", { name: name.toLowerCase() })
      .getOne();

    /**
     * If sub exists then throw an Error
     * @throw `errors.name` 'Sub already exists'
     *
     * Able to use errors.name since error would have been thrown if name was empty
     */
    if (sub) errors.name = "Sub already exists";

    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  } catch (err) {
    return res.status(401).json(err);
  }

  /**
   * Second try catch block
   *  - Everything should be valid if at this point
   *
   * Creating sub
   */
  try {
    const sub = new Sub({ name, description, title, user });
    await sub.save();

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const router = Router();

router.post("/", auth, createSub);

export default router;