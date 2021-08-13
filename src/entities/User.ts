import { IsEmail, Length } from "class-validator";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }
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

  @Index()
  // 255 - varchar max
  @Length(6, 255)
  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
