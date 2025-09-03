-- Delete duplicate Nathan Redbird personas (keep the original from 2025-01-21 04:13:56.754)
DELETE FROM v4_personas 
WHERE name = 'Nathan Redbird' 
AND persona_id != 'v4_1755778436754_ypzfs37dt';

-- Delete duplicate Heather McMillan personas (keep the original from 2025-01-21 04:13:57.189)
DELETE FROM v4_personas 
WHERE name = 'Heather McMillan' 
AND persona_id != 'v4_1755778437189_hhlhd69jh';