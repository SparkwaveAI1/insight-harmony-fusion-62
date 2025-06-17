
import { ResearchMessage } from '../hooks/types';
import { Persona } from '@/services/persona/types';

export const exportTranscript = (
  messages: ResearchMessage[],
  loadedPersonas: Persona[],
  sessionId: string | null
) => {
  if (messages.length === 0) return;

  // Create markdown content
  let markdownContent = '# Research Session Transcript\n\n';
  
  // Add session metadata
  markdownContent += `**Session ID:** ${sessionId}\n`;
  markdownContent += `**Date:** ${new Date().toLocaleString()}\n`;
  markdownContent += `**Total Messages:** ${messages.length}\n\n`;
  
  // Add personas section
  markdownContent += '## Active Personas\n\n';
  loadedPersonas.forEach(persona => {
    markdownContent += `- **${persona.name}**`;
    if (persona.metadata?.occupation) {
      markdownContent += ` (${persona.metadata.occupation})`;
    }
    if (persona.metadata?.age) {
      markdownContent += ` - Age ${persona.metadata.age}`;
    }
    if (persona.metadata?.region) {
      markdownContent += ` - ${persona.metadata.region}`;
    }
    markdownContent += '\n';
  });
  
  markdownContent += '\n## Conversation\n\n';
  
  // Add messages
  messages.forEach((message, index) => {
    const timestamp = new Date(message.timestamp).toLocaleTimeString();
    
    if (message.role === 'user') {
      markdownContent += `**[${timestamp}] User:** ${message.content}\n\n`;
    } else if (message.responding_persona_id) {
      const persona = loadedPersonas.find(p => p.persona_id === message.responding_persona_id);
      const personaName = persona?.name || 'Unknown Persona';
      markdownContent += `**[${timestamp}] ${personaName}:** ${message.content}\n\n`;
    }
  });
  
  // Create and download file
  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `research-session-${sessionId}-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('Research transcript exported successfully');
};
