-- Delete all projects named "Persona Chat" created today for the current user
DELETE FROM projects 
WHERE name = 'Persona Chat' 
  AND DATE(created_at) = CURRENT_DATE 
  AND user_id = auth.uid();