/**
 * Offline Essential Modules Data Catalog
 * Contains pre-compiled, highly accurate Indian generic medicine prices (Jan Aushadhi)
 * and rich Indian kitchen recipe templates for full offline PWA accessibility.
 */

export interface CachedMedicineItem {
  id: string;
  brandName: string;
  aliases: string[];
  category: string;
  categoryHi: string;
  saltName: string;
  genericAlternative: string;
  priceBrand: number;
  priceGeneric: number;
  savingsPercentage: number;
  useCase: string;
  useCaseHi: string;
  dosageGuideline: string;
  precautions: string;
}

export interface CachedRecipeTemplate {
  id: string;
  title: string;
  titleHindi: string;
  diet: 'veg' | 'jain' | 'nonveg';
  mealType: string;
  prepTime: string;
  servings: string;
  matchingIngredients: string[];
  ingredients: string[];
  instructions: string[];
  jugaadTip: string;
  substitutions: string;
}

export const OFFLINE_MEDICINES_CATALOG: CachedMedicineItem[] = [
  {
    id: 'm1',
    brandName: 'Dolo 650 (Crocin / Calpol)',
    aliases: ['dolo', 'crocin', 'calpol', 'paracetamol', 'fever', 'bukhar', 'dard', 'headache'],
    category: 'Fever & Pain Relief',
    categoryHi: 'बुखार व बदन दर्द',
    saltName: 'Paracetamol 650mg',
    genericAlternative: 'Jan Aushadhi Paracetamol 650mg',
    priceBrand: 32,
    priceGeneric: 6,
    savingsPercentage: 81,
    useCase: 'High fever, tension headaches, mild to moderate body pain',
    useCaseHi: 'तेज बुखार, सिरदर्द, बदन दर्द और हल्का जोड़ों का दर्द',
    dosageGuideline: '1 tablet after food every 6-8 hours as required (max 4 tablets/day).',
    precautions: 'Do not exceed 4g paracetamol in 24 hours. Avoid alcohol.'
  },
  {
    id: 'm2',
    brandName: 'Pan 40 (Pantocid / Pantop)',
    aliases: ['pan 40', 'pantocid', 'pantop', 'pantoprazole', 'acidity', 'gas', 'jalan', 'gerd'],
    category: 'Acidity & Gastric',
    categoryHi: 'गैस, एसिडिटी व सीने में जलन',
    saltName: 'Pantoprazole 40mg',
    genericAlternative: 'Jan Aushadhi Pantoprazole 40mg',
    priceBrand: 155,
    priceGeneric: 18,
    savingsPercentage: 88,
    useCase: 'Heartburn, acid reflux (GERD), gastric ulcer healing',
    useCaseHi: 'सीने में जलन, पेट में गैस, खट्टी डकार व गैस्ट्रिक अल्सर',
    dosageGuideline: '1 tablet daily in the morning, 30 minutes before breakfast with plain water.',
    precautions: 'Take on empty stomach for maximum acid inhibition.'
  },
  {
    id: 'm3',
    brandName: 'Allegra 120 (Fexova / Altiva)',
    aliases: ['allegra', 'fexofenadine', 'allergy', 'khujli', 'running nose', 'chheenk', 'cold'],
    category: 'Allergy & Cold',
    categoryHi: 'एलर्जी, जुकाम व छींकें',
    saltName: 'Fexofenadine 120mg',
    genericAlternative: 'Jan Aushadhi Fexofenadine 120mg',
    priceBrand: 190,
    priceGeneric: 24,
    savingsPercentage: 87,
    useCase: 'Seasonal allergic rhinitis, frequent sneezing, watery itchy eyes, hives',
    useCaseHi: 'मौसम बदलने पर छींकें, बहती नाक, आंखों में खुजली और पित्ती',
    dosageGuideline: '1 tablet once daily with water, preferably evening.',
    precautions: 'Non-sedating antihistamine; avoid consuming simultaneously with fruit juices.'
  },
  {
    id: 'm4',
    brandName: 'Combiflam (Ibugesic Plus)',
    aliases: ['combiflam', 'ibugesic', 'ibuprofen', 'joint pain', 'toothache', 'swelling', 'moch'],
    category: 'Fever & Pain Relief',
    categoryHi: 'दर्द, सूजन व बुखार',
    saltName: 'Ibuprofen 400mg + Paracetamol 325mg',
    genericAlternative: 'Jan Aushadhi Ibuprofen + Paracetamol',
    priceBrand: 48,
    priceGeneric: 9,
    savingsPercentage: 81,
    useCase: 'Moderate body aches, severe toothache, muscular sprains, arthritis pain',
    useCaseHi: 'दांत दर्द, जोड़ों का दर्द, मोच, मांसपेशियों में खिंचाव व सूजन',
    dosageGuideline: '1 tablet after full meals (never take on an empty stomach).',
    precautions: 'Use with caution if history of acid reflux or stomach ulcer.'
  },
  {
    id: 'm5',
    brandName: 'Augmentin 625 (Moxikind-CV 625)',
    aliases: ['augmentin', 'amoxyclav', 'moxikind', 'infection', 'throat infection', 'antibiotic'],
    category: 'Antibiotics',
    categoryHi: 'एंटीबायोटिक (बैक्टीरियल संक्रमण)',
    saltName: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    genericAlternative: 'Jan Aushadhi Amoxyclav 625mg',
    priceBrand: 204,
    priceGeneric: 52,
    savingsPercentage: 75,
    useCase: 'Throat, ear, dental, sinus and lower respiratory bacterial infections',
    useCaseHi: 'गले में इन्फेक्शन, कान का संक्रमण, छाती का कफ व दांतों का घाव',
    dosageGuideline: '1 tablet twice daily for 5-7 days under prescription.',
    precautions: 'Never discontinue course prematurely; take after meals to prevent stomach upset.'
  },
  {
    id: 'm6',
    brandName: 'Cetrizine / Cetzine 10 (Zyrtec)',
    aliases: ['cetzine', 'cetirizine', 'zyrtec', 'itching', 'khansi', 'dust allergy', 'rash'],
    category: 'Allergy & Cold',
    categoryHi: 'एलर्जी व खुजली',
    saltName: 'Cetirizine Hydrochloride 10mg',
    genericAlternative: 'Jan Aushadhi Cetirizine 10mg',
    priceBrand: 22,
    priceGeneric: 4,
    savingsPercentage: 82,
    useCase: 'Common cold runny nose, mosquito bite itching, allergic rashes',
    useCaseHi: 'धूल की एलर्जी, सामान्य सर्दी, त्वचा में लाल चकत्ते और खुजली',
    dosageGuideline: '1 tablet at bedtime.',
    precautions: 'May cause mild sleepiness; avoid operating machinery after consumption.'
  },
  {
    id: 'm7',
    brandName: 'Glycomet 500 (Obimet)',
    aliases: ['glycomet', 'metformin', 'sugar', 'diabetes', 'madhumeh', 'hba1c'],
    category: 'Diabetes Management',
    categoryHi: 'शुगर व डायबिटीज नियंत्रण',
    saltName: 'Metformin Hydrochloride 500mg',
    genericAlternative: 'Jan Aushadhi Metformin 500mg',
    priceBrand: 45,
    priceGeneric: 7,
    savingsPercentage: 84,
    useCase: 'Type 2 Diabetes mellitus blood sugar regulation',
    useCaseHi: 'टाइप-2 डायबिटीज में ब्लड शुगर को संतुलित रखना',
    dosageGuideline: 'Take with or immediately after meals as prescribed.',
    precautions: 'Periodic kidney function & HbA1c monitoring recommended.'
  },
  {
    id: 'm8',
    brandName: 'Telma 40 (Telmikind / Telpres)',
    aliases: ['telma', 'telmisartan', 'bp', 'blood pressure', 'hypertension', 'dil', 'heart'],
    category: 'Cardiac & BP',
    categoryHi: 'ब्लड प्रेशर (BP) व हृदय',
    saltName: 'Telmisartan 40mg',
    genericAlternative: 'Jan Aushadhi Telmisartan 40mg',
    priceBrand: 115,
    priceGeneric: 16,
    savingsPercentage: 86,
    useCase: 'Hypertension (high blood pressure) management, cardiovascular protection',
    useCaseHi: 'हाई ब्लड प्रेशर को नियंत्रित करना और दिल पर दबाव कम करना',
    dosageGuideline: '1 tablet once daily in the morning at the same time.',
    precautions: 'Do not stop abruptly; check BP readings weekly.'
  },
  {
    id: 'm9',
    brandName: 'Pan-D (Pantocid DSR / Pantodac D)',
    aliases: ['pan d', 'pan-d', 'pantocid dsr', 'gas vomiting', 'nausea', 'ulcer', 'bloating'],
    category: 'Acidity & Gastric',
    categoryHi: 'गैस, उल्टी व भारीपन',
    saltName: 'Pantoprazole 40mg + Domperidone 30mg SR',
    genericAlternative: 'Jan Aushadhi Pantoprazole + Domperidone SR',
    priceBrand: 195,
    priceGeneric: 28,
    savingsPercentage: 86,
    useCase: 'Severe acid reflux with vomiting sensation, morning nausea, fullness',
    useCaseHi: 'एसिडिटी के साथ जी मिचलाना, उल्टी का अहसास व पेट फूलना',
    dosageGuideline: '1 capsule daily in the morning, 30-45 minutes before breakfast.',
    precautions: 'Swallow whole with water; do not break capsule beads.'
  },
  {
    id: 'm10',
    brandName: 'Azithral 500 (Azee 500 / Zady)',
    aliases: ['azithral', 'azithromycin', 'azee', 'tonsils', 'pneumonia', 'throat', 'cough'],
    category: 'Antibiotics',
    categoryHi: 'एंटीबायोटिक (गला व फेफड़े)',
    saltName: 'Azithromycin 500mg',
    genericAlternative: 'Jan Aushadhi Azithromycin 500mg',
    priceBrand: 130,
    priceGeneric: 38,
    savingsPercentage: 71,
    useCase: 'Acute bacterial pharyngitis, tonsillitis, chronic bronchitis exacerbation',
    useCaseHi: 'गले में तेज दर्द, टॉन्सिल, खांसी और छाती में जकड़न का संक्रमण',
    dosageGuideline: '1 tablet once daily for 3 days (1 hour before or 2 hours after meals).',
    precautions: 'Must be taken under doctor guidance; avoid missing consecutive doses.'
  },
  {
    id: 'm11',
    brandName: 'Montair LC (Montek LC / Telekast-L)',
    aliases: ['montair lc', 'montek lc', 'montelukast', 'asthma', 'dam', 'wheezing', 'night cough'],
    category: 'Allergy & Cold',
    categoryHi: 'दमा, सांस की तकलीफ व एलर्जी',
    saltName: 'Montelukast 10mg + Levocetirizine 5mg',
    genericAlternative: 'Jan Aushadhi Montelukast + Levocetirizine',
    priceBrand: 210,
    priceGeneric: 32,
    savingsPercentage: 85,
    useCase: 'Allergic asthma, persistent dry nocturnal cough, chronic allergic rhinitis',
    useCaseHi: 'रात में सूखी खांसी, सांस फूलना, एलर्जिक अस्थमा व धूल से बचाव',
    dosageGuideline: '1 tablet at night before sleeping.',
    precautions: 'Consistent daily timing helps maintain night airway relaxation.'
  },
  {
    id: 'm12',
    brandName: 'Becosules Capsules (Cobadex Forte)',
    aliases: ['becosules', 'b complex', 'mouth ulcer', 'chhale', 'weakness', 'kamzori', 'vitamins'],
    category: 'Vitamins & Supplements',
    categoryHi: 'विटामिन बी-कॉम्प्लेक्स व कमजोरी',
    saltName: 'Vitamin B-Complex + Vitamin C',
    genericAlternative: 'Jan Aushadhi B-Complex Forte',
    priceBrand: 55,
    priceGeneric: 12,
    savingsPercentage: 78,
    useCase: 'Painful mouth ulcers (chhale), fatigue, nutrient deficiencies',
    useCaseHi: 'मुंह के छाले, शारीरिक कमजोरी, भूख की कमी और नसों की शक्ति',
    dosageGuideline: '1 capsule daily after lunch.',
    precautions: 'Harmless neon-yellow urine discoloration is standard for excess B2 excretion.'
  },
  {
    id: 'm13',
    brandName: 'Shelcal 500 (Cipcal 500)',
    aliases: ['shelcal', 'calcium', 'cipcal', 'bone pain', 'haddi', 'vitamin d3'],
    category: 'Vitamins & Supplements',
    categoryHi: 'हड्डियों की मजबूती व कैल्शियम',
    saltName: 'Calcium Carbonate 500mg + Vitamin D3 250 IU',
    genericAlternative: 'Jan Aushadhi Calcium + Vitamin D3',
    priceBrand: 135,
    priceGeneric: 25,
    savingsPercentage: 81,
    useCase: 'Osteoporosis prevention, post-fracture healing, bone mineral strength',
    useCaseHi: 'हड्डियों व जोड़ों का दर्द, कैल्शियम की कमी और ऑस्टियोपोरोसिस',
    dosageGuideline: '1 tablet daily after lunch or dinner.',
    precautions: 'Drink 8-10 glasses of water daily.'
  },
  {
    id: 'm14',
    brandName: 'Atorva 10 (Storvas / Lipitor)',
    aliases: ['atorva', 'atorvastatin', 'cholesterol', 'fat', 'heart blockage', 'triglycerides'],
    category: 'Cardiac & BP',
    categoryHi: 'कोलेस्ट्रॉल व हार्ट हेल्थ',
    saltName: 'Atorvastatin 10mg',
    genericAlternative: 'Jan Aushadhi Atorvastatin 10mg',
    priceBrand: 98,
    priceGeneric: 14,
    savingsPercentage: 86,
    useCase: 'High LDL cholesterol reduction, coronary artery plaque stabilization',
    useCaseHi: 'खून में खराब कोलेस्ट्रॉल घटाना और नसों में ब्लॉकेज से बचाव',
    dosageGuideline: '1 tablet at bedtime.',
    precautions: 'Pair with brisk walking and low saturated fat diet.'
  },
  {
    id: 'm15',
    brandName: 'Volini Pain Relief Gel (Moov / Iodex)',
    aliases: ['volini', 'moov', 'pain gel', 'diclofenac gel', 'moch', 'kamar dard', 'sprain'],
    category: 'Pain Relief & Sprays',
    categoryHi: 'दर्द निवारक जेल व मलहम',
    saltName: 'Diclofenac Diethylamine + Linseed Oil + Methyl Salicylate',
    genericAlternative: 'Jan Aushadhi Diclofenac Pain Relief Gel 30g',
    priceBrand: 140,
    priceGeneric: 30,
    savingsPercentage: 79,
    useCase: 'Lower back stiffness, cervical neck pain, sports muscle sprains',
    useCaseHi: 'कमर दर्द, मोच, घुटनों की अकड़न और मांसपेशियों का खिंचाव',
    dosageGuideline: 'Apply a thin layer 3 times daily gently over painful area.',
    precautions: 'External use only. Avoid open wounds, cuts, or eyes.'
  },
  {
    id: 'm16',
    brandName: 'Electral Powder (ORS Sachet)',
    aliases: ['electral', 'ors', 'dehydration', 'dast', 'loose motion', 'dhoop', 'energy'],
    category: 'Emergency & First Aid',
    categoryHi: 'ओआरएस व निर्जलीकरण (डिहाइड्रेशन)',
    saltName: 'WHO Recommended Oral Rehydration Salts (ORS)',
    genericAlternative: 'Jan Aushadhi ORS 21.8g Sachet',
    priceBrand: 22,
    priceGeneric: 6,
    savingsPercentage: 73,
    useCase: 'Rapid electrolyte rebalancing in acute diarrhea, vomiting, heat exhaustion',
    useCaseHi: 'दस्त, उल्टी या तेज धूप से शरीर में पानी और नमक की कमी पूरा करना',
    dosageGuideline: 'Dissolve entire 21.8g pack in exactly 1 Liter of clean boiled & cooled water.',
    precautions: 'Do not boil or reheat prepared solution. Use within 24 hours.'
  },
  {
    id: 'm17',
    brandName: 'Emeset 4 (Vomitron / Zofer 4)',
    aliases: ['emeset', 'ondansetron', 'zofer', 'ulti', 'vomiting', 'safar me ulti', 'nausea'],
    category: 'Acidity & Gastric',
    categoryHi: 'उल्टी व जी मिचलाना',
    saltName: 'Ondansetron 4mg',
    genericAlternative: 'Jan Aushadhi Ondansetron 4mg',
    priceBrand: 50,
    priceGeneric: 8,
    savingsPercentage: 84,
    useCase: 'Acute nausea, motion sickness during mountain or bus travel, vomiting control',
    useCaseHi: 'उल्टी, जी घबराना और यात्रा के दौरान चक्कर आना रोकना',
    dosageGuideline: '1 tablet 30 minutes before travel or during nausea attack.',
    precautions: 'Follow medical advice for children or pregnant women.'
  },
  {
    id: 'm18',
    brandName: 'Omez 20 (Omeprazole)',
    aliases: ['omez', 'omeprazole', 'peptic ulcer', 'acid', 'pet dard'],
    category: 'Acidity & Gastric',
    categoryHi: 'पेट का अल्सर व एसिडिटी',
    saltName: 'Omeprazole 20mg',
    genericAlternative: 'Jan Aushadhi Omeprazole 20mg',
    priceBrand: 65,
    priceGeneric: 10,
    savingsPercentage: 85,
    useCase: 'Gastric acidity, stomach ulcers, burning sensation in chest',
    useCaseHi: 'पेट का अल्सर, जलन, खट्टी डकारें और अपच',
    dosageGuideline: '1 capsule before breakfast with water.',
    precautions: 'Do not crush or chew the capsule beads.'
  }
];

export const OFFLINE_RECIPE_TEMPLATES: CachedRecipeTemplate[] = [
  {
    id: 'rec_offline_1',
    title: 'Quick Leftover Roti Chivda',
    titleHindi: 'बची हुई रोटी का चटपटा चिवड़ा',
    diet: 'veg',
    mealType: 'Breakfast / Snacks',
    prepTime: '10 mins',
    servings: '2',
    matchingIngredients: ['roti', 'bread', 'onion', 'mustard', 'greenchilli', 'curryleaves', 'lemon'],
    ingredients: [
      '3-4 Leftover Rotis (बची हुई रोटियां)',
      '1 Chopped Onion (बारीक कटा प्याज)',
      '1 Green Chilli (बारीक कटी हरी मिर्च)',
      '1/2 tsp Mustard Seeds (राई)',
      'Curry Leaves & Coriander (कढ़ी पत्ता व हरा धनिया)',
      '1/4 tsp Turmeric, 1/2 tsp Salt, 1/2 Lemon'
    ],
    instructions: [
      'Tear rotis into bite-sized rough pieces or pulse coarsely in a mixer.',
      'Heat 1 tbsp oil in a kadai, crackle mustard seeds, green chilli, and curry leaves.',
      'Add chopped onion and sauté on medium flame until translucent.',
      'Sprinkle turmeric and salt, then add the roti pieces.',
      'Toss continuously on medium heat for 3-4 minutes until lightly crisp.',
      'Turn off flame, squeeze fresh lemon juice and garnish with coriander.'
    ],
    jugaadTip: 'Sprinkle 1 tbsp curd or water while tossing so stale dry rotis turn exceptionally soft inside with crisp edges!',
    substitutions: 'If no rotis, make this exact recipe using stale bread slices or leftover pav.'
  },
  {
    id: 'rec_offline_2',
    title: 'Dhaba Style Aloo Gobhi Matar',
    titleHindi: 'ढाबा स्टाइल आलू गोभी मटर',
    diet: 'veg',
    mealType: 'Lunch / Dinner',
    prepTime: '20 mins',
    servings: '3-4',
    matchingIngredients: ['potato', 'cauliflower', 'peas', 'onion', 'tomato', 'ginger_garlic'],
    ingredients: [
      '2 Medium Potatoes cubed (आलू)',
      '1 Medium Cauliflower florets (फूल गोभी)',
      '1/2 Cup Green Peas (हरी मटर)',
      '1 Onion & 2 Tomatoes pureed',
      '1 tsp Ginger-Garlic paste, 1/2 tsp Cumin seeds',
      'Spices: Haldi, Lal Mirch, Dhania powder, Garam Masala, Salt'
    ],
    instructions: [
      'Shallow fry potato cubes and cauliflower florets in 2 tbsp oil on medium-high flame until 70% cooked and golden. Remove to a plate.',
      'In the same pan, crackle cumin seeds, then sauté onions and ginger-garlic paste until brown.',
      'Add tomato puree, salt, turmeric, red chilli, and coriander powder. Cook until oil separates.',
      'Add green peas, fried potatoes, cauliflower, and 1/4 cup warm water. Mix well.',
      'Cover with lid and simmer on low flame for 6-8 minutes until vegetables are tender.',
      'Sprinkle garam masala and fresh chopped coriander before serving hot with rotis.'
    ],
    jugaadTip: 'Frying potatoes and cauliflower first seals their shape so they don\'t turn mushy while simmering in the gravy!',
    substitutions: 'If cauliflower is unavailable, replace with paneer cubes or capsicum.'
  },
  {
    id: 'rec_offline_3',
    title: 'Instant Indori Masala Poha',
    titleHindi: 'झटपट इंदौरी मसाला पोहा',
    diet: 'veg',
    mealType: 'Breakfast',
    prepTime: '12 mins',
    servings: '2-3',
    matchingIngredients: ['poha', 'onion', 'peanuts', 'greenchilli', 'mustard', 'turmeric', 'lemon'],
    ingredients: [
      '2 Cups Thick Poha (मोटा पोहा)',
      '1 Medium Onion finely chopped',
      '2 tbsp Raw Peanuts (मूंगफली)',
      '2 Green Chillies slit, 1/2 tsp Mustard seeds, 1/2 tsp Fennel (Saunf)',
      '1/2 tsp Turmeric, 1 tsp Sugar, Salt to taste',
      '1 Lemon, Fresh coriander, Indori Sev for topping'
    ],
    instructions: [
      'Rinse poha in a colander under running water for 30 seconds. Drain completely and gently toss with 1/2 tsp salt and 1 tsp sugar. Let rest for 5 minutes.',
      'Heat 1.5 tbsp oil in a pan, roast peanuts on medium-low flame until crunchy. Keep aside or leave in pan.',
      'Add mustard seeds, saunf (fennel), and green chillies. Let crackle.',
      'Add chopped onions and cook on medium flame until light pink (do not over-brown).',
      'Add turmeric powder and mix, then add the fluffed drained poha.',
      'Gently toss from edges to center on low flame. Cover with lid and steam for 2 minutes.',
      'Turn off flame, add generous lemon juice, chopped coriander, and crunchy sev.'
    ],
    jugaadTip: 'Adding sugar and salt directly to rinsed raw poha before cooking ensures uniform sweet-tangy taste throughout every grain!',
    substitutions: 'If peanuts are missing, toss in roasted chana dal or boiled peas.'
  },
  {
    id: 'rec_offline_4',
    title: 'Comfort Masala Khichdi (One-Pot)',
    titleHindi: 'पौष्टिक मसाला खिचड़ी (कुकर स्पेशल)',
    diet: 'veg',
    mealType: 'Dinner',
    prepTime: '20 mins',
    servings: '3',
    matchingIngredients: ['rice', 'moong_dal', 'arhar_dal', 'potato', 'onion', 'tomato', 'ghee', 'jeera', 'hing'],
    ingredients: [
      '1/2 Cup Rice + 1/2 Cup Yellow Moong Dal (धोकर 10 मिनट भिगोएं)',
      '1 Diced Potato, 1 Onion, 1 Tomato',
      '1 tbsp Desi Ghee, 1 tsp Cumin (Jeera), 1 pinch Hing',
      'Spices: Haldi, Salt, Red Chilli',
      '3.5 Cups Water'
    ],
    instructions: [
      'Heat ghee in a pressure cooker. Add hing and cumin seeds; let them splutter.',
      'Add chopped onion, tomato, and diced potato. Sauté for 2 minutes.',
      'Add turmeric, salt, soaked rice, and dal. Sauté gently for 1 minute.',
      'Pour in 3.5 cups of water and stir thoroughly.',
      'Close pressure cooker lid and cook on medium flame for 3-4 whistles.',
      'Allow pressure to release naturally. Stir and serve piping hot with ghee, papad, and pickle.'
    ],
    jugaadTip: 'A pinch of hing (asafoetida) in desi ghee makes the khichdi super easy to digest and creates an irresistible aroma!',
    substitutions: 'Can use Toor Dal or Masoor Dal if Moong Dal is not on hand.'
  },
  {
    id: 'rec_offline_5',
    title: 'Leftover Rice Lemon Masala Pulao',
    titleHindi: 'बचे हुए चावल का चटपटा लेमन पुलाव',
    diet: 'veg',
    mealType: 'Lunch / Dinner',
    prepTime: '10 mins',
    servings: '2',
    matchingIngredients: ['rice', 'onion', 'lemon', 'mustard', 'peanuts', 'curryleaves', 'turmeric'],
    ingredients: [
      '2 Cups Cooked Leftover Rice (बचे हुए ठंडे चावल)',
      '1 Onion sliced, 2 tbsp Peanuts',
      '1 tsp Mustard seeds, Curry leaves, 1 Green Chilli',
      '1/2 tsp Turmeric, Salt to taste',
      'Juice of 1 full Lemon'
    ],
    instructions: [
      'Gently separate cold leftover rice grains with your fingers so no lumps remain.',
      'Heat 1.5 tbsp oil in a pan, fry peanuts until golden brown.',
      'Add mustard seeds, curry leaves, and green chillies. Let crackle.',
      'Add sliced onions and sauté on medium heat until translucent.',
      'Add turmeric powder and salt, followed by the cooked rice.',
      'Toss lightly on medium-low flame for 3-4 minutes until heated through.',
      'Turn off flame and mix in freshly squeezed lemon juice.'
    ],
    jugaadTip: 'Cold refrigerated rice works 10x better than fresh hot rice because the starch is firm and grains won\'t break into a mush!',
    substitutions: 'Add any leftover dry sabzi directly into the rice for an instant masala tahri.'
  },
  {
    id: 'rec_offline_6',
    title: 'High-Protein Besan Cheela',
    titleHindi: 'हाई-प्रोटीन बेसन चीला (हेल्दी नाश्ता)',
    diet: 'veg',
    mealType: 'Breakfast / Snacks',
    prepTime: '15 mins',
    servings: '2',
    matchingIngredients: ['besan', 'onion', 'tomato', 'greenchilli', 'coriander', 'ajwain'],
    ingredients: [
      '1 Cup Besan (चने का आटा)',
      '1 Finely chopped Onion & 1 Tomato',
      '1 Green Chilli, 2 tbsp Coriander',
      '1/2 tsp Carom Seeds (Ajwain crushed between palms)',
      '1/4 tsp Haldi, 1/2 tsp Salt, Water to make smooth pourable batter',
      '1 tbsp Oil or Ghee for shallow cooking'
    ],
    instructions: [
      'In a bowl, mix besan, ajwain, turmeric, and salt. Add water gradually, whisking to form a smooth, lump-free dosa-like batter.',
      'Stir in chopped onions, tomatoes, chillies, and coriander.',
      'Heat a non-stick tawa on medium heat and brush lightly with oil.',
      'Pour a ladleful of batter in center and spread evenly in circular motion.',
      'Drizzle a few drops of oil around edges and cook for 2 minutes until bottom is golden and crispy.',
      'Flip and cook the second side for 1-2 minutes pressing gently.',
      'Serve hot with tomato ketchup or green mint chutney.'
    ],
    jugaadTip: 'Always crush Ajwain between palms before adding—it enhances aroma tenfold and aids quick digestion of gram flour!',
    substitutions: 'Grate 2 tbsp paneer on top right after flipping for a luxury Paneer Cheela.'
  },
  {
    id: 'rec_offline_7',
    title: 'Jeera Aloo (10-Minute Bachelor Special)',
    titleHindi: '10 मिनट में कुरकुरे जीरा आलू',
    diet: 'veg',
    mealType: 'Lunch / Dinner',
    prepTime: '10 mins',
    servings: '2',
    matchingIngredients: ['potato', 'jeera', 'greenchilli', 'turmeric', 'dhania_powder', 'lemon'],
    ingredients: [
      '3 Boiled or Thinly Sliced Potatoes (उबले या पतले कटे आलू)',
      '1.5 tsp Cumin Seeds (खड़ा जीरा)',
      '2 Slit Green Chillies, 1 inch grated Ginger',
      'Spices: 1/2 tsp Haldi, 1 tsp Coriander powder, 1/2 tsp Amchur (Dry Mango powder), Salt',
      '2 tbsp Mustard oil or Refined oil'
    ],
    instructions: [
      'Heat mustard oil in a pan until it smokes slightly, then lower flame.',
      'Add generous cumin seeds and let them sizzle into a deep nutty brown.',
      'Add slit chillies and ginger; sauté for 30 seconds.',
      'Add sliced potatoes, sprinkle haldi, dhania powder, amchur, and salt.',
      'Roast on medium flame uncovered for 5-7 minutes, flipping occasionally until golden crust forms on potato edges.',
      'Garnish with coriander and lemon juice. Perfect with hot puris or parathas!'
    ],
    jugaadTip: 'Adding 1/2 tsp Amchur (dry mango powder) or chaat masala right at the end turns simple potatoes into an addictive street-style delicacy!',
    substitutions: 'If amchur is unavailable, squeeze 1/2 fresh lemon.'
  },
  {
    id: 'rec_offline_8',
    title: 'Quick Egg Bhurji (Street Style)',
    titleHindi: 'स्ट्रीट स्टाइल अंडा भुर्जी',
    diet: 'nonveg',
    mealType: 'Breakfast / Dinner',
    prepTime: '10 mins',
    servings: '2',
    matchingIngredients: ['egg', 'onion', 'tomato', 'greenchilli', 'butter', 'coriander'],
    ingredients: [
      '3-4 Fresh Eggs (अंडे)',
      '2 Finely chopped Onions & 1 Tomato',
      '2 Green Chillies, 1 tbsp Butter + 1 tbsp Oil',
      '1/4 tsp Haldi, 1/2 tsp Pav Bhaji Masala or Garam Masala, Salt',
      'Fresh Coriander'
    ],
    instructions: [
      'Crack eggs into a bowl, whisk lightly with a pinch of salt.',
      'Heat butter and oil in a pan. Sauté chopped onions and chillies on medium flame until golden brown.',
      'Add tomatoes, salt, turmeric, and pav bhaji masala. Cook until tomatoes turn soft and pulpy.',
      'Pour in the whisked eggs on medium-low flame.',
      'Scramble continuously with a spatula for 2-3 minutes until soft, fluffy curds form.',
      'Do not overcook until dry. Garnish with coriander and serve immediately with toasted pav or roti.'
    ],
    jugaadTip: 'A half teaspoon of Pav Bhaji masala gives standard egg bhurji that famous Mumbai roadside buttery flavor!',
    substitutions: 'Replace eggs with 200g crumbled Paneer for pure vegetarian Paneer Bhurji.'
  },
  {
    id: 'rec_offline_9',
    title: 'Dhaba Style Paneer Masala',
    titleHindi: 'ढाबा स्टाइल पनीर मसाला',
    diet: 'veg',
    mealType: 'Dinner',
    prepTime: '20 mins',
    servings: '3',
    matchingIngredients: ['paneer', 'onion', 'tomato', 'capsicum', 'ginger_garlic', 'malai', 'kasuri_methi'],
    ingredients: [
      '200g Fresh Paneer cubes (ताजा पनीर)',
      '2 Onions finely chopped, 2 Tomatoes pureed',
      '1 Capsicum diced (optional)',
      '1 tbsp Ginger-Garlic paste, 2 tbsp Fresh Malai/Cream',
      'Spices: Haldi, Kashmiri Lal Mirch, Garam Masala, Kasuri Methi, Salt'
    ],
    instructions: [
      'Soak paneer cubes in warm water for 5 minutes to make them soft as cotton.',
      'Heat 2 tbsp oil/butter in a kadai. Sauté onions and ginger-garlic paste until deep golden brown.',
      'Add tomato puree and dry spices. Cook until oil separates on edges.',
      'Stir in 2 tbsp fresh malai and 1/4 cup water to form a rich velvety gravy.',
      'Gently add paneer cubes and capsicum. Simmer on low heat for 4 minutes.',
      'Crush kasuri methi between palms and sprinkle on top.'
    ],
    jugaadTip: 'Soaking paneer in warm water before adding to gravy keeps it melt-in-mouth soft even after reheating!',
    substitutions: 'Substitute paneer with boiled potatoes, mushrooms, or soya chunks.'
  },
  {
    id: 'rec_offline_10',
    title: 'Jain Matar Paneer (No Onion, No Garlic)',
    titleHindi: 'जैन मटर पनीर (बिना प्याज-लहसुन)',
    diet: 'jain',
    mealType: 'Lunch / Dinner',
    prepTime: '18 mins',
    servings: '3',
    matchingIngredients: ['paneer', 'peas', 'tomato', 'ginger', 'jeera', 'hing', 'malai', 'kasuri_methi'],
    ingredients: [
      '200g Paneer cubes',
      '1 Cup Green Peas (मटर)',
      '3 Juicy Tomatoes blended with 1 inch Ginger & 1 Green Chilli',
      '1 tbsp Ghee, 1/2 tsp Cumin seeds, 1 pinch Hing',
      'Spices: Haldi, Dhania powder, Kashmiri Mirch, Garam Masala, Salt',
      '2 tbsp Fresh Curd (whisked) or Malai'
    ],
    instructions: [
      'Heat ghee in a pan. Add hing and cumin seeds.',
      'Pour in the blended tomato-ginger puree. Add salt, haldi, and dhania powder.',
      'Cook on medium flame until oil starts leaving the sides.',
      'Lower flame and quickly stir in whisked curd/malai to build body and richness without onion.',
      'Add green peas, paneer cubes, and 1/2 cup warm water.',
      'Cover and simmer on low heat for 5-6 minutes.',
      'Finish with crushed kasuri methi and fresh coriander.'
    ],
    jugaadTip: 'Whisking fresh curd or cashews into the tomato gravy provides identical thickness and creaminess as restaurant onion gravies!',
    substitutions: 'If fresh green peas are unavailable, frozen peas work directly without pre-boiling.'
  }
];
