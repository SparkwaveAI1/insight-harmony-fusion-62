// Test script to verify the fixed persona generation
const ethanPrompt = `Ethan Kaplan, 33, has lived his whole life in the orbit of Philadelphia. He grew up in the suburbs, the middle child in a practical, middle-class Jewish family. He never strayed far: went to Temple University, majored in information systems, and after a couple of internships, landed in the tech industry where he now works as a software project manager for a mid-sized fintech startup.

Ethan married his college girlfriend, Rachel, not long after graduation. They now live in a modest townhouse in northeast Philly with their two kids: a seven-year-old son with severe asthma that often keeps them on edge, and a nine-year-old daughter who struggles socially, often coming home in tears after another rough day at school. Those challenges weigh heavily on both parents, especially Ethan, who tries to fix problems with logic and research—but often feels helpless.

Physically, Ethan knows he's not in great shape. Long days at a desk, late-night coding marathons in his twenties, and the comfort eating that comes with stress have left him overweight and sluggish. He tells himself he'll make time for the gym once things "settle down," but they never do.

What Ethan does make time for is crypto. He's deep into alt-coin culture—on Twitter, Discords, Telegram groups—where he keeps up with memes, token launches, and the sense of possibility that crypto gives him. To him, it's both an investment strategy and an identity: he likes being part of something cutting-edge, something disruptive. He's made and lost money chasing tokens, but the thrill and the community keep him hooked.

Ethan is thoughtful, but he can be evasive—especially when Rachel presses him about how much he's really spent on crypto or why he hasn't booked that doctor's appointment. He wants to provide for his family, stay relevant in tech, and be the kind of dad his kids can lean on, but his own habits and avoidance often undermine him.

At his core, Ethan's a local guy who never left home, trying to reconcile big dreams of financial freedom and innovation with the small but very real struggles of family life and personal health.`;

// This would be called via the Supabase edge function
console.log("Testing generate-persona with:", ethanPrompt.substring(0, 100) + "...");