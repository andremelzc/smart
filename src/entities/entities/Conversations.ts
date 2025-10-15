import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ConversationParticipants } from "./ConversationParticipants";
import { Properties } from "./Properties";
import { Bookings } from "./Bookings";
import { Messages } from "./Messages";

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

  @PrimaryGeneratedColumn({ type: "number", name: "CONVERSATION_ID", scale: 0 })
  conversationId: number;

  @Column("date", { name: "CLOSED_AT", nullable: true })
  closedAt: Date | null;

  @OneToMany(
    () => ConversationParticipants,
    (conversationParticipants) => conversationParticipants.conversation
  )
  conversationParticipants: ConversationParticipants[];

  @ManyToOne(() => Properties, (properties) => properties.conversations)
  @JoinColumn([{ name: "PROPERTY_ID", referencedColumnName: "propertyId" }])
  property: Properties;

  @ManyToOne(() => Bookings, (bookings) => bookings.conversations)
  @JoinColumn([{ name: "BOOKING_ID", referencedColumnName: "bookingId" }])
  booking: Bookings;

  @OneToMany(() => Messages, (messages) => messages.conversation)
  messages: Messages[];
}
