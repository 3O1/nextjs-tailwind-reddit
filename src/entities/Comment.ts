import {
  BeforeInsert,
  Column,
  Entity as TOEntity,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { makeId } from "../util/helpers";
import Entity from "./Entity";

import Post from "./Post";
import User from "./User";

@TOEntity("comments")
export default class Comment extends Entity {
  constructor(comment: Partial<Comment>) {
    super();
    Object.assign(this, comment);
  }

  @Column()
  identifier: string;

  @Column()
  body: string;

  @Column()
  username: string;

  /**
   * Relation to the user
   *
   * Don't need to return `user.comments`
   *  - not going to have a request where we get the comments from a user
   */

  @ManyToOne(() => User)
  @JoinColumn({ name: "usename", referencedColumnName: "username" })
  user: User;

  /**
   * ManyToOne relationship for the post
   *
   * Joins on the primary column (id) -> omit the @JoinColumn
   *  - will produce a post id field
   */
  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @BeforeInsert()
  makeIdAndSlug() {
    this.identifier = makeId(8);
  }
}
