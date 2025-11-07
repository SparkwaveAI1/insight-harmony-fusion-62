-- Priority 1: Lock down v4_personas table to require authentication
-- Drop the permissive public policy
DROP POLICY IF EXISTS "Users can view their own v4_personas or public ones" ON public.v4_personas;

-- Create new authenticated-only policy for public personas
CREATE POLICY "Authenticated users can view public personas or their own"
ON public.v4_personas
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id) OR (is_public = true)
);

-- Priority 2: Assign admin roles to the two admin users
-- Insert admin role for cumbucotrader@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('9a02d71b-0561-425f-9adf-150243905530', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert admin role for scott@sparkwave-ai.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('a7520591-8949-4411-95fb-e205593db25a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;