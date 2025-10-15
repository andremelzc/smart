import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("SYS_C008486", ["conversationId"], { unique: true })
@Entity("CONVERSATIONS")
export class Conversations {
  @Column("varchar2", { name: "STATUS", length: 20, default: () => "'open'" })
  status: string;

  @Column("date", {
    name: "CREATED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  createdAt: Date | null;

  @PrimaryGeneratedColumn({ type: "number", name: "CONVERSATION_ID" })
  conversationId: number;

  @Column("date", { name: "CLOSED_AT", nullable: true })
  closedAt: Date | null;

  @OneToMany(
    "ConversationParticipants",
    (conversationParticipants: any) => conversationParticipants.conversation
  )
  conversationParticipants: any[];

  @ManyToOne("Properties", (properties: any) => properties.conversations)
  @JoinColumn([{ name: "PROPERTY_ID", referencedColumnName: "propertyId" }])
  property: any;

  @ManyToOne("Bookings", (bookings: any) => bookings.conversations)
  @JoinColumn([{ name: "BOOKING_ID", referencedColumnName: "bookingId" }])
  booking: any;

  @OneToMany("Messages", (messages: any) => messages.conversation)
  messages: any[];
}
