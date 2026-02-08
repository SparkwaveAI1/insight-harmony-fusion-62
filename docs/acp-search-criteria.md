# ACP Search Criteria Types & Examples

## User Query Categories

### 1. Demographics
- **Age ranges**: "adults", "seniors over 65", "millennials", "people in their 30s"
- **Gender**: "women", "men", "female executives"
- **Location**: "from Texas", "West Coast residents", "people in rural areas"
- **Income**: "high earners", "middle class", "under $50k income"
- **Education**: "college graduates", "PhD holders", "high school education"
- **Ethnicity**: "Hispanic Americans", "Asian professionals", "diverse backgrounds"

### 2. Psychographics
- **Political orientation**: "conservatives", "liberals", "moderates", "libertarians"
- **Values**: "family-oriented", "environmentally conscious", "religious"
- **Interests**: "outdoor enthusiasts", "tech lovers", "art collectors"

### 3. Behaviors & Lifestyle
- **Occupation**: "software engineers", "teachers", "healthcare workers", "retirees"
- **Hobbies**: "runners", "gamers", "gardeners", "photographers"
- **Media consumption**: "news readers", "podcast listeners", "social media users"
- **Consumer behavior**: "crypto investors", "luxury shoppers", "budget conscious"

### 4. Diversity Requirements
- **Different X**: "different political orientations", "different age groups", "different ethnicities"
- **Mix of X**: "mix of genders", "mix of income levels", "mix of education backgrounds"
- **Variety of X**: "variety of occupations", "variety of states", "variety of interests"
- **One from each X**: "one from each political lean", "one from each age decade"
- **Balanced representation**: "equal men and women", "balanced across regions"

### 5. Complex Combinations
- **Multi-filter**: "conservative women over 50 from the South"
- **Diversity + filters**: "crypto investors with different political views"
- **Quantity + category**: "2 liberals and 2 conservatives who work in tech"
- **Geographic diversity**: "5 people from different states in the Midwest"

## 25 Realistic Example Queries

### Basic Filtering (5 examples)
1. "5 crypto investors"
2. "women over 40 from Texas"
3. "software engineers in California"
4. "college graduates who are parents"
5. "seniors with health conditions"

### Diversity Requirements (8 examples)
6. "3 people with different political orientations"
7. "mix of ages and income levels"
8. "people from different states"
9. "variety of occupations and backgrounds"
10. "different ethnicities and education levels"
11. "one person from each age decade (20s, 30s, 40s, 50s)"
12. "balanced representation of men and women"
13. "different political leans but all from the South"

### Complex Combinations (7 examples)
14. "2 conservatives and 2 liberals who invest in crypto"
15. "tech workers with different political orientations from different states"
16. "women entrepreneurs from diverse ethnic backgrounds"
17. "3 people over 50 with different income brackets from the West Coast"
18. "college-educated parents with varying political views"
19. "healthcare workers from different regions with different ages"
20. "5 people: mix of urban and rural, different political leans"

### Niche/Specialized (5 examples)
21. "environmentally conscious voters from swing states"
22. "small business owners with children under different income brackets"
23. "retired professionals with different political orientations"
24. "young adults (20-30) from different ethnic backgrounds who are tech-savvy"
25. "middle-class families from the Midwest with varying education levels"

## Diversity Constraint Types

### 1. Unique Value Diversity
- Ensure no duplicate values for specified fields
- Examples: "different political orientations" → unique political_lean values
- Implementation: Group by field, take max 1 from each group

### 2. Balanced Distribution
- Aim for roughly equal representation across categories
- Examples: "equal men and women" → 50/50 gender split
- Implementation: Calculate target counts per category

### 3. Range Coverage
- Ensure representation across a range or spectrum
- Examples: "mix of ages" → cover different age brackets
- Implementation: Divide range into buckets, select from each

### 4. Categorical Sampling
- Sample from multiple distinct categories
- Examples: "variety of occupations" → select from different job types
- Implementation: Group by category, select random sample from each

### 5. Geographic Spread
- Ensure geographic distribution
- Examples: "from different states" → unique state values
- Implementation: Group by geographic field, diversify selection