import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ConversationParticipants } from "./ConversationParticipants";
import { Hosts } from "./Hosts";
import { Messages } from "./Messages";
import { Reviews } from "./Reviews";
import { Tenants } from "./Tenants";
import { UserAuthIdentities } from "./UserAuthIdentities";
import { UserPaymentMethods } from "./UserPaymentMethods";

@Index("SYS_C008381", ["userId"], { unique: true })
@Index("SYS_C008382", ["email"], { unique: true })
@Entity("USERS")
export class Users {
  @PrimaryGeneratedColumn({ type: "number", name: "USER_ID", scale: 0 })
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
    () => ConversationParticipants,
    (conversationParticipants) => conversationParticipants.user
  )
  conversationParticipants: ConversationParticipants[];

  @OneToOne(() => Hosts, (hosts) => hosts.host)
  hosts: Hosts;

  @OneToMany(() => Messages, (messages) => messages.authorUser)
  messages: Messages[];

  @OneToMany(() => Reviews, (reviews) => reviews.authorUser)
  reviews: Reviews[];

  @OneToMany(() => Reviews, (reviews) => reviews.targetUser)
  reviews2: Reviews[];

  @OneToOne(() => Tenants, (tenants) => tenants.tenant)
  tenants: Tenants;

  @OneToMany(
    () => UserAuthIdentities,
    (userAuthIdentities) => userAuthIdentities.user
  )
  userAuthIdentities: UserAuthIdentities[];

  @OneToMany(
    () => UserPaymentMethods,
    (userPaymentMethods) => userPaymentMethods.user
  )
  userPaymentMethods: UserPaymentMethods[];
}
