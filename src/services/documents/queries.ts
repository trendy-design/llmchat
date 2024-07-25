import { TDocument } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { documentService } from "./client";

export const useDocumentsQueries = () => {
  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: () => documentService.getDocuments(),
  });

  const createDocumentMutation = useMutation({
    mutationFn: (variables: any) => documentService.createDocument(variables),
    onSuccess: () => {
      documentsQuery.refetch();
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: documentService.deleteDocument,
    onSuccess: () => {
      documentsQuery.refetch();
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({
      documentId,
      newDocument,
    }: {
      documentId: string;
      newDocument: Omit<Partial<TDocument>, "id">;
    }) => documentService.updateDocument(documentId, newDocument),
    onSuccess: () => {
      documentsQuery.refetch();
    },
  });

  return {
    documentsQuery,
    createDocumentMutation,
    updateDocumentMutation,
    deleteDocumentMutation,
  };
};
