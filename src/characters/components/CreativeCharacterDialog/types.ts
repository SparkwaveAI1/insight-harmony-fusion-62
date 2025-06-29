
export interface CreativeCharacterData {
  name: string;
  entityType: string;
  narrativeDomain: string;
  functionalRole: string;
  description: string;
  environment: string;
  physicalForm: string;
  communication: string;
  coreDrives: string[];
  surfaceTriggers: string[];
  changeResponseStyle: string;
}

export interface CreativeCharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: CreativeCharacterData) => void;
}
