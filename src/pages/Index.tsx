
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import ProductShowcase from "@/components/sections/ProductShowcase";
import Footer from "@/components/sections/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <ProductShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
