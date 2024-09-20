import { examples } from "@/config/examples";
import { drizzle } from "drizzle-orm/pglite";
import moment from "moment";
import { schema } from "../schema";

export const runMigrationv2 = async (db: ReturnType<typeof drizzle>) => {
  try {
    await db.transaction(async (tx) => {
      // Insert example chat sessions
      await tx.insert(schema.chatSessions).values(
        examples.chatSessions.map((session) => ({
          id: session.id,
          title: session.title,
          isExample: true,
          createdAt: moment(session.createdAt).toDate(),
          updatedAt: moment(session.updatedAt).toDate(),
        })),
      );

      // Insert example chat messages
      await tx.insert(schema.chatMessages).values(
        examples.chatMessages.map((message) => ({
          id: message.id,
          sessionId: message.sessionId,
          runConfig: message.runConfig,
          errorMessage: message.errorMessage,
          image: message?.image,
          parentId: message?.parentId,
          isLoading: message?.isLoading || false,
          rawAI: message?.rawAI,
          rawHuman: message?.rawHuman,
          relatedQuestions: message?.relatedQuestions,
          stop: message?.stop,
          stopReason: message?.stopReason,
          tools: message?.tools,
          createdAt: moment(message.createdAt).toDate(),
        })),
      );

      // You can add more example data insertions here if needed
    });
  } catch (error) {
    console.error("Migration v2 failed:", error);
  }
};
