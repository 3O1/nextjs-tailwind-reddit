import {
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { classToPlain, Exclude } from "class-transformer";

export default abstract class Entity extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // classToPlain() does the transformation of the model -> goes through and looks what fields have the @Exclude() directives & hides them
  toJSON() {
    return classToPlain(this);
  }
}
