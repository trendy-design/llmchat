"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createContext, useContext, useState } from "react";

export type TConfirmArgs = {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  title: string;
  cancelTitle?: string;
  actionTitle?: string;
};
export type TConfirmContext = {
  open: (args: TConfirmArgs) => void;
  dismiss: () => void;
};
export const ConfirmContext = createContext<undefined | TConfirmContext>(
  undefined
);

export const useConfirmProvider = () => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};
export type TConfirmProvider = {
  children: React.ReactNode;
};
export const ConfirmProvider = ({ children }: TConfirmProvider) => {
  const [isOpen, setIsOpen] = useState(false);
  const [args, setArgs] = useState<TConfirmArgs | null>(null);

  const open = (args: TConfirmArgs) => {
    setIsOpen(true);
    setArgs(args);
  };
  const dismiss = () => {
    setIsOpen(false);
    args?.onCancel?.();
    setArgs(null);
  };
  return (
    <ConfirmContext.Provider value={{ open, dismiss }}>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{args?.title}</AlertDialogTitle>
            {args?.message && (
              <AlertDialogDescription>{args?.message}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={dismiss}>
              {args?.cancelTitle || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                args?.onConfirm();
                dismiss();
              }}
            >
              {args?.actionTitle || "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {children}
    </ConfirmContext.Provider>
  );
};
