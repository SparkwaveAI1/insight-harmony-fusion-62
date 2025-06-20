
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { OpenAIService } from '@/services/ai/openaiService';

const OpenAITester = () => {
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [response, setResponse] = useState('');
  const [testPrompt, setTestPrompt] = useState('Say hello and confirm the API is working correctly.');

  const testOpenAIConnection = async () => {
    setTestResult('testing');
    setErrorMessage('');
    setResponse('');
    
    try {
      const result = await OpenAIService.generateCompletion(testPrompt);
      setResponse(result);
      setTestResult('success');
    } catch (error) {
      console.error('OpenAI test failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setTestResult('error');
    }
  };

  const resetTest = () => {
    setTestResult('idle');
    setErrorMessage('');
    setResponse('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {testResult === 'testing' && <Loader2 className="h-5 w-5 animate-spin" />}
          {testResult === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {testResult === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
          OpenAI API Connection Test
        </CardTitle>
        <CardDescription>
          Test your OpenAI API key to ensure it's working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="test-prompt" className="block text-sm font-medium mb-2">
            Test Prompt
          </label>
          <Input
            id="test-prompt"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Enter a test prompt..."
            disabled={testResult === 'testing'}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={testOpenAIConnection}
            disabled={testResult === 'testing' || !testPrompt.trim()}
            className="flex-1"
          >
            {testResult === 'testing' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test API Connection'
            )}
          </Button>
          
          {testResult !== 'idle' && (
            <Button onClick={resetTest} variant="outline">
              Reset
            </Button>
          )}
        </div>

        {testResult === 'success' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Success!</strong> Your OpenAI API key is working correctly.
            </AlertDescription>
          </Alert>
        )}

        {testResult === 'error' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {response && (
          <div>
            <label className="block text-sm font-medium mb-2">Response:</label>
            <Textarea
              value={response}
              readOnly
              className="min-h-[100px] bg-muted"
              placeholder="API response will appear here..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OpenAITester;
