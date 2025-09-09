import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const newsletterSchema = z.object({
  email: z.string()
    .min(1, "Please enter your email address")
    .email("Please enter a valid email address (e.g., name@example.com)")
    .refine((email) => email.includes('@'), "Please include '@' in your email address")
    .refine((email) => email.split('@')[1]?.includes('.'), "Please enter the domain after '@' (e.g., example.com)"),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

const Newsletter = () => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubscribe = async (values: NewsletterFormValues) => {
    setStatus("loading");
    const { error } = await supabase.from("newsletters").insert({ email: values.email });
    if (error) {
      setStatus("error");
    } else {
      setStatus("success");
      form.reset();
    }
  };

  return (
    <div className="py-12 bg-[#d0e0ec]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/4 mb-6 md:mb-0">
          </div>
          
          <div className="md:w-7/12">
            <h2 className="text-2xl font-bold mb-2 text-[#39536f]">Newsletter</h2>
            <p className="text-gray-700 mb-6">
              Subscribe To Our Newsletter Get Bonus For The Next Purchase
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubscribe)} className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          {...field}
                          type="email" 
                          placeholder="name@example.com" 
                          className="w-full bg-gray-200 border-0 focus:outline-none focus:border-2 focus:border-[#d0e0ec]"
                          disabled={status === "loading"}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
                <Button 
                  className="bg-[#39536f] hover:bg-[#2a405a] px-8"
                  type="submit"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </Form>

            {status === "success" && (
              <div className="mt-2 text-[#39536f] font-medium">
                You are now subscribed!
              </div>
            )}
            {status === "error" && (
              <div className="mt-2 text-[#39536f] font-medium">
                Something went wrong. Please try again.
              </div>
            )}
          </div>
          
          <div className="md:w-1/4 hidden md:block">
            <img 
              src="/lovable-uploads/mobile.webp" 
              loading="lazy"
              alt="Newsletter" 
              className="max-h-[200px] object-cover rounded-lg ml-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
