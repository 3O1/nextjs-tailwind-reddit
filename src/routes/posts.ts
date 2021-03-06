import { Router, Request, Response } from "express";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import Sub from "../entities/Sub";

import auth from "../middleware/auth";
import user from "../middleware/user";

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
    /**
     * @param {order: {} }
     *  - define how the posts should be queried
     * @param {relations: ['table']}
     *  - adds the corresponding relation to the response
     *
     * Removing sub since there is already `subName` on the Post object
     *
     */
    const posts = await Post.find({
      order: { createdAt: "DESC" },
      relations: ["comments", "votes", "sub"],
    });

    if (res.locals.user) {
      posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};

/**
 * Gets one post from the database
 * 
 * Send the slug & the identifier as part of the url
 *  - based on those find the post & return it
] */
const getPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  try {
    /**
     * Finds one post or fails with the given identifier & slug
     *
     * @throws if there is no post, error is thrown
     *
     * Add another object to add relations
     */
    const post = await Post.findOneOrFail(
      { identifier, slug },
      {
        relations: ["sub", "votes", "comments"],
      }
    );

    if (res.locals.user) {
      post.setUserVote(res.locals.user);
    }

    return res.json(post);
  } catch (err) {
    console.log(err);
    /**
     * return STATUS 404 since no post was found with the given identifier or slug
     */
    return res.status(404).json({ err: "Post not found" });
  }
};
/**
 * Send details on what post to comment on
 * @param {req} content of the comment we want to send
 */
const commentOnPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;

  const body = req.body.body;

  try {
    /**
     * Fetch post first
     * @throws if no post is found
     */
    const post = await Post.findOneOrFail({ identifier, slug });

    /**
     * Create new comment object
     * @param body: comment body from req
     * @param user: current user from auth middleware
     * @param post: post which the comment is commenting on
     */
    const comment = new Comment({
      body,
      user: res.locals.user,
      post,
    });

    await comment.save();
    return res.json(comment);
  } catch (err) {
    /**
     * Most likely will only get post not found error
     */
    console.log(err);
    return res.status(404).json({ error: "Post not found" });
  }
};

/**
 * fetch comments
 *
 * set the user vote on the commments
 */
const getPostComments = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  try {
    const post = await Post.findOneOrFail({ identifier, slug });

    const comments = await Comment.find({
      where: { post },
      order: { createdAt: "DESC" },
      relations: ["votes"],
    });

    if (res.locals.user) {
      comments.forEach((c) => c.setUserVote(res.locals.user));
    }

    return res.json(comments);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const router = Router();

router.post("/", user, auth, createPost);
router.get("/", user, getPosts);
router.get("/:identifier/:slug", user, getPost);
router.post("/:identifier/:slug/comments", user, auth, commentOnPost);
router.get("/:identifier/:slug/comments", user, getPostComments);

export default router;
