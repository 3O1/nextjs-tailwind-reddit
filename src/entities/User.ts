import { IsEmail, Max, Min } from "class-validator";
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
  @Min(3, { message: "Usernames must be at least 3 characters long!" })
  @Max(16)
  @Column({
    unique: true,
  })
  username: string;

  @Index()
  @Min(6)
  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
