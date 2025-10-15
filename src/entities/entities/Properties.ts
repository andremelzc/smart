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
import { Availabilities } from "./Availabilities";
import { Bookings } from "./Bookings";
import { Conversations } from "./Conversations";
import { Hosts } from "./Hosts";
import { Currencies } from "./Currencies";
import { Amenities } from "./Amenities";
import { PropertyDetails } from "./PropertyDetails";
import { PropertyImages } from "./PropertyImages";
import { Reviews } from "./Reviews";

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

  @PrimaryGeneratedColumn({ type: "number", name: "PROPERTY_ID", scale: 0 })
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

  @OneToMany(() => Availabilities, (availabilities) => availabilities.property)
  availabilities: Availabilities[];

  @OneToMany(() => Bookings, (bookings) => bookings.property)
  bookings: Bookings[];

  @OneToMany(() => Conversations, (conversations) => conversations.property)
  conversations: Conversations[];

  @ManyToOne(() => Hosts, (hosts) => hosts.properties)
  @JoinColumn([{ name: "HOST_ID", referencedColumnName: "hostId" }])
  host: Hosts;

  @ManyToOne(() => Currencies, (currencies) => currencies.properties)
  @JoinColumn([{ name: "CURRENCY_CODE", referencedColumnName: "currencyCode" }])
  currencyCode: Currencies;

  @ManyToMany(() => Amenities, (amenities) => amenities.properties)
  @JoinTable({
    name: "PROPERTY_AMENITIES",
    joinColumns: [{ name: "PROPERTY_ID", referencedColumnName: "propertyId" }],
    inverseJoinColumns: [
      { name: "AMENITY_ID", referencedColumnName: "amenityId" },
    ],
  })
  amenities: Amenities[];

  @OneToOne(
    () => PropertyDetails,
    (propertyDetails) => propertyDetails.property
  )
  propertyDetails: PropertyDetails;

  @OneToMany(() => PropertyImages, (propertyImages) => propertyImages.property)
  propertyImages: PropertyImages[];

  @OneToMany(() => Reviews, (reviews) => reviews.property)
  reviews: Reviews[];
}
