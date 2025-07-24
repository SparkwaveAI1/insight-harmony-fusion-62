import { Persona } from '@/services/persona/types';

interface CachedPersona {
  persona: Persona;
  timestamp: number;
}

class PersonaCache {
  private cache = new Map<string, CachedPersona>();
  private readonly TTL = 10 * 60 * 1000; // 10 minutes

  get(personaId: string): Persona | null {
    const cached = this.cache.get(personaId);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      console.log('Using cached persona data for:', personaId);
      return cached.persona;
    }
    
    // Remove expired cache
    if (cached) {
      this.cache.delete(personaId);
    }
    
    return null;
  }

  set(personaId: string, persona: Persona): void {
    this.cache.set(personaId, {
      persona,
      timestamp: Date.now()
    });
    console.log('Cached persona data for:', personaId);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [id, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= this.TTL) {
        this.cache.delete(id);
      }
    }
  }
}

export const personaCache = new PersonaCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  personaCache.cleanup();
}, 5 * 60 * 1000);