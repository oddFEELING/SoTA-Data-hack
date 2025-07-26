import React, {
  type FC,
  type Dispatch,
  type SetStateAction,
  useEffect,
} from "react";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import z from "zod";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "../ui/multi-select";
import { Button } from "../ui/button";

type CreateStoryDialogProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

export const CreateStoryDialog: FC<CreateStoryDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const createStory = useMutation(api.story.creatStory);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
    },
  });

  // ~ ======= Handle submit ======= ~
  const handleSubmit = async (formData: z.infer<typeof formSchema>) => {
    console.log(formData);
  };

  useEffect(() => {
    form.reset();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create story</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full grid space-y-8 mt-4"
          >
            {/* ~ ======= Title ======= ~ */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full ">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus placeholder="My new story" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ~ ======= Description ======= ~ */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      {...field}
                      required
                      placeholder="New story description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ~ ======= Tags ======= ~ */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tags{" "}
                    <span className="text-muted-foreground text-sm">
                      (Optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <MultiSelector
                      values={field.value}
                      loop
                      className="w-full"
                      onValuesChange={field.onChange}
                    >
                      <MultiSelectorTrigger>
                        <MultiSelectorInput placeholder="Select tags for this story" />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          <MultiSelectorItem value="finance">
                            Finance
                          </MultiSelectorItem>
                          <MultiSelectorItem value="technology">
                            Technology
                          </MultiSelectorItem>
                          <MultiSelectorItem value="health">
                            Health
                          </MultiSelectorItem>
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button>Create Story</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
