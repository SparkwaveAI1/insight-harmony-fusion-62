
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import ContactForm from "@/components/contact/ContactForm";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-plasmik">
                  Get in Touch with PersonaAI
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Have questions about our AI research platform? Looking to partner with us or learn more about investment opportunities? We're here to help. Fill out the form below and our team will get back to you shortly.
                </p>
              </div>

              <div className="bg-white/50 shadow-sm border border-border rounded-xl p-8">
                <ContactForm formType="contact" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Contact;
