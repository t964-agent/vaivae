"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { toast } from "@/lib/toast";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  HStack,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Skeleton,
  Spinner,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  VisuallyHidden,
} from "@/components/ui";

type PreviewFormValues = {
  email: string;
  message: string;
  consent: boolean;
};

function PreviewSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="border border-on-light/10 bg-cream p-5 shadow-fine">
      <h2 className="mb-5 font-display text-2xl font-light tracking-[-0.04em] italic">{title}</h2>
      {children}
    </section>
  );
}

/** Temporary visual smoke-test page for the Agent 9 primitive set. */
function PreviewUiShowcase() {
  const [checked, setChecked] = useState(true);
  const [density, setDensity] = useState("editorial");
  const form = useForm<PreviewFormValues>({
    defaultValues: {
      consent: true,
      email: "",
      message: "",
    },
  });

  const handleSubmit = (values: PreviewFormValues) => {
    toast.success(values.email ? `Preview ready for ${values.email}` : "Preview form submitted");
  };

  return (
    <main className="min-h-dvh bg-cream py-16 text-on-light" id="main-content">
      <Container variant="wide">
        <Stack gap={10}>
          <Stack gap={3}>
            <Badge variant="accent">Primitive Library</Badge>
            <h1 className="font-display text-[clamp(3.5rem,9vw,8rem)] leading-[0.95] font-light tracking-[-0.055em] italic">
              vaïvae UI Preview
            </h1>
            <p className="max-w-2xl text-base leading-7 text-on-light/65">
              Temporary noindex route for verifying the headless, brand-aware primitives.
            </p>
          </Stack>

          <div className="grid gap-6 lg:grid-cols-2">
            <PreviewSection title="Buttons, badges, feedback">
              <Stack gap={6}>
                <HStack gap={3} wrap>
                  <Button>Primary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="underline">Underline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button loading>Loading</Button>
                  <Button size="icon" variant="ghost">
                    <VisuallyHidden>Icon button</VisuallyHidden>
                    <span aria-hidden>V</span>
                  </Button>
                </HStack>
                <HStack className="bg-oxblood p-4" gap={3} wrap>
                  <Button tone="on-dark">On dark</Button>
                  <Button tone="on-dark" variant="ghost">
                    Ghost
                  </Button>
                  <Button tone="on-dark" variant="underline">
                    Underline
                  </Button>
                </HStack>
                <HStack gap={2} wrap>
                  <Badge>Neutral</Badge>
                  <Badge variant="accent">Accent</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                </HStack>
                <HStack gap={4}>
                  <Spinner />
                  <Skeleton className="max-w-64" />
                </HStack>
                <Button onClick={() => toast.info("Toast wrapper is ready")} variant="ghost">
                  Trigger toast
                </Button>
              </Stack>
            </PreviewSection>

            <PreviewSection title="Inputs and form">
              <Form {...form}>
                <form className="grid gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="atelier@vaivae.com" type="email" {...field} />
                        </FormControl>
                        <FormDescription>
                          Visible labels, helper text, and errors share ids.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                    rules={{ required: "Email is required" }}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Notes for the atelier" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex-row items-center gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(value) => field.onChange(value === true)}
                          />
                        </FormControl>
                        <FormLabel className="normal-case">Receive editorial updates</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Label htmlFor="standalone-input">Standalone label</Label>
                  <Input id="standalone-input" placeholder="Standalone input" />
                  <Button type="submit">Submit preview</Button>
                </form>
              </Form>
            </PreviewSection>

            <PreviewSection title="Dialog and drawer">
              <HStack gap={3} wrap>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost">Open dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editorial modal</DialogTitle>
                      <DialogDescription>
                        Radix handles focus trap, labelling, escape close, and return focus.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="ghost">Close</Button>
                      </DialogClose>
                      <Button>Continue</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="ghost">Open drawer</Button>
                  </DrawerTrigger>
                  <DrawerContent side="right">
                    <DrawerHeader>
                      <DrawerTitle>Cart drawer substrate</DrawerTitle>
                      <DrawerDescription>
                        Side sheet primitive for cart and mobile navigation.
                      </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="ghost">Close drawer</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </HStack>
            </PreviewSection>

            <PreviewSection title="Popover, dropdown, tooltip">
              <TooltipProvider>
                <HStack gap={3} wrap>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost">Popover</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Stack gap={2}>
                        <p className="text-sm font-medium">Material note</p>
                        <p className="text-sm leading-6 text-on-light/65">
                          Popovers host interactive or structured content.
                        </p>
                      </Stack>
                    </PopoverContent>
                  </Popover>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">Dropdown</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Sort</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
                        <DropdownMenuRadioItem value="editorial">Editorial</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
                        Include archived
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Nested</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem>Sub item</DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost">Tooltip</Button>
                    </TooltipTrigger>
                    <TooltipContent>Non-interactive hint</TooltipContent>
                  </Tooltip>
                </HStack>
              </TooltipProvider>
            </PreviewSection>

            <PreviewSection title="Tabs, accordion, checkbox">
              <Stack gap={6}>
                <Tabs defaultValue="story">
                  <TabsList>
                    <TabsTrigger value="story">Story</TabsTrigger>
                    <TabsTrigger value="fit">Fit</TabsTrigger>
                  </TabsList>
                  <TabsContent value="story">
                    A restrained tab panel with underline state.
                  </TabsContent>
                  <TabsContent value="fit">Fit notes and care instructions live here.</TabsContent>
                </Tabs>

                <Accordion collapsible defaultValue="materials" type="single">
                  <AccordionItem value="materials">
                    <AccordionHeader>
                      <AccordionTrigger>Materials</AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                      Oxblood silk, structured cotton, quiet hardware.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="care">
                    <AccordionHeader>
                      <AccordionTrigger>Care</AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                      Dry clean only. Store away from direct light.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <HStack gap={3}>
                  <Checkbox
                    checked={checked}
                    id="preview-checkbox"
                    onCheckedChange={(value) => setChecked(value === true)}
                  />
                  <Label htmlFor="preview-checkbox">Standalone checkbox</Label>
                </HStack>
                <Separator />
                <HStack className="h-8" gap={4}>
                  <span className="text-sm">Left</span>
                  <Separator orientation="vertical" />
                  <span className="text-sm">Right</span>
                </HStack>
              </Stack>
            </PreviewSection>
          </div>
        </Stack>
      </Container>
    </main>
  );
}

export { PreviewUiShowcase };
