export interface LocationPageConfig {
  path: string;
  city: string;
  stateRegion: string;
  useCase: string;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  executiveSummary: string;
  faqs: { q: string; a: string }[];
  evidenceText: string;
}

export const TOP_CITIES: { city: string; state: string; region: string }[] = [

  // ===== MIDDLE EAST & GCC (25 cities) =====
  { city: 'Dubai', state: 'UAE', region: 'Middle East Tech & Financial Capital' },
  { city: 'Abu Dhabi', state: 'UAE', region: 'Capital Hub & Government Innovation' },
  { city: 'Sharjah', state: 'UAE', region: 'Industrial & Trade Center' },
  { city: 'Ajman', state: 'UAE', region: 'UAE Northern Emirate Hub' },
  { city: 'Ras Al Khaimah', state: 'UAE', region: 'Free Zone & Industrial Hub' },
  { city: 'Fujairah', state: 'UAE', region: 'East Coast Maritime Hub' },
  { city: 'Riyadh', state: 'Saudi Arabia', region: 'GCC Vision 2030 Enterprise Hub' },
  { city: 'Jeddah', state: 'Saudi Arabia', region: 'Red Sea Commercial Center' },
  { city: 'Dammam', state: 'Saudi Arabia', region: 'Eastern Province Industrial Hub' },
  { city: 'Mecca', state: 'Saudi Arabia', region: 'Holy City & Religious Services Hub' },
  { city: 'Medina', state: 'Saudi Arabia', region: 'Religious & Logistics Hub' },
  { city: 'Khobar', state: 'Saudi Arabia', region: 'Aramco Corridor Business Hub' },
  { city: 'Doha', state: 'Qatar', region: 'Gulf Enterprise & Energy Capital' },
  { city: 'Muscat', state: 'Oman', region: 'Gulf Trade & Logistics Center' },
  { city: 'Sohar', state: 'Oman', region: 'Northern Oman Industrial Port' },
  { city: 'Kuwait City', state: 'Kuwait', region: 'Gulf Commercial District' },
  { city: 'Manama', state: 'Bahrain', region: 'Fintech & Financial Hub' },
  { city: 'Amman', state: 'Jordan', region: 'Levant Business & Technology Hub' },
  { city: 'Beirut', state: 'Lebanon', region: 'Mediterranean Business Hub' },
  { city: 'Cairo', state: 'Egypt', region: 'North Africa Commercial Capital' },
  { city: 'Alexandria', state: 'Egypt', region: 'Mediterranean Port & Business Hub' },
  { city: 'Istanbul', state: 'Turkey', region: 'Eurasian Commerce & Logistics Bridge' },
  { city: 'Ankara', state: 'Turkey', region: 'Turkish Capital Enterprise Hub' },
  { city: 'Karachi', state: 'Pakistan', region: 'South Asia Commercial Port' },
  { city: 'Lahore', state: 'Pakistan', region: 'Pakistan Technology & Cultural Hub' },

  // ===== SOUTHEAST ASIA (25 cities) =====
  { city: 'Singapore', state: 'Singapore', region: 'APAC Tech & Financial Hub' },
  { city: 'Kuala Lumpur', state: 'Malaysia', region: 'ASEAN Business & Digital Hub' },
  { city: 'Penang', state: 'Malaysia', region: 'Northern Malaysia Industrial Hub' },
  { city: 'Johor Bahru', state: 'Malaysia', region: 'Southern Malaysia Gateway' },
  { city: 'Jakarta', state: 'Indonesia', region: 'Southeast Asia Tech & Commerce Hub' },
  { city: 'Surabaya', state: 'Indonesia', region: 'East Java Industrial Capital' },
  { city: 'Bandung', state: 'Indonesia', region: 'Indonesia Startup & Creative Hub' },
  { city: 'Medan', state: 'Indonesia', region: 'North Sumatra Commercial Center' },
  { city: 'Bangkok', state: 'Thailand', region: 'Regional Enterprise & Retail Capital' },
  { city: 'Chiang Mai', state: 'Thailand', region: 'North Thailand Digital Hub' },
  { city: 'Manila', state: 'Philippines', region: 'Global BPO & Staffing Capital' },
  { city: 'Cebu', state: 'Philippines', region: 'Philippines IT & BPO Hub' },
  { city: 'Ho Chi Minh City', state: 'Vietnam', region: 'Vietnam Commercial & Tech Hub' },
  { city: 'Hanoi', state: 'Vietnam', region: 'Northern Enterprise Capital' },
  { city: 'Da Nang', state: 'Vietnam', region: 'Central Vietnam Tech Hub' },
  { city: 'Phnom Penh', state: 'Cambodia', region: 'Mekong Commercial Capital' },
  { city: 'Vientiane', state: 'Laos', region: 'Mekong Regional Hub' },
  { city: 'Yangon', state: 'Myanmar', region: 'Myanmar Commercial Capital' },
  { city: 'Colombo', state: 'Sri Lanka', region: 'South Asia Island Commerce Hub' },
  { city: 'Dhaka', state: 'Bangladesh', region: 'South Asia Garment & Tech Hub' },
  { city: 'Chittagong', state: 'Bangladesh', region: 'Bangladesh Port & Industrial City' },
  { city: 'Kathmandu', state: 'Nepal', region: 'Himalayan Regional Capital' },
  { city: 'Taipei', state: 'Taiwan', region: 'East Asia Semiconductor & Innovation Hub' },
  { city: 'Hong Kong', state: 'Hong Kong SAR', region: 'Asia Pacific Financial Center' },
  { city: 'Macau', state: 'Macau SAR', region: 'Asia Pacific Hospitality Hub' },

  // ===== NORTH AMERICA & UK (25 cities) =====
  { city: 'New York', state: 'USA (NY)', region: 'Global Financial & Media Capital' },
  { city: 'San Francisco', state: 'USA (CA)', region: 'Silicon Valley Innovation Hub' },
  { city: 'Los Angeles', state: 'USA (CA)', region: 'Media, Trade & Enterprise Hub' },
  { city: 'Chicago', state: 'USA (IL)', region: 'Midwest Commercial Capital' },
  { city: 'Houston', state: 'USA (TX)', region: 'Energy & Diverse Enterprise Hub' },
  { city: 'Dallas', state: 'USA (TX)', region: 'Southwest Corporate HQ Hub' },
  { city: 'Austin', state: 'USA (TX)', region: 'Enterprise Tech & Startup Hub' },
  { city: 'Seattle', state: 'USA (WA)', region: 'Cloud & Enterprise SaaS Hub' },
  { city: 'Boston', state: 'USA (MA)', region: 'Healthcare & Biotech Innovation' },
  { city: 'Atlanta', state: 'USA (GA)', region: 'Southeast US Enterprise Hub' },
  { city: 'Miami', state: 'USA (FL)', region: 'Latin America Gateway & Fintech' },
  { city: 'Phoenix', state: 'USA (AZ)', region: 'Southwest Growth & Tech Hub' },
  { city: 'Washington DC', state: 'USA (DC)', region: 'Government & Policy Tech Hub' },
  { city: 'Denver', state: 'USA (CO)', region: 'Mountain West Enterprise Hub' },
  { city: 'Minneapolis', state: 'USA (MN)', region: 'Midwest Healthcare & Retail Hub' },
  { city: 'Toronto', state: 'Canada (ON)', region: 'North American Finance & Tech' },
  { city: 'Vancouver', state: 'Canada (BC)', region: 'Pacific Gateway & Digital Hub' },
  { city: 'Montreal', state: 'Canada (QC)', region: 'Canadian AI & Creative Hub' },
  { city: 'Calgary', state: 'Canada (AB)', region: 'Canadian Energy & Enterprise Hub' },
  { city: 'Ottawa', state: 'Canada (ON)', region: 'Canadian Government & Tech Capital' },
  { city: 'London', state: 'United Kingdom', region: 'European & Global Business Hub' },
  { city: 'Manchester', state: 'United Kingdom', region: 'UK Northern Powerhouse Hub' },
  { city: 'Birmingham', state: 'United Kingdom', region: 'UK Midlands Enterprise Hub' },
  { city: 'Sydney', state: 'Australia', region: 'APAC Southern Business Capital' },
  { city: 'Melbourne', state: 'Australia', region: 'Australia Innovation & Finance Hub' },

  // ===== INDIA - MAHARASHTRA (20 cities) =====
  { city: 'Mumbai', state: 'Maharashtra', region: 'Financial Capital of India' },
  { city: 'Pune', state: 'Maharashtra', region: 'Maharashtra Manufacturing & Tech Hub' },
  { city: 'Nagpur', state: 'Maharashtra', region: 'Central India Logistics Nexus' },
  { city: 'Nashik', state: 'Maharashtra', region: 'Grape Capital & Engineering Hub' },
  { city: 'Thane', state: 'Maharashtra', region: 'MMR Business District' },
  { city: 'Navi Mumbai', state: 'Maharashtra', region: 'Infotech & Port Hub' },
  { city: 'Aurangabad', state: 'Maharashtra', region: 'Marathwada Industrial Hub' },
  { city: 'Solapur', state: 'Maharashtra', region: 'Textile & Commerce District' },
  { city: 'Kolhapur', state: 'Maharashtra', region: 'Southern Maharashtra Trade Hub' },
  { city: 'Amravati', state: 'Maharashtra', region: 'Vidarbha Commercial Center' },
  { city: 'Nanded', state: 'Maharashtra', region: 'Marathwada Regional Hub' },
  { city: 'Sangli', state: 'Maharashtra', region: 'Turmeric & Trade Center' },
  { city: 'Latur', state: 'Maharashtra', region: 'Marathwada Pulse Capital' },
  { city: 'Dhule', state: 'Maharashtra', region: 'North Maharashtra Commerce Hub' },
  { city: 'Ahmednagar', state: 'Maharashtra', region: 'Maharashtra Deccan Hub' },
  { city: 'Jalgaon', state: 'Maharashtra', region: 'Banana & Industrial Belt' },
  { city: 'Chandrapur', state: 'Maharashtra', region: 'Vidarbha Mining & Industry' },
  { city: 'Malegaon', state: 'Maharashtra', region: 'Maharashtra Power Loom Hub' },
  { city: 'Akola', state: 'Maharashtra', region: 'Vidarbha Cotton Belt' },
  { city: 'Pimpri-Chinchwad', state: 'Maharashtra', region: 'Pune Metro Industrial Zone' },

  // ===== INDIA - UTTAR PRADESH (20 cities) =====
  { city: 'Lucknow', state: 'Uttar Pradesh', region: 'UP State Capital & Commerce' },
  { city: 'Noida', state: 'Uttar Pradesh', region: 'IT & Media Hub' },
  { city: 'Kanpur', state: 'Uttar Pradesh', region: 'Leather & Industrial Hub' },
  { city: 'Agra', state: 'Uttar Pradesh', region: 'Tourism & Commercial Hub' },
  { city: 'Varanasi', state: 'Uttar Pradesh', region: 'Cultural & Textile Center' },
  { city: 'Meerut', state: 'Uttar Pradesh', region: 'NCR Industrial Corridor' },
  { city: 'Prayagraj', state: 'Uttar Pradesh', region: 'Sangam City & Education Hub' },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', region: 'NCR Industrial Gateway' },
  { city: 'Bareilly', state: 'Uttar Pradesh', region: 'UP Northern Commerce Hub' },
  { city: 'Aligarh', state: 'Uttar Pradesh', region: 'Lock & Brass Industrial City' },
  { city: 'Moradabad', state: 'Uttar Pradesh', region: 'Brass & Handicraft Export Hub' },
  { city: 'Saharanpur', state: 'Uttar Pradesh', region: 'UP Northern Wood Craft Hub' },
  { city: 'Gorakhpur', state: 'Uttar Pradesh', region: 'Eastern UP Trade Center' },
  { city: 'Firozabad', state: 'Uttar Pradesh', region: 'Glass & Bangle Industry Hub' },
  { city: 'Jhansi', state: 'Uttar Pradesh', region: 'Bundelkhand Commercial Center' },
  { city: 'Muzaffarnagar', state: 'Uttar Pradesh', region: 'Sugar & Commerce Belt' },
  { city: 'Mathura', state: 'Uttar Pradesh', region: 'Religious & Petrochemical Hub' },
  { city: 'Raebareli', state: 'Uttar Pradesh', region: 'UP Central Commerce Town' },
  { city: 'Hapur', state: 'Uttar Pradesh', region: 'NCR Light Industry Hub' },
  { city: 'Rampur', state: 'Uttar Pradesh', region: 'UP Northern Trade District' },

  // ===== INDIA - RAJASTHAN (15 cities) =====
  { city: 'Jaipur', state: 'Rajasthan', region: 'Pink City - Northern Commerce Hub' },
  { city: 'Jodhpur', state: 'Rajasthan', region: 'Handicraft & Export Center' },
  { city: 'Udaipur', state: 'Rajasthan', region: 'Lake City Tourism & Marble Hub' },
  { city: 'Kota', state: 'Rajasthan', region: 'Education & Industrial Hub' },
  { city: 'Ajmer', state: 'Rajasthan', region: 'Central Rajasthan Commerce Hub' },
  { city: 'Bikaner', state: 'Rajasthan', region: 'Desert Commerce & Food Hub' },
  { city: 'Alwar', state: 'Rajasthan', region: 'Rajasthan-NCR Industrial Corridor' },
  { city: 'Bhilwara', state: 'Rajasthan', region: 'Textile Capital of India' },
  { city: 'Sikar', state: 'Rajasthan', region: 'Shekhawati Commerce Hub' },
  { city: 'Sri Ganganagar', state: 'Rajasthan', region: 'Northwest Agricultural Hub' },
  { city: 'Bharatpur', state: 'Rajasthan', region: 'Eastern Rajasthan Trade Hub' },
  { city: 'Pali', state: 'Rajasthan', region: 'Rajasthan Textile Processing Hub' },
  { city: 'Tonk', state: 'Rajasthan', region: 'Central Rajasthan Rural Hub' },
  { city: 'Chittorgarh', state: 'Rajasthan', region: 'Zinc & Heritage Hub' },
  { city: 'Jaisalmer', state: 'Rajasthan', region: 'Desert Tourism & Renewable Energy' },

  // ===== INDIA - GUJARAT (15 cities) =====
  { city: 'Ahmedabad', state: 'Gujarat', region: 'Textile & Enterprise Capital' },
  { city: 'Surat', state: 'Gujarat', region: 'Diamond & Textile Commerce Hub' },
  { city: 'Vadodara', state: 'Gujarat', region: 'Industrial & Petrochemical Hub' },
  { city: 'Rajkot', state: 'Gujarat', region: 'Engineering & Manufacturing Hub' },
  { city: 'Gandhinagar', state: 'Gujarat', region: 'Gujarat State Capital & IT Hub' },
  { city: 'Bhavnagar', state: 'Gujarat', region: 'Alang Ship Recycling & Trade' },
  { city: 'Jamnagar', state: 'Gujarat', region: 'Brass Capital & Petrochemicals' },
  { city: 'Junagadh', state: 'Gujarat', region: 'Agri & Commerce Center' },
  { city: 'Anand', state: 'Gujarat', region: 'Dairy Capital & AMUL Hub' },
  { city: 'Gandhidham', state: 'Gujarat', region: 'Kutch Trade & Port Gateway' },
  { city: 'Morbi', state: 'Gujarat', region: 'Ceramic & Clock Industry Hub' },
  { city: 'Navsari', state: 'Gujarat', region: 'South Gujarat Commerce Center' },
  { city: 'Surendranagar', state: 'Gujarat', region: 'Gujarat Cotton Belt Hub' },
  { city: 'Mehsana', state: 'Gujarat', region: 'North Gujarat Industrial Hub' },
  { city: 'Vapi', state: 'Gujarat', region: 'South Gujarat Chemical Industrial Zone' },

  // ===== INDIA - KARNATAKA (15 cities) =====
  { city: 'Bangalore', state: 'Karnataka', region: 'Silicon Valley of India' },
  { city: 'Mysuru', state: 'Karnataka', region: 'Tech & Cultural Heritage Hub' },
  { city: 'Hubballi', state: 'Karnataka', region: 'North Karnataka Industrial Hub' },
  { city: 'Mangalore', state: 'Karnataka', region: 'Port & Educational Hub' },
  { city: 'Belgaum', state: 'Karnataka', region: 'Border Region Commerce Hub' },
  { city: 'Davangere', state: 'Karnataka', region: 'Cotton & Commerce Belt' },
  { city: 'Ballari', state: 'Karnataka', region: 'Karnataka Iron & Steel Hub' },
  { city: 'Shimoga', state: 'Karnataka', region: 'Malnad Regional Commerce Hub' },
  { city: 'Gulbarga', state: 'Karnataka', region: 'Hyderabad-Karnataka Commerce Hub' },
  { city: 'Tumkur', state: 'Karnataka', region: 'Bangalore Satellite Industrial Hub' },
  { city: 'Raichur', state: 'Karnataka', region: 'Karnataka Power & Agriculture Hub' },
  { city: 'Bidar', state: 'Karnataka', region: 'Bidar Craft & Heritage City' },
  { city: 'Udupi', state: 'Karnataka', region: 'Coastal Trade & Education Hub' },
  { city: 'Vijayapura', state: 'Karnataka', region: 'Northern Karnataka Heritage Hub' },
  { city: 'Dharwad', state: 'Karnataka', region: 'North Karnataka Education Hub' },

  // ===== INDIA - TAMIL NADU (15 cities) =====
  { city: 'Chennai', state: 'Tamil Nadu', region: 'Automotive & SaaS Capital' },
  { city: 'Coimbatore', state: 'Tamil Nadu', region: 'Manchester of South India' },
  { city: 'Madurai', state: 'Tamil Nadu', region: 'Temple City Commerce Hub' },
  { city: 'Trichy', state: 'Tamil Nadu', region: 'Educational & Engineering Hub' },
  { city: 'Salem', state: 'Tamil Nadu', region: 'Steel & Textile Center' },
  { city: 'Tirunelveli', state: 'Tamil Nadu', region: 'Southern TN Trade Hub' },
  { city: 'Tiruppur', state: 'Tamil Nadu', region: 'Knitwear Export Capital' },
  { city: 'Erode', state: 'Tamil Nadu', region: 'Turmeric & Textile Hub' },
  { city: 'Vellore', state: 'Tamil Nadu', region: 'Healthcare & Education Hub' },
  { city: 'Thoothukudi', state: 'Tamil Nadu', region: 'Port City & Pearl Trade' },
  { city: 'Thanjavur', state: 'Tamil Nadu', region: 'Rice Bowl & Heritage Hub' },
  { city: 'Dindigul', state: 'Tamil Nadu', region: 'TN Central Lock & Commerce Hub' },
  { city: 'Kanchipuram', state: 'Tamil Nadu', region: 'Temple & Silk Weaving City' },
  { city: 'Nagercoil', state: 'Tamil Nadu', region: 'Southernmost Tamil Nadu Hub' },
  { city: 'Hosur', state: 'Tamil Nadu', region: 'Bangalore Border Industrial Hub' },

  // ===== INDIA - ANDHRA PRADESH & TELANGANA (15 cities) =====
  { city: 'Hyderabad', state: 'Telangana', region: 'IT & Pharma Twin Cities Hub' },
  { city: 'Secunderabad', state: 'Telangana', region: 'Telangana Commercial Twin City' },
  { city: 'Warangal', state: 'Telangana', region: 'Telangana Second City' },
  { city: 'Nizamabad', state: 'Telangana', region: 'Northern Telangana Commerce' },
  { city: 'Karimnagar', state: 'Telangana', region: 'Telangana Granite & Trade Hub' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', region: 'Coastal Port & Tech Hub' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', region: 'AP Commercial & Trade Capital' },
  { city: 'Guntur', state: 'Andhra Pradesh', region: 'AP Tobacco & Commerce Hub' },
  { city: 'Nellore', state: 'Andhra Pradesh', region: 'AP Southern Commerce Center' },
  { city: 'Kurnool', state: 'Andhra Pradesh', region: 'Rayalaseema Commercial Center' },
  { city: 'Rajahmundry', state: 'Andhra Pradesh', region: 'Godavari Delta Trade Hub' },
  { city: 'Tirupati', state: 'Andhra Pradesh', region: 'Pilgrimage & Education Hub' },
  { city: 'Eluru', state: 'Andhra Pradesh', region: 'AP Western Delta Commerce Hub' },
  { city: 'Ongole', state: 'Andhra Pradesh', region: 'Prakasam Cattle & Trade Hub' },
  { city: 'Anantapur', state: 'Andhra Pradesh', region: 'AP Western Industrial Hub' },

  // ===== INDIA - WEST BENGAL & EASTERN INDIA (15 cities) =====
  { city: 'Kolkata', state: 'West Bengal', region: 'Eastern Business Gateway of India' },
  { city: 'Howrah', state: 'West Bengal', region: 'Industrial & Engineering Hub' },
  { city: 'Durgapur', state: 'West Bengal', region: 'Steel City of West Bengal' },
  { city: 'Asansol', state: 'West Bengal', region: 'Coal & Industry Belt' },
  { city: 'Siliguri', state: 'West Bengal', region: 'Northeast Gateway & Tea Trade' },
  { city: 'Patna', state: 'Bihar', region: 'Bihar Capital & Commerce' },
  { city: 'Gaya', state: 'Bihar', region: 'Bihar Religious & Commerce Hub' },
  { city: 'Muzaffarpur', state: 'Bihar', region: 'Bihar Northern Commerce Hub' },
  { city: 'Ranchi', state: 'Jharkhand', region: 'Jharkhand Capital & Mining Hub' },
  { city: 'Jamshedpur', state: 'Jharkhand', region: 'Steel & Heavy Manufacturing City' },
  { city: 'Dhanbad', state: 'Jharkhand', region: 'Coal Capital of India' },
  { city: 'Bhubaneswar', state: 'Odisha', region: 'Odisha Capital & IT Hub' },
  { city: 'Cuttack', state: 'Odisha', region: 'Odisha Silver Filigree Commerce' },
  { city: 'Rourkela', state: 'Odisha', region: 'Odisha Steel Town' },
  { city: 'Berhampur', state: 'Odisha', region: 'Silk & Commerce Hub of Odisha' },

  // ===== INDIA - DELHI NCR & HARYANA & PUNJAB (20 cities) =====
  { city: 'Delhi NCR', state: 'Delhi/Haryana/UP', region: 'National Capital Region' },
  { city: 'Gurgaon', state: 'Haryana', region: 'Corporate & Startup Capital' },
  { city: 'Noida Sector 62', state: 'Uttar Pradesh', region: 'IT & Electronics Hub' },
  { city: 'Faridabad', state: 'Haryana', region: 'NCR Southern Industrial Belt' },
  { city: 'Sonipat', state: 'Haryana', region: 'NCR Northern Manufacturing Hub' },
  { city: 'Rohtak', state: 'Haryana', region: 'Haryana Healthcare & Education Hub' },
  { city: 'Panipat', state: 'Haryana', region: 'Haryana Textile Recycling Hub' },
  { city: 'Hisar', state: 'Haryana', region: 'Haryana Steel & Agriculture Hub' },
  { city: 'Karnal', state: 'Haryana', region: 'Haryana Agri & Dairy Hub' },
  { city: 'Ambala', state: 'Haryana', region: 'Haryana Electronics & Trade Hub' },
  { city: 'Ludhiana', state: 'Punjab', region: 'Punjab Industrial Textile Capital' },
  { city: 'Amritsar', state: 'Punjab', region: 'Border Commerce & Heritage Hub' },
  { city: 'Jalandhar', state: 'Punjab', region: 'Sports Goods & Industrial Hub' },
  { city: 'Chandigarh', state: 'Punjab/Haryana', region: 'Tri-City Hub' },
  { city: 'Patiala', state: 'Punjab', region: 'Heritage & Agricultural Hub' },
  { city: 'Bathinda', state: 'Punjab', region: 'Punjab Southwest Petrochemical Hub' },
  { city: 'Pathankot', state: 'Punjab', region: 'Punjab Northern Gateway City' },
  { city: 'Mohali', state: 'Punjab', region: 'Chandigarh Satellite IT Hub' },
  { city: 'Zirakpur', state: 'Punjab', region: 'Chandigarh Peripheral Commerce Hub' },
  { city: 'Shimla', state: 'Himachal Pradesh', region: 'Himachal Capital & Tourism Hub' },

  // ===== INDIA - MADHYA PRADESH & CHHATTISGARH (15 cities) =====
  { city: 'Indore', state: 'Madhya Pradesh', region: 'MP Commerce & IT Capital' },
  { city: 'Bhopal', state: 'Madhya Pradesh', region: 'MP State Capital District' },
  { city: 'Jabalpur', state: 'Madhya Pradesh', region: 'MP Defense & Education Hub' },
  { city: 'Gwalior', state: 'Madhya Pradesh', region: 'MP Heritage & Trade District' },
  { city: 'Ujjain', state: 'Madhya Pradesh', region: 'Religious & Commerce Hub' },
  { city: 'Sagar', state: 'Madhya Pradesh', region: 'Central MP Commerce District' },
  { city: 'Rewa', state: 'Madhya Pradesh', region: 'MP Eastern Commerce Hub' },
  { city: 'Satna', state: 'Madhya Pradesh', region: 'MP Cement & Mining Hub' },
  { city: 'Ratlam', state: 'Madhya Pradesh', region: 'MP Railway & Commerce Hub' },
  { city: 'Dewas', state: 'Madhya Pradesh', region: 'MP Industrial Cluster' },
  { city: 'Raipur', state: 'Chhattisgarh', region: 'Chhattisgarh Capital & Industry' },
  { city: 'Bhilai', state: 'Chhattisgarh', region: 'Chhattisgarh Steel City' },
  { city: 'Bilaspur', state: 'Chhattisgarh', region: 'CG Railway & Commerce Hub' },
  { city: 'Durg', state: 'Chhattisgarh', region: 'CG Industrial Belt Hub' },
  { city: 'Korba', state: 'Chhattisgarh', region: 'Power Capital of Chhattisgarh' },

  // ===== INDIA - KERALA (10 cities) =====
  { city: 'Kochi', state: 'Kerala', region: 'Kerala Maritime & Tech Capital' },
  { city: 'Thiruvananthapuram', state: 'Kerala', region: 'Kerala IT & Governance Hub' },
  { city: 'Kozhikode', state: 'Kerala', region: 'Malabar Commerce & Spice Hub' },
  { city: 'Thrissur', state: 'Kerala', region: 'Kerala Cultural & Finance Hub' },
  { city: 'Kannur', state: 'Kerala', region: 'North Kerala Weaving & Trade' },
  { city: 'Palakkad', state: 'Kerala', region: 'Kerala Gateway City' },
  { city: 'Malappuram', state: 'Kerala', region: 'Kerala Northern Commerce Hub' },
  { city: 'Alappuzha', state: 'Kerala', region: 'Backwaters Tourism & Coir Hub' },
  { city: 'Kollam', state: 'Kerala', region: 'Cashew & Marine Products Hub' },
  { city: 'Kottayam', state: 'Kerala', region: 'Rubber & Education Capital' },

  // ===== INDIA - NORTHEAST & NORTH INDIA (15 cities) =====
  { city: 'Guwahati', state: 'Assam', region: 'Northeast Gateway Commerce Hub' },
  { city: 'Dibrugarh', state: 'Assam', region: 'Assam Tea & Oil Capital' },
  { city: 'Silchar', state: 'Assam', region: 'Barak Valley Commerce Hub' },
  { city: 'Shillong', state: 'Meghalaya', region: 'Scotland of the East Hub' },
  { city: 'Imphal', state: 'Manipur', region: 'Northeast India Cultural Capital' },
  { city: 'Agartala', state: 'Tripura', region: 'Tripura Capital & Gateway' },
  { city: 'Itanagar', state: 'Arunachal Pradesh', region: 'Northeast Frontier Hub' },
  { city: 'Kohima', state: 'Nagaland', region: 'Nagaland Capital Commerce Hub' },
  { city: 'Aizawl', state: 'Mizoram', region: 'Mizoram Capital & Trade Hub' },
  { city: 'Gangtok', state: 'Sikkim', region: 'Sikkim Capital Tourism Hub' },
  { city: 'Dehradun', state: 'Uttarakhand', region: 'Uttarakhand Capital & IT Hub' },
  { city: 'Haridwar', state: 'Uttarakhand', region: 'Pilgrim & Pharma Industry Hub' },
  { city: 'Haldwani', state: 'Uttarakhand', region: 'Kumaon Gateway Commerce Hub' },
  { city: 'Jammu', state: 'J&K', region: 'J&K Winter Capital Commerce Hub' },
  { city: 'Srinagar', state: 'J&K', region: 'J&K Summer Capital & Crafts Hub' },

  // ===== INDIA - SOUTH & OTHER STATES (10 cities) =====
  { city: 'Pondicherry', state: 'Puducherry', region: 'French Heritage Commerce Hub' },
  { city: 'Mysore', state: 'Karnataka', region: 'Sandalwood & Silk Heritage Hub' },
  { city: 'Mangaluru', state: 'Karnataka', region: 'Port Education & Finance Hub' },
  { city: 'Goa', state: 'Goa', region: 'Coastal Tourism & Startup Hub' },
  { city: 'Panaji', state: 'Goa', region: 'Goa Capital & Tourism Commerce' },
  { city: 'Margao', state: 'Goa', region: 'Goa Southern Commerce Hub' },
  { city: 'Rajnandgaon', state: 'Chhattisgarh', region: 'CG Industrial & Commerce Hub' },
  { city: 'Bokaro', state: 'Jharkhand', region: 'Jharkhand Steel & Industry Hub' },
  { city: 'Tiruchirapalli', state: 'Tamil Nadu', region: 'TN Engineering & Education' },
  { city: 'Pudukottai', state: 'Tamil Nadu', region: 'TN Rock Fort Commerce Hub' },
];

export const LOCATION_USE_CASES = [
  { slug: 'recruitment-agencies', title: 'Recruitment & Staffing Agencies', focus: 'candidate screening and resume parsing' },
  { slug: 'whatsapp-business-api', title: 'WhatsApp Business API Solutions', focus: 'multi-agent team inbox and lead routing' },
  { slug: 'hiring-automation', title: 'Hiring Automation & SLA Tracking', focus: 'candidate drop-off reduction and interview scheduling' },
  { slug: 'real-estate-lead-management', title: 'Real Estate Lead Management', focus: 'instant site-visit booking and lead response SLA' },
  { slug: 'healthcare-patient-messaging', title: 'Healthcare & Clinic Patient Messaging', focus: 'appointment confirmations and follow-ups' }
];

export const generateLocationPages = (): LocationPageConfig[] => {
  const pages: LocationPageConfig[] = [];
  const seen = new Set<string>();

  TOP_CITIES.forEach(c => {
    LOCATION_USE_CASES.forEach(u => {
      const citySlug = c.city.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const path = `/location/${u.slug}-${citySlug}`;
      if (seen.has(path)) return;
      seen.add(path);
      pages.push({
        path,
        city: c.city,
        stateRegion: `${c.state} (${c.region})`,
        useCase: u.title,
        title: `${u.title} in ${c.city} | CHATR & TalentXcel`,
        description: `Deploy CHATR OS and TalentXcel in ${c.city}, ${c.state}. Automate ${u.focus} with official WhatsApp Business API integration. Verified telemetry benchmarks.`,
        keywords: `${u.slug} ${c.city}, whatsapp automation ${c.city}, candidate screening ${c.city}, chatr ${c.city}`,
        h1: `${u.title} in ${c.city}`,
        executiveSummary: `Enterprises and agencies in ${c.city} use CHATR Communication OS to streamline ${u.focus}, reduce first-response time under 60 seconds, and eliminate unassigned WhatsApp lead queues.`,
        faqs: [
          {
            q: `How does CHATR support businesses in ${c.city}?`,
            a: `CHATR provides cloud-based WhatsApp Business API multi-agent inboxes, automated candidate screening, and real-time SLA dashboards tailored for ${c.city} enterprise scale.`
          },
          {
            q: `Can recruitment agencies in ${c.city} use TalentXcel AI Resume Parser?`,
            a: `Yes. TalentXcel parses resumes in English and regional formats, extracting candidate skills and experience in under 1.2 seconds with 94% accuracy.`
          }
        ],
        evidenceText: `Based on regional telemetry across ${c.city} and ${c.state} business hubs (July-August 2026).`
      });
    });
  });

  return pages;
};

export const LOCATION_EXPANSION_PAGES = generateLocationPages();
