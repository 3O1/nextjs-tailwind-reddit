import { Expose } from "class-transformer";
import {
  Entity as TOEntity,
  Column,
  Index,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  OneToMany,
  AfterLoad,
} from "typeorm";
import { makeId, sluggify } from "../util/helpers";
import Comment from "./Comment";

import Entity from "./Entity";
import Sub from "./Sub";
import User from "./User";
import Vote from "./Vote";

/**
 * Declared as `ToEntity` due to the naming conflict of the Entity abstract class created
 */
@TOEntity("posts")
export default class Post extends Entity {
  constructor(post: Partial<Post>) {
    super();
    Object.assign(this, post);
  }

  /**
   * @Index() on fields that will be queried for improved performance.
   */

  @Index()
  @Column()
  identifier: string; // 7 character id

  @Column()
  title: string;

  @Index()
  @Column()
  slug: string;

  /**
   * @param nullable true
   * @param type `text`
   *  SQL's long text
   */
  @Column({ nullable: true, type: "text" })
  body: string;

  @Column()
  subName: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @Column()
  username: string;

  /**
   * References {name} on the sub table
   */
  @ManyToOne(() => Sub, (sub) => sub.posts)
  @JoinColumn({ name: "subName", referencedColumnName: "name" })
  sub: Sub;

  /**
   * Have to setup inverseSide for OneToMany
   * It's not this table that holds the foreign key
   */
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Vote, (vote) => vote.post)
  votes: Vote[];

  /**
   * getter that returns a string - using class-transformer
   * evquivalent to the virual @AfterLoad()
   */
  @Expose() get url(): string {
    return `/r/${this.subName}/${this.identifier}/${this.slug}`;
  }

  /**
   * Used to generate the URL for each post

   * virtual fields
   *  - can't be edited outside the instance
   * 
   */
  // protected url: string;
  // @AfterLoad()
  // createFields() {
  //   this.url = `/r/${this.subName}/${this.identifier}/${this.slug}`;
  // }

  /**
   * Function that generates the identifier and slug before the model is inserted into the db.
   *
   * Sets the model's identifier to the returned string from makeId
   *  - Length of 7
   *
   * `sluggify()` turns the title into a url friendly slug
   */

  @BeforeInsert()
  makeIdAndSlug() {
    this.identifier = makeId(7);
    this.slug = sluggify(this.title);
  }
}
