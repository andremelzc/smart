import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";

@Index("SYS_C008393", ["hostId"], { unique: true })
@Entity("HOSTS")
export class Hosts {
  @Column("date", { name: "UPDATED_AT", nullable: true })
  updatedAt: Date | null;

  @Column("number", {
    name: "REVIEWS_COUNT",
    nullable: true,
    scale: 0,
    default: () => "0",
  })
  reviewsCount: number | null;

  @Column("number", {
    name: "IS_VERIFIED",
    precision: 1,
    scale: 0,
    default: () => "0",
  })
  isVerified: number;

  @Column("number", { primary: true, name: "HOST_ID", scale: 0 })
  hostId: number;

  @Column("clob", { name: "DESCRIPTION", nullable: true })
  description: string | null;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @Column("number", {
    name: "AVERAGE_RATING",
    nullable: true,
    precision: 3,
    scale: 2,
    default: () => "0",
  })
  averageRating: number | null;

  @OneToOne("Users", (users: any) => users.hosts)
  @JoinColumn([{ name: "HOST_ID", referencedColumnName: "userId" }])
  host: any;

  @OneToMany("Properties", (properties: any) => properties.host)
  properties: any[];
}
