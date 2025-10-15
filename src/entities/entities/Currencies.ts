import { Column, Entity, Index, OneToMany } from "typeorm";
import { Bookings } from "./Bookings";
import { FxRateQuotes } from "./FxRateQuotes";
import { PaymentDetails } from "./PaymentDetails";
import { Payments } from "./Payments";
import { Properties } from "./Properties";

@Index("SYS_C008497", ["currencyCode"], { unique: true })
@Entity("CURRENCIES")
export class Currencies {
  @Column("varchar2", { name: "NAME", length: 50 })
  name: string;

  @Column("number", { name: "EXPONENT", scale: 0, default: () => "2" })
  exponent: number;

  @Column("char", { primary: true, name: "CURRENCY_CODE", length: 3 })
  currencyCode: string;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @OneToMany(() => Bookings, (bookings) => bookings.currencyCode)
  bookings: Bookings[];

  @OneToMany(() => FxRateQuotes, (fxRateQuotes) => fxRateQuotes.baseCurrency)
  fxRateQuotes: FxRateQuotes[];

  @OneToMany(() => FxRateQuotes, (fxRateQuotes) => fxRateQuotes.quoteCurrency)
  fxRateQuotes2: FxRateQuotes[];

  @OneToMany(
    () => PaymentDetails,
    (paymentDetails) => paymentDetails.currencyCode
  )
  paymentDetails: PaymentDetails[];

  @OneToMany(() => Payments, (payments) => payments.currencyCode)
  payments: Payments[];

  @OneToMany(() => Properties, (properties) => properties.currencyCode)
  properties: Properties[];
}
