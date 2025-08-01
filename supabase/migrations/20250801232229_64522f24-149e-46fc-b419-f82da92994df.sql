-- Create a default project for persona chats
INSERT INTO public.projects (id, name, description, user_id, methodology, research_objectives, information)
VALUES (
  'default-persona-chat-project'::uuid,
  'Personal Persona Chats',
  'Default project for individual persona conversations',
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Individual 1-on-1 conversations',
  'Personal interaction and exploration',
  'This is a system-generated project for persona chat sessions'
) ON CONFLICT (id) DO NOTHING;