
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAllPersonas } from "@/services/persona"; // Updated import path
import { Persona } from "@/services/persona/types";

interface PersonaSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

function PersonaSelector({ value, onValueChange }: PersonaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const allPersonas = await getAllPersonas();
        setPersonas(allPersonas);
      } catch (error) {
        console.error("Error fetching personas:", error);
      }
    };

    fetchPersonas();
  }, []);

  const selectedPersona = personas.find((persona) => persona.persona_id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedPersona ? selectedPersona.name : "Select Persona"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search persona..." />
          <CommandEmpty>No persona found.</CommandEmpty>
          <CommandGroup>
            {personas.map((persona) => (
              <CommandItem
                key={persona.persona_id}
                value={persona.name}
                onSelect={() => {
                  onValueChange(persona.persona_id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === persona.persona_id ? "opacity-100" : "opacity-0"
                  )}
                />
                {persona.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default PersonaSelector;
