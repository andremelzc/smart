import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";

@Index("SYS_C008388", ["identityId"], { unique: true })
@Entity("USER_AUTH_IDENTITIES")
export class UserAuthIdentities {
  @Column("varchar2", { name: "PROVIDER_USER_ID", length: 255 })
  providerUserId: string;

  @Column("varchar2", { name: "PROVIDER", length: 30 })
  provider: string;

  @Column("varchar2", { name: "PASSWORD_HASH", nullable: true, length: 255 })
  passwordHash: string | null;

  @Column("date", { name: "LAST_LOGIN_AT", nullable: true })
  lastLoginAt: Date | null;

  @PrimaryGeneratedColumn({ type: "number", name: "IDENTITY_ID", scale: 0 })
  identityId: number;

  @Column("number", {
    name: "EMAIL_VERIFIED",
    precision: 1,
    scale: 0,
    default: () => "0",
  })
  emailVerified: number;

  @Column("varchar2", { name: "EMAIL", nullable: true, length: 255 })
  email: string | null;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @ManyToOne(() => Users, (users) => users.userAuthIdentities)
  @JoinColumn([{ name: "USER_ID", referencedColumnName: "userId" }])
  user: Users;
}
