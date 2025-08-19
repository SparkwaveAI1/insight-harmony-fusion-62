import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="pt-24 p-8">
          <h1 className="text-4xl font-bold text-center mb-8">TEST - HOMEPAGE IS WORKING</h1>
          <div className="text-center text-xl">
            <p>If you can see this text, the homepage is rendering.</p>
            <p>If you can't see this, there's a deeper routing issue.</p>
          </div>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Index;