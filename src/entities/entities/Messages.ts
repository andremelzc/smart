import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Conversations } from "./Conversations";
import { Users } from "./Users";

@Index("SYS_C008494", ["messageId"], { unique: true })
@Entity("MESSAGES")
export class Messages {
  @Column("date", { name: "SENT_AT", nullable: true, default: () => "SYSDATE" })
  sentAt: Date | null;

  @Column("date", { name: "READ_AT", nullable: true })
  readAt: Date | null;

  @PrimaryGeneratedColumn({ type: "number", name: "MESSAGE_ID", scale: 0 })
  messageId: number;

  @Column("number", {
    name: "IS_READ",
    precision: 1,
    scale: 0,
    default: () => "0",
  })
  isRead: number;

  @Column("clob", { name: "CONTENT" })
  content: string;

  @ManyToOne(() => Conversations, (conversations) => conversations.messages)
  @JoinColumn([
    { name: "CONVERSATION_ID", referencedColumnName: "conversationId" },
  ])
  conversation: Conversations;

  @ManyToOne(() => Users, (users) => users.messages)
  @JoinColumn([{ name: "AUTHOR_USER_ID", referencedColumnName: "userId" }])
  authorUser: Users;
}
