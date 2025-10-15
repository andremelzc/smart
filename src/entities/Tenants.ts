import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";

@Index("SYS_C008390", ["tenantId"], { unique: true })
@Entity("TENANTS")
export class Tenants {
  @Column("date", { name: "UPDATED_AT", nullable: true })
  updatedAt: Date | null;

  @Column("number", { primary: true, name: "TENANT_ID", scale: 0 })
  tenantId: number;

  @Column("number", {
    name: "REVIEWS_COUNT",
    nullable: true,
    scale: 0,
    default: () => "0",
  })
  reviewsCount: number | null;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @Column("clob", { name: "BIO", nullable: true })
  bio: string | null;

  @Column("number", {
    name: "AVERAGE_RATING",
    nullable: true,
    precision: 3,
    scale: 2,
    default: () => "0",
  })
  averageRating: number | null;

  @OneToMany("Bookings", (bookings: any) => bookings.tenant)
  bookings: any[];

  @OneToMany(
    "TenantPreferences",
    (tenantPreferences: any) => tenantPreferences.tenant
  )
  tenantPreferences: any[];

  @OneToOne("Users", (users: any) => users.tenants)
  @JoinColumn([{ name: "TENANT_ID", referencedColumnName: "userId" }])
  tenant: any;
}
