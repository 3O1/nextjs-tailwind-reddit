import { IsEmail, Length } from "class-validator";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from "typeorm";
import bcrypt from "bcrypt";
import { classToPlain, Exclude } from "class-transformer";

@Entity("users")
export class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // hook directive to perform someting before inserted into db
  // hashing password with 6 rounds
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }

  // classToPlain() does the transformation of the model -> goes through and looks what fields have the @Exclude() directives & hides them
  toJSON() {
    return classToPlain(this);
  }
}
