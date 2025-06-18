
import { PersonaMetadata } from "@/services/persona/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PersonaDemographicsProps {
  metadata: PersonaMetadata;
}

const PersonaDemographics = ({ metadata }: PersonaDemographicsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
        Demographics Profile
      </h2>
      
      <Accordion type="multiple" defaultValue={["core-demographics"]}>
        {/* Core Demographics */}
        <AccordionItem value="core-demographics" className="border-0 mb-2">
          <AccordionTrigger className="text-lg font-semibold py-2 px-3 bg-blue-50/50 rounded-md hover:bg-blue-50 transition-colors">
            Core Demographics
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <InfoItem label="Age" value={metadata.age} />
                <InfoItem label="Gender" value={metadata.gender} />
                <InfoItem label="Race/Ethnicity" value={metadata.race_ethnicity} />
                <InfoItem label="Sexual Orientation" value={metadata.sexual_orientation} />
                <InfoItem label="Education" value={metadata.education_level} />
                <InfoItem label="Occupation" value={metadata.occupation} />
                <InfoItem label="Employment Type" value={metadata.employment_type} />
              </div>
              <div className="space-y-2">
                <InfoItem label="Income Level" value={metadata.income_level} />
                <InfoItem label="Social Class" value={metadata.social_class_identity} />
                <InfoItem label="Marital Status" value={metadata.marital_status || metadata.relationship_status} />
                <InfoItem label="Parenting Role" value={metadata.parenting_role || metadata.children_or_caregiver} />
                <InfoItem label="Relationship History" value={metadata.relationship_history} />
                <InfoItem label="Military Service" value={metadata.military_service} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Location & Environment */}
        <AccordionItem value="location-environment" className="border-0 mb-2">
          <AccordionTrigger className="text-lg font-semibold py-2 px-3 bg-blue-50/30 rounded-md hover:bg-blue-50 transition-colors">
            Location, Environment & Migration
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <InfoItem label="Region" value={metadata.region} />
                <InfoItem label="Urban/Rural Context" value={metadata.urban_rural_context} />
                <InfoItem label="Climate Risk Zone" value={metadata.climate_risk_zone} />
                <InfoItem label="Migration History" value={metadata.migration_history} />
              </div>
              <div className="space-y-2">
                <InfoItem label="Grew Up In" value={metadata.location_history?.grew_up_in} />
                <InfoItem label="Current Residence" value={metadata.location_history?.current_residence} />
                {metadata.location_history?.places_lived && (
                  <div className="flex">
                    <span className="font-medium w-32">Places Lived:</span>
                    <span>{Array.isArray(metadata.location_history.places_lived) 
                      ? metadata.location_history.places_lived.join(", ") 
                      : metadata.location_history.places_lived}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Cognitive & Cultural */}
        <AccordionItem value="cognitive-cultural" className="border-0 mb-2">
          <AccordionTrigger className="text-lg font-semibold py-2 px-3 bg-green-50/40 rounded-md hover:bg-green-50 transition-colors">
            Cognitive, Psychological, and Cultural
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <InfoItem label="Languages" value={formatArrayOrString(metadata.language_proficiency)} />
                <InfoItem label="Religion" value={metadata.religious_affiliation} />
                <InfoItem label="Practice Level" value={metadata.religious_practice_level} />
                <InfoItem label="Cultural Background" value={metadata.cultural_background} />
                <InfoItem label="Cultural Affiliations" value={formatArrayOrString(metadata.cultural_affiliation)} />
              </div>
              <div className="space-y-2">
                <InfoItem label="Political Affiliation" value={metadata.political_affiliation} />
                <InfoItem label="Political Sophistication" value={metadata.political_sophistication} />
                <InfoItem label="Tech Familiarity" value={metadata.tech_familiarity} />
                <InfoItem label="Learning Modality" value={metadata.learning_modality} />
                <InfoItem label="Trust in Institutions" value={metadata.trust_in_institutions} />
                <InfoItem label="Trauma Exposure" value={metadata.trauma_exposure} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Financial & Resource */}
        <AccordionItem value="financial-resource" className="border-0 mb-2">
          <AccordionTrigger className="text-lg font-semibold py-2 px-3 bg-amber-50/30 rounded-md hover:bg-amber-50 transition-colors">
            Financial and Time Resource Profile
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <InfoItem label="Financial Pressure" value={metadata.financial_pressure} />
                <InfoItem label="Credit Access" value={metadata.credit_access} />
              </div>
              <div className="space-y-2">
                <InfoItem label="Debt Load" value={metadata.debt_load} />
                <InfoItem label="Time Abundance" value={metadata.time_abundance} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Digital & Signaling */}
        <AccordionItem value="digital-signaling" className="border-0 mb-2">
          <AccordionTrigger className="text-lg font-semibold py-2 px-3 bg-purple-50/30 rounded-md hover:bg-purple-50 transition-colors">
            Digital Ecosystem & Signaling Behavior
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="space-y-2">
              <InfoItem label="Media Ecosystem" value={formatArrayOrString(metadata.media_ecosystem)} />
              <InfoItem label="Aesthetic Subculture" value={metadata.aesthetic_subculture} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Enhanced Health-Related Attributes */}
        <AccordionItem value="health" className="border-0 mb-2">
          <AccordionTrigger className="text-lg font-semibold py-2 px-3 bg-red-50/20 rounded-md hover:bg-red-50 transition-colors">
            Health-Related Attributes
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <InfoItem label="Physical Health Status" value={metadata.physical_health_status} />
                <InfoItem label="Mental Health Status" value={metadata.mental_health_status} />
                <InfoItem label="Health Prioritization" value={metadata.health_prioritization} />
                <InfoItem label="Healthcare Access" value={metadata.healthcare_access} />
                <InfoItem label="Health Insurance" value={metadata.health_insurance_status} />
                <InfoItem label="Chronic Conditions" value={formatArrayOrString(metadata.chronic_conditions)} />
                <InfoItem label="Medications" value={formatArrayOrString(metadata.medications)} />
                <InfoItem label="Mental Health History" value={metadata.mental_health_history} />
                <InfoItem label="Therapy Experience" value={metadata.therapy_counseling_experience} />
              </div>
              <div className="space-y-2">
                <InfoItem label="Fitness Level" value={metadata.fitness_activity_level} />
                <InfoItem label="Dietary Restrictions" value={formatArrayOrString(metadata.dietary_restrictions)} />
                <InfoItem label="Sleep Patterns" value={metadata.sleep_patterns} />
                <InfoItem label="Stress Management" value={metadata.stress_management} />
                <InfoItem label="Substance Use" value={metadata.substance_use} />
                <InfoItem label="Family Health History" value={metadata.health_family_history} />
                <InfoItem label="Disability Accommodations" value={metadata.disability_accommodations} />
                <InfoItem label="Legacy Medical History" value={metadata.family_medical_history} />
                <InfoItem label="Legacy Conditions" value={metadata.disabilities_or_conditions} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* New Physical Description Section */}
        <AccordionItem value="physical-description" className="border-0 mb-2">
          <AccordionTrigger className="text-lg font-semibold py-2 px-3 bg-indigo-50/30 rounded-md hover:bg-indigo-50 transition-colors">
            Physical Description
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <InfoItem label="Height" value={metadata.height} />
                <InfoItem label="Build/Body Type" value={metadata.build_body_type} />
                <InfoItem label="Hair Color" value={metadata.hair_color} />
                <InfoItem label="Hair Style" value={metadata.hair_style} />
                <InfoItem label="Eye Color" value={metadata.eye_color} />
                <InfoItem label="Skin Tone" value={metadata.skin_tone} />
                <InfoItem label="Distinctive Features" value={formatArrayOrString(metadata.distinctive_features)} />
              </div>
              <div className="space-y-2">
                <InfoItem label="Style/Fashion Sense" value={metadata.style_fashion_sense} />
                <InfoItem label="Grooming Habits" value={metadata.grooming_habits} />
                <InfoItem label="Physical Mannerisms" value={formatArrayOrString(metadata.physical_mannerisms)} />
                <InfoItem label="Posture/Bearing" value={metadata.posture_bearing} />
                <InfoItem label="Voice/Speech Patterns" value={metadata.voice_speech_patterns} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// Helper component for displaying info items
const InfoItem = ({ label, value }: { label: string, value: any }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  
  return (
    <div className="flex">
      <span className="font-medium w-32">{label}:</span>
      <span>{value}</span>
    </div>
  );
};

// Helper function to format array or string values
const formatArrayOrString = (value: string[] | string | undefined): string => {
  if (!value) return '';
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  return value;
};

export default PersonaDemographics;
