/**
 * Collection of routes that aren't specific to main routes
 */
import { Request, Response, Router } from "express";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import User from "../entities/User";
import Vote from "../entities/Vote";

import auth from "../middleware/auth";
import user from "../middleware/user";

const vote = async (req: Request, res: Response) => {
  /**
   * Destructure the identifier, slug, comment identifier, & value (value of post)
   *
   * identifier & slug for the post
   *  - comment identifier in the body? -> use it to put a vote on a comment
   *
   * Detect whether adding a comment vote or a post vote
   */

  const { identifier, slug, commentIdentifier, value } = req.body;

  /**
   * Validate vote value
   *
   * Either [-1, 0, 1]
   */
  if (![-1, 0, 1].includes(value)) {
    return res.status(400).json({ value: "Value must be -1, 0, or 1" });
  }

  /**
   * If value from the request is valid
   *
   * Extract user from auth middleware
   *
   * If not able to retrieve post with identifier or slug,
   * @return status code `500` -> shouldn't fail through UI
   */

  try {
    const user: User = res.locals.user;
    let post = await Post.findOneOrFail({ identifier, slug });
    let vote: Vote | undefined;
    let comment: Comment | undefined;

    if (commentIdentifier) {
      /** If there is a comment identifier find vote by comment */
      comment = await Comment.findOneOrFail({ identifier: commentIdentifier });
      vote = await Vote.findOne({ user, comment });
    } else {
      /** Otherwise try to find the vote by the user on this post */
      vote = await Vote.findOne({ user, post });
    }

    if (!vote && value === 0) {
      /** If no vote & value = 0 return error - no vote to reset */
      return res.status(404).json({ error: "Vote not found" });
    } else if (!vote) {
      /**
       * Means value has to be either -1 or 1
       *
       * Need to create a new vote with the given value
       *
       */

      vote = new Vote({ user, value });
      if (comment) vote.comment = comment;
      else vote.post = post;
      await vote.save();
    } else if (value === 0) {
      /** If vote exists & value = 0 -> remove vote from db */
      await vote.remove();
    } else if (vote.value != value) {
      /** If vote & value has changed -> update vote */

      vote.value = value;
      await vote.save();
    }

    /**
     * Refetch the post, comments, & votes -> send it back to the user
     * Use `findOneOrFail()` since it either returns a Post or undefined
     */

    post = await Post.findOneOrFail(
      { identifier, slug },
      { relations: ["comments", "comments.votes", "sub", "votes"] }
    );

    post.setUserVote(user);
    post.comments.forEach((c) => c.setUserVote(user));

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const router = Router();
router.post("/vote/", user, auth, vote);

export default router;
