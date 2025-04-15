
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import QualitativeAnalysis from "@/components/sections/QualitativeAnalysis";

const InsightConductor = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <QualitativeAnalysis />
      </main>
      <Footer />
    </div>
  );
};

export default InsightConductor;
