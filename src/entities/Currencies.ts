import { Column, Entity, Index, OneToMany } from "typeorm";

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

  @OneToMany("Bookings", (bookings: any) => bookings.currencyCode)
  bookings: any[];

  @OneToMany("FxRateQuotes", (fxRateQuotes: any) => fxRateQuotes.baseCurrency)
  fxRateQuotes: any[];

  @OneToMany("FxRateQuotes", (fxRateQuotes: any) => fxRateQuotes.quoteCurrency)
  fxRateQuotes2: any[];

  @OneToMany(
    "PaymentDetails",
    (paymentDetails: any) => paymentDetails.currencyCode
  )
  paymentDetails: any[];

  @OneToMany("Payments", (payments: any) => payments.currencyCode)
  payments: any[];

  @OneToMany("Properties", (properties: any) => properties.currencyCode)
  properties: any[];
}
