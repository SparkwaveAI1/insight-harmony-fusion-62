import React from 'react';
import { V4PersonaCreator } from '@/components/v4-system';
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

export function V4PersonaCreationPage() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6">
                <div className="flex items-center justify-between">
                  <SidebarTrigger className="hidden md:flex" />
                </div>
                
                <div className="max-w-4xl mx-auto px-4">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">V4 Persona Creation</h1>
                    <p className="text-lg text-gray-600 mt-2">
                      Next-generation persona creation with trait-scanning conversations (Grok-powered)
                    </p>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>V4 System:</strong> Advanced trait-scanning conversations powered by Grok for enhanced authenticity.
                      </p>
                    </div>
                  </div>

                  <V4PersonaCreator />

                  <div className="mt-8 text-center text-sm text-gray-500">
                    <p>V4 System - Advanced psychological modeling for authentic conversations</p>
                  </div>
                </div>
              </div>
            </main>
            <Footer />
            <Toaster />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}