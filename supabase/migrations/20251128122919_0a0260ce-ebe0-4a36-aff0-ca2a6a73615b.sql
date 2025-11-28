-- Drop the old function version with double precision BMI parameters
DROP FUNCTION IF EXISTS public.search_personas_advanced(
  integer, integer, 
  double precision, double precision,
  text, text, text, 
  text[], text[], text[], text[], 
  text, uuid[], integer
);