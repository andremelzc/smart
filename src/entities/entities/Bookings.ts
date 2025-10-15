import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Properties } from "./Properties";
import { Tenants } from "./Tenants";
import { Currencies } from "./Currencies";
import { Conversations } from "./Conversations";
import { Payments } from "./Payments";
import { Reviews } from "./Reviews";

@Index("SYS_C008449", ["bookingId"], { unique: true })
@Entity("BOOKINGS")
export class Bookings {
  @Column("number", { name: "TOTAL_AMOUNT", precision: 12, scale: 2 })
  totalAmount: number;

  @Column("clob", { name: "TENANT_NOTE", nullable: true })
  tenantNote: string | null;

  @Column("number", {
    name: "TAXES",
    nullable: true,
    precision: 12,
    scale: 2,
    default: () => "0",
  })
  taxes: number | null;

  @Column("varchar2", {
    name: "STATUS",
    length: 20,
    default: () => "'pending'",
  })
  status: string;

  @Column("number", {
    name: "SERVICE_FEE",
    nullable: true,
    precision: 12,
    scale: 2,
    default: () => "0",
  })
  serviceFee: number | null;

  @Column("number", { name: "PRICE_NIGHTS", precision: 12, scale: 2 })
  priceNights: number;

  @Column("number", { name: "NIGHT_COUNT", scale: 0 })
  nightCount: number;

  @Column("clob", { name: "HOST_NOTE", nullable: true })
  hostNote: string | null;

  @Column("number", { name: "GUEST_COUNT", scale: 0 })
  guestCount: number;

  @Column("date", { name: "DECLINED_AT", nullable: true })
  declinedAt: Date | null;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @Column("date", { name: "COMPLETED_AT", nullable: true })
  completedAt: Date | null;

  @Column("number", {
    name: "CLEANING_FEE",
    nullable: true,
    precision: 12,
    scale: 2,
    default: () => "0",
  })
  cleaningFee: number | null;

  @Column("date", { name: "CHECKOUT_DATE" })
  checkoutDate: Date;

  @Column("date", { name: "CHECKIN_DATE" })
  checkinDate: Date;

  @Column("varchar2", { name: "CHECKIN_CODE", nullable: true, length: 50 })
  checkinCode: string | null;

  @PrimaryGeneratedColumn({ type: "number", name: "BOOKING_ID", scale: 0 })
  bookingId: number;

  @Column("date", { name: "ACCEPTED_AT", nullable: true })
  acceptedAt: Date | null;

  @ManyToOne(() => Properties, (properties) => properties.bookings)
  @JoinColumn([{ name: "PROPERTY_ID", referencedColumnName: "propertyId" }])
  property: Properties;

  @ManyToOne(() => Tenants, (tenants) => tenants.bookings)
  @JoinColumn([{ name: "TENANT_ID", referencedColumnName: "tenantId" }])
  tenant: Tenants;

  @ManyToOne(() => Currencies, (currencies) => currencies.bookings)
  @JoinColumn([{ name: "CURRENCY_CODE", referencedColumnName: "currencyCode" }])
  currencyCode: Currencies;

  @OneToMany(() => Conversations, (conversations) => conversations.booking)
  conversations: Conversations[];

  @OneToMany(() => Payments, (payments) => payments.booking)
  payments: Payments[];

  @OneToMany(() => Reviews, (reviews) => reviews.booking)
  reviews: Reviews[];
}
