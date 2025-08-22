-- Delete Ethan Kaplan persona from personas table
DELETE FROM public.personas 
WHERE name = 'Ethan Kaplan' 
AND user_id = '9a02d71b-0561-425f-9adf-150243905530';

-- Delete Jason Miller personas from v4_personas table  
DELETE FROM public.v4_personas 
WHERE name = 'Jason Miller' 
AND user_id = '9a02d71b-0561-425f-9adf-150243905530';

-- Also remove any collection references for these personas
DELETE FROM public.collection_personas 
WHERE persona_id IN ('', 'v4_1755817699963_bmdjk22vv', 'v4_1755817780523_pibiy44qi');