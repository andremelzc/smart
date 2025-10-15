import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

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

  @PrimaryGeneratedColumn({ type: "number", name: "BOOKING_ID" })
  bookingId: number;

  @Column("date", { name: "ACCEPTED_AT", nullable: true })
  acceptedAt: Date | null;

  @ManyToOne("Properties", (properties: any) => properties.bookings)
  @JoinColumn([{ name: "PROPERTY_ID", referencedColumnName: "propertyId" }])
  property: any;

  @ManyToOne("Tenants", (tenants: any) => tenants.bookings)
  @JoinColumn([{ name: "TENANT_ID", referencedColumnName: "tenantId" }])
  tenant: any;

  @ManyToOne("Currencies", (currencies: any) => currencies.bookings)
  @JoinColumn([{ name: "CURRENCY_CODE", referencedColumnName: "currencyCode" }])
  currencyCode: any;

  @OneToMany("Conversations", (conversations: any) => conversations.booking)
  conversations: any[];

  @OneToMany("Payments", (payments: any) => payments.booking)
  payments: any[];

  @OneToMany("Reviews", (reviews: any) => reviews.booking)
  reviews: any[];
}
