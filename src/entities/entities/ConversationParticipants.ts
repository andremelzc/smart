import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Conversations } from "./Conversations";
import { Users } from "./Users";

@Index("PK_CONVERSATION_PARTICIPANTS", ["conversationId", "userId"], {
  unique: true,
})
@Entity("CONVERSATION_PARTICIPANTS")
export class ConversationParticipants {
  @Column("number", { primary: true, name: "USER_ID", scale: 0 })
  userId: number;

  @Column("varchar2", { name: "ROLE", nullable: true, length: 20 })
  role: string | null;

  @Column("date", {
    name: "JOINED_AT",
    nullable: true,
    default: () => "SYSDATE",
  })
  joinedAt: Date | null;

  @Column("number", { primary: true, name: "CONVERSATION_ID", scale: 0 })
  conversationId: number;

  @ManyToOne(
    () => Conversations,
    (conversations) => conversations.conversationParticipants
  )
  @JoinColumn([
    { name: "CONVERSATION_ID", referencedColumnName: "conversationId" },
  ])
  conversation: Conversations;

  @ManyToOne(() => Users, (users) => users.conversationParticipants)
  @JoinColumn([{ name: "USER_ID", referencedColumnName: "userId" }])
  user: Users;
}
