import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Currencies } from "./Currencies";

@Index("SYS_C008502", ["fxQuoteId"], { unique: true })
@Entity("FX_RATE_QUOTES")
export class FxRateQuotes {
  @Column("varchar2", { name: "SOURCE", nullable: true, length: 50 })
  source: string | null;

  @Column("number", {
    name: "RATE_DECIMAL",
    nullable: true,
    precision: 20,
    scale: 10,
  })
  rateDecimal: number | null;

  @Column("date", { name: "QUOTED_AT" })
  quotedAt: Date;

  @PrimaryGeneratedColumn({ type: "number", name: "FX_QUOTE_ID", scale: 0 })
  fxQuoteId: number;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @ManyToOne(() => Currencies, (currencies) => currencies.fxRateQuotes)
  @JoinColumn([{ name: "BASE_CURRENCY", referencedColumnName: "currencyCode" }])
  baseCurrency: Currencies;

  @ManyToOne(() => Currencies, (currencies) => currencies.fxRateQuotes2)
  @JoinColumn([
    { name: "QUOTE_CURRENCY", referencedColumnName: "currencyCode" },
  ])
  quoteCurrency: Currencies;
}
