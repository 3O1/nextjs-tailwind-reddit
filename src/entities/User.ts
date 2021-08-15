import { IsEmail, Length } from "class-validator";
import {
  Entity as TOEntity,
  Column,
  Index,
  BeforeInsert,
  OneToMany,
} from "typeorm";
import bcrypt from "bcrypt";
import { Exclude } from "class-transformer";

import Entity from "./Entity";
import Post from "./Post";

/**
 * Declared as `ToEntity` due to the naming conflict of the Entity abstract class created
 */
@TOEntity("users")
export default class User extends Entity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Index()
  @IsEmail(undefined, { message: "Must be a valid email address" })
  @Length(1, 25, { message: "Email is empty" })
  @Column({
    unique: true,
  })
  email: string;

  @Index()
  @Length(3, 16, { message: "Must be at least 3 characters long!" })
  @Column({
    unique: true,
  })
  username: string;

  // excludes from response?
  @Exclude()
  @Column()
  // 255 - varchar max
  @Length(6, 255, { message: "Must be at least 6 characters long!" })
  password: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  // hook directive to perform someting before inserted into db
  // hashing password with 6 rounds
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
