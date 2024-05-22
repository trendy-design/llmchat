"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { Check, Warning } from "@phosphor-icons/react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex flex-row gap-2">
              {props.variant === "destructive" ? (
                <Warning
                  size={20}
                  weight="bold"
                  className="text-red-400 flex-shrink-0"
                />
              ) : (
                <Check
                  size={20}
                  weight="bold"
                  className="text-blue-400 flex-shrink-0"
                />
              )}
              <div className="grid gap-1 w-full">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
