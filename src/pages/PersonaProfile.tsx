import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Plus, FileText, BarChart3, Edit, Clock, Brain, Home, Heart, DollarSign, Activity, AlertTriangle, CheckCircle, Users, PawPrint, Target, Download, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { V4Persona } from '@/types/persona-v4';
import { getV4PersonaById } from '@/services/v4-persona';
import { getPersonaAge, getPersonaLocation, getPersonaBackgroundDescription, getPersonaDisplayName } from '@/utils/personaDisplayUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TraitsDashboard } from '@/components/TraitsDashboard';

interface PersonaCollection {
  collection_id: string;
  name: string;
}

function PersonaProfile() {
  const { personaId } = useParams<{ personaId: string }>();
  console.log('Route params:', useParams());
  console.log('Extracted personaId:', personaId);
  const navigate = useNavigate();
  const [persona, setPersona] = useState<V4Persona | null>(null);
  const [collections, setCollections] = useState<PersonaCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const loadData = async () => {
      if (personaId) {
        console.log('Loading persona...');
        await loadPersona(personaId);
        await loadCollections(personaId);
      }
    };
    loadData();
  }, [personaId]);

  const loadPersona = async (personaId: string) => {
    try {
      setIsLoading(true);
      const personaData = await getV4PersonaById(personaId);
      console.log('Loaded persona data:', personaData);
      
      if (!personaData) {
        toast.error('Persona not found');
        navigate('/persona-library');
        return;
      }

      setPersona(personaData);
    } catch (error) {
      console.error('Error loading persona:', error);
      toast.error('Failed to load persona');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollections = async (personaId: string) => {
    try {
      const { data, error } = await supabase
        .from('collection_personas')
        .select(`
          collection_id,
          collections!inner(name)
        `)
        .eq('persona_id', personaId);

      if (error) throw error;

      const collectionData = data?.map(item => ({
        collection_id: item.collection_id,
        name: (item.collections as any).name
      })) || [];

      setCollections(collectionData);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const generateDescription = (persona: V4Persona): string => {
    // V4 personas don't have a description field, generate from other data
    
    // Generate from attitude_narrative + current_focus
    const attitude = persona.full_profile?.attitude_narrative || '';
    const focus = persona.full_profile?.prompt_shaping?.current_focus || '';
    
    if (attitude && focus) {
      return `${attitude.slice(0, 200)}... Currently focused on: ${focus}`;
    }
    
    if (attitude) {
      return attitude.slice(0, 400);
    }
    
    return 'No description available.';
  };

  const generateBackground = (persona: V4Persona): string => {
    // Generate background from attitude_narrative + life details
    const attitude = persona.full_profile?.attitude_narrative || '';
    const identity = persona.full_profile?.identity;
    const relationships = persona.full_profile?.relationships;
    const money = persona.full_profile?.money_profile;
    
    let background = '';
    
    if (attitude) {
      background = attitude;
    }
    
    // Add formative life details if available
    if (identity?.occupation) {
      background += ` Their career as a ${identity.occupation} has shaped their worldview.`;
    }
    
    if (relationships?.household?.status) {
      background += ` Their ${relationships.household.status} has influenced their life priorities.`;
    }
    
    if (money?.attitude_toward_money) {
      background += ` Their relationship with money reflects ${money.attitude_toward_money}.`;
    }
    
    return background.slice(0, 900);
  };

  const getCharacterCount = (text: string, limit: number) => {
    const count = text.length;
    const percentage = (count / limit) * 100;
    
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  // Computed indices
  const calculateFinancialStressIndex = (persona: V4Persona): number => {
    const money = persona.full_profile?.money_profile;
    if (!money) return 0;
    
    const stressors = money.financial_stressors?.length || 0;
    const emergencyFund = money.savings_investing_habits?.emergency_fund_months || 0;
    const debtPosture = money.debt_posture;
    
    let stress = stressors * 20; // Each stressor adds 20%
    if (emergencyFund < 3) stress += 30; // Low emergency fund
    if (debtPosture === 'high_debt' || debtPosture === 'struggling') stress += 25;
    
    return Math.min(100, stress);
  };

  const calculateWellbeingIndex = (persona: V4Persona): number => {
    const health = persona.full_profile?.health_profile;
    if (!health) return 50; // Default neutral
    
    let wellbeing = 50;
    const sleepHours = health.sleep_hours || 7;
    const mentalFlags = health.mental_health_flags?.length || 0;
    
    // Sleep optimization (7-8 hours optimal)
    if (sleepHours >= 7 && sleepHours <= 8) wellbeing += 20;
    else if (sleepHours >= 6 && sleepHours <= 9) wellbeing += 10;
    else wellbeing -= 15;
    
    // Mental health impact
    wellbeing -= mentalFlags * 15;
    
    // Fitness level impact
    if (health.fitness_level === 'high' || health.fitness_level === 'very_active') wellbeing += 20;
    else if (health.fitness_level === 'moderate') wellbeing += 10;
    else if (health.fitness_level === 'low' || health.fitness_level === 'sedentary') wellbeing -= 10;
    
    return Math.max(0, Math.min(100, wellbeing));
  };

  // Export Functions
  const handleExportJSON = () => {
    if (!persona) return;
    
    const dataStr = JSON.stringify(persona, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${persona.name.replace(/\s+/g, '_')}_persona_profile.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-6"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Persona Not Found</h1>
          <Button onClick={() => navigate('/persona-library')}>
            Return to Library
          </Button>
        </div>
      </div>
    );
  }

  const displayName = getPersonaDisplayName(persona);
  const age = getPersonaAge(persona);
  const location = getPersonaLocation(persona);
  const description = generateDescription(persona);

  // Debug logging for data visualization
  console.log('=== PERSONA DATA DEBUG ===');
  console.log('Full persona object:', persona);
  console.log('Motivation profile:', persona?.full_profile?.motivation_profile);
  console.log('Primary drivers:', persona?.full_profile?.motivation_profile?.primary_drivers);
  console.log('Bias profile:', persona?.full_profile?.bias_profile);
  console.log('=== END DEBUG ===');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/persona-library')}
              className="gap-2 p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Library
            </Button>
            <span>/</span>
            <span className="text-foreground font-medium">{displayName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-4 w-4 mr-1" />
              View Similar
            </Button>
          </div>
        </div>

        {/* Identity Header - Always Visible */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar/Photo */}
            <div className="flex-shrink-0">
              {persona.profile_image_url ? (
                <img 
                  src={persona.profile_image_url} 
                  alt={`${displayName} profile`}
                  className="w-32 h-32 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center border">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Name + Description */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                {age && (
                  <div className="text-lg text-muted-foreground mb-2">
                    {age} years old {location && `• ${location}`}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Description</span>
                    <span className={`text-xs ${getCharacterCount(description, 400)}`}>
                      {description.length}/400 characters
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>

              {/* Collection Badges */}
              {collections.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {collections.map((collection) => (
                    <Badge 
                      key={collection.collection_id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => navigate(`/collection/${collection.collection_id}`)}
                    >
                      {collection.name}
                    </Badge>
                  ))}
                </div>
              )}

              {collections.length === 0 && (
                <Badge variant="outline">No collections</Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Study
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to Study</DialogTitle>
                    <DialogDescription>
                      Study functionality coming soon. You'll be able to add personas to research studies for comparative analysis.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Compare
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Compare Personas</DialogTitle>
                    <DialogDescription>
                      Comparison functionality coming soon. You'll be able to select multiple personas for side-by-side comparison.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleExportJSON}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF (Coming Soon)
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV (Coming Soon)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Edit mode coming soon. You'll be able to modify persona traits and details directly.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge & Memory</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="space-y-4">
              <CollapsibleSection title="Background & Demographics" defaultOpen>
            <div className="space-y-6">
              {/* Background Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Background</h4>
                  <span className={`text-xs ${getCharacterCount(generateBackground(persona), 900)}`}>
                    {generateBackground(persona).length}/900 characters
                  </span>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {generateBackground(persona) || 'No background information available.'}
                  </p>
                </div>
              </div>

              {/* Demographics Grid */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Demographics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Age:</span>
                      <span className="text-sm">
                        {age || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Gender:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.gender || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Pronouns:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.pronouns || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Ethnicity:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.ethnicity || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Nationality:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.nationality || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Location:</span>
                      <span className="text-sm">
                        {location || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Education Level:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.education_level || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Occupation:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.occupation || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Income Bracket:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.income_bracket || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Relationship Status:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.relationship_status || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Dependents:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.dependents !== undefined 
                          ? persona.full_profile.identity.dependents 
                          : <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Daily Life Snapshot">
            <div className="space-y-6">
              {/* Activity Chart */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Daily Time Allocation
                </h4>
                {persona.full_profile?.daily_life?.primary_activities ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(persona.full_profile.daily_life.primary_activities).map(([key, value]) => ({
                              name: key.replace(/_/g, ' '),
                              value: value as number,
                              hours: value as number
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {Object.entries(persona.full_profile.daily_life.primary_activities).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 45 + 200}, 70%, 50%)`} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value} hours`, 'Time']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(persona.full_profile.daily_life.primary_activities).map(([key, value], index) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: `hsl(${index * 45 + 200}, 70%, 50%)` }}
                            />
                            <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                          </div>
                          <span className="text-sm font-medium">{value} hrs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No activity data available</div>
                )}
              </div>

              {/* Screen Time Summary */}
              {persona.full_profile?.daily_life?.screen_time_summary && (
                <div>
                  <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Screen Time
                  </h4>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {persona.full_profile.daily_life.screen_time_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Mental Preoccupations */}
              {persona.full_profile?.daily_life?.mental_preoccupations && (
                <div>
                  <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Mental Preoccupations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {persona.full_profile.daily_life.mental_preoccupations.map((preoccupation, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {preoccupation}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!persona.full_profile?.daily_life && (
                <div className="text-muted-foreground">No daily life data available</div>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Home Life & Relationships">
            <div className="space-y-6">
              {/* Household Info */}
              {persona.full_profile?.relationships?.household && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Household
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Status:</span>
                      <span className="text-sm capitalize">
                        {persona.full_profile.relationships.household.status?.replace(/_/g, ' ') || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Harmony:</span>
                      <span className="text-sm capitalize">
                        {persona.full_profile.relationships.household.harmony_level || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Dependents:</span>
                      <span className="text-sm">
                        {persona.full_profile.relationships.household.dependents ?? 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pets */}
              <div>
                <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <PawPrint className="h-5 w-5" />
                  Pets
                </h4>
                {persona.full_profile?.relationships?.pets && persona.full_profile.relationships.pets.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {persona.full_profile.relationships.pets.map((pet, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <PawPrint className="h-3 w-3 mr-1" />
                        {typeof pet === 'string' ? pet : (pet as any)?.name || 'Pet'}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">No pets</div>
                )}
              </div>

              {/* Friend Network */}
              {persona.full_profile?.relationships?.friend_network && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Social Network
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Network Size:</span>
                        <span className="text-sm capitalize">
                          {persona.full_profile.relationships.friend_network.size || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Contact Frequency:</span>
                        <span className="text-sm capitalize">
                          {persona.full_profile.relationships.friend_network.frequency || 'Not specified'}
                        </span>
                      </div>
                    </div>
                    {persona.full_profile.relationships.friend_network.anchor_contexts && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground mb-2 block">Social Contexts:</span>
                        <div className="flex flex-wrap gap-2">
                          {persona.full_profile.relationships.friend_network.anchor_contexts.map((context, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {context}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Caregiving Roles */}
              {persona.full_profile?.relationships?.caregiving_roles && persona.full_profile.relationships.caregiving_roles.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Caregiving Responsibilities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {persona.full_profile.relationships.caregiving_roles.map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Heart className="h-3 w-3 mr-1" />
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!persona.full_profile?.relationships && (
                <div className="text-muted-foreground">No relationship data available</div>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Money & Health">
            <div className="space-y-6">
              {/* Computed Indices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Financial Stress Index
                    </h4>
                    <span className="text-2xl font-bold">{calculateFinancialStressIndex(persona)}%</span>
                  </div>
                  <Progress value={calculateFinancialStressIndex(persona)} className="h-2" />
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Wellbeing Index
                    </h4>
                    <span className="text-2xl font-bold">{calculateWellbeingIndex(persona)}%</span>
                  </div>
                  <Progress value={calculateWellbeingIndex(persona)} className="h-2" />
                </Card>
              </div>

              {/* Money Profile */}
              {persona.full_profile?.money_profile && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Profile
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground block mb-1">Spending Style</span>
                        <span className="text-sm capitalize">
                          {persona.full_profile.money_profile.spending_style?.replace(/_/g, ' ') || 'Not specified'}
                        </span>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground block mb-1">Debt Posture</span>
                        <span className="text-sm capitalize">
                          {persona.full_profile.money_profile.debt_posture?.replace(/_/g, ' ') || 'Not specified'}
                        </span>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground block mb-1">Earning Context</span>
                        <span className="text-sm capitalize">
                          {persona.full_profile.money_profile.earning_context?.replace(/_/g, ' ') || 'Not specified'}
                        </span>
                      </div>
                    </div>

                    {/* Financial Stressors */}
                    {persona.full_profile.money_profile.financial_stressors && persona.full_profile.money_profile.financial_stressors.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground mb-2 block">Financial Stressors:</span>
                        <div className="flex flex-wrap gap-2">
                          {persona.full_profile.money_profile.financial_stressors.map((stressor, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {stressor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Savings & Investing */}
                    {persona.full_profile.money_profile.savings_investing_habits && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h5 className="text-sm font-semibold mb-2">Savings & Investing</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Emergency Fund:</span>
                            <span className="ml-2">
                              {persona.full_profile.money_profile.savings_investing_habits.emergency_fund_months || 0} months
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Retirement:</span>
                            <span className="ml-2 capitalize">
                              {persona.full_profile.money_profile.savings_investing_habits.retirement_contributions?.replace(/_/g, ' ') || 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Investment Style:</span>
                            <span className="ml-2 capitalize">
                              {persona.full_profile.money_profile.savings_investing_habits.investing_style?.replace(/_/g, ' ') || 'Not specified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Health Profile */}
              {persona.full_profile?.health_profile && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Health Profile
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground block mb-1">Sleep</span>
                        <span className="text-sm">
                          {persona.full_profile.health_profile.sleep_hours || 'Not specified'} hours/night
                        </span>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground block mb-1">Diet Pattern</span>
                        <span className="text-sm capitalize">
                          {persona.full_profile.health_profile.diet_pattern?.replace(/_/g, ' ') || 'Not specified'}
                        </span>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground block mb-1">Fitness Level</span>
                        <span className="text-sm capitalize">
                          {persona.full_profile.health_profile.fitness_level?.replace(/_/g, ' ') || 'Not specified'}
                        </span>
                      </div>
                    </div>

                    {/* Health Conditions */}
                    {persona.full_profile.health_profile.chronic_conditions && persona.full_profile.health_profile.chronic_conditions.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground mb-2 block">Chronic Conditions:</span>
                        <div className="flex flex-wrap gap-2">
                          {persona.full_profile.health_profile.chronic_conditions.map((condition, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mental Health */}
                    {persona.full_profile.health_profile.mental_health_flags && persona.full_profile.health_profile.mental_health_flags.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground mb-2 block">Mental Health:</span>
                        <div className="flex flex-wrap gap-2">
                          {persona.full_profile.health_profile.mental_health_flags.map((flag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Substance Use */}
                    {persona.full_profile.health_profile.substance_use && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h5 className="text-sm font-semibold mb-2">Substance Use</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {Object.entries(persona.full_profile.health_profile.substance_use).map(([substance, usage]) => (
                            <div key={substance}>
                              <span className="text-muted-foreground capitalize">{substance}:</span>
                              <span className="ml-2 capitalize">{usage?.replace(/_/g, ' ') || 'None'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!persona.full_profile?.money_profile && !persona.full_profile?.health_profile && (
                <div className="text-muted-foreground">No financial or health data available</div>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Traits Dashboard">
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
                  {(() => {
                    const biasData = persona.full_profile.bias_profile.cognitive;
                    console.log('Bias profile data:', biasData);
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {Object.entries(biasData).map(([bias, value]) => {
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
                    );
                  })()}
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
                        {conflict.triggers && (
                          <div className="mt-3 pt-3 border-t">
                            <span className="text-xs font-medium text-muted-foreground">Triggers: </span>
                            <span className="text-xs text-muted-foreground">{conflict.triggers}</span>
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
          </CollapsibleSection>

          <CollapsibleSection title="Public Issues & Attitudes">
            <div className="space-y-6">
              {/* Politics Snapshot */}
              {persona.full_profile?.political_narrative && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Political Worldview
                  </h4>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {persona.full_profile.political_narrative}
                    </p>
                  </div>
                </div>
              )}

              {/* Policy Issue Cards */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Policy Positions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['Education', 'Healthcare', 'Climate', 'Social Equity', 'Economics', 'Technology'].map((issue) => (
                    <Card key={issue} className="p-4 opacity-50">
                      <div className="space-y-2">
                        <h5 className="font-medium">{issue}</h5>
                        <div className="text-sm text-muted-foreground">
                          No recorded position
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    No active policy opinions recorded. Political views may be inferred from the narrative above.
                  </p>
                </div>
              </div>

              {!persona.full_profile?.political_narrative && (
                <div className="text-center p-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No political or public issue data available</p>
                </div>
              )}
            </div>
          </CollapsibleSection>
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <div className="space-y-6">
              {/* Knowledge Items Section */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Knowledge Items</h3>
                <div className="text-center p-8 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No knowledge items recorded yet</p>
                  <p className="text-xs mt-1">Knowledge base will be populated during conversations</p>
                  <Button variant="outline" size="sm" className="mt-4" disabled>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Knowledge (Coming Soon)
                  </Button>
                </div>
              </Card>

              {/* Memories Section */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Memories</h3>
                <div className="text-center p-8 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                  <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No memories captured yet</p>
                  <p className="text-xs mt-1">Personal memories and experiences will appear here</p>
                  <Button variant="outline" size="sm" className="mt-4" disabled>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Memory (Coming Soon)
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default PersonaProfile;