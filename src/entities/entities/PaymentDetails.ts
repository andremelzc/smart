import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Payments } from "./Payments";
import { Currencies } from "./Currencies";

@Index("SYS_C008474", ["detailId"], { unique: true })
@Entity("PAYMENT_DETAILS")
export class PaymentDetails {
  @Column("number", { name: "TOTAL_GROSS", precision: 12, scale: 2 })
  totalGross: number;

  @Column("number", { name: "TAX_IGV", precision: 12, scale: 2 })
  taxIgv: number;

  @Column("number", { name: "PLATFORM_FEE", precision: 12, scale: 2 })
  platformFee: number;

  @Column("number", { name: "HOST_PAYOUT", precision: 12, scale: 2 })
  hostPayout: number;

  @PrimaryGeneratedColumn({ type: "number", name: "DETAIL_ID", scale: 0 })
  detailId: number;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @ManyToOne(() => Payments, (payments) => payments.paymentDetails)
  @JoinColumn([{ name: "PAYMENT_ID", referencedColumnName: "paymentId" }])
  payment: Payments;

  @ManyToOne(() => Currencies, (currencies) => currencies.paymentDetails)
  @JoinColumn([{ name: "CURRENCY_CODE", referencedColumnName: "currencyCode" }])
  currencyCode: Currencies;
}
