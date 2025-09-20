import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Download, FileText } from 'lucide-react';
import { useState } from 'react';

const SAMPLE_PERSONA_JSON = {
  "identity": {
    "name": "Sarah Martinez",
    "age": 32,
    "gender": "female",
    "pronouns": "she/her",
    "ethnicity": "Hispanic",
    "nationality": "American",
    "occupation": "Digital Marketing Manager",
    "relationship_status": "married",
    "dependents": 1,
    "education_level": "bachelor's degree",
    "income_bracket": "75000-99999",
    "location": {
      "city": "Austin",
      "region": "Texas",
      "country": "United States",
      "urbanicity": "urban"
    }
  },
  "daily_life": {
    "primary_activities": {
      "work": 8,
      "family_time": 4,
      "personal_care": 2,
      "personal_interests": 2,
      "social_interaction": 2
    },
    "schedule_blocks": [
      {
        "start": "07:00",
        "end": "08:30",
        "activity": "morning routine",
        "setting": "home"
      },
      {
        "start": "09:00",
        "end": "17:00",
        "activity": "work",
        "setting": "office"
      },
      {
        "start": "18:00",
        "end": "20:00",
        "activity": "family time",
        "setting": "home"
      }
    ],
    "time_sentiment": {
      "work": "engaged but sometimes stressed",
      "family": "fulfilled and happy",
      "personal": "rushed but necessary"
    },
    "screen_time_summary": "High during work hours for productivity tools, moderate personal use for social media and streaming",
    "mental_preoccupations": [
      "work project deadlines",
      "daughter's school activities",
      "household management"
    ]
  },
  "health_profile": {
    "bmi_category": "normal",
    "chronic_conditions": [],
    "mental_health_flags": ["mild anxiety"],
    "medications": [],
    "adherence_level": "good",
    "sleep_hours": 7,
    "substance_use": {
      "alcohol": "occasionally",
      "cigarettes": "never",
      "vaping": "never",
      "marijuana": "never"
    },
    "fitness_level": "moderate",
    "diet_pattern": "balanced with occasional indulgences"
  },
  "relationships": {
    "household": {
      "status": "married with child",
      "harmony_level": "high",
      "dependents": 1
    },
    "caregiving_roles": ["parent"],
    "friend_network": {
      "size": "medium",
      "frequency": "weekly",
      "anchor_contexts": ["work", "neighborhood", "online"]
    },
    "pets": ["dog"]
  },
  "money_profile": {
    "attitude_toward_money": "practical and security-focused",
    "earning_context": "steady salary with performance bonuses",
    "spending_style": "thoughtful with occasional impulse purchases",
    "savings_investing_habits": {
      "emergency_fund_months": 4,
      "retirement_contributions": "employer match plus extra",
      "investing_style": "conservative index funds"
    },
    "debt_posture": "manageable mortgage and car payment",
    "financial_stressors": ["childcare costs", "home maintenance"],
    "money_conflicts": "occasional disagreements with spouse about discretionary spending",
    "generosity_profile": "gives to causes she cares about when financially comfortable"
  },
  "motivation_profile": {
    "primary_motivation_labels": ["family security", "professional growth", "work-life balance"],
    "deal_breakers": ["unethical business practices", "excessive work demands that impact family"],
    "primary_drivers": {
      "care": 8,
      "family": 9,
      "status": 5,
      "mastery": 7,
      "meaning": 6,
      "novelty": 4,
      "security": 8,
      "belonging": 7,
      "self_interest": 5
    },
    "goal_orientation": {
      "strength": 7,
      "time_horizon": "medium-term",
      "primary_goals": ["career advancement", "family stability", "home ownership"],
      "goal_flexibility": 6
    },
    "want_vs_should_tension": {
      "major_conflicts": ["more personal time vs family responsibilities", "career advancement vs work-life balance"],
      "default_resolution": "prioritize family needs first, then personal goals"
    }
  },
  "communication_style": {
    "regional_register": {
      "region": "Southwest",
      "urbanicity": "urban",
      "dialect_hints": ["y'all", "fixin' to"]
    },
    "voice_foundation": {
      "formality": "moderate",
      "directness": "balanced",
      "pace_rhythm": "steady",
      "positivity": "optimistic",
      "empathy_level": 8,
      "honesty_style": "diplomatic",
      "charisma_level": 6
    },
    "style_markers": {
      "metaphor_domains": ["sports", "nature", "family"],
      "aphorism_register": "contemporary",
      "storytelling_vs_bullets": 6,
      "humor_style": "warm and inclusive",
      "code_switching_contexts": ["work", "social", "family"]
    },
    "context_switches": {
      "work": {
        "formality": "professional",
        "directness": "clear and diplomatic"
      },
      "home": {
        "formality": "casual",
        "directness": "warm and honest"
      },
      "online": {
        "formality": "casual-professional",
        "directness": "thoughtful"
      }
    },
    "authenticity_filters": {
      "avoid_registers": ["overly corporate", "dismissive"],
      "embrace_registers": ["collaborative", "solution-oriented"],
      "personality_anchors": ["family-first", "growth-minded", "community-oriented"]
    }
  },
  "humor_profile": {
    "frequency": "moderate",
    "style": ["observational", "self-deprecating", "wordplay"],
    "boundaries": ["no offensive content", "family-friendly"],
    "targets": ["daily life situations", "work quirks", "parenting moments"],
    "use_cases": ["break tension", "connect with others", "lighten mood"]
  },
  "truth_honesty_profile": {
    "baseline_honesty": 8,
    "situational_variance": {
      "work": 8,
      "home": 9,
      "public": 7
    },
    "typical_distortions": ["white lies to spare feelings", "optimistic framing"],
    "red_lines": ["lying about important matters", "misleading clients"],
    "pressure_points": ["protecting family", "maintaining professional reputation"],
    "confession_style": "gradual revelation with context"
  },
  "bias_profile": {
    "cognitive": {
      "status_quo": 6,
      "loss_aversion": 7,
      "confirmation": 5,
      "anchoring": 6,
      "availability": 5,
      "optimism": 7,
      "sunk_cost": 4,
      "overconfidence": 3
    },
    "mitigations": ["seeks multiple perspectives", "data-driven decisions"]
  },
  "cognitive_profile": {
    "verbal_fluency": 7,
    "abstract_reasoning": 6,
    "problem_solving_orientation": "collaborative",
    "thought_coherence": 8
  },
  "emotional_profile": {
    "stress_responses": ["problem-solving", "seeking support"],
    "negative_triggers": ["feeling overwhelmed", "family conflict", "work criticism"],
    "positive_triggers": ["family achievements", "work recognition", "helping others"],
    "explosive_triggers": ["threats to family", "perceived unfairness"],
    "emotional_regulation": "generally good with occasional overwhelm"
  },
  "attitude_narrative": "Optimistic and family-focused professional who values balance, growth, and community connection",
  "political_narrative": "Moderate liberal with focus on family values, education, and community development",
  "adoption_profile": {
    "buyer_power": 6,
    "adoption_influence": 7,
    "risk_tolerance": 4,
    "change_friction": 5,
    "expected_objections": ["cost concerns", "time investment", "impact on family"],
    "proof_points_needed": ["testimonials", "data on outcomes", "trial periods"]
  },
  "prompt_shaping": {
    "voice_foundation": {
      "formality": "moderate",
      "directness": "balanced",
      "pace_rhythm": "steady",
      "positivity": "optimistic",
      "empathy_level": 8
    },
    "style_markers": {
      "metaphor_domains": ["sports", "nature", "family"],
      "humor_style": "warm and inclusive",
      "storytelling_vs_bullets": 6
    },
    "primary_motivations": ["family security", "professional growth", "work-life balance"],
    "deal_breakers": ["unethical practices", "family impact"],
    "honesty_vector": {
      "baseline": 8,
      "work": 8,
      "home": 9,
      "public": 7,
      "distortions": ["white lies to spare feelings"]
    },
    "bias_vector": {
      "top_cognitive": ["loss_aversion", "optimism"],
      "top_social": ["in-group favoritism"],
      "mitigation_playbook": ["seek multiple perspectives", "data-driven approach"]
    },
    "context_switches": {
      "work": "professional and collaborative",
      "home": "warm and nurturing",
      "online": "thoughtful and authentic"
    },
    "current_focus": "balancing career growth with family responsibilities"
  }
};

export function PersonaJsonUploadHelp() {
  const [showSample, setShowSample] = useState(false);

  const downloadSample = () => {
    const dataStr = JSON.stringify(SAMPLE_PERSONA_JSON, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'sample-persona.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          JSON Format Guide
        </CardTitle>
        <CardDescription>
          Understand the expected persona JSON structure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={downloadSample} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Sample JSON
          </Button>
          
          <Collapsible open={showSample} onOpenChange={setShowSample}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <ChevronDown className="h-4 w-4 mr-2" />
                {showSample ? 'Hide' : 'View'} Sample Structure
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-xs overflow-auto max-h-96">
                  {JSON.stringify(SAMPLE_PERSONA_JSON, null, 2)}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="space-y-2 text-sm">
          <h4 className="font-medium">Required Sections:</h4>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li><strong>identity:</strong> Basic demographic and personal information</li>
            <li><strong>daily_life:</strong> Schedule, activities, and mental preoccupations</li>
            <li><strong>health_profile:</strong> Physical and mental health information</li>
            <li><strong>relationships:</strong> Family, friends, and social connections</li>
            <li><strong>money_profile:</strong> Financial attitudes and behaviors</li>
            <li><strong>motivation_profile:</strong> Goals, drivers, and motivations</li>
            <li><strong>communication_style:</strong> How they express themselves</li>
            <li><strong>humor_profile:</strong> Sense of humor and boundaries</li>
            <li><strong>truth_honesty_profile:</strong> Honesty patterns and tendencies</li>
            <li><strong>bias_profile:</strong> Cognitive biases and mitigations</li>
            <li><strong>cognitive_profile:</strong> Thinking patterns and abilities</li>
            <li><strong>emotional_profile:</strong> Emotional responses and triggers</li>
            <li><strong>attitude_narrative:</strong> Overall worldview summary</li>
            <li><strong>political_narrative:</strong> Political views and values</li>
            <li><strong>adoption_profile:</strong> How they adopt new things</li>
            <li><strong>prompt_shaping:</strong> AI interaction guidelines</li>
          </ul>
        </div>
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-medium text-blue-900 mb-1">Note:</p>
          <p className="text-blue-800">
            After upload, the system will automatically generate a profile image 
            based on the identity section and add the persona to your selected collections.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}