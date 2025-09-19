import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { runEnhanceTest } from '@/utils/testEnhanceFunction';

export default function TestEnhance() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const testResult = await runEnhanceTest();
      setResult(testResult);
    } catch (error) {
      console.error('Test failed:', error);
      setResult({ error: 'Test failed: ' + error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Persona Enhancement Function</h1>
      
      <Button onClick={handleTest} disabled={loading}>
        {loading ? 'Testing...' : 'Test Enhancement on Nico Vargas'}
      </Button>

      {result && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Test Results:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}