'use client';
import { cn } from '@repo/shared/utils';
import {
  Button,
  Dialog,
  DialogContent,
  DialogPortal,
  Flex,
  FormLabel,
  Input,
  Textarea,
  Type,
  useToast,
} from '@repo/ui';
import { useFormik } from 'formik';
import { Flag, Frown, Meh, Smile } from 'lucide-react';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';

export type FeedbackModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type FeedbackType = 'positive' | 'neutral' | 'negative';

const feedbackSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  feedbackType: z.enum(['positive', 'neutral', 'negative']),
  feedback: z.string({ required_error: 'Feedback is required' }),
});

export const FeedbackModal = ({ open, onOpenChange }: FeedbackModalProps) => {
  const { toast } = useToast();
  const formik = useFormik({
    initialValues: {
      feedback: '',
      email: '',
      feedbackType: 'positive',
    },
    validateOnBlur: true,
    validationSchema: toFormikValidationSchema(feedbackSchema),
    onSubmit: async (values) => {
      if (!values.feedback) return;
      const response = await fetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          feedback: values.feedback,
          feedbackType: values.feedbackType,
        }),
      });
      onOpenChange(false);
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
        variant: 'default',
      });
    },
  });
  const feedbackOptions = [
    { type: 'positive', icon: Smile, color: 'text-teal-400' },
    { type: 'neutral', icon: Meh, color: '' },
    { type: 'negative', icon: Frown, color: 'text-rose-400' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent
          ariaTitle="Assistants"
          className="rounded-xl bg-white p-0 md:w-[450px] dark:border dark:border-white/10"
        >
          <div className="relative w-full space-y-4">
            <Flex className="w-full p-4" gap="sm" items="center">
              <Flag size={20} strokeWidth={2} />
              <Type size="base" weight="medium">
                Share your feedback
              </Type>
            </Flex>
            <Flex gap="sm" direction="col" className="w-full px-6 pb-6">
              <Type size="sm" textColor="secondary">
                We&apos;re always looking for ways to improve our product. Please let us know what
                you think.
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
                    variant={formik.values.feedbackType === type ? 'secondary' : 'ghost'}
                    size="icon"
                    className={cn(formik.values.feedbackType === type && 'opacity-100')}
                    rounded="full"
                    onClick={() => formik.setFieldValue('feedbackType', type as FeedbackType)}
                  >
                    <Icon size={24} strokeWidth={2} />
                  </Button>
                ))}
              </Flex>
              <Flex gap="sm" className="w-full" justify="end">
                <Button type="submit" onClick={() => formik.handleSubmit()}>
                  Submit Feedback
                </Button>
              </Flex>
            </Flex>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
