
export function handleEmotionalTriggers(emotionalTriggers: any) {
  try {
    // Ensure the structure is correct
    if (!emotionalTriggers || typeof emotionalTriggers !== 'object') {
      return {
        positive_triggers: [],
        negative_triggers: []
      };
    } else {
      // Validate structure
      return {
        positive_triggers: Array.isArray(emotionalTriggers.positive_triggers) ? emotionalTriggers.positive_triggers : [],
        negative_triggers: Array.isArray(emotionalTriggers.negative_triggers) ? emotionalTriggers.negative_triggers : []
      };
    }
  } catch (error) {
    console.warn("Error parsing emotional triggers, using default structure:", error);
    return {
      positive_triggers: [],
      negative_triggers: []
    };
  }
}

export function prepareEmotionalTriggersForDb(emotionalTriggers: any) {
  if (!emotionalTriggers) {
    return {
      positive_triggers: [],
      negative_triggers: []
    };
  } else {
    // Ensure the structure matches what the database expects
    return {
      positive_triggers: emotionalTriggers.positive_triggers || [],
      negative_triggers: emotionalTriggers.negative_triggers || []
    };
  }
}
