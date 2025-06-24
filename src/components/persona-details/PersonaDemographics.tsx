
import React from "react";
import { PersonaMetadata } from "@/services/persona/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PersonaDemographicsProps {
  metadata: PersonaMetadata;
}

const PersonaDemographics = ({ metadata }: PersonaDemographicsProps) => {
  console.log("=== DEMOGRAPHICS COMPONENT DEBUG ===");
  console.log("Full metadata:", metadata);
  console.log("relationships_family:", metadata?.relationships_family);
  
  // Extract children data from multiple possible locations
  let childrenData = {
    has_children: metadata?.has_children || metadata?.relationships_family?.has_children,
    number_of_children: metadata?.number_of_children || metadata?.relationships_family?.number_of_children,
    children_ages: metadata?.children_ages || metadata?.relationships_family?.children_ages
  };
  
  console.log("Extracted children data:", childrenData);

  const renderSection = (title: string, data: any) => {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return null;
    }

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {typeof data === 'object' ? (
              Object.entries(data).map(([key, value]) => {
                if (value === null || value === undefined) return null;
                
                const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                return (
                  <div key={key} className="space-y-1">
                    <dt className="text-sm font-medium text-gray-600">{displayKey}</dt>
                    <dd className="text-sm text-gray-900">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </dd>
                  </div>
                );
              })
            ) : (
              <div className="space-y-1">
                <dd className="text-sm text-gray-900">{String(data)}</dd>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Create family relationships data by combining various fields
  const familyRelationshipsData = {
    has_children: childrenData.has_children ? 'Yes' : 'No',
    number_of_children: childrenData.number_of_children,
    children_ages: childrenData.children_ages,
    stepchildren: metadata?.stepchildren ? 'Yes' : 'No',
    custody_arrangement: metadata?.custody_arrangement || metadata?.relationships_family?.custody_arrangement,
    living_situation: metadata?.living_situation || metadata?.relationships_family?.living_situation,
    household_composition: metadata?.household_composition || metadata?.relationships_family?.household_composition,
    primary_caregiver_responsibilities: metadata?.relationships_family?.primary_caregiver_responsibilities,
    eldercare_responsibilities: metadata?.relationships_family?.eldercare_responsibilities,
    partner_spouse_relationship: metadata?.relationships_family?.partner_spouse_relationship,
    partner_health_status: metadata?.relationships_family?.partner_health_status,
    children_health_issues: metadata?.children_health_issues || metadata?.relationships_family?.children_health_issues,
    family_relationship_quality: metadata?.relationships_family?.family_relationship_quality,
    family_stressors: metadata?.family_stressors || metadata?.relationships_family?.family_stressors,
    support_system_strength: metadata?.support_system_strength || metadata?.relationships_family?.support_system_strength,
    extended_family_involvement: metadata?.relationships_family?.extended_family_involvement,
    relationship_priorities: metadata?.relationship_priorities || metadata?.relationships_family?.relationship_priorities,
    co_parenting_dynamics: metadata?.co_parenting_dynamics || metadata?.relationships_family?.co_parenting_dynamics,
    family_financial_responsibilities: metadata?.relationships_family?.family_financial_responsibilities,
    family_medical_history_impact: metadata?.relationships_family?.family_medical_history_impact
  };

  // Filter out null/undefined values
  const cleanedFamilyData = Object.fromEntries(
    Object.entries(familyRelationshipsData).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    )
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Demographics & Background</h2>
      
      {/* Core Demographics */}
      {renderSection("Core Demographics", {
        age: metadata?.age,
        gender: metadata?.gender,
        race_ethnicity: metadata?.race_ethnicity,
        sexual_orientation: metadata?.sexual_orientation,
        education_level: metadata?.education_level,
        occupation: metadata?.occupation,
        employment_type: metadata?.employment_type,
        income_level: metadata?.income_level,
        social_class_identity: metadata?.social_class_identity,
        marital_status: metadata?.marital_status,
        parenting_role: metadata?.parenting_role,
        military_service: metadata?.military_service
      })}

      {/* Location & Environment */}
      {renderSection("Location & Environment", {
        region: metadata?.region,
        urban_rural_context: metadata?.urban_rural_context,
        grew_up_in: metadata?.location_history?.grew_up_in,
        current_residence: metadata?.location_history?.current_residence,
        places_lived: metadata?.location_history?.places_lived,
        migration_history: metadata?.migration_history,
        climate_risk_zone: metadata?.climate_risk_zone
      })}

      {/* Relationships & Family Dynamics - Using cleaned data */}
      {Object.keys(cleanedFamilyData).length > 0 && renderSection("Relationships & Family Dynamics", cleanedFamilyData)}

      {/* Cultural & Psychological */}
      {renderSection("Cultural & Psychological", {
        language_proficiency: metadata?.language_proficiency,
        religious_affiliation: metadata?.religious_affiliation,
        religious_practice_level: metadata?.religious_practice_level,
        cultural_background: metadata?.cultural_background,
        cultural_affiliation: metadata?.cultural_affiliation,
        political_affiliation: metadata?.political_affiliation,
        political_sophistication: metadata?.political_sophistication,
        tech_familiarity: metadata?.tech_familiarity,
        learning_modality: metadata?.learning_modality,
        trust_in_institutions: metadata?.trust_in_institutions,
        trauma_exposure: metadata?.trauma_exposure
      })}

      {/* Financial & Resources */}
      {renderSection("Financial & Resources", {
        financial_pressure: metadata?.financial_pressure,
        credit_access: metadata?.credit_access,
        debt_load: metadata?.debt_load,
        time_abundance: metadata?.time_abundance
      })}

      {/* Health Profile */}
      {renderSection("Health Profile", {
        physical_health_status: metadata?.physical_health_status,
        mental_health_status: metadata?.mental_health_status,
        health_prioritization: metadata?.health_prioritization,
        healthcare_access: metadata?.healthcare_access,
        chronic_conditions: metadata?.chronic_conditions,
        medications: metadata?.medications,
        mental_health_history: metadata?.mental_health_history,
        therapy_counseling_experience: metadata?.therapy_counseling_experience,
        health_insurance_status: metadata?.health_insurance_status,
        fitness_activity_level: metadata?.fitness_activity_level,
        dietary_restrictions: metadata?.dietary_restrictions,
        sleep_patterns: metadata?.sleep_patterns,
        stress_management: metadata?.stress_management,
        substance_use: metadata?.substance_use,
        health_family_history: metadata?.health_family_history,
        disability_accommodations: metadata?.disability_accommodations
      })}

      {/* Physical Description */}
      {renderSection("Physical Description", {
        height: metadata?.height,
        build_body_type: metadata?.build_body_type,
        hair_color: metadata?.hair_color,
        hair_style: metadata?.hair_style,
        eye_color: metadata?.eye_color,
        skin_tone: metadata?.skin_tone,
        distinctive_features: metadata?.distinctive_features,
        style_fashion_sense: metadata?.style_fashion_sense,
        grooming_habits: metadata?.grooming_habits,
        physical_mannerisms: metadata?.physical_mannerisms,
        posture_bearing: metadata?.posture_bearing,
        voice_speech_patterns: metadata?.voice_speech_patterns
      })}

      {/* Knowledge Domains */}
      {metadata?.knowledge_domains && renderSection("Knowledge Domains", 
        Object.entries(metadata.knowledge_domains).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key.replace(/_/g, ' ')] = `Level ${value}/5`;
          }
          return acc;
        }, {} as Record<string, string>)
      )}

      {/* Digital & Media */}
      {renderSection("Digital & Media", {
        media_ecosystem: metadata?.media_ecosystem,
        aesthetic_subculture: metadata?.aesthetic_subculture
      })}

      {/* Debug Section - Remove this in production */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Debug: Children Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div><strong>metadata.has_children:</strong> {JSON.stringify(metadata?.has_children)}</div>
            <div><strong>metadata.number_of_children:</strong> {JSON.stringify(metadata?.number_of_children)}</div>
            <div><strong>metadata.children_ages:</strong> {JSON.stringify(metadata?.children_ages)}</div>
            <div><strong>metadata.relationships_family:</strong> {JSON.stringify(metadata?.relationships_family, null, 2)}</div>
            <div><strong>Extracted children data:</strong> {JSON.stringify(childrenData, null, 2)}</div>
            <div><strong>Family section data count:</strong> {Object.keys(cleanedFamilyData).length}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonaDemographics;
