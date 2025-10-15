import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Properties } from "./Properties";

@Index("SYS_C008437", ["availabilityId"], { unique: true })
@Entity("AVAILABILITIES")
export class Availabilities {
  @Column("date", { name: "START_DATE" })
  startDate: Date;

  @Column("number", {
    name: "PRICE_PER_NIGHT",
    nullable: true,
    precision: 12,
    scale: 2,
  })
  pricePerNight: number | null;

  @Column("varchar2", { name: "KIND", nullable: true, length: 30 })
  kind: string | null;

  @Column("date", { name: "END_DATE" })
  endDate: Date;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @PrimaryGeneratedColumn({ type: "number", name: "AVAILABILITY_ID", scale: 0 })
  availabilityId: number;

  @ManyToOne(() => Properties, (properties) => properties.availabilities)
  @JoinColumn([{ name: "PROPERTY_ID", referencedColumnName: "propertyId" }])
  property: Properties;
}
