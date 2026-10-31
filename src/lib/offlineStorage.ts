import {
  CachedMedicineItem,
  CachedRecipeTemplate,
  OFFLINE_MEDICINES_CATALOG,
  OFFLINE_RECIPE_TEMPLATES
} from './offlineModuleData';

const OFFLINE_MEDICINES_KEY = 'bharatjugaad_offline_medicines_v2';
const OFFLINE_RECIPES_KEY = 'bharatjugaad_offline_recipes_v2';
const OFFLINE_AI_CACHE_KEY = 'bharatjugaad_offline_ai_cache_v2';

// 1. Medicine Storage Logic
export function getOfflineMedicines(): CachedMedicineItem[] {
  try {
    const raw = localStorage.getItem(OFFLINE_MEDICINES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[OfflineStorage] Error reading cached medicines, using built-in catalog', err);
  }
  // Initialize with built-in catalog if not present
  try {
    localStorage.setItem(OFFLINE_MEDICINES_KEY, JSON.stringify(OFFLINE_MEDICINES_CATALOG));
  } catch {}
  return OFFLINE_MEDICINES_CATALOG;
}

export function searchOfflineMedicines(query: string): CachedMedicineItem[] {
  const all = getOfflineMedicines();
  const q = query.trim().toLowerCase();
  if (!q) return all;

  return all.filter((med) => {
    const brandMatch = med.brandName.toLowerCase().includes(q);
    const saltMatch = med.saltName.toLowerCase().includes(q);
    const genericMatch = med.genericAlternative.toLowerCase().includes(q);
    const useCaseMatch = med.useCase.toLowerCase().includes(q) || med.useCaseHi.toLowerCase().includes(q);
    const categoryMatch = med.category.toLowerCase().includes(q) || med.categoryHi.toLowerCase().includes(q);
    const aliasMatch = med.aliases.some((a) => a.toLowerCase().includes(q));

    return brandMatch || saltMatch || genericMatch || useCaseMatch || categoryMatch || aliasMatch;
  });
}

// 2. Recipe Storage Logic
export function getOfflineRecipeTemplates(): CachedRecipeTemplate[] {
  try {
    const raw = localStorage.getItem(OFFLINE_RECIPES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[OfflineStorage] Error reading cached recipes, using built-in catalog', err);
  }
  // Initialize with built-in catalog if not present
  try {
    localStorage.setItem(OFFLINE_RECIPES_KEY, JSON.stringify(OFFLINE_RECIPE_TEMPLATES));
  } catch {}
  return OFFLINE_RECIPE_TEMPLATES;
}

export function findMatchingOfflineRecipe(
  selectedIngredients: string[],
  diet: 'veg' | 'jain' | 'nonveg' = 'veg',
  mealType?: string
): CachedRecipeTemplate {
  const all = getOfflineRecipeTemplates();
  const lowerSelected = selectedIngredients.map((i) => i.toLowerCase().trim());

  // Filter recipes matching diet constraints
  let candidates = all.filter((r) => {
    if (diet === 'jain') return r.diet === 'jain';
    if (diet === 'veg') return r.diet === 'veg' || r.diet === 'jain';
    return true; // nonveg allows all
  });

  if (candidates.length === 0) {
    candidates = all;
  }

  // Score candidates based on matching ingredients
  let bestMatch = candidates[0];
  let highestScore = -1;

  for (const recipe of candidates) {
    let score = 0;
    for (const ing of lowerSelected) {
      if (recipe.matchingIngredients.some((m) => ing.includes(m) || m.includes(ing))) {
        score += 3;
      }
    }
    if (mealType && recipe.mealType.toLowerCase().includes(mealType.toLowerCase())) {
      score += 1;
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = recipe;
    }
  }

  return bestMatch;
}

// 3. Structured Offline Response Generators
export function generateOfflineMedicineResponse(medicineName: string, language: string = 'en'): string {
  const isHi = language === 'hi';
  const matches = searchOfflineMedicines(medicineName);
  const med = matches.length > 0 ? matches[0] : null;

  if (med) {
    if (isHi) {
      return `📡 [ऑफलाइन कैश्ड डेटा — डिवाइस स्टोरेज से]

1. 💊 **मुख्य साल्ट / फॉर्मूला**:
${med.saltName}

2. 🏷️ **ब्रांडेड दवाई और सस्ती जन औषधि विकल्प**:
• ब्रांडेड नाम: ${med.brandName} (बाजार कीमत: ₹${med.priceBrand})
• प्रधानमंत्री जन औषधि जेनेरिक: ${med.genericAlternative} (कीमत: ₹${med.priceGeneric})

3. 💰 **अनुमानित बचत**:
${med.savingsPercentage}% तक सीधी बचत (प्रति स्ट्रिप लगभग ₹${med.priceBrand - med.priceGeneric} की बचत)

4. ⚠️ **उपयोग और सावधानियां**:
• **उपयोग**: ${med.useCaseHi}
• **खुराक निर्देश**: ${med.dosageGuideline}
• **सावधानी**: ${med.precautions}

5. 👨‍⚕️ **डॉक्टर की सलाह का डिस्क्लेमर**:
सस्ती दवाई केवल जन औषधि मूल्य शिक्षा और सूचना के लिए है। किसी भी दवा की खुराक या ब्रांड बदलने से पहले हमेशा पंजीकृत चिकित्सक (डॉक्टर) या फार्मासिस्ट से परामर्श अवश्य लें।`;
    }

    return `📡 [Offline Cached Data — Loaded from Device Storage]

1. 💊 **Primary Active Salt / Composition**:
${med.saltName}

2. 🏷️ **Brand Name vs Low-Cost Generic (Jan Aushadhi) Alternative**:
• Popular Brand: ${med.brandName} (Market MRP: ₹${med.priceBrand})
• PM Jan Aushadhi Generic Substitute: ${med.genericAlternative} (Govt Price: ₹${med.priceGeneric})

3. 💰 **Estimated Price Savings**:
Save up to ${med.savingsPercentage}% (Save approx ₹${med.priceBrand - med.priceGeneric} per pack!)

4. ⚠️ **Usage & Precautions**:
• **Indication**: ${med.useCase}
• **Dosage Note**: ${med.dosageGuideline}
• **Precaution**: ${med.precautions}

5. 👨‍⚕️ **Doctor Disclaimer**:
Sasti Dawai is an educational price-comparison tool. Always consult a certified medical practitioner or registered pharmacist before switching medicines or altering prescribed dosages.`;
  }

  // Fallback if medicine is not specifically in database
  if (isHi) {
    return `📡 [ऑफलाइन मोड — सामान्य जेनेरिक गाइड]

1. 💊 **दवाई**: "${medicineName}"
2. 🏷️ **जेनेरिक विकल्प**: अधिकांश सामान्य ब्रांडेड दवाओं का जेनेरिक साल्ट प्रधानमंत्री जन औषधि केंद्र (PMBJP) पर 50% से 90% सस्ती दर पर उपलब्ध होता है।
3. 💰 **अनुमानित बचत**: 50% से 85% तक।
4. ⚠️ **सुझाव**: अपनी दवाई की स्ट्रिप के पीछे लिखा 'Salt / Composition Name' नोट करें और किसी भी नजदीकी जन औषधि केंद्र पर उस साल्ट की जेनेरिक दवा मांगें।
5. 👨‍⚕️ **डिस्क्लेमर**: किसी भी दवा को बदलने से पहले हमेशा डॉक्टर से पुष्टि करें।`;
  }

  return `📡 [Offline Mode — General Generic Guide]

1. 💊 **Medicine**: "${medicineName}"
2. 🏷️ **Generic Alternative**: Most common brand medications have direct active salt substitutes available at Pradhan Mantri Jan Aushadhi Kendras at 50% to 90% lower prices.
3. 💰 **Estimated Savings**: 50% - 85% average savings on retail cost.
4. ⚠️ **Actionable Tip**: Read the active "Salt / Composition" name printed on the back of your current medicine strip and ask your pharmacist or Jan Aushadhi store for that exact salt.
5. 👨‍⚕️ **Disclaimer**: Always verify with a certified doctor or pharmacist before making any medical substitutions.`;
}

export function generateOfflineRecipeResponse(
  ingredientsText: string,
  diet: 'veg' | 'jain' | 'nonveg' = 'veg',
  mealType: string = 'Dinner',
  maxTime: string = '20',
  language: string = 'en'
): string {
  const isHi = language === 'hi';
  const selected = ingredientsText.split(',').map((s) => s.trim());
  const template = findMatchingOfflineRecipe(selected, diet, mealType);

  if (isHi) {
    return `🍲 **पकवान का नाम**: ${template.titleHindi}
⏱️ **पकाने का समय**: ${template.prepTime || maxTime + ' मिनट'} | **कितने लोगों के लिए**: ${template.servings} लोग
🏷️ **डाइट**: ${diet === 'jain' ? 'जैन (नो अनियन नो गार्लिक)' : diet === 'veg' ? 'शुद्ध शाकाहारी' : 'मांसाहारी'}

🛒 **ज़रूरी सामग्री**:
${template.ingredients.map((ing) => `• ${ing}`).join('\n')}

🍳 **बनाने की आसान विधि**:
${template.instructions.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

💡 **शेफ की खास देसी टिप**:
${template.jugaadTip}

🔄 **विकल्प (Substitutions)**:
${template.substitutions}`;
  }

  return `🍲 **Dish Name**: ${template.title} (${template.titleHindi})
⏱️ **Cooking Time**: ${template.prepTime || maxTime + ' mins'} | **Servings**: ${template.servings} People
🏷️ **Diet Type**: ${diet.toUpperCase()}

🛒 **Ingredients Required**:
${template.ingredients.map((ing) => `• ${ing}`).join('\n')}

🍳 **Easy Step-by-Step Method**:
${template.instructions.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

💡 **Chef's Special Jugaad Tip**:
${template.jugaadTip}

🔄 **Substitutions**:
${template.substitutions}`;
}

// 4. Offline AI Query Caching Layer (Stores last responses for offline retrieval)
interface CachedAiQueryItem {
  module: string;
  key: string;
  result: string;
  timestamp: number;
}

export function cacheAiQuery(module: string, key: string, result: string): void {
  try {
    const raw = localStorage.getItem(OFFLINE_AI_CACHE_KEY);
    const cache: Record<string, CachedAiQueryItem> = raw ? JSON.parse(raw) : {};
    const normalizedKey = `${module}_${key.trim().toLowerCase()}`;
    cache[normalizedKey] = {
      module,
      key: key.trim(),
      result,
      timestamp: Date.now()
    };

    // Keep cache under 50 recent queries
    const keys = Object.keys(cache);
    if (keys.length > 50) {
      delete cache[keys[0]];
    }

    localStorage.setItem(OFFLINE_AI_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('[OfflineStorage] Failed to cache AI query', err);
  }
}

export function getCachedAiQuery(module: string, key: string): string | null {
  try {
    const raw = localStorage.getItem(OFFLINE_AI_CACHE_KEY);
    if (!raw) return null;
    const cache: Record<string, CachedAiQueryItem> = JSON.parse(raw);
    const normalizedKey = `${module}_${key.trim().toLowerCase()}`;
    if (cache[normalizedKey]) {
      return cache[normalizedKey].result;
    }
  } catch (err) {
    console.warn('[OfflineStorage] Failed to read cached AI query', err);
  }
  return null;
}

// 5. Sync Offline Data with Server in Background when Online
export async function syncOfflineDataWithServer(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return false;
  }

  try {
    const res = await fetch('/data/essential_modules_data.json', { cache: 'no-cache' });
    if (!res.ok) return false;
    const data = await res.json();

    if (Array.isArray(data.medicines) && data.medicines.length > 0) {
      localStorage.setItem(OFFLINE_MEDICINES_KEY, JSON.stringify(data.medicines));
    }
    if (Array.isArray(data.recipes) && data.recipes.length > 0) {
      localStorage.setItem(OFFLINE_RECIPES_KEY, JSON.stringify(data.recipes));
    }
    return true;
  } catch (err) {
    console.warn('[OfflineStorage] Background data sync failed', err);
    return false;
  }
}

// 6. Offline Storage Statistics
export function getOfflineStorageStats() {
  const medicines = getOfflineMedicines();
  const recipes = getOfflineRecipeTemplates();
  let aiQueriesCount = 0;
  try {
    const raw = localStorage.getItem(OFFLINE_AI_CACHE_KEY);
    if (raw) {
      aiQueriesCount = Object.keys(JSON.parse(raw)).length;
    }
  } catch {}

  return {
    medicinesCount: medicines.length,
    recipesCount: recipes.length,
    aiQueriesCount,
    isOfflineReady: true
  };
}
