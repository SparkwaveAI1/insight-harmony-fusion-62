
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { CreativeCharacterDialogProps, CreativeCharacterData } from './CreativeCharacterDialog/types';
import { canProceed, compileForHistoricalCreator } from './CreativeCharacterDialog/utils';
import { handleRandomize } from './CreativeCharacterDialog/randomizers';
import Step1NameInput from './CreativeCharacterDialog/steps/Step1NameInput';
import Step2EntityType from './CreativeCharacterDialog/steps/Step2EntityType';
import Step3NarrativeDomain from './CreativeCharacterDialog/steps/Step3NarrativeDomain';
import Step4FunctionalRole from './CreativeCharacterDialog/steps/Step4FunctionalRole';
import Step5Description from './CreativeCharacterDialog/steps/Step5Description';
import Step6Environment from './CreativeCharacterDialog/steps/Step6Environment';
import Step7Drives from './CreativeCharacterDialog/steps/Step7Drives';
import Step8Response from './CreativeCharacterDialog/steps/Step8Response';

const CreativeCharacterDialog = ({ open, onOpenChange, onComplete }: CreativeCharacterDialogProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreativeCharacterData>({
    name: '',
    entityType: '',
    narrativeDomain: '',
    functionalRole: '',
    description: '',
    environment: '',
    physicalForm: '',
    communication: '',
    coreDrives: [],
    surfaceTriggers: [],
    changeResponseStyle: ''
  });

  const totalSteps = 8;

  const compileForNonHumanoidCreator = async (data: CreativeCharacterData) => {
    try {
      const { generateNonHumanoidTraits } = await import('../services/nonHumanoidTraitGenerator');
      
      const traits = await generateNonHumanoidTraits({
        name: data.name,
        description: data.description,
        entityType: data.entityType,
        narrativeDomain: data.narrativeDomain,
        functionalRole: data.functionalRole,
        environment: data.environment,
        physicalForm: data.physicalForm,
        communication: data.communication,
        coreDrives: data.coreDrives,
        surfaceTriggers: data.surfaceTriggers,
        changeResponseStyle: data.changeResponseStyle
      });

      console.log('Generated non-humanoid traits:', traits);
      onComplete(data);
      
    } catch (error) {
      console.error('Error generating non-humanoid traits:', error);
      onComplete(data);
    }
  };

  const handleNext = () => {
    console.log('handleNext called - current step:', currentStep, 'can proceed:', canProceed(currentStep, formData));
    console.log('Form data at step:', currentStep, formData);
    
    if (currentStep < totalSteps && canProceed(currentStep, formData)) {
      const nextStep = currentStep + 1;
      console.log('Moving to step:', nextStep);
      setCurrentStep(nextStep);
    } else {
      console.log('Cannot proceed to next step');
    }
  };

  const handleBack = () => {
    console.log('handleBack called - current step:', currentStep);
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      console.log('Moving to step:', prevStep);
      setCurrentStep(prevStep);
    }
  };

  const handleComplete = () => {
    if (formData.entityType === 'human') {
      const compiledDescription = compileForHistoricalCreator(formData);
      const searchParams = new URLSearchParams({
        prefill: 'true',
        name: formData.name,
        description: compiledDescription,
        location: formData.environment,
        source: 'creative-genesis'
      });
      navigate(`/characters/create/historical?${searchParams.toString()}`);
      onOpenChange(false);
    } else {
      compileForNonHumanoidCreator(formData);
      onOpenChange(false);
    }
  };

  const renderStep = () => {
    console.log('renderStep called for step:', currentStep);
    
    switch (currentStep) {
      case 1:
        return <Step1NameInput formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step2EntityType formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step3NarrativeDomain formData={formData} setFormData={setFormData} />;
      case 4:
        return <Step4FunctionalRole formData={formData} setFormData={setFormData} />;
      case 5:
        return <Step5Description formData={formData} setFormData={setFormData} />;
      case 6:
        return <Step6Environment formData={formData} setFormData={setFormData} />;
      case 7:
        return <Step7Drives formData={formData} setFormData={setFormData} />;
      case 8:
        return <Step8Response formData={formData} setFormData={setFormData} />;
      default:
        console.log('Unknown step in renderStep:', currentStep);
        return (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Error: Unknown step {currentStep}</p>
            <Button onClick={() => setCurrentStep(1)} className="mt-4">
              Return to Step 1
            </Button>
          </div>
        );
    }
  };

  console.log('CreativeCharacterDialog render - current step:', currentStep, 'open:', open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-2 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Character Genesis Creation
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Create a unique character through our guided 8-step process
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-between px-4 sm:px-6 pb-2 sm:pb-4 flex-shrink-0">
          <div className="flex space-x-1 sm:space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                  i + 1 <= currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRandomize(currentStep, formData, setFormData)}
              className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1 h-auto"
            >
              <Shuffle className="h-3 w-3" />
              <span className="hidden sm:inline">Randomize</span>
            </Button>
          </div>
        </div>

        {/* Step content - with proper scrolling */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="pb-4">
            {renderStep()}
          </div>
        </div>

        {/* Navigation - Fixed at bottom */}
        <div className="flex justify-between items-center p-4 sm:p-6 pt-2 sm:pt-4 border-t flex-shrink-0 bg-background">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-2 h-8 sm:h-9"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Back
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed(currentStep, formData)}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-2 h-8 sm:h-9"
            >
              Next
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed(currentStep, formData)}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-2 h-8 sm:h-9"
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{formData.entityType === 'human' ? 'Create Historical Character' : 'Create Character'}</span>
              <span className="sm:hidden">Create</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreativeCharacterDialog;
