import { NextFunction, Request, Response, Router } from "express";
import { isEmpty } from "class-validator";
import { getRepository } from "typeorm";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

import User from "../entities/User";
import Sub from "../entities/Sub";
import auth from "../middleware/auth";
import user from "../middleware/user";
import Post from "../entities/Post";
import { makeId } from "../util/helpers";

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

/**
 * Gets one sub
 *
 * findOneOrFail({ })
 * find the posts where the sub is equal to the sub, get comments and votes
 *  - sets the subs' posts to the ones returned
 *
 * @throws 500 error
 */
const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const sub = await Sub.findOneOrFail({ name });
    const posts = await Post.find({
      where: { sub },
      order: { createdAt: "DESC" },
      relations: ["comments", "votes"],
    });

    sub.posts = posts;

    /**
     * If there is a user, set the user's vote on each post
     */
    if (res.locals.user) {
      sub.posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ error: "Sub not found" });
  }
};

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });

    if (sub.username !== user.username) {
      return res.status(403).json({ error: "User does not own sub" });
    }

    /** If user owns the sub the proceed */
    res.locals.sub = sub;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: "public/images",
    filename: (_, file, callback) => {
      const name = makeId(15);
      callback(null, name + path.extname(file.originalname)); // e.g. xcv923nlsiqg23kf + .png
    },
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    /**
     * Check if file is an image
     */
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
      callback(null, true);
    } else {
      callback(new Error("File not supported"));
    }
  },
});

const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;
  try {
    const type = req.body.type;

    if (type !== "image" && type !== "banner") {
      fs.unlinkSync(req.file?.path ?? "");
      return res.status(400).json({ error: "Invalid type" });
    }

    /**
     * 
     * Update record

     * Check if it's the image or banner
     */

    let oldImageUrn: string = "";

    if (type === "image") {
      oldImageUrn = sub.imageUrn ?? "";
      sub.imageUrn = req.file?.filename ?? "";
    } else if (type === "banner") {
      oldImageUrn = sub.bannerUrn ?? "";
      sub.bannerUrn = req.file?.filename ?? "";
    }
    await sub.save();

    if (oldImageUrn !== "") {
      fs.unlinkSync(`public\\images\\${oldImageUrn}`);
    }

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const router = Router();

router.post("/", user, auth, createSub);
router.get("/:name", user, getSub);
router.post(
  "/:name/image",
  user,
  auth,
  ownSub,
  upload.single("file"),
  uploadSubImage
);

export default router;
