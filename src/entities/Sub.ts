import {
  Entity as TOEntity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

import Entity from "./Entity";
import Post from "./Post";
import User from "./User";

/**
 * Declared as `ToEntity` due to the naming conflict of the Entity abstract class created
 */
@TOEntity("subs")
export default class Sub extends Entity {
  constructor(sub: Partial<Sub>) {
    super();
    Object.assign(this, sub);
  }

  @Index()
  @Column({
    unique: true,
  })
  name: string;

  @Column()
  title: string;

  @Column({
    type: "text",
    nullable: true,
  })
  description: string;

  /**
   * Store name of file
   *  - URL will be generated at runtime on the fly
   *  - domain can change or where files are stored
   *
   * URL is always generated dynamically
   *
   * URN: Unique Resource Name
   */
  @Column({ nullable: true })
  imageUrn: string;

  @Column({ nullable: true })
  bannerUrn: string;

  @Column()
  username: string;

  /**
   * Sub belongs to a User that created it
   *
   * don't need to fetch user's subs - no need for inverse of this relationship
   *
   * @returns {User} type of User
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  /**
   * One to many relationship for posts
   */
  @OneToMany(() => Post, (post) => post.sub)
  posts: Post[];
}
