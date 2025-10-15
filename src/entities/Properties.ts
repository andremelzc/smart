import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("SYS_C008418", ["propertyId"], { unique: true })
@Entity("PROPERTIES")
export class Properties {
  @Column("varchar2", { name: "TITLE", length: 150 })
  title: string;

  @Column("varchar2", { name: "STATUS", nullable: true, length: 20 })
  status: string | null;

  @Column("varchar2", { name: "STATE_REGION", length: 255 })
  stateRegion: string;

  @Column("varchar2", { name: "PROPERTY_TYPE", length: 30 })
  propertyType: string;

  @PrimaryGeneratedColumn({ type: "number", name: "PROPERTY_ID" })
  propertyId: number;

  @Column("varchar2", { name: "POSTAL_CODE", length: 255 })
  postalCode: string;

  @Column("number", { name: "LONGITUDE", precision: 9, scale: 6 })
  longitude: number;

  @Column("number", { name: "LATITUDE", precision: 9, scale: 6 })
  latitude: number;

  @Column("varchar2", { name: "FORMATTED_ADDRESS", length: 255 })
  formattedAddress: string;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @Column("varchar2", { name: "COUNTRY", length: 255 })
  country: string;

  @Column("varchar2", { name: "CITY", length: 255 })
  city: string;

  @Column("number", { name: "BASE_PRICE_NIGHT", precision: 12, scale: 2 })
  basePriceNight: number;

  @Column("varchar2", { name: "ADDRESS_TEXT", length: 255 })
  addressText: string;

  @OneToMany("Availabilities", (availabilities: any) => availabilities.property)
  availabilities: any[];

  @OneToMany("Bookings", (bookings: any) => bookings.property)
  bookings: any[];

  @OneToMany("Conversations", (conversations: any) => conversations.property)
  conversations: any[];

  @ManyToOne("Hosts", (hosts: any) => hosts.properties)
  @JoinColumn([{ name: "HOST_ID", referencedColumnName: "hostId" }])
  host: any;

  @ManyToOne("Currencies", (currencies: any) => currencies.properties)
  @JoinColumn([{ name: "CURRENCY_CODE", referencedColumnName: "currencyCode" }])
  currencyCode: any;

  @ManyToMany("Amenities", (amenities: any) => amenities.properties)
  @JoinTable({
    name: "PROPERTY_AMENITIES",
    joinColumns: [{ name: "PROPERTY_ID", referencedColumnName: "propertyId" }],
    inverseJoinColumns: [
      { name: "AMENITY_ID", referencedColumnName: "amenityId" },
    ],
  })
  amenities: any[];

  @OneToOne(
    "PropertyDetails",
    (propertyDetails: any) => propertyDetails.property
  )
  propertyDetails: any;

  @OneToMany("PropertyImages", (propertyImages: any) => propertyImages.property)
  propertyImages: any[];

  @OneToMany("Reviews", (reviews: any) => reviews.property)
  reviews: any[];
}
