import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Bookings } from "./Bookings";
import { Properties } from "./Properties";
import { Users } from "./Users";

@Index("SYS_C008483", ["reviewId"], { unique: true })
@Entity("REVIEWS")
export class Reviews {
  @Column("clob", { name: "comment", nullable: true })
  comment: string | null;

  @PrimaryGeneratedColumn({ type: "number", name: "REVIEW_ID", scale: 0 })
  reviewId: number;

  @Column("number", { name: "RATING", scale: 0 })
  rating: number;

  @Column("date", { name: "PUBLISHED_AT", nullable: true })
  publishedAt: Date | null;

  @Column("date", { name: "PUBLISHABLE_AT", nullable: true })
  publishableAt: Date | null;

  @Column("number", {
    name: "IS_PUBLISHED",
    precision: 1,
    scale: 0,
    default: () => "0",
  })
  isPublished: number;

  @Column("number", {
    name: "FOR_HOST",
    precision: 1,
    scale: 0,
    default: () => "0",
  })
  forHost: number;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @ManyToOne(() => Bookings, (bookings) => bookings.reviews)
  @JoinColumn([{ name: "BOOKING_ID", referencedColumnName: "bookingId" }])
  booking: Bookings;

  @ManyToOne(() => Properties, (properties) => properties.reviews)
  @JoinColumn([{ name: "PROPERTY_ID", referencedColumnName: "propertyId" }])
  property: Properties;

  @ManyToOne(() => Users, (users) => users.reviews)
  @JoinColumn([{ name: "AUTHOR_USER_ID", referencedColumnName: "userId" }])
  authorUser: Users;

  @ManyToOne(() => Users, (users) => users.reviews2)
  @JoinColumn([{ name: "TARGET_USER_ID", referencedColumnName: "userId" }])
  targetUser: Users;
}
