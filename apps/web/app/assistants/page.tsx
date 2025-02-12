"use client";
import { AssistantCard } from "@/components/assistants/assitant-card";
import { CreateAssistant } from "@/components/assistants/create-assistant";
import { TopNav } from "@/components/layout/top-nav";
import { useAssistantUtils } from "@/hooks";
import { useSessions } from "@/libs/context";
import { TCustomAssistant } from "@repo/shared/types";
import { Button, Flex, Type } from "@repo/ui";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AssistantPage = () => {
  const { push } = useRouter();
  const { assistantsQuery, removeAssistantMutation } = useAssistantUtils();
  const { addAssistantToSessionMutation, createSession } = useSessions();
  const [openCreateAssistant, setOpenCreateAssistant] = useState(false);

  const remoteAssistantsQuery = useQuery({
    queryKey: ["remote-assistants"],
    queryFn: () => fetch("/api/assistants").then((res) => res.json()),
  });

  const localAssistants = assistantsQuery.data || [];
  const remoteAssistants = remoteAssistantsQuery.data?.assistants || [];

  const handleAddToChat = (assistant: TCustomAssistant) => {
    addAssistantToSessionMutation.mutate(assistant, {
      onSuccess: () => {
        createSession().then(() => {
          push("/chat");
        });
      },
    });
  };

  const handleDelete = (key: string) => {
    removeAssistantMutation.mutate(key);
  };

  const renderAssistantList = (
    assistants: TCustomAssistant[],
    canDelete: boolean,
  ) => (
    <div className="grid w-full grid-cols-2 gap-3 px-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {assistants.map((assistant) => (
        <AssistantCard
          key={assistant.key}
          assistant={assistant}
          canDelete={canDelete}
          onAddToChat={handleAddToChat}
          onDelete={handleDelete}
        />
      ))}
      {assistants.length === 0 && (
        <div className="col-span-full flex items-center justify-center rounded-lg bg-zinc-500/5 p-2">
          <Type textColor="tertiary">No assistants yet</Type>
        </div>
      )}
    </div>
  );

  return (
    <>
      <TopNav title="AI Assistants" showBackButton />

      <Flex direction="col" className="w-full">
        <Flex
          direction="row"
          items="center"
          justify="between"
          className="w-full px-6 py-3"
        >
          <Type size="base" weight="medium">
            Your Assistants
          </Type>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => setOpenCreateAssistant(true)}
          >
            <PlusIcon size={16} />
            Create assistant
          </Button>
        </Flex>

        {renderAssistantList(localAssistants, true)}
      </Flex>

      {remoteAssistants?.length > 0 && (
        <Flex direction="col" className="mt-4 w-full">
          <Type size="base" weight="medium" className="px-6 py-3">
            Explore More
          </Type>
          {renderAssistantList(remoteAssistants, false)}
        </Flex>
      )}

      <CreateAssistant
        open={openCreateAssistant}
        onOpenChange={setOpenCreateAssistant}
      />
    </>
  );
};

export default AssistantPage;
