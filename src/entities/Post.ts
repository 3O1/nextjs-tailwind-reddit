import {
  Entity as TOEntity,
  Column,
  Index,
  BeforeInsert,
  In,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import Entity from "./Entity";
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
}
