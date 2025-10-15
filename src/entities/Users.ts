import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("SYS_C008381", ["userId"], { unique: true })
@Index("SYS_C008382", ["email"], { unique: true })
@Entity("USERS")
export class Users {
  @PrimaryGeneratedColumn({ type: "number", name: "USER_ID" })
  userId: number;

  @Column("varchar2", { name: "STATUS", nullable: true, length: 20 })
  status: string | null;

  @Column("varchar2", { name: "PHONE_NUMBER", nullable: true, length: 30 })
  phoneNumber: string | null;

  @Column("varchar2", { name: "LAST_NAME", nullable: true, length: 100 })
  lastName: string | null;

  @Column("varchar2", { name: "FIRST_NAME", length: 100 })
  firstName: string;

  @Column("varchar2", { name: "EMAIL", unique: true, length: 255 })
  email: string;

  @Column("varchar2", { name: "DNI", nullable: true, length: 9 })
  dni: string | null;

  @Column("date", { name: "CREATED_AT", default: () => "SYSDATE" })
  createdAt: Date;

  @Column("date", { name: "BLOCKED_UNTIL", nullable: true })
  blockedUntil: Date | null;

  @OneToMany(
    "ConversationParticipants",
    (conversationParticipants: any) => conversationParticipants.user
  )
  conversationParticipants: any[];

  @OneToOne("Hosts", (hosts: any) => hosts.host)
  hosts: any;

  @OneToMany("Messages", (messages: any) => messages.authorUser)
  messages: any[];

  @OneToMany("Reviews", (reviews: any) => reviews.authorUser)
  reviews: any[];

  @OneToMany("Reviews", (reviews: any) => reviews.targetUser)
  reviews2: any[];

  @OneToOne("Tenants", (tenants: any) => tenants.tenant)
  tenants: any;

  @OneToMany(
    "UserAuthIdentities",
    (userAuthIdentities: any) => userAuthIdentities.user
  )
  userAuthIdentities: any[];

  @OneToMany(
    "UserPaymentMethods",
    (userPaymentMethods: any) => userPaymentMethods.user
  )
  userPaymentMethods: any[];
}
