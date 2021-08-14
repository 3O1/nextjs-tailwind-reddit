import { Router, Request, Response } from "express";
import Post from "../entities/Post";
import Sub from "../entities/Sub";

import auth from "../middleware/auth";

const createPost = async (req: Request, res: Response) => {
  /**
   * Extracing the title, body, sub from the requests body
   */
  const { title, body, sub } = req.body;

  /**
   * Use the middleware to obtain the user, then attach the post to the user
   *
   * If we get here, authentication passed & we have a user,
   * otherwise an error will be thrown in the middleware.
   */

  const user = res.locals.user;

  /**
   * Simple validation
   *
   * Don't need to validate the body, can be nullable
   */

  if (title.trim() === "") {
    return res.status(400).json({ title: "Title cannot be empty" });
  }

  try {
    /**
     * Find corresponding sub
     *
     * will throw error on its own if there isn't a corresponding sub
     * UI will be set to make sure this doesn't happen
     */
    const subRecord = await Sub.findOneOrFail({ name: sub });

    /**
     * Create post inside the try catch block
     *
     * IF you pass in a user, typeorm will look at the model,
     * & see which fields that need to persist & add it to the table
     *  - will know which fields to take from the object & store it
     *
     * @param subName sub extracted from the request's body
     *
     * after creating the post object, save to the database & return it
     */
    const post = new Post({ title, body, user, sub: subRecord });
    await post.save();

    return res.json(post);
  } catch (err) {
    /**
     * Returning status code 500, validation has already been done
     */
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

/**
 * Gets all the posts, uses the find() method and returns them,
 * since there are no conditions
 * 
 * @param _ `Request` (Omitted)
 * @param res `Response`
 * 
 * Doesn't need auth middleware since it's public
 *  - anyone can view the posts
] */
const getPosts = async (_: Request, res: Response) => {
  try {
    const posts = await Post.find();

    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.json({ err: "Something went wrong" });
  }
};

const router = Router();

router.post("/", auth, createPost);
router.get("/", getPosts);

export default router;
