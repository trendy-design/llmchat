"use client";

import { Mdx } from "@/components/mdx";
import {
  Badge,
  Button,
  Flex,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  Spinner,
  Type,
} from "@/components/ui";
import {
  Delete01Icon,
  InformationCircleIcon,
  Pdf02Icon,
} from "@hugeicons/react";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { useEffect, useState } from "react";

import { defaultPreferences } from "@/config";
import { models } from "@/config/models";
import { vectorSearchSystemPrompt } from "@/config/prompts";
import { usePreferenceContext } from "@/context";
import { constructPrompt } from "@/helper/promptUtil";
import { useAttachment } from "@/hooks";
import { VectorStorage } from "@/libs/vector-storage";
import { useDocumentsQueries } from "@/services/documents/queries";
import { modelService } from "@/services/models";
import { RunnableSequence } from "@langchain/core/runnables";
import { HoverCard } from "@radix-ui/react-hover-card";

export default function Spaces() {
  const { apiKeys } = usePreferenceContext();
  const { renderPdfFileUpload, attachment } = useAttachment();
  const [search, setSearch] = useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [results, setResults] = useState<string>();
  const {
    createDocumentMutation,
    updateDocumentMutation,
    documentsQuery,
    deleteDocumentMutation,
  } = useDocumentsQueries();

  const vectorStore = new VectorStorage({
    embedTextsFn(texts) {
      const embeddings = new OllamaEmbeddings({
        model: "jina/jina-embeddings-v2-base-en",
        baseUrl: defaultPreferences.ollamaBaseUrl,
      });
      return embeddings.embedDocuments(texts);
    },
  });

  const handleSearch = async () => {
    const results = await vectorStore.similaritySearch({ query: search });
    console.log("results", results.similarItems);

    const model = models.find((model) => model.key === "gpt-3.5-turbo");
    if (!model) return;

    const selectedModel = await modelService.createInstance({
      model: model,
      provider: model.provider,
      apiKey: apiKeys.openai,
    });

    const prompt = await constructPrompt({
      systemPrompt: vectorSearchSystemPrompt(results.similarItems),
      memories: [],

      hasMessages: false,
    });

    const chain = RunnableSequence.from([prompt as any, selectedModel as any]);

    const response = await chain.invoke({ input: search, chat_history: [] });

    console.log("results", response.content);
    setResults(response.content as string);
  };

  const updateDocumentStatus = async (documentId: string, newDocument: any) => {
    try {
      await updateDocumentMutation.mutateAsync(
        { documentId, newDocument },
        { onSuccess: () => documentsQuery.refetch() },
      );
    } catch (error) {
      console.error("Failed to update document status:", error);
    }
  };

  const extractWebsiteContent = async (data: any, documentId: string) => {
    console.log("data", data);
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1400,
      chunkOverlap: 100,
      separators: ["\n\n", "\n", " "],
    });

    try {
      await updateDocumentStatus(documentId, {
        isIndexing: true,
        isFailed: false,
      });

      const chunks = await textSplitter.splitDocuments([
        new Document({ pageContent: data.markdown }),
      ]);
      console.log("chunks", chunks);

      const chunksWithMetadata = chunks?.map((chunk) => ({
        chunk: {
          text: `Title: ${data.title} \n\n ${chunk.pageContent}`,
          metadata: {
            source: data.url,
            title: data.title,
          },
        },
      }));

      console.log("chunksWithMetadata", chunksWithMetadata);

      await Promise.all(
        chunksWithMetadata.map(async (page) => {
          return vectorStore.addText(page.chunk.text, {
            ...page.chunk.metadata,
            documentId,
          });
        }),
      );

      await updateDocumentStatus(documentId, {
        isIndexed: true,
        isIndexing: false,
        isFailed: false,
      });
    } catch (error) {
      console.log("error", error);
      await updateDocumentStatus(documentId, {
        isFailed: true,
        isIndexing: false,
        isIndexed: false,
      });
    }
  };

  const extractContent = async (file: File, documentId: string) => {
    const worker = new Worker(
      new URL("../../worker/worker.ts", import.meta.url),
    );
    worker.postMessage({ file, documentId });
    worker.onmessage = async (event) => {
      console.log("event", event);
      const { pages = [], documentId } = event?.data;
      try {
        await updateDocumentStatus(documentId, {
          isIndexing: true,
          isFailed: false,
        });
        await Promise.all(
          pages.map(async (page: any) => {
            return vectorStore.addText(page.content, {
              page: page.page,
              fileName: page.fileName,
              fileType: page.fileType,
              documentId,
            });
          }),
        );

        await updateDocumentStatus(documentId, {
          isIndexed: true,
          isIndexing: false,
          isFailed: false,
        });
      } catch (error) {
        await updateDocumentStatus(documentId, {
          isFailed: true,
          isIndexing: false,
          isIndexed: false,
        });
      }
    };
  };

  useEffect(() => {
    console.log("attachment", attachment);
    if (attachment?.file) {
      createDocumentMutation.mutate(
        {
          content: attachment.file,
          isIndexed: false,
          meta: {
            name: attachment.file.name,
            type: attachment.file.type,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          onSuccess(data) {
            documentsQuery.refetch();
            typeof data.content !== "string" &&
              extractContent(data.content, data.id);
          },
          onError(error) {
            console.log("error", error);
          },
        },
      );
    }
  }, [attachment]);

  const { data, error } = documentsQuery;

  const handleWebsiteIndex = async () => {
    if (!websiteUrl) return;

    console.log("websiteUrl", websiteUrl);
    const response = await fetch(`/api/reader`, {
      method: "POST",
      body: JSON.stringify({ url: websiteUrl }),
    });
    const data = await response.json();

    createDocumentMutation.mutate(
      {
        content: data,
        isIndexed: false,
        meta: {
          source: data.url,
          title: data.title,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        onSuccess(data) {
          extractWebsiteContent(data.content, data.id);
        },
      },
    );

    console.log("data", data);
  };

  console.log("error", error);

  return (
    <Flex className="w-full pt-8" items="center" direction="col" gap="md">
      <Flex direction="col" gap="md" className="md:w-[700px]">
        <Flex className="w-full" gap="sm" items="center">
          <Input
            placeholder="Website URL"
            value={websiteUrl}
            type="url"
            size="sm"
            className="w-full"
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
          <Button onClick={handleWebsiteIndex}>Add</Button>
          {renderPdfFileUpload()}
        </Flex>
        <Flex>
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={handleSearch}>Search</Button>
        </Flex>
        <Flex gap="xs" direction="col" className="w-full">
          {data?.map((doc) => (
            <Flex
              key={doc.id}
              gap="sm"
              className="h-12 w-full rounded-md bg-white/5 pl-3 pr-2"
              items="center"
            >
              <Pdf02Icon size={20} strokeWidth={2} />
              <Type size="sm" weight="medium" textColor="primary">
                {doc.meta.name}
                <span className="pl-1 opacity-50">#{doc.id}</span>
              </Type>
              <Flex className="flex-1" />
              <Flex gap="sm" items="center">
                <Type>{doc.isIndexed && <Badge>Indexed</Badge>}</Type>
                {doc.isIndexing && (
                  <Flex gap="sm">
                    <Spinner /> <Type>Indexing</Type>
                  </Flex>
                )}
                <Type>
                  {doc.isFailed && <Badge variant="destructive">Failed</Badge>}
                </Type>
                <HoverCard key={doc.id}>
                  <HoverCardTrigger asChild>
                    <InformationCircleIcon
                      size={18}
                      variant="solid"
                      className="text-zinc-500"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent className="h-[300px] min-w-[400px] overflow-y-auto p-0">
                    <Flex
                      direction="col"
                      gap="none"
                      className="border-b border-zinc-500/20 p-4"
                    >
                      <Type size="xxs" textColor="tertiary">
                        #{doc.id}
                      </Type>
                      <Type size="sm" weight="medium">
                        {doc.meta.title}
                      </Type>
                      <Type size="xs" textColor="secondary">
                        {doc.meta.source}
                      </Type>
                    </Flex>
                    <Flex direction="col" gap="sm" className="p-4">
                      <Mdx
                        message={(doc?.content as any)?.markdown}
                        animate={false}
                        messageId="skmksdm"
                        size="sm"
                      />
                    </Flex>
                  </HoverCardContent>
                </HoverCard>
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={async () => {
                    await vectorStore.deleteDocumentsByMetadata(doc.id);
                    deleteDocumentMutation.mutate(doc.id, {
                      onSuccess() {
                        documentsQuery.refetch();
                      },
                    });
                  }}
                >
                  <Delete01Icon size={18} strokeWidth={2} />
                </Button>
              </Flex>
            </Flex>
          ))}
        </Flex>
        {results && (
          <Mdx message={results} animate={false} messageId="skmksdm" />
        )}
      </Flex>
    </Flex>
  );
}
