// BharatJugaad Enhanced Offline Service Worker (v2.0)
// Powered by Vyron AI - Provides seamless offline access to essential module data
// (Medicine prices & Jan Aushadhi generic equivalents, Recipe templates, Offline guides)

const SW_VERSION = 'bharatjugaad-v2.1';
const STATIC_CACHE = `static-${SW_VERSION}`;
const DATA_CACHE = `data-${SW_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${SW_VERSION}`;
const API_CACHE = `api-${SW_VERSION}`;

// Core Shell Assets
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/data/essential_modules_data.json',
  '/data/portfolio_data.json',
  '/default-avatar.svg',
  '/profile.png',
  '/profile.svg'
];

// Essential Preloaded Fallback Medicine Catalog for instant SW-level offline responses
const SW_FALLBACK_MEDICINES = [
  {
    brand: 'Dolo 650 (Crocin)',
    salt: 'Paracetamol 650mg',
    generic: 'Jan Aushadhi Paracetamol 650mg',
    brandPrice: 32,
    genericPrice: 6,
    savings: 81,
    useCase: 'High fever, headaches, mild body pain',
    precautions: 'Do not exceed 4g in 24 hours. Take after meals.'
  },
  {
    brand: 'Pan 40 (Pantocid)',
    salt: 'Pantoprazole 40mg',
    generic: 'Jan Aushadhi Pantoprazole 40mg',
    brandPrice: 155,
    genericPrice: 18,
    savings: 88,
    useCase: 'Heartburn, gastroesophageal reflux (GERD), gastric acidity',
    precautions: 'Take 30 minutes before breakfast with plain water.'
  },
  {
    brand: 'Allegra 120 (Fexova)',
    salt: 'Fexofenadine 120mg',
    generic: 'Jan Aushadhi Fexofenadine 120mg',
    brandPrice: 190,
    genericPrice: 24,
    savings: 87,
    useCase: 'Seasonal allergic rhinitis, sneezing, watery eyes, hives',
    precautions: 'Non-drowsy formula; avoid taking with citrus juices.'
  },
  {
    brand: 'Combiflam',
    salt: 'Ibuprofen 400mg + Paracetamol 325mg',
    generic: 'Jan Aushadhi Ibuprofen + Paracetamol',
    brandPrice: 48,
    genericPrice: 9,
    savings: 81,
    useCase: 'Joint pain, toothache, muscular sprain, swelling',
    precautions: 'Always take after food. Avoid if having gastric ulcers.'
  },
  {
    brand: 'Augmentin 625',
    salt: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    generic: 'Jan Aushadhi Amoxyclav 625mg',
    brandPrice: 204,
    genericPrice: 52,
    savings: 75,
    useCase: 'Bacterial infections of throat, ear, dental, and chest',
    precautions: 'Complete entire 5-7 days course. Doctor prescription required.'
  },
  {
    brand: 'Cetrizine / Cetzine 10',
    salt: 'Cetirizine 10mg',
    generic: 'Jan Aushadhi Cetirizine 10mg',
    brandPrice: 22,
    genericPrice: 4,
    savings: 82,
    useCase: 'Runny nose, dust allergy, insect bite itching',
    precautions: 'May cause mild sleepiness; take at bedtime.'
  },
  {
    brand: 'Glycomet 500',
    salt: 'Metformin 500mg',
    generic: 'Jan Aushadhi Metformin 500mg',
    brandPrice: 45,
    genericPrice: 7,
    savings: 84,
    useCase: 'Type 2 Diabetes blood sugar control',
    precautions: 'Take with or right after food.'
  },
  {
    brand: 'Telma 40',
    salt: 'Telmisartan 40mg',
    generic: 'Jan Aushadhi Telmisartan 40mg',
    brandPrice: 115,
    genericPrice: 16,
    savings: 86,
    useCase: 'High blood pressure (Hypertension) management',
    precautions: 'Take daily at fixed time. Check BP regularly.'
  }
];

// Install: Pre-cache core shell & essential module data
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching static assets and essential module data');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some non-critical static assets failed to precache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up obsolete previous caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (![STATIC_CACHE, DATA_CACHE, DYNAMIC_CACHE, API_CACHE].includes(key)) {
            console.log('[SW] Deleting obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Handler with Intelligent Offline Fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html')
          .then((res) => res || caches.match('/offline.html'));
      })
    );
    return;
  }

  // 2. Essential Data files (/data/*) - Cache First with background network revalidation
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. AI Endpoints Offline Interception (/api/ai/medicine, /api/ai/recipe, /api/ai/jugaad)
  if (request.method === 'POST' && url.pathname.startsWith('/api/ai/')) {
    event.respondWith(handleAiApiRequest(request));
    return;
  }

  // 4. Static assets, fonts, styles, scripts, images (Stale-While-Revalidate)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const resClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, resClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // 5. Default pass-through
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).catch(() => {
        // Safe empty fallback
        return new Response('', { status: 408, statusText: 'Request timed out or offline' });
      });
    })
  );
});

// Helper: Handle AI API requests offline with synthetic cached responses
async function handleAiApiRequest(request) {
  const url = new URL(request.url);
  const endpoint = url.pathname;

  let requestBody = {};
  try {
    requestBody = await request.clone().json();
  } catch (e) {}

  try {
    // Attempt online network request with a 6-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const networkResponse = await fetch(request.clone(), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (networkResponse.ok) {
      // Cache successful response in API_CACHE
      const cache = await caches.open(API_CACHE);
      const cacheKey = `${endpoint}_${JSON.stringify(requestBody)}`;
      cache.put(cacheKey, networkResponse.clone());
      return networkResponse;
    }
  } catch (err) {
    // Network failed or device is offline - Proceed to synthesized offline response
  }

  // Generate synthetic offline response based on cached module data
  if (endpoint === '/api/ai/medicine') {
    const medName = (requestBody.medicineName || '').toLowerCase().trim();
    const isHi = requestBody.language === 'hi';

    // Find in fallback catalog
    const matched = SW_FALLBACK_MEDICINES.find(
      (m) => m.brand.toLowerCase().includes(medName) || m.salt.toLowerCase().includes(medName)
    ) || SW_FALLBACK_MEDICINES[0];

    const resultText = isHi
      ? `📡 [ऑफलाइन कैश्ड डेटा — डिवाइस स्टोरेज से]\n\n1. 💊 **मुख्य साल्ट / फॉर्मूला**:\n${matched.salt}\n\n2. 🏷️ **ब्रांडेड दवाई और सस्ती जन औषधि विकल्प**:\n• ब्रांड नाम: ${matched.brand} (बाजार मूल्य: ₹${matched.brandPrice})\n• जन औषधि विकल्प: ${matched.generic} (कीमत: ₹${matched.genericPrice})\n\n3. 💰 **अनुमानित बचत**:\n${matched.savings}% तक बचत!\n\n4. ⚠️ **उपयोग और सावधानियां**:\n• उपयोग: ${matched.useCase}\n• सावधानी: ${matched.precautions}\n\n5. 👨‍⚕️ **डॉक्टर की सलाह का डिस्क्लेमर**:\nसस्ती दवाई सूचना केवल जन औषधि जागरूकता के लिए है। किसी भी दवा को बदलने से पहले हमेशा पंजीकृत डॉक्टर से परामर्श लें।`
      : `📡 [Offline Cached Data — Loaded from Device Storage]\n\n1. 💊 **Primary Active Salt / Composition**:\n${matched.salt}\n\n2. 🏷️ **Brand Name vs Low-Cost Generic (Jan Aushadhi) Alternative**:\n• Brand: ${matched.brand} (Market Price: ₹${matched.brandPrice})\n• PM Jan Aushadhi Substitute: ${matched.generic} (Govt Price: ₹${matched.genericPrice})\n\n3. 💰 **Estimated Price Savings**:\nSave up to ${matched.savings}% per pack!\n\n4. ⚠️ **Usage & Precautions**:\n• Indication: ${matched.useCase}\n• Precaution: ${matched.precautions}\n\n5. 👨‍⚕️ **Doctor Disclaimer**:\nAlways consult a certified medical practitioner or registered pharmacist before switching medicines.`;

    return new Response(JSON.stringify({ result: resultText, isOffline: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  }

  if (endpoint === '/api/ai/recipe') {
    const ingredients = requestBody.ingredients || 'potatoes, onions, spices';
    const diet = requestBody.diet || 'veg';
    const mealType = requestBody.mealType || 'Dinner';
    const isHi = requestBody.language === 'hi';

    const resultText = isHi
      ? `🍲 **पकवान का नाम**: स्वादिष्ट आलू-प्याज मसाला सूखी सब्जी (ऑफलाइन रेसिपी)\n⏱️ **पकाने का समय**: 15 मिनट | **कितने लोगों के लिए**: 2-3 लोग\n🏷️ **डाइट**: ${diet.toUpperCase()}\n\n🛒 **ज़रूरी सामग्री**:\n• 2 उबले या कटे आलू\n• 1 कटा प्याज, 1 हरी मिर्च\n• 1/2 चम्मच जीरा व हल्दी\n• 1 चम्मच धनिया पाउडर, नमक स्वादानुसार\n\n🍳 **बनाने की आसान विधि**:\n1. कड़ाही में 2 चम्मच तेल गरम करें और जीरा व हरी मिर्च का तड़का लगाएं।\n2. कटे प्याज डालकर 2 मिनट मध्यम आंच पर भूनें।\n3. आलू, हल्दी, धनिया पाउडर और नमक डालकर अच्छी तरह मिलाएं।\n4. धीमी आंच पर ढककर 5 मिनट तक कुरकुरा होने तक पकाएं।\n5. बारीक कटे हरे धनिए से सजाकर गरमा-गरम रोटी या पराठे के साथ परोसें।\n\n💡 **शेफ की खास देसी टिप**:\nउतारने से पहले 1/2 चम्मच अमचूर पाउडर या नींबू का रस निचोड़ें, स्वाद 10 गुना बढ़ जाएगा!`
      : `🍲 **Dish Name**: Quick Masala Jeera Aloo (Offline Kitchen Recipe)\n⏱️ **Cooking Time**: 15 mins | **Servings**: 2-3 People\n🏷️ **Diet**: ${diet.toUpperCase()}\n\n🛒 **Ingredients Required**:\n• 2 Boiled or thinly sliced Potatoes\n• 1 Chopped Onion, 1 Green Chilli\n• 1/2 tsp Cumin seeds & Turmeric\n• 1 tsp Coriander powder, Salt to taste\n\n🍳 **Easy Step-by-Step Method**:\n1. Heat 2 tbsp oil in a pan, sizzle cumin seeds and green chillies.\n2. Sauté chopped onions on medium flame until translucent.\n3. Add potatoes, turmeric, coriander powder, and salt. Toss well.\n4. Cook on medium-low flame for 5 minutes until crispy golden crust forms.\n5. Garnish with fresh coriander and serve hot with rotis or bread.\n\n💡 **Chef's Special Jugaad Tip**:\nSprinkle a pinch of chaat masala or squeeze lemon juice right before serving for street-style flavor!`;

    return new Response(JSON.stringify({ result: resultText, isOffline: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  }

  // Generic offline fallback
  return new Response(JSON.stringify({
    result: "This module data is cached for offline use. Your device is currently offline.",
    isOffline: true
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}
