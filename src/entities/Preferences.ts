import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("SYS_C008398", ["preferenceId"], { unique: true })
@Index("SYS_C008399", ["code"], { unique: true })
@Entity("PREFERENCES")
export class Preferences {
  @Column("varchar2", {
    name: "VALUE_TYPE",
    length: 20,
    default: () => "'text'",
  })
  valueType: string;

  @PrimaryGeneratedColumn({ type: "number", name: "PREFERENCE_ID" })
  preferenceId: number;

  @Column("varchar2", { name: "NAME", length: 100 })
  name: string;

  @Column("clob", { name: "DESCRIPTION", nullable: true })
  description: string | null;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @Column("varchar2", { name: "CODE", unique: true, length: 50 })
  code: string;

  @OneToMany(
    "TenantPreferences",
    (tenantPreferences: any) => tenantPreferences.preference
  )
  tenantPreferences: any[];
}
