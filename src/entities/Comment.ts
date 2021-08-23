import {
  BeforeInsert,
  Column,
  Entity as TOEntity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

import Entity from "./Entity";
import Post from "./Post";
import User from "./User";
import Vote from "./Vote";

import { makeId } from "../util/helpers";
import { Exclude, Expose } from "class-transformer";

@TOEntity("comments")
export default class Comment extends Entity {
  constructor(comment: Partial<Comment>) {
    super();
    Object.assign(this, comment);
  }

  // Add @Index for identifier
  @Index()
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
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  /**
   * ManyToOne relationship for the post
   *
   * Joins on the primary column (id) -> omit the @JoinColumn
   *  - will produce a post id field
   *
   * @param {nullable: false} don't want post id to be nullable
   */
  @ManyToOne(() => Post, (post) => post.comments, {
    nullable: false,
  })
  post: Post;

  @Exclude()
  @OneToMany(() => Vote, (vote) => vote.comment)
  votes: Vote[];

  @Expose() get voteScore(): number {
    return this.votes?.reduce((prev, curr) => prev + (curr.value || 0), 0);
  }

  protected userVote: number;
  setUserVote(user: User) {
    /**
     * Check votes whether user has upvoted the comment or not
     */

    const index = this.votes?.findIndex((v) => v.username === user.username);
    this.userVote = index > -1 ? this.votes[index].value : 0;
  }

  @BeforeInsert()
  makeIdAndSlug() {
    this.identifier = makeId(8);
  }
}
