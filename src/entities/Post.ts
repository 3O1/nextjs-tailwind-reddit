import {
  Entity as TOEntity,
  Column,
  Index,
  BeforeInsert,
  In,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { makeId, sluggify } from "../util/helpers";

import Entity from "./Entity";
import Sub from "./Sub";
import User from "./User";

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

  /**
   * References {name} on the sub table
   */
  @ManyToOne(() => Sub, (sub) => sub.posts)
  @JoinColumn({ name: "subName", referencedColumnName: "name" })
  sub: Sub;

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
