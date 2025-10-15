import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("SYS_C008424", ["imageId"], { unique: true })
@Entity("PROPERTY_IMAGES")
export class PropertyImages {
  @Column("varchar2", { name: "URL", length: 500 })
  url: string;

  @Column("number", { name: "SORT_ORDER", scale: 0, default: () => "0" })
  sortOrder: number;

  @PrimaryGeneratedColumn({ type: "number", name: "IMAGE_ID" })
  imageId: number;

  @Column("varchar2", { name: "CAPTION", nullable: true, length: 150 })
  caption: string | null;

  @ManyToOne("Properties", (properties: any) => properties.propertyImages)
  @JoinColumn([{ name: "PROPERTY_ID", referencedColumnName: "propertyId" }])
  property: any;
}
