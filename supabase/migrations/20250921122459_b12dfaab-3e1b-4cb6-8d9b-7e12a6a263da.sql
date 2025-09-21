UPDATE collections 
SET description = CASE 
  WHEN name = 'AI Early Adopters' THEN 'Forward-thinking individuals who embrace artificial intelligence technologies in their personal and professional lives'
  WHEN name = 'Caregivers for Aging Parents' THEN 'Adult children managing the complex responsibilities of caring for elderly parents while balancing their own lives'
  WHEN name = 'Cat Owners' THEN 'Devoted cat parents who prioritize their feline companions'' health, happiness, and well-being'
  WHEN name = 'College Students & Recent Grads' THEN 'Young adults navigating higher education and early career transitions with limited budgets and evolving priorities'
  WHEN name = 'Diverse USA Consumer' THEN 'Representative cross-section of American consumers from various backgrounds, demographics, and purchasing behaviors'
  WHEN name = 'DIY & Home Improvement Enthusiasts' THEN 'Hands-on homeowners who tackle projects themselves, from weekend warriors to serious renovation enthusiasts'
  WHEN name = 'Dog Owners' THEN 'Dedicated dog parents committed to providing the best care, training, and lifestyle for their canine family members'
  WHEN name = 'E-commerce Shoppers / Online Deal-Seekers' THEN 'Savvy digital consumers who actively hunt for bargains, compare prices, and prefer online shopping experiences'
  WHEN name = 'Empty Nesters' THEN 'Parents whose children have left home, now rediscovering personal interests and adjusting to new life priorities'
  WHEN name = 'Environmental Advocates (sustainability-conscious buyers, activists)' THEN 'Eco-conscious consumers who prioritize sustainable products and practices in their purchasing decisions'
  WHEN name = 'Fight Flow Study age 30-50' THEN 'Adults in their prime earning years participating in combat sports or martial arts training research'
  WHEN name = 'Fight Flow Women' THEN 'Female practitioners and enthusiasts of combat sports, martial arts, and self-defense training'
  WHEN name = 'Gamers' THEN 'Video game enthusiasts across platforms who invest time and money in gaming experiences and related products'
  WHEN name = 'Gym Customers' THEN 'Fitness facility members with varying commitment levels, from casual users to dedicated fitness enthusiasts'
  WHEN name = 'Gym Marketing Professionals' THEN 'Marketing specialists working in the fitness industry, focused on member acquisition and retention strategies'
  WHEN name = 'Healthcare Patients (managing chronic conditions, wellness-seekers)' THEN 'Individuals actively managing health conditions or pursuing wellness goals through medical care and lifestyle changes'
  WHEN name = 'Health‑Conscious Consumers (fitness/nutrition shoppers)' THEN 'Wellness-focused shoppers who prioritize fitness equipment, supplements, and nutritious food products'
  WHEN name = 'Independent Voters' THEN 'Politically unaffiliated citizens who vote based on issues and candidates rather than strict party loyalty'
  WHEN name = 'Luxury & Premium Buyers' THEN 'Affluent consumers who seek high-quality, exclusive products and are willing to pay premium prices for superior experiences'
  WHEN name = 'Meme Traders' THEN 'Retail investors who engage in cryptocurrency and stock trading based on social media trends and viral content'
  WHEN name = 'Mothers of Young Children' THEN 'Busy moms managing the demands of raising small children while balancing household and personal responsibilities'
  WHEN name = 'New Parents' THEN 'First-time and experienced parents navigating the early stages of child-rearing with new priorities and concerns'
  WHEN name = 'Overweight Adults' THEN 'Adults dealing with weight management challenges and seeking solutions for healthier lifestyles'
  WHEN name = 'Real Estate Agency Clients' THEN 'Homebuyers and sellers working with real estate professionals to navigate property transactions'
  WHEN name = 'Real Estate Investors' THEN 'Property investors seeking profitable opportunities in residential and commercial real estate markets'
  WHEN name = 'Senior Citizens (retirement planning, healthcare, leisure)' THEN 'Older adults focused on retirement security, healthcare needs, and enjoying their golden years'
  WHEN name = 'Small Business Owners (Retail/Service)' THEN 'Entrepreneurs running local businesses who face unique challenges in customer service and operations'
  WHEN name = 'Swing State Voters' THEN 'Voters in politically competitive states whose decisions significantly impact election outcomes'
  WHEN name = 'Teachers & Educators (K-12, higher ed, tutoring)' THEN 'Education professionals dedicated to student learning across various academic levels and settings'
  WHEN name = 'Tech Workers' THEN 'Technology industry professionals including developers, engineers, and digital specialists in various tech roles'
  WHEN name = 'Veterans & Military Families' THEN 'Current and former military service members and their families with unique experiences and needs'
  WHEN name = 'Works from Home' THEN 'Remote workers who have adapted to home-based employment with distinct lifestyle and workspace needs'
  WHEN name = 'Young Voters (18-25)' THEN 'First-time and early voters who are politically engaged and represent the future of democratic participation'
END
WHERE user_id = '9a02d71b-0561-425f-9adf-150243905530'
AND (description IS NULL OR description = '')
AND name IN (
  'AI Early Adopters', 'Caregivers for Aging Parents', 'Cat Owners', 'College Students & Recent Grads',
  'Diverse USA Consumer', 'DIY & Home Improvement Enthusiasts', 'Dog Owners', 'E-commerce Shoppers / Online Deal-Seekers',
  'Empty Nesters', 'Environmental Advocates (sustainability-conscious buyers, activists)', 'Fight Flow Study age 30-50',
  'Fight Flow Women', 'Gamers', 'Gym Customers', 'Gym Marketing Professionals',
  'Healthcare Patients (managing chronic conditions, wellness-seekers)', 'Health‑Conscious Consumers (fitness/nutrition shoppers)',
  'Independent Voters', 'Luxury & Premium Buyers', 'Meme Traders', 'Mothers of Young Children', 'New Parents',
  'Overweight Adults', 'Real Estate Agency Clients', 'Real Estate Investors',
  'Senior Citizens (retirement planning, healthcare, leisure)', 'Small Business Owners (Retail/Service)',
  'Swing State Voters', 'Teachers & Educators (K-12, higher ed, tutoring)', 'Tech Workers',
  'Veterans & Military Families', 'Works from Home', 'Young Voters (18-25)'
);