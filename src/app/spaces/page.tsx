"use client";
import { Mdx } from "@/components/mdx";
import { Badge, Button, Flex, Input, Spinner, Type } from "@/components/ui";
import { defaultPreferences } from "@/config";
import { models } from "@/config/models";
import { usePreferenceContext } from "@/context";
import { useAttachment } from "@/hooks";
import { VectorStorage } from "@/libs/vector-storage";
import { useDocumentsQueries } from "@/services/documents/queries";
import { modelService } from "@/services/models";
import { Delete01Icon, Pdf02Icon } from "@hugeicons/react";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { useEffect, useState } from "react";

export default function Spaces() {
  const { apiKeys } = usePreferenceContext();
  const { renderPdfFileUpload, attachment } = useAttachment();
  const [search, setSearch] = useState<string>("");
  const [results, setResults] = useState<string>();
  const vectorStore = new VectorStorage({
    embedTextsFn(texts) {
      const embeddings = new OllamaEmbeddings({
        model: "jina/jina-embeddings-v2-base-en", // default value
        baseUrl: defaultPreferences.ollamaBaseUrl, // default value
      });
      return embeddings.embedDocuments(texts);
    },
  });

  const handleSearch = async () => {
    const results = await vectorStore.similaritySearch({
      query: search,
    });

    console.log("results", results.similarItems);

    const model = models.find((model) => model.key === "gpt-3.5-turbo");
    if (!model) return;
    const selectedModel = await modelService.createInstance({
      model: model,
      apiKey: apiKeys.openai,
    });

    console.log("results", results.similarItems);

    const response =
      await selectedModel.invoke(`You're helpful assistant. You're given a list of documents and a query. You need to answer the query based on the documents.
    documents: ${JSON.stringify(results.similarItems.map((item: any) => item.text))}
    query: ${search}
    `);
    console.log("results", response.content);
    setResults(response.content as string);
  };

  const {
    createDocumentMutation,
    updateDocumentMutation,
    documentsQuery,
    deleteDocumentMutation,
  } = useDocumentsQueries();

  const extractContent = async (file: File, documentId: string) => {
    const worker = new Worker(
      new URL("../../worker/worker.ts", import.meta.url),
    ); // Updated path
    worker.postMessage({ file, documentId });
    worker.onmessage = async (event) => {
      console.log("event", event);
      const { pages = [], documentId } = event?.data;
      try {
        updateDocumentMutation.mutate(
          {
            documentId,
            newDocument: { isIndexing: true, isFailed: false },
          },
          {
            onSuccess() {
              documentsQuery.refetch();
            },
          },
        );
        // Wait for all addText operations to complete
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

        updateDocumentMutation.mutate(
          {
            documentId,
            newDocument: {
              isIndexed: true,
              isIndexing: false,
              isFailed: false,
            },
          },
          {
            onSuccess() {
              documentsQuery.refetch();
            },
          },
        );
      } catch (error) {
        updateDocumentMutation.mutate(
          {
            documentId,
            newDocument: {
              isFailed: true,
              isIndexing: false,
              isIndexed: false,
            },
          },
          {
            onSuccess() {
              documentsQuery.refetch();
            },
          },
        );
      }

      // Add a text document to the store
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

  console.log("error", error);
  return (
    <Flex className="ml-16 p-4" direction="col" gap="md">
      {renderPdfFileUpload()}
      <Flex>
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </Flex>
      <Flex gap="xs" direction="col">
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
              <Button
                variant="secondary"
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
      {results && <Mdx message={results} animate={false} messageId="skmksdm" />}
    </Flex>
  );
}
