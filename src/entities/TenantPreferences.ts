import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("SYS_C008403", ["tenantId", "preferenceId"], { unique: true })
@Entity("TENANT_PREFERENCES")
export class TenantPreferences {
  @Column("varchar2", { name: "VALUE_TEXT", nullable: true, length: 255 })
  valueText: string | null;

  @Column("number", { name: "VALUE_INT", nullable: true, scale: 0 })
  valueInt: number | null;

  @Column("number", {
    name: "VALUE_BOOL",
    precision: 1,
    scale: 0,
    default: () => "0",
  })
  valueBool: number;

  @Column("date", { name: "UPDATED_AT", nullable: true })
  updatedAt: Date | null;

  @Column("number", { primary: true, name: "TENANT_ID", scale: 0 })
  tenantId: number;

  @Column("number", { primary: true, name: "PREFERENCE_ID", scale: 0 })
  preferenceId: number;

  @ManyToOne("Tenants", (tenants: any) => tenants.tenantPreferences)
  @JoinColumn([{ name: "TENANT_ID", referencedColumnName: "tenantId" }])
  tenant: any;

  @ManyToOne("Preferences", (preferences: any) => preferences.tenantPreferences)
  @JoinColumn([{ name: "PREFERENCE_ID", referencedColumnName: "preferenceId" }])
  preference: any;
}
