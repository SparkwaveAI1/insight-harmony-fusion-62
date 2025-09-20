import React from 'react';
import { Brain, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { V4Persona } from '@/types/persona-v4';

interface TraitsDashboardProps {
  persona: V4Persona;
}

export function TraitsDashboard({ persona }: TraitsDashboardProps) {
  console.log('=== TRAITS DASHBOARD DEBUG ===');
  console.log('Motivation profile:', persona?.full_profile?.motivation_profile);
  console.log('Primary drivers:', persona?.full_profile?.motivation_profile?.primary_drivers);
  console.log('Bias profile:', persona?.full_profile?.bias_profile);
  console.log('=== END TRAITS DEBUG ===');

  return (
    <div className="space-y-8">
      {/* Big Five Personality - Not Available in V4 Schema */}
      <div className="text-center p-6 text-muted-foreground bg-muted/30 rounded-lg">
        <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Big Five personality data not available</p>
        <p className="text-xs mt-1">This persona uses behavioral profiling instead</p>
      </div>

      {/* Bias Profile */}
      {persona.full_profile?.bias_profile?.cognitive && (
        <div>
          <h4 className="text-lg font-semibold mb-4">Cognitive Bias Profile</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {Object.entries(persona.full_profile.bias_profile.cognitive).map(([bias, value]) => {
              const biasName = bias.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const percentage = Math.round((value as number) * 100);
              
              return (
                <div key={bias} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{biasName}</span>
                    <span className="text-sm text-muted-foreground">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
          {persona.full_profile.bias_profile.mitigations && persona.full_profile.bias_profile.mitigations.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Bias Mitigations:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {persona.full_profile.bias_profile.mitigations.map((mitigation: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {mitigation}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Personality Attributes */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Core Personality Attributes</h4>
        {(() => {
          const honestyValue = persona.full_profile?.truth_honesty_profile?.baseline_honesty || 0.5;
          const empathyValue = persona.full_profile?.prompt_shaping?.voice_foundation?.empathy_level || 0.5;
          const regulation = persona.full_profile?.emotional_profile?.emotional_regulation;
          const spendingStyle = persona.full_profile?.money_profile?.spending_style;
          const selfEfficacyValue = persona.full_profile?.motivation_profile?.goal_orientation?.strength || 0.5;
          
          // Calculate impulse control
          let impulseControl = 0.5;
          if (regulation === 'very_high' || regulation === 'high') impulseControl += 0.3;
          else if (regulation === 'low' || regulation === 'very_low') impulseControl -= 0.3;
          if (spendingStyle === 'frugal' || spendingStyle === 'conservative') impulseControl += 0.2;
          else if (spendingStyle === 'impulsive' || spendingStyle === 'extravagant') impulseControl -= 0.2;
          impulseControl = Math.max(0, Math.min(1, impulseControl));
          
          console.log('Personality attributes:', {
            honesty: honestyValue,
            empathy: empathyValue,
            impulseControl,
            selfEfficacy: selfEfficacyValue
          });

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Honesty */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Honesty</span>
                  <span className="text-sm text-muted-foreground">{Math.round(honestyValue * 100)}%</span>
                </div>
                <Progress value={honestyValue * 100} className="h-3" />
              </div>

              {/* Empathy */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Empathy</span>
                  <span className="text-sm text-muted-foreground">{Math.round(empathyValue * 100)}%</span>
                </div>
                <Progress value={empathyValue * 100} className="h-3" />
              </div>

              {/* Impulse Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Impulse Control</span>
                  <span className="text-sm text-muted-foreground">{Math.round(impulseControl * 100)}%</span>
                </div>
                <Progress value={impulseControl * 100} className="h-3" />
              </div>

              {/* Self-Efficacy */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Self-Efficacy</span>
                  <span className="text-sm text-muted-foreground">{Math.round(selfEfficacyValue * 100)}%</span>
                </div>
                <Progress value={selfEfficacyValue * 100} className="h-3" />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Motivations Display */}
      {persona.full_profile?.motivation_profile ? (
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Motivational Profile
          </h4>
          
          {/* Primary Drivers */}
          {persona.full_profile.motivation_profile.primary_drivers && (
            <div className="mb-6">
              <h5 className="text-base font-medium mb-3">Primary Drivers</h5>
              {(() => {
                const driversData = Object.entries(persona.full_profile.motivation_profile.primary_drivers)
                  .map(([key, value]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                    value: value as number,
                    percentage: Math.round((value as number) * 100)
                  }))
                  .sort((a, b) => b.value - a.value);
                
                console.log('Primary drivers data for chart:', driversData);
                
                return (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={driversData} layout="horizontal" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                        <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                        <YAxis dataKey="name" type="category" width={80} className="text-xs" />
                        <Tooltip formatter={(value, name) => [`${Math.round((value as number) * 100)}%`, 'Strength']} />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Current Goals */}
          {persona.full_profile.motivation_profile.goal_orientation?.primary_goals && (
            <div className="mb-6">
              <h5 className="text-base font-medium mb-3">Current Goals</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {persona.full_profile.motivation_profile.goal_orientation.primary_goals.map((goalObj: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <Target className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">{goalObj.goal}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Timeframe: {goalObj.timeframe || 'Unknown'}</span>
                          <span>•</span>
                          <span>Intensity: {Math.round((goalObj.intensity || 0.5) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground bg-muted/30 rounded-lg">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No motivational profile data available</p>
        </div>
      )}

      {/* Want vs Should Tensions */}
      {persona.full_profile?.motivation_profile?.want_vs_should_tension?.major_conflicts && 
       persona.full_profile.motivation_profile.want_vs_should_tension.major_conflicts.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Internal Tensions
          </h4>
          <div className="space-y-4">
            {persona.full_profile.motivation_profile.want_vs_should_tension.major_conflicts.map((conflict: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Badge variant="destructive" className="w-fit">WANT</Badge>
                    <p className="text-sm">{conflict.want}</p>
                  </div>
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-fit">SHOULD</Badge>
                    <p className="text-sm">{conflict.should}</p>
                  </div>
                </div>
                {conflict.trigger_conditions && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-xs font-medium text-muted-foreground">Triggers: </span>
                    <span className="text-xs text-muted-foreground">{Array.isArray(conflict.trigger_conditions) ? conflict.trigger_conditions.join(', ') : conflict.trigger_conditions}</span>
                  </div>
                )}
                {conflict.typical_resolution && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-muted-foreground">Typical Resolution: </span>
                    <span className="text-xs text-muted-foreground">{conflict.typical_resolution}</span>
                  </div>
                )}
              </Card>
            ))}
            {persona.full_profile.motivation_profile.want_vs_should_tension.default_resolution && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                <strong>Default Resolution Pattern:</strong> {persona.full_profile.motivation_profile.want_vs_should_tension.default_resolution}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contradiction Log Placeholder */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Contradiction Log</h4>
        <div className="text-center p-8 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed border-muted">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No contradictions logged yet</p>
          <p className="text-xs mt-1">Personality tensions will be tracked here during conversations</p>
        </div>
      </div>

      {!persona.full_profile?.bias_profile && !persona.full_profile?.motivation_profile && (
        <div className="text-center p-8 text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No personality traits data available</p>
        </div>
      )}
    </div>
  );
}