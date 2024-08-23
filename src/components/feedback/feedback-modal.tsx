"use client";
import { cn } from "@/helper/clsx";
import {
  Comment01Icon,
  NeutralIcon,
  Sad01Icon,
  SmileIcon,
} from "@hugeicons/react";
import { useFormik } from "formik";
import { Drawer } from "vaul";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  Button,
  Flex,
  FormLabel,
  Input,
  Textarea,
  Type,
  useToast,
} from "../ui";

export type FeedbackModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type FeedbackType = "positive" | "neutral" | "negative";

const feedbackSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  feedbackType: z.enum(["positive", "neutral", "negative"]),
  feedback: z.string({ required_error: "Feedback is required" }),
});

export const FeedbackModal = ({ open, onOpenChange }: FeedbackModalProps) => {
  const { toast } = useToast();
  const formik = useFormik({
    initialValues: {
      feedback: "",
      email: "",
      feedbackType: "positive",
    },
    validateOnBlur: true,
    validationSchema: toFormikValidationSchema(feedbackSchema),
    onSubmit: async (values) => {
      if (!values.feedback) return;
      const response = await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          feedback: values.feedback,
          feedbackType: values.feedbackType,
        }),
      });
      onOpenChange(false);
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
        variant: "default",
      });
    },
  });
  const feedbackOptions = [
    { type: "positive", icon: SmileIcon, color: "text-cyan-400" },
    { type: "neutral", icon: NeutralIcon, color: "" },
    { type: "negative", icon: Sad01Icon, color: "text-rose-400" },
  ];

  return (
    <Drawer.Root
      direction="bottom"
      shouldScaleBackground
      open={open}
      onOpenChange={onOpenChange}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[400] bg-zinc-500/70 backdrop-blur-sm dark:bg-zinc-900/70" />
        <Drawer.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-[500] mx-auto mt-24 flex max-h-[530px] flex-col items-center outline-none md:bottom-4 md:left-[50%]",
            `w-full md:ml-[-200px] md:w-[400px]`,
          )}
        >
          <div className="relative w-full space-y-4 rounded-lg bg-white dark:border dark:border-white/10 dark:bg-zinc-800">
            <Flex className="w-full border-b p-3" gap="sm" items="center">
              <Comment01Icon size={20} variant="solid" />
              <Type size="base" weight="medium">
                Share your feedback
              </Type>
            </Flex>
            <Flex gap="sm" direction="col" className="w-full px-3 pb-3">
              <Type size="sm" textColor="secondary">
                We&apos;re always looking for ways to improve our product.
                Please let us know what you think.
              </Type>

              <FormLabel label="Email" isOptional />
              <Input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                placeholder="Email"
                className="w-full"
              />

              <FormLabel label="Feedback" />
              <Textarea
                id="feedback"
                required
                name="feedback"
                value={formik.values.feedback}
                onChange={formik.handleChange}
                placeholder="Share your thoughts..."
                className="w-full resize-none"
              />
              {formik.errors.feedback && (
                <Type size="sm" textColor="secondary">
                  {formik.errors.feedback}
                </Type>
              )}
              <Flex gap="sm" className="w-full py-2" justify="center">
                {feedbackOptions.map(({ type, icon: Icon, color }) => (
                  <Button
                    key={type}
                    variant={
                      formik.values.feedbackType === type
                        ? "secondary"
                        : "ghost"
                    }
                    size="icon"
                    className={cn(
                      formik.values.feedbackType === type && "opacity-100",
                    )}
                    rounded="full"
                    onClick={() =>
                      formik.setFieldValue("feedbackType", type as FeedbackType)
                    }
                  >
                    <Icon
                      size={28}
                      variant={
                        formik.values.feedbackType === type ? "solid" : "stroke"
                      }
                      className={color}
                    />
                  </Button>
                ))}
              </Flex>
              <Button
                className="w-full"
                type="submit"
                onClick={() => formik.handleSubmit()}
              >
                Submit Feedback
              </Button>
            </Flex>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
