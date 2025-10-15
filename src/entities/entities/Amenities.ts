import {
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Properties } from "./Properties";

@Index("SYS_C008428", ["amenityId"], { unique: true })
@Index("SYS_C008429", ["code"], { unique: true })
@Entity("AMENITIES")
export class Amenities {
  @Column("varchar2", { name: "NAME", length: 100 })
  name: string;

  @Column("number", {
    name: "DISPLAY_ORDER",
    nullable: true,
    scale: 0,
    default: () => "0",
  })
  displayOrder: number | null;

  @Column("clob", { name: "DESCRIPTION", nullable: true })
  description: string | null;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @Column("varchar2", { name: "CODE", unique: true, length: 50 })
  code: string;

  @PrimaryGeneratedColumn({ type: "number", name: "AMENITY_ID", scale: 0 })
  amenityId: number;

  @ManyToMany(() => Properties, (properties) => properties.amenities)
  properties: Properties[];
}
