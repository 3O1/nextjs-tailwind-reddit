import { IsEmail, Length } from "class-validator";
import { Entity as TOEntity, Column, Index, BeforeInsert } from "typeorm";
import bcrypt from "bcrypt";
import { Exclude } from "class-transformer";

import Entity from "./Entity";

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
  @IsEmail()
  @Column({
    unique: true,
  })
  email: string;

  @Index()
  @Length(3, 16, { message: "Usernames must be at least 3 characters long!" })
  @Column({
    unique: true,
  })
  username: string;

  // excludes from response?
  @Exclude()
  @Index()
  // 255 - varchar max
  @Length(6, 255)
  @Column()
  password: string;

  // hook directive to perform someting before inserted into db
  // hashing password with 6 rounds
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
