const HeroSection = ({ onGenerate, isGenerating }: { onGenerate: () => void; isGenerating: boolean }) => {
  return (
    <div className="container px-4 mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">
          Build a Simulated Persona
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Use natural language to generate a realistic AI persona. Our system parses your input, rolls traits, and returns a fully interactive research subject—ready for interviews, group tests, or scenario simulations.
        </p>
        <div className="bg-muted p-6 rounded-lg mb-8">
          <div className="mb-4">
            <label htmlFor="persona-prompt" className="block text-sm font-medium mb-2">
              Describe your persona
            </label>
            <textarea
              id="persona-prompt"
              className="w-full p-3 border rounded-md h-32 bg-background"
              placeholder="Example: Crypto-savvy Gen Z woman, skeptical of authority, loves sustainability"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onGenerate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Generating...
                </>
              ) : (
                <>Generate Persona</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
