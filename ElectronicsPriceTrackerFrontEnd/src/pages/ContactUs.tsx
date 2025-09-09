import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";

const contactSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.string()
    .min(1, "Please enter your email address")
    .email("Please enter a valid email address (e.g., name@example.com)")
    .refine((email) => email.includes('@'), "Please include '@' in your email address")
    .refine((email) => email.split('@')[1]?.includes('.'), "Please enter the domain after '@' (e.g., example.com)"),
  subject: z.string().min(1, "Please enter a subject"),
  message: z.string().min(1, "Please enter your message"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const ContactUs: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      // Here you would typically send the form data to your backend
      console.log("Form submitted:", values);
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });

      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-[#39536f] text-white py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6">
            Get in Touch
          </h1>
          <p className="text-lg sm:text-xl text-center max-w-3xl mx-auto text-gray-200">
            Have questions or suggestions? We'd love to hear from you. Our team is here to help and improve your shopping experience.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#39536f] mb-6">
              Send Us a Message
            </h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Your Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John Doe"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="john@example.com"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Subject</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="How can we help?"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell us more about your inquiry..."
                          className="w-full min-h-[150px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#39536f] hover:bg-[#2d4055] text-white py-6 text-base"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Quick Contact */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#39536f] mb-6">
                Quick Contact
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#e6eef1] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#39536f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-[#39536f]">Email Us</h3>
                    <p className="text-gray-600">support@hardwarepricetracker.com</p>
                    <p className="text-gray-600">info@hardwarepricetracker.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#39536f] mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-[#39536f] mb-2">
                    How accurate are the price predictions?
                  </h3>
                  <p className="text-gray-600">
                    Our price predictions are based on historical data analysis and market trends. While we strive for accuracy, we recommend using them as a guide rather than a guarantee.
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-[#39536f] mb-2">
                    How often are prices updated?
                  </h3>
                  <p className="text-gray-600">
                    We update our price database multiple times daily to ensure you have access to the most current pricing information.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#39536f] mb-2">
                    Can I suggest a new retailer to track?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely! We're always looking to expand our coverage. Use the contact form above to suggest new retailers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ContactUs;
