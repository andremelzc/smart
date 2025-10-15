import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("SYS_C008452", ["paymentTypeId"], { unique: true })
@Index("SYS_C008453", ["name"], { unique: true })
@Entity("PAYMENT_TYPES")
export class PaymentTypes {
  @PrimaryGeneratedColumn({ type: "number", name: "PAYMENT_TYPE_ID" })
  paymentTypeId: number;

  @Column("varchar2", { name: "NAME", unique: true, length: 50 })
  name: string;

  @Column("clob", { name: "DESCRIPTION", nullable: true })
  description: string | null;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @OneToMany(
    "UserPaymentMethods",
    (userPaymentMethods: any) => userPaymentMethods.paymentType
  )
  userPaymentMethods: any[];
}
