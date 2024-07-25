"use client";
import { Mdx } from "@/components/mdx";
import { Button, Flex, Input, Type } from "@/components/ui";
import { models } from "@/config/models";
import { usePreferenceContext } from "@/context";
import { useAttachment } from "@/hooks";
import { VectorStorage } from "@/libs/vector-storage";
import { useDocumentsQueries } from "@/services/documents/queries";
import { modelService } from "@/services/models";
import { useEffect, useState } from "react";

export default function Spaces() {
  const { apiKeys } = usePreferenceContext();
  const { renderPdfFileUpload, attachment } = useAttachment();
  const [search, setSearch] = useState<string>("");
  const [results, setResults] = useState<string>();
  const vectorStore = new VectorStorage({ openAIApiKey: apiKeys.openai });

  const handleSearch = async () => {
    const results = await vectorStore.similaritySearch({
      query: search,
    });

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

  const { createDocumentMutation, updateDocumentMutation, documentsQuery } =
    useDocumentsQueries();

  const extractContent = async (file: File, documentId: string) => {
    const worker = new Worker(
      new URL("../../worker/worker.ts", import.meta.url),
    ); // Updated path
    worker.postMessage({ file, documentId });
    worker.onmessage = async (event) => {
      console.log("event", event);
      const { pages = [], documentId } = event?.data;

      pages.forEach(async (page: any) => {
        await vectorStore.addText(page.content, {
          page: page.page,
          fileName: page.fileName,
          fileType: page.fileType,
          documentId,
        });
      });

      updateDocumentMutation.mutate(
        {
          documentId,
          newDocument: { isIndexed: true },
        },
        {
          onSuccess() {
            documentsQuery.refetch();
          },
        },
      );

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
    <div className="ml-16">
      {renderPdfFileUpload()}
      <Flex>
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </Flex>
      {data?.map((document) => (
        <Flex key={document.id} gap="lg">
          <Type>{document.id}</Type>
          <Type>{JSON.stringify(document.content)}</Type>
          <Type>{document.isIndexed ? "Indexed" : "Not Indexed"}</Type>
        </Flex>
      ))}
      {results && <Mdx message={results} animate={false} messageId="skmksdm" />}
    </div>
  );
}
