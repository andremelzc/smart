import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("SYS_C008483", ["reviewId"], { unique: true })
@Entity("REVIEWS")
export class Reviews {
  @Column("clob", { name: "comment", nullable: true })
  comment: string | null;

  @PrimaryGeneratedColumn({ type: "number", name: "REVIEW_ID" })
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

  @ManyToOne("Bookings", (bookings: any) => bookings.reviews)
  @JoinColumn([{ name: "BOOKING_ID", referencedColumnName: "bookingId" }])
  booking: any;

  @ManyToOne("Properties", (properties: any) => properties.reviews)
  @JoinColumn([{ name: "PROPERTY_ID", referencedColumnName: "propertyId" }])
  property: any;

  @ManyToOne("Users", (users: any) => users.reviews)
  @JoinColumn([{ name: "AUTHOR_USER_ID", referencedColumnName: "userId" }])
  authorUser: any;

  @ManyToOne("Users", (users: any) => users.reviews2)
  @JoinColumn([{ name: "TARGET_USER_ID", referencedColumnName: "userId" }])
  targetUser: any;
}
