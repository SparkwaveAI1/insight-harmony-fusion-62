-- Migration: Standardize income brackets to 9 standard ranges
-- Standard brackets:
--   Under $25,000
--   $25,000 - $50,000
--   $50,000 - $75,000
--   $75,000 - $100,000
--   $100,000 - $150,000
--   $150,000 - $200,000
--   $200,000 - $350,000
--   $350,000 - $500,000
--   Over $500,000

-- Under $25,000 (all ranges where upper bound <= 25000 or midpoint < 25000)
UPDATE v4_personas SET income_bracket = 'Under $25,000'
WHERE income_bracket IN (
  '0-5000', '0-10000', '0-15000', '0-25000',
  '800-2000', '2500-4000', '5000-10000', '7000-9000', '7500-10000',
  '10000-15000', '10000-20000', '12000-15000',
  '15000-17000', '15000-20000', '15000-25000',
  '20000-25000'
);

-- $25,000 - $50,000
UPDATE v4_personas SET income_bracket = '$25,000 - $50,000'
WHERE income_bracket IN (
  '20000-30000', '25000-35000', '30000-35000',
  '35000-45000', '35000-50000',
  '40000-45000', '45000-50000'
);

-- $50,000 - $75,000
UPDATE v4_personas SET income_bracket = '$50,000 - $75,000'
WHERE income_bracket IN (
  '50000-55000', '50000-60000', '50000-65000', '50000-75000',
  '55000-60000', '60000-65000', '60000-70000', '60000-75000',
  '65000-70000', '65000-75000', '70000-75000', '70000-80000'
);

-- $75,000 - $100,000
UPDATE v4_personas SET income_bracket = '$75,000 - $100,000'
WHERE income_bracket IN (
  '75000-100000', '85000-130000', '90000-100000', '90000-120000',
  '95000-120000', '95000-125000', '95000-170000'
);

-- $100,000 - $150,000
UPDATE v4_personas SET income_bracket = '$100,000 - $150,000'
WHERE income_bracket IN (
  '100000-120000', '100000-125000', '100000-130000', '100000-140000',
  '100000-150000', '100000-250000',
  '120000-150000', '120000-160000', '120000-180000',
  '125000-135000', '125000-150000', '125000-175000',
  '140000-200000'
);

-- $150,000 - $200,000
UPDATE v4_personas SET income_bracket = '$150,000 - $200,000'
WHERE income_bracket IN (
  '150000-175000', '150000-180000', '150000-200000', '150000-250000',
  '175000-225000', '175000-250000'
);

-- $200,000 - $350,000
UPDATE v4_personas SET income_bracket = '$200,000 - $350,000'
WHERE income_bracket IN (
  '200000-225000', '200000-250000', '200000-275000', '200000-300000',
  '250000-300000', '250000-350000'
);

-- $350,000 - $500,000
UPDATE v4_personas SET income_bracket = '$350,000 - $500,000'
WHERE income_bracket IN (
  '250000-400000', '250000-500000',
  '300000-350000', '350000-400000', '350000-500000',
  '400000-450000'
);

-- Over $500,000
UPDATE v4_personas SET income_bracket = 'Over $500,000'
WHERE income_bracket IN (
  '500000-550000', '500000-600000',
  '750000-1000000', '900000-1200000',
  '1000000-5000000', '1500000-2000000',
  '1000000000-1000000000000'
);

-- Also update the full_profile JSON if income_bracket is stored there
UPDATE v4_personas
SET full_profile = jsonb_set(full_profile, '{identity,income_bracket}', to_jsonb(income_bracket))
WHERE full_profile->'identity'->>'income_bracket' IS NOT NULL
  AND income_bracket IS NOT NULL;
