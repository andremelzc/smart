import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("SYS_C008459", ["paymentMethodId"], { unique: true })
@Entity("USER_PAYMENT_METHODS")
export class UserPaymentMethods {
  @Column("date", { name: "UPDATED_AT", nullable: true })
  updatedAt: Date | null;

  @Column("varchar2", { name: "PROVIDER", length: 50 })
  provider: string;

  @PrimaryGeneratedColumn({
    type: "number",
    name: "PAYMENT_METHOD_ID",
  })
  paymentMethodId: number;

  @Column("number", {
    name: "IS_DEFAULT",
    precision: 1,
    scale: 0,
    default: () => "0",
  })
  isDefault: number;

  @Column("number", { name: "EXP_YEAR", nullable: true, scale: 0 })
  expYear: number | null;

  @Column("number", { name: "EXP_MONTH", nullable: true, scale: 0 })
  expMonth: number | null;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @Column("varchar2", { name: "ACCOUNT_REF", nullable: true, length: 100 })
  accountRef: string | null;

  @OneToMany("Payments", (payments: any) => payments.paymentMethod)
  payments: any[];

  @ManyToOne("Users", (users: any) => users.userPaymentMethods)
  @JoinColumn([{ name: "USER_ID", referencedColumnName: "userId" }])
  user: any;

  @ManyToOne(
    "PaymentTypes",
    (paymentTypes: any) => paymentTypes.userPaymentMethods
  )
  @JoinColumn([
    { name: "PAYMENT_TYPE_ID", referencedColumnName: "paymentTypeId" },
  ])
  paymentType: any;
}
