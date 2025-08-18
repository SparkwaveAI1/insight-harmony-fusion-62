import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { runVoicepackTests, TestResult } from '../../services/voicepack/testing';

export const VoicepackTestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      const testResults = await runVoicepackTests();
      setResults(testResults);
      setLastRunTime(new Date());
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🧪 Voicepack Test Suite
              {lastRunTime && (
                <Badge variant="outline" className="ml-2">
                  Last run: {lastRunTime.toLocaleTimeString()}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Integration tests for PersonaV2 → VoicepackRuntime compilation
            </CardDescription>
          </div>
          <Button 
            onClick={handleRunTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {results.length > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                Test Results: {passedCount}/{totalCount} passed
              </span>
              {passedCount === totalCount ? (
                <Badge className="bg-green-100 text-green-800">All Passed</Badge>
              ) : (
                <Badge variant="destructive">
                  {totalCount - passedCount} Failed
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {results.map((result, index) => (
            <Card key={index} className={result.passed ? 'border-green-200' : 'border-red-200'}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(result.passed)}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{result.testName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.details}
                      </p>
                      
                      {result.metrics && (
                        <div className="mt-3 p-2 bg-muted rounded text-xs">
                          <strong>Metrics:</strong>
                          <pre className="mt-1 whitespace-pre-wrap">
                            {JSON.stringify(result.metrics, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {results.length === 0 && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Click "Run Tests" to start the voicepack test suite</p>
          </div>
        )}

        {isRunning && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Running integration tests...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};