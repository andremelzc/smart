import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { Properties } from "./Properties";

@Index("SYS_C008419", ["propertyId"], { unique: true })
@Entity("PROPERTY_DETAILS")
export class PropertyDetails {
  @Column("date", { name: "UPDATED_AT", nullable: true })
  updatedAt: Date | null;

  @Column("number", { primary: true, name: "PROPERTY_ID", scale: 0 })
  propertyId: number;

  @Column("clob", { name: "HOUSE_RULES", nullable: true })
  houseRules: string | null;

  @Column("number", { name: "FLOOR_NUMBER", nullable: true, scale: 0 })
  floorNumber: number | null;

  @Column("clob", { name: "DESCRIPTION_LONG", nullable: true })
  descriptionLong: string | null;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @Column("varchar2", { name: "CHECKOUT_TIME", nullable: true, length: 5 })
  checkoutTime: string | null;

  @Column("varchar2", { name: "CHECKIN_TIME", nullable: true, length: 5 })
  checkinTime: string | null;

  @Column("number", { name: "CAPACITY", nullable: true, scale: 0 })
  capacity: number | null;

  @Column("number", { name: "BEDS", nullable: true, scale: 0 })
  beds: number | null;

  @Column("number", { name: "BEDROOMS", nullable: true, scale: 0 })
  bedrooms: number | null;

  @Column("number", { name: "BATHROOMS", nullable: true, scale: 0 })
  bathrooms: number | null;

  @Column("number", { name: "AREA_M2", nullable: true, scale: 0 })
  areaM2: number | null;

  @OneToOne(() => Properties, (properties) => properties.propertyDetails)
  @JoinColumn([{ name: "PROPERTY_ID", referencedColumnName: "propertyId" }])
  property: Properties;
}
