import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("SYS_C008466", ["paymentId"], { unique: true })
@Entity("PAYMENTS")
export class Payments {
  @Column("varchar2", {
    name: "STATUS",
    length: 20,
    default: () => "'pending'",
  })
  status: string;

  @Column("date", { name: "PROCESSED_AT", nullable: true })
  processedAt: Date | null;

  @PrimaryGeneratedColumn({ type: "number", name: "PAYMENT_ID" })
  paymentId: number;

  @Column("varchar2", { name: "MESSAGE", nullable: true, length: 255 })
  message: string | null;

  @Column("varchar2", { name: "EXTERNAL_ID", nullable: true, length: 150 })
  externalId: string | null;

  @Column("varchar2", {
    name: "DIRECTION",
    length: 10,
    default: () => "'charge'",
  })
  direction: string;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @Column("number", { name: "AMOUNT", precision: 12, scale: 2 })
  amount: number;

  @OneToMany("PaymentDetails", (paymentDetails: any) => paymentDetails.payment)
  paymentDetails: any[];

  @ManyToOne("Bookings", (bookings: any) => bookings.payments)
  @JoinColumn([{ name: "BOOKING_ID", referencedColumnName: "bookingId" }])
  booking: any;

  @ManyToOne(
    "UserPaymentMethods",
    (userPaymentMethods: any) => userPaymentMethods.payments
  )
  @JoinColumn([
    { name: "PAYMENT_METHOD_ID", referencedColumnName: "paymentMethodId" },
  ])
  paymentMethod: any;

  @ManyToOne("Currencies", (currencies: any) => currencies.payments)
  @JoinColumn([{ name: "CURRENCY_CODE", referencedColumnName: "currencyCode" }])
  currencyCode: any;
}
