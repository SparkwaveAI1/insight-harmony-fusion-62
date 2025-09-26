
import { InterviewSection } from "./types.ts";

// Standard sections and questions for interview
export const interviewSections: InterviewSection[] = [
  {
    section: "Introduction & Tone Calibration",
    notes: "Use open-ended, low-pressure prompts to establish persona's speech style and default rhythm.",
    questions: [
      "What's something you've been thinking about lately?",
      "What's something that recently made you pause or think twice?",
      "What kind of mood have you been in this week?",
    ],
  },
  {
    section: "Daily Life & Rhythms",
    notes: "Let tone drift naturally. Accept tangents, task switching, and emotional leakage. Avoid default mentions of coffee or generic morning routines. Create unique, varied daily habits based on persona's background, region, and preferences.",
    questions: [
      "What's your typical day look like right now?",
      "What time of day do you feel most like yourself?",
      "What throws off your rhythm?",
      "Something small that helps your day feel better?",
    ],
  },
  {
    section: "Childhood & Growing Up",
    notes: "Watch for emotional compression or expansion. People may skip, stall, or flood.",
    questions: [
      "Where did you grow up?",
      "What was your household like?",
      "What do you remember clearly from that time?",
      "Did you feel understood by the adults around you?",
    ],
  },
  {
    section: "Relationships",
    notes: "Response length varies depending on trust style. Look for quiet care or guarded phrasing.",
    questions: [
      "Who do you talk to most in your life right now?",
      "Who really gets you?",
      "Do you ask for support when you need it?",
      "Have you let go of relationships that no longer fit?",
    ],
  },
  {
    section: "Health & Coping",
    notes: "Expect quick shifts from surface to depth. Track routines, avoidance, and naming behaviors.",
    questions: [
      "How do you take care of yourself, mentally or physically?",
      "How do you know when something's off?",
      "What helps you reset when you're stressed?",
      "Do you ever share when you're not okay?",
    ],
  },
  {
    section: "Work & Ambition",
    notes: "Some personas open up here; others deflect. Let ambition be emotional or logistical.",
    questions: [
      "How do you feel about the work you do?",
      "What kind of work would feel closer to what you want?",
      "What does success look like to you?",
      "Do you think of yourself as ambitious?",
    ],
  },
  {
    section: "Financial Behavior",
    notes: "Include memory, friction, shame, or pride. Money is rarely a neutral topic.",
    questions: [
      "How do you manage your money?",
      "What kind of spending feels 'worth it' to you?",
      "Do you take financial risks?",
      "What's one money decision you second-guessed?",
    ],
  },
  {
    section: "Politics & Institutions",
    notes: "Don't force ideology. Let disillusionment, fatigue, or contradiction show.",
    questions: [
      "How do you feel about politics in general?",
      "Do you vote? Why or why not?",
      "Do you trust institutions—government, media, healthcare?",
      "What kinds of political messages push you away?",
    ],
  },
  {
    section: "Technology & Media",
    notes: "Look for attention drift, digital hygiene, and relationship to algorithmic space.",
    questions: [
      "How do you use your phone throughout the day?",
      "What apps or platforms do you trust most right now?",
      "Do you feel overwhelmed by digital stuff sometimes?",
      "What kind of content actually holds your attention?",
    ],
  },
  {
    section: "Decision-Making & Reflection",
    notes: "Follow logic vs. emotion tension. Include hesitations and second-guessing.",
    questions: [
      "How do you usually make decisions?",
      "What helps you move forward when you're stuck?",
      "Have you ever made a hard decision that still feels right?",
      "Do you tend to rely on logic or instinct?",
    ],
  },
  {
    section: "Moral & Ethical Framework",
    notes: "Let moral tension show up subtly—via phrasing, delay, or framing conflicts.",
    questions: [
      "Are there values you try to live by?",
      "Where do those come from?",
      "Have you ever walked away from something on principle?",
      "Do you think people can change?",
    ],
  },
  {
    section: "Cultural Identity & Positioning",
    notes: "Make room for ambiguity, misfit, hybridity. Avoid forcing identity labels.",
    questions: [
      "Do you feel like you fit in where you live?",
      "How do you relate to your generation or background?",
      "Do you ever feel misunderstood culturally or socially?",
      "What's something people often assume about you that isn't true?",
    ],
  },
  {
    section: "Future Vision & Aspiration",
    notes: "Expect idealism, realism, and contradiction to coexist.",
    questions: [
      "What would a really good year look like for you?",
      "What are you trying to create—personally or professionally?",
      "What's something you keep putting off?",
      "How do you want to be remembered?",
    ],
  },
];
