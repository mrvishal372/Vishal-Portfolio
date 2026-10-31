import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserProfile, RecipeItem } from '../../types';
import { 
  Utensils, 
  Sparkles, 
  Clock, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Loader2, 
  Flame, 
  Check, 
  X, 
  Filter, 
  RotateCcw, 
  Plus, 
  Search, 
  Trash2,
  BookOpen,
  WifiOff,
  Database,
  Mic,
  MicOff,
  Copy,
  MessageSquare
} from 'lucide-react';
import { VoiceListener, speakText, stopSpeech } from '../../lib/voice';
import { AISolutionSkeleton } from '../skeletons/ModuleSkeleton';
import { SwipeToDeleteItem } from '../common/SwipeToDeleteItem';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { 
  getOfflineRecipeTemplates, 
  generateOfflineRecipeResponse, 
  cacheAiQuery, 
  getCachedAiQuery 
} from '../../lib/offlineStorage';
import { CachedRecipeTemplate } from '../../lib/offlineModuleData';

interface AajKyaBanaooProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  initialQuery?: string;
  onOpenAssistant?: (initialPrompt?: string) => void;
}

export interface KitchenIngredient {
  id: string;
  nameEn: string;
  nameHi: string;
  category: 'veg' | 'grains' | 'dals' | 'dairy' | 'spices' | 'nonveg';
  emoji: string;
  aliases?: string[];
}

const INGREDIENTS_DATABASE: KitchenIngredient[] = [
  // Vegetables & Produce
  { id: 'potato', nameEn: 'Potato', nameHi: 'आलू', category: 'veg', emoji: '🥔', aliases: ['potato', 'aloo', 'alu', 'batata', 'urulaikizhangu', 'urulai', 'alo', 'batate'] },
  { id: 'onion', nameEn: 'Onion', nameHi: 'प्याज', category: 'veg', emoji: '🧅', aliases: ['onion', 'pyaaz', 'pyaj', 'kanda', 'vengayam', 'ullipaya', 'piyaj', 'eerulli', 'pyaz'] },
  { id: 'tomato', nameEn: 'Tomato', nameHi: 'टमाटर', category: 'veg', emoji: '🍅', aliases: ['tomato', 'tamatar', 'thakkali', 'tamota', 'tamatara', 'bilahi'] },
  { id: 'peas', nameEn: 'Green Peas', nameHi: 'हरी मटर', category: 'veg', emoji: '🫛', aliases: ['peas', 'green peas', 'matar', 'hari matar', 'pattani', 'bataani', 'pachai pattani', 'batani'] },
  { id: 'spinach', nameEn: 'Spinach', nameHi: 'पालक', category: 'veg', emoji: '🥬', aliases: ['spinach', 'palak', 'pasalai keerai', 'palakoora', 'palanga', 'palak saag'] },
  { id: 'cauliflower', nameEn: 'Cauliflower', nameHi: 'फूल गोभी', category: 'veg', emoji: '🥦', aliases: ['cauliflower', 'phool gobi', 'gobhi', 'pookosu', 'gobi', 'fulkopi'] },
  { id: 'cabbage', nameEn: 'Cabbage', nameHi: 'पत्ता गोभी', category: 'veg', emoji: '🥬', aliases: ['cabbage', 'patta gobi', 'band gobi', 'muttaikose', 'bandhakopi', 'kobi'] },
  { id: 'capsicum', nameEn: 'Capsicum', nameHi: 'शिमला मिर्च', category: 'veg', emoji: '🫑', aliases: ['capsicum', 'shimla mirch', 'bell pepper', 'kuda milagai', 'bengaluru mirapakaya'] },
  { id: 'carrot', nameEn: 'Carrot', nameHi: 'गाजर', category: 'veg', emoji: '🥕', aliases: ['carrot', 'gajar', 'gajjara', 'gajjari'] },
  { id: 'brinjal', nameEn: 'Brinjal', nameHi: 'बैंगन', category: 'veg', emoji: '🍆', aliases: ['brinjal', 'baingan', 'eggplant', 'kathirikai', 'vankaya', 'vangi', 'baigan', 'begun'] },
  { id: 'ladyfinger', nameEn: 'Bhindi', nameHi: 'भिंडी', category: 'veg', emoji: '🫛', aliases: ['bhindi', 'ladyfinger', 'okra', 'vendakkai', 'bhendi', 'bendakaya'] },
  { id: 'bottlegourd', nameEn: 'Lauki', nameHi: 'लौकी', category: 'veg', emoji: '🥒', aliases: ['lauki', 'bottle gourd', 'ghiya', 'sorakkai', 'anapakaya', 'dudhi', 'lau', 'sorakaya'] },
  { id: 'bittergourd', nameEn: 'Karela', nameHi: 'करेला', category: 'veg', emoji: '🥒', aliases: ['karela', 'bitter gourd', 'pavakkai', 'kakarakaya', 'karle', 'korola'] },
  { id: 'ridgegourd', nameEn: 'Turai', nameHi: 'तोरई', category: 'veg', emoji: '🥒', aliases: ['turai', 'torai', 'ridge gourd', 'peerkangai', 'beerakaya', 'ghosale'] },
  { id: 'pumpkin', nameEn: 'Kaddu', nameHi: 'कद्दू', category: 'veg', emoji: '🎃', aliases: ['kaddu', 'pumpkin', 'pooshanikai', 'gummadikaya', 'bhopla', 'kumra', 'lal kaddu'] },
  { id: 'drumstick', nameEn: 'Sahjan', nameHi: 'सहजन', category: 'veg', emoji: '🥖', aliases: ['sahjan', 'drumstick', 'murungakkai', 'munagakaya', 'seing', 'sajna', 'munga'] },
  { id: 'rawbanana', nameEn: 'Raw Banana', nameHi: 'कच्चा केला', category: 'veg', emoji: '🍌', aliases: ['kacha kela', 'raw banana', 'plantain', 'vazhaikkai', 'aratikaya', 'kacha kola'] },
  { id: 'mushroom', nameEn: 'Mushroom', nameHi: 'मशरूम', category: 'veg', emoji: '🍄', aliases: ['mushroom', 'mushrooms', 'khumbi', 'kalan', 'kalahal'] },
  { id: 'sweetpotato', nameEn: 'Shakarkandi', nameHi: 'शकरकंद', category: 'veg', emoji: '🍠', aliases: ['shakarkandi', 'sweet potato', 'sakkaraivalli', 'chilagada dumpa', 'ratalu', 'rangalu'] },
  { id: 'radish', nameEn: 'Mooli', nameHi: 'मूली', category: 'veg', emoji: '🥕', aliases: ['mooli', 'radish', 'mullangi', 'mula'] },
  { id: 'beetroot', nameEn: 'Beetroot', nameHi: 'चुकंदर', category: 'veg', emoji: '🫐', aliases: ['beetroot', 'chukandar', 'beet', 'beetroot'] },
  { id: 'rawmango', nameEn: 'Raw Mango', nameHi: 'कच्चा आम', category: 'veg', emoji: '🥭', aliases: ['kacha aam', 'raw mango', 'maangai', 'mamidikaya', 'kairi', 'kacha aam'] },
  { id: 'lemon', nameEn: 'Lemon', nameHi: 'नींबू', category: 'veg', emoji: '🍋', aliases: ['lemon', 'nimbu', 'limbu', 'elumichai', 'nimmakaya', 'lebu'] },
  { id: 'greenchilli', nameEn: 'Green Chilli', nameHi: 'हरी मिर्च', category: 'veg', emoji: '🌶️', aliases: ['green chilli', 'hari mirch', 'pachai milagai', 'pachi mirapakaya', 'hirvi mirchi', 'kanchi lanka'] },
  { id: 'ginger', nameEn: 'Ginger', nameHi: 'अदरक', category: 'veg', emoji: '🫚', aliases: ['ginger', 'adrak', 'inji', 'allam', 'ale', 'ada'] },
  { id: 'garlic', nameEn: 'Garlic', nameHi: 'लहसुन', category: 'veg', emoji: '🧄', aliases: ['garlic', 'lahsun', 'lasun', 'poondu', 'vellulli', 'lason', 'rasuna'] },
  { id: 'coriander', nameEn: 'Coriander', nameHi: 'धनिया पत्ती', category: 'veg', emoji: '🌿', aliases: ['coriander', 'dhaniya', 'koththamalli', 'kothimera', 'kothimbir', 'dhania'] },
  { id: 'mint', nameEn: 'Mint', nameHi: 'पुदीना', category: 'veg', emoji: '🍃', aliases: ['pudina', 'mint', 'pudina keerai'] },
  { id: 'curryleaves', nameEn: 'Curry Leaves', nameHi: 'कढ़ी पत्ता', category: 'veg', emoji: '🌿', aliases: ['kadi patta', 'curry leaves', 'kariveppilai', 'karivepaku', 'kadipatta'] },
  { id: 'corn', nameEn: 'Sweet Corn', nameHi: 'मक्का', category: 'veg', emoji: '🌽', aliases: ['sweet corn', 'makka', 'bhutta', 'corn', 'cholam', 'mokka jonna', 'makai'] },

  // Grains & Staples
  { id: 'atta', nameEn: 'Wheat Flour (Atta)', nameHi: 'गेहूं का आटा', category: 'grains', emoji: '🌾', aliases: ['atta', 'wheat flour', 'gehun ka aata', 'godhumai maavu', 'godhuma pindi', 'aata'] },
  { id: 'rice', nameEn: 'Rice', nameHi: 'चावल', category: 'grains', emoji: '🍚', aliases: ['rice', 'chawal', 'arisi', 'biyyam', 'bhat', 'chaal', 'akki'] },
  { id: 'basmati', nameEn: 'Basmati Rice', nameHi: 'बासमती चावल', category: 'grains', emoji: '🍚', aliases: ['basmati', 'basmati rice', 'biryani rice', 'pulao rice'] },
  { id: 'poha', nameEn: 'Poha', nameHi: 'पोहा', category: 'grains', emoji: '🥣', aliases: ['poha', 'flattened rice', 'chivda', 'aval', 'atukulu', 'pohe', 'chira'] },
  { id: 'besan', nameEn: 'Besan (Gram Flour)', nameHi: 'बेसन', category: 'grains', emoji: '💛', aliases: ['besan', 'gram flour', 'chana flour', 'kadalai maavu', 'senaga pindi'] },
  { id: 'suji', nameEn: 'Suji / Rava', nameHi: 'सूजी', category: 'grains', emoji: '🌾', aliases: ['suji', 'sooji', 'rava', 'semolina', 'rawa', 'ravai'] },
  { id: 'maida', nameEn: 'Maida', nameHi: 'मैदा', category: 'grains', emoji: '🌾', aliases: ['maida', 'all purpose flour', 'refined flour'] },
  { id: 'oats', nameEn: 'Oats', nameHi: 'ओट्स', category: 'grains', emoji: '🥣', aliases: ['oats', 'oatmeal'] },
  { id: 'bread', nameEn: 'Bread', nameHi: 'ब्रेड', category: 'grains', emoji: '🍞', aliases: ['bread', 'pav', 'paav', 'double roti'] },
  { id: 'pasta', nameEn: 'Pasta / Noodles', nameHi: 'पास्ता-नूडल्स', category: 'grains', emoji: '🍝', aliases: ['noodles', 'pasta', 'chowmein', 'macaroni', 'spaghetti', 'maggie', 'maggi'] },
  { id: 'sabudana', nameEn: 'Sabudana', nameHi: 'साबूदाना', category: 'grains', emoji: '⚪', aliases: ['sabudana', 'sago', 'javvarisi', 'sagubiyyam'] },
  { id: 'vermicelli', nameEn: 'Vermicelli', nameHi: 'सेवई', category: 'grains', emoji: '🍜', aliases: ['vermicelli', 'sevai', 'semiya', 'shevaya'] },

  // Pulses & Dals
  { id: 'arhar_dal', nameEn: 'Toor / Arhar Dal', nameHi: 'अरहर दाल', category: 'dals', emoji: '🥣', aliases: ['toor dal', 'arhar dal', 'tur dal', 'tuvaram paruppu', 'kandi pappu', 'arhar'] },
  { id: 'moong_dal', nameEn: 'Moong Dal', nameHi: 'मूंग दाल', category: 'dals', emoji: '🥣', aliases: ['moong dal', 'mung dal', 'yellow dal', 'paasi paruppu', 'pesara pappu', 'mung'] },
  { id: 'chana_dal', nameEn: 'Chana Dal', nameHi: 'चने की दाल', category: 'dals', emoji: '🥣', aliases: ['chana dal', 'gram dal', 'kadalai paruppu', 'senaga pappu'] },
  { id: 'chhole', nameEn: 'Chickpeas (Chhole)', nameHi: 'काबुली चने', category: 'dals', emoji: '🧆', aliases: ['chhole', 'kabuli chana', 'white chickpeas', 'garbanzo', 'chana'] },
  { id: 'kalachana', nameEn: 'Kala Chana', nameHi: 'कला चना', category: 'dals', emoji: '🧆', aliases: ['kala chana', 'black chickpeas', 'kondai kadalai', 'nalla senagalu'] },
  { id: 'rajma', nameEn: 'Rajma (Kidney Beans)', nameHi: 'राजमा', category: 'dals', emoji: '🫘', aliases: ['rajma', 'kidney beans', 'rajmah'] },
  { id: 'urad_dal', nameEn: 'Urad Dal', nameHi: 'उड़द दाल', category: 'dals', emoji: '🥣', aliases: ['urad dal', 'black gram', 'ulutham paruppu', 'minapa pappu'] },
  { id: 'masoor_dal', nameEn: 'Masoor Dal', nameHi: 'मसूर दाल', category: 'dals', emoji: '🥣', aliases: ['masoor dal', 'red lentils', 'masur dal'] },
  { id: 'lobia', nameEn: 'Lobia', nameHi: 'लोबिया', category: 'dals', emoji: '🫘', aliases: ['lobia', 'black eyed peas', 'rongi', 'karamani', 'alasandalu'] },

  // Dairy & Fridge
  { id: 'paneer', nameEn: 'Paneer', nameHi: 'पनीर', category: 'dairy', emoji: '🧀', aliases: ['paneer', 'cottage cheese', 'panir'] },
  { id: 'milk', nameEn: 'Milk', nameHi: 'दूध', category: 'dairy', emoji: '🥛', aliases: ['milk', 'doodh', 'paal', 'paalu', 'dood'] },
  { id: 'curd', nameEn: 'Curd (Dahi)', nameHi: 'दही', category: 'dairy', emoji: '🥣', aliases: ['curd', 'dahi', 'yogurt', 'thayir', 'perugu'] },
  { id: 'butter', nameEn: 'Butter', nameHi: 'मक्खन', category: 'dairy', emoji: '🧈', aliases: ['butter', 'makkhan', 'makhan', 'vennai', 'venna', 'loni'] },
  { id: 'ghee', nameEn: 'Ghee', nameHi: 'घी', category: 'dairy', emoji: '🍯', aliases: ['ghee', 'clarified butter', 'ghi', 'ney', 'neyyi', 'tup'] },
  { id: 'cheese', nameEn: 'Cheese', nameHi: 'चीज़', category: 'dairy', emoji: '🧀', aliases: ['cheese', 'chees'] },
  { id: 'malai', nameEn: 'Fresh Cream / Malai', nameHi: 'मलाई', category: 'dairy', emoji: '🍨', aliases: ['malai', 'fresh cream', 'cream'] },
  { id: 'coconut', nameEn: 'Coconut', nameHi: 'नारियल', category: 'dairy', emoji: '🥥', aliases: ['coconut', 'nariyal', 'thengai', 'kobbari', 'naral', 'narkel'] },
  { id: 'peanuts', nameEn: 'Peanuts', nameHi: 'मूंगफली', category: 'dairy', emoji: '🥜', aliases: ['peanut', 'peanuts', 'moongphali', 'groundnut', 'verkadalai', 'pallilu', 'shenga'] },

  // Spices & Extras
  { id: 'ginger_garlic', nameEn: 'Ginger-Garlic Paste', nameHi: 'अदरक-लहसुन पेस्ट', category: 'spices', emoji: '🧄', aliases: ['ginger garlic', 'adrak lahsun', 'inji poondu'] },
  { id: 'jeera', nameEn: 'Cumin (Jeera)', nameHi: 'जीरा', category: 'spices', emoji: '🧂', aliases: ['jeera', 'cumin', 'seeragam', 'jilakarra', 'jira'] },
  { id: 'mustard', nameEn: 'Mustard Seeds (Rai)', nameHi: 'राई / सरसों', category: 'spices', emoji: '🟡', aliases: ['rai', 'mustard seeds', 'sarson', 'kadugu', 'avalu', 'mori'] },
  { id: 'turmeric', nameEn: 'Turmeric (Haldi)', nameHi: 'हल्दी', category: 'spices', emoji: '🟡', aliases: ['haldi', 'turmeric', 'manjal', 'pasupu', 'halad'] },
  { id: 'redchilli', nameEn: 'Red Chilli Powder', nameHi: 'लाल मिर्च पाउडर', category: 'spices', emoji: '🌶️', aliases: ['lal mirch', 'chilli powder', 'red chilli', 'milagai thool', 'karam'] },
  { id: 'garam_masala', nameEn: 'Garam Masala', nameHi: 'गरम मसाला', category: 'spices', emoji: '🌶️', aliases: ['garam masala', 'masala'] },
  { id: 'dhania_powder', nameEn: 'Coriander Powder', nameHi: 'धनिया पाउडर', category: 'spices', emoji: '🧂', aliases: ['dhania powder', 'coriander powder', 'malli thool'] },
  { id: 'hing', nameEn: 'Asafoetida (Hing)', nameHi: 'हींग', category: 'spices', emoji: '🧂', aliases: ['hing', 'asafoetida', 'perungayam', 'inguva', 'hingu'] },
  { id: 'kasuri_methi', nameEn: 'Kasuri Methi', nameHi: 'कस्तूरी मेथी', category: 'spices', emoji: '🌿', aliases: ['kasuri methi', 'dried fenugreek', 'methi leaves'] },

  // Non-Veg
  { id: 'egg', nameEn: 'Eggs', nameHi: 'अंडे', category: 'nonveg', emoji: '🥚', aliases: ['egg', 'eggs', 'anda', 'ande', 'muttai', 'guddu'] },
  { id: 'chicken', nameEn: 'Chicken', nameHi: 'चिकन', category: 'nonveg', emoji: '🍗', aliases: ['chicken', 'murgi', 'murgh', 'kozhi', 'kodi'] },
  { id: 'mutton', nameEn: 'Mutton', nameHi: 'मटन', category: 'nonveg', emoji: '🥩', aliases: ['mutton', 'goat meat', 'gosht', 'aattu irachi', 'meka mamsam'] },
  { id: 'fish', nameEn: 'Fish', nameHi: 'मछली', category: 'nonveg', emoji: '🐟', aliases: ['fish', 'machhli', 'machli', 'meen', 'chepalu', 'maach'] },
];

export const AajKyaBanaoo: React.FC<AajKyaBanaooProps> = React.memo(({ 
  profile, 
  onUpdateProfile, 
  initialQuery = '',
  onOpenAssistant 
}) => {
  const isHi = profile.language === 'hi';
  const isOnline = useOnlineStatus();

  // Vyron AI Direct Hindi Dish Query State
  const [dishNameInput, setDishNameInput] = useState(initialQuery);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const voiceListenerRef = useRef<VoiceListener | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customExtra, setCustomExtra] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'veg' | 'grains' | 'dals' | 'dairy' | 'spices' | 'nonveg'>('all');
  const [diet, setDiet] = useState<'veg' | 'jain' | 'nonveg'>('veg');
  const [mealType, setMealType] = useState('Dinner');
  const [maxTime, setMaxTime] = useState('20');
  const [loading, setLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState('');
  const [isResultFromCache, setIsResultFromCache] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showOfflineBook, setShowOfflineBook] = useState(false);

  // Load offline recipe templates
  const offlineTemplates = useMemo(() => getOfflineRecipeTemplates(), []);

  // Cleanup mic & speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (voiceListenerRef.current) {
        try {
          voiceListenerRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Toggle item selection
  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedIds([]);
    setCustomExtra('');
  };

  // Preset mixes
  const applyPreset = (preset: 'aloo_pyaaz' | 'paneer_special' | 'quick_breakfast' | 'dal_rice') => {
    if (preset === 'aloo_pyaaz') {
      setSelectedIds(['potato', 'onion', 'tomato', 'greenchilli', 'coriander']);
    } else if (preset === 'paneer_special') {
      setSelectedIds(['paneer', 'onion', 'tomato', 'capsicum', 'malai', 'ginger_garlic']);
    } else if (preset === 'quick_breakfast') {
      setSelectedIds(['poha', 'onion', 'peas', 'lemon', 'greenchilli']);
    } else if (preset === 'dal_rice') {
      setSelectedIds(['arhar_dal', 'rice', 'tomato', 'onion', 'jeera', 'ginger_garlic']);
    }
  };

  // Filtered ingredients base
  const filteredIngredients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return INGREDIENTS_DATABASE.filter((item) => {
      if ((diet === 'veg' || diet === 'jain') && item.category === 'nonveg') {
        return false;
      }
      if (q) {
        const nameEnMatch = item.nameEn.toLowerCase().includes(q);
        const nameHiMatch = item.nameHi.toLowerCase().includes(q);
        const aliasMatch = item.aliases?.some((a) => a.toLowerCase().includes(q));
        return nameEnMatch || nameHiMatch || aliasMatch;
      }
      if (categoryFilter === 'all') return true;
      return item.category === categoryFilter;
    });
  }, [categoryFilter, diet, searchQuery]);

  // Selected names compiled string
  const compiledIngredientsText = useMemo(() => {
    const names = selectedIds
      .map((id) => {
        const item = INGREDIENTS_DATABASE.find((i) => i.id === id);
        return item ? `${item.nameEn} (${item.nameHi})` : '';
      })
      .filter(Boolean);

    if (customExtra.trim()) {
      names.push(customExtra.trim());
    }
    return names.join(', ');
  }, [selectedIds, customExtra]);

  // Voice Mic input in Hindi for hands-free kitchen interaction
  const handleToggleMic = () => {
    if (isListeningMic) {
      if (voiceListenerRef.current) {
        try {
          voiceListenerRef.current.stop();
        } catch {}
      }
      setIsListeningMic(false);
      return;
    }

    const listener = new VoiceListener();
    voiceListenerRef.current = listener;
    setIsListeningMic(true);

    listener.start(
      (transcript) => {
        setIsListeningMic(false);
        if (transcript.trim()) {
          setDishNameInput(transcript.trim());
          handleGenerateRecipeWithDish(transcript.trim());
        }
      },
      (err) => {
        console.warn('Recipe Voice Mic error:', err);
        setIsListeningMic(false);
      },
      'hi' // Pure Hindi speech recognition
    );
  };

  // Main Vyron AI Recipe Generator (Connects with Pure Hindi Master Chef)
  const handleGenerateRecipeWithDish = async (targetDish?: string) => {
    const dishToUse = typeof targetDish === 'string' ? targetDish : dishNameInput;
    if (!dishToUse.trim() && !compiledIngredientsText.trim()) {
      alert(isHi ? 'कृपया कोई रेसिपी का नाम लिखें, बोलें या नीचे से सामग्री चुनें!' : 'Please enter a recipe name, speak, or select ingredients!');
      return;
    }

    setLoading(true);
    setRecipeResult('');
    setIsResultFromCache(false);
    stopSpeech();
    setIsSpeaking(false);

    // 1. If device is offline, synthesize from offline template engine directly
    if (!navigator.onLine) {
      setTimeout(() => {
        const synthesized = generateOfflineRecipeResponse(
          dishToUse || compiledIngredientsText,
          diet,
          mealType,
          maxTime,
          'hi'
        );
        setRecipeResult(synthesized);
        setIsResultFromCache(true);
        setLoading(false);
      }, 300);
      return;
    }

    // 2. Check local client cache
    const cacheKey = `vyron_${dishToUse}_${compiledIngredientsText}_${diet}_${mealType}`;
    const previous = getCachedAiQuery('recipe', cacheKey);
    if (previous) {
      setRecipeResult(previous);
      setIsResultFromCache(true);
      setLoading(false);
      return;
    }

    // 3. Online fetch to Vyron AI Master Chef API
    try {
      const res = await fetch('/api/ai/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishQuery: dishToUse,
          ingredients: compiledIngredientsText,
          diet,
          mealType,
          maxTime,
          language: 'hi' // Guaranteed pure Hindi explanation
        })
      });
      const data = await res.json();
      if (data.result) {
        setRecipeResult(data.result);
        setIsResultFromCache(Boolean(data.isOffline));
        cacheAiQuery('recipe', cacheKey, data.result);
      } else {
        throw new Error('Could not generate recipe online');
      }
    } catch (err: any) {
      // Offline fallback
      const offlineFallback = generateOfflineRecipeResponse(
        dishToUse || compiledIngredientsText,
        diet,
        mealType,
        maxTime,
        'hi'
      );
      setRecipeResult(offlineFallback);
      setIsResultFromCache(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOfflineTemplate = (template: CachedRecipeTemplate) => {
    const formatted = `🍽️ **${template.titleHindi}** (${template.title}) — व्यारोन AI मास्टर शेफ\n⏱️ **पकाने का समय**: ${template.prepTime} | 👥 **कितने लोगों के लिए**: ${template.servings} लोग | 🌶️ **तीखापन**: मध्यम\n\n🛒 **ज़रूरी सामग्री (क्या-क्या चाहिए)**:\n${template.ingredients.map(i => `• ${i}`).join('\n')}\n\n👨‍🍳 **बनाने की आसान विधि (कदम-दर-कदम कैसे बनाएं)**:\n${template.instructions.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}\n\n💡 **व्यारोन AI की खास शेफ टिप / देशी जुगाड़**:\n${template.jugaadTip}\n\n🔄 **विकल्प (यदि कोई सामान न हो)**:\n${template.substitutions}`;

    setRecipeResult(formatted);
    setIsResultFromCache(true);
    setShowOfflineBook(false);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Pure Hindi voice readout using Vyron AI Voice
  const toggleSpeech = (text: string) => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      speakText(text, 'hi').then(() => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  const handleCopyRecipe = () => {
    if (!recipeResult) return;
    navigator.clipboard.writeText(recipeResult);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSaveRecipeToProfile = () => {
    if (!recipeResult) return;
    const title = dishNameInput.trim() 
      ? dishNameInput.trim() 
      : selectedIds.length > 0 
      ? `स्वादिष्ट रेसिपी (${selectedIds.slice(0, 3).join(', ')})` 
      : 'व्यारोन AI देसी रेसिपी';

    const newRecipe: RecipeItem = {
      id: 'rec_' + Date.now(),
      title,
      titleHindi: title,
      prepTime: `${maxTime} mins`,
      servings: '2-3',
      diet,
      ingredients: [compiledIngredientsText || 'Kitchen ingredients'],
      instructions: [recipeResult],
      jugaadTip: 'व्यारोन AI शेफ टिप: बचे हुए खाने से स्वादिष्ट पराठे या कटलेट बनाएं!'
    };

    onUpdateProfile({
      savedRecipes: [newRecipe, ...profile.savedRecipes]
    });
    alert(isHi ? 'रेसिपी आपकी प्रोफाइल में सेव हो गई!' : 'Recipe saved to your Profile!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#FF9933] via-[#ea580c] to-[#138808] text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            <Utensils className="w-3.5 h-3.5" />
            <span>{isHi ? 'AI किचन रेसिपी सलाहकार' : 'AI Indian Kitchen Recipe Generator'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOfflineBook(!showOfflineBook)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isHi ? '📖 ऑफलाइन रेसिपी बुक (10+)' : '📖 Offline Recipe Book (10+)'}</span>
            </button>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
              isOnline ? 'bg-emerald-500/30 text-emerald-100' : 'bg-amber-500/40 text-amber-100'
            }`}>
              <Database className="w-3 h-3" />
              <span>{isOnline ? '10+ Offline Templates' : 'Offline Mode'}</span>
            </span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Aaj Kya Banaoo — {isHi ? 'व्यारोन AI किचन शेफ' : 'Vyron AI Master Chef'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-100 mt-1 font-medium">
          {isHi 
            ? 'अपनी मनपसंद रेसिपी हिंदी में लिखें, बोलें या घर की सामग्री चुनें। व्यारोन AI शुद्ध हिंदी में बताएगा क्या और कैसे बनाना है!'
            : 'Ask for any authentic Indian recipe in pure Hindi or select kitchen ingredients. Vyron AI explains step-by-step what and how to cook!'}
        </p>

        {/* Quick Recipe Preferences */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-slate-900 text-xs bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          <div>
            <label className="text-white text-[10px] font-bold block mb-1">
              {isHi ? 'आहार का प्रकार' : 'Diet Preference'}
            </label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white text-xs font-bold focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="veg">{isHi ? '🥬 शुद्ध शाकाहारी' : '🥬 Pure Veg'}</option>
              <option value="jain">{isHi ? '🙏 जैन (बिना प्याज/लहसुन)' : '🙏 Jain (No Onion/Garlic)'}</option>
              <option value="nonveg">{isHi ? '🍗 मांसाहारी' : '🍗 Non-Veg'}</option>
            </select>
          </div>

          <div>
            <label className="text-white text-[10px] font-bold block mb-1">
              {isHi ? 'भोजन का समय' : 'Meal Type'}
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white text-xs font-bold focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="Breakfast">{isHi ? '🍳 नाश्ता' : '🍳 Breakfast'}</option>
              <option value="Lunch">{isHi ? '🍛 दोपहर का खाना' : '🍛 Lunch'}</option>
              <option value="Snacks">{isHi ? '☕ शाम का नाश्ता' : '☕ Evening Snacks'}</option>
              <option value="Dinner">{isHi ? '🍲 रात का खाना' : '🍲 Dinner'}</option>
            </select>
          </div>

          <div>
            <label className="text-white text-[10px] font-bold block mb-1">
              {isHi ? 'अधिकतम समय' : 'Max Time'}
            </label>
            <select
              value={maxTime}
              onChange={(e) => setMaxTime(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white text-xs font-bold focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="10">⚡ 10 {isHi ? 'मिनट' : 'mins'}</option>
              <option value="20">⏱️ 20 {isHi ? 'मिनट' : 'mins'}</option>
              <option value="30">🥘 30 {isHi ? 'मिनट' : 'mins'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 🍲 1. Vyron AI Direct Hindi Recipe Writer & Voice Assistant */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-emerald-500/10 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-amber-950/20 border-2 border-amber-400/60 dark:border-amber-500/40 shadow-md space-y-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF9933] to-[#ea580c] flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isHi ? 'व्यारोन AI से जो भी बनाना है, हिंदी में लिखें या बोलें' : 'Ask Vyron AI what you want to cook in Hindi'}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                  {isHi ? 'शुद्ध हिंदी' : 'Pure Hindi'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                {isHi 
                  ? 'व्यारोन AI आपको शुद्ध हिंदी में क्या सामान चाहिए और धीमी-तेज आंच के साथ कैसे बनाना है, सब कुछ बोलकर व लिखकर बताएगा।' 
                  : 'Vyron AI explains what ingredients are needed and how to cook with exact flame levels in pure Hindi.'}
              </p>
            </div>
          </div>
        </div>

        {/* Input Bar with Mic & Action */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={dishNameInput}
              onChange={(e) => setDishNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateRecipeWithDish();
              }}
              placeholder={isHi ? 'जैसे: कड़ाही पनीर कैसे बनाएं, 10 मिनट में चटपटा नाश्ता, या चिकन करी...' : 'e.g. Paneer Butter Masala, Quick Evening Snacks, or Dal Tadka...'}
              className="w-full pl-3.5 pr-9 py-2.5 sm:py-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-amber-300 dark:border-amber-600/70 text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner transition-all"
            />
            {dishNameInput && (
              <button
                type="button"
                onClick={() => setDishNameInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full cursor-pointer touch-manipulation"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Hindi Voice Mic Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            title={isHi ? 'हिंदी में बोलकर बताएं' : 'Speak in Hindi'}
            className={`p-2.5 sm:p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0 touch-manipulation ${
              isListeningMic
                ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-400'
                : 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white'
            }`}
          >
            {isListeningMic ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
          </button>

          {/* Ask Button */}
          <button
            type="button"
            onClick={() => handleGenerateRecipeWithDish()}
            disabled={loading || (!dishNameInput.trim() && !compiledIngredientsText.trim())}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#000080] via-blue-800 to-[#138808] hover:opacity-95 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 touch-manipulation"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
            <span className="whitespace-nowrap">{isHi ? 'रेसिपी बताएं' : 'Ask Recipe'}</span>
          </button>
        </div>

        {/* Popular Hindi Dish Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px]">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300">
            💡 {isHi ? 'आसान सुझाव:' : 'Quick Dishes:'}
          </span>
          {[
            'पनीर बटर मसाला',
            'स्वादिष्ट दम आलू',
            'दाल तड़का ढाबा स्टाइल',
            'स्वादिष्ट वेज पुलाव',
            '10 मिनट में रवा चीला',
            'देसी चिकन करी'
          ].map((dish) => (
            <button
              key={dish}
              type="button"
              onClick={() => {
                setDishNameInput(dish);
                handleGenerateRecipeWithDish(dish);
              }}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/60 font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              {dish}
            </button>
          ))}
        </div>
      </div>

      {/* Offline Recipe Book Modal / Drawer */}
      {showOfflineBook && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-950/30 border-2 border-amber-400/50 backdrop-blur-xl shadow-lg space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isHi ? '📖 ऑफलाइन भारतीय रेसिपी संग्रह (डिवाइस स्टोरेज)' : '📖 Offline Indian Recipe Catalog (Cached)'}
              </h3>
            </div>
            <button
              onClick={() => setShowOfflineBook(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            {isHi 
              ? 'ये सभी 10+ रेसिपी आपके फोन/कंप्यूटर में हमेशा सुरक्षित हैं। किसी भी रेसिपी पर क्लिक करके तुरंत पूरी विधि देखें:'
              : 'These 10+ authentic recipes are permanently saved offline. Click any dish to instantly view full cooking steps:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {offlineTemplates.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectOfflineTemplate(t)}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300/60 dark:border-amber-700/50 hover:border-amber-500 transition-all cursor-pointer shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {t.prepTime}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">
                    {t.diet}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                  {t.title}
                </h4>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  {t.titleHindi}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-2">
                  {t.jugaadTip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingredient Category Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: isHi ? 'सभी' : 'All' },
              { id: 'veg', label: isHi ? '🥬 सब्जियां' : '🥬 Vegetables' },
              { id: 'grains', label: isHi ? '🌾 अनाज' : '🌾 Grains' },
              { id: 'dals', label: isHi ? '🥣 दालें' : '🥣 Lentils & Dals' },
              { id: 'dairy', label: isHi ? '🧀 डेयरी' : '🧀 Dairy' },
              { id: 'spices', label: isHi ? '🧂 मसाले' : '🧂 Spices' },
              ...(diet === 'nonveg' ? [{ id: 'nonveg', label: isHi ? '🍗 नॉन-वेज' : '🍗 Non-Veg' }] : [])
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat.id as any);
                  setSearchQuery('');
                }}
                className={`px-3.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border select-none touch-manipulation cursor-pointer min-h-[40px] flex items-center justify-center flex-shrink-0 active:scale-95 ${
                  categoryFilter === cat.id && !searchQuery
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0 w-full sm:w-auto sm:min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? "सामग्री खोजें (Aloo, Batata, Paneer, Rice...)" : "Search (Aloo, Batata, Paneer, Rice...)"}
              className="w-full pl-8 pr-7 py-2 rounded-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/60 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full cursor-pointer touch-manipulation"
              >
                <X className="w-3.5 h-3.5 pointer-events-none" />
              </button>
            )}
          </div>
        </div>

        {/* Grid of Kitchen Ingredients */}
        {filteredIngredients.length === 0 ? (
          <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-slate-800/60 border border-dashed border-amber-300 dark:border-slate-700 text-center space-y-3">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
              {isHi
                ? `"${searchQuery}" सूची में नहीं मिला, लेकिन आप इसे अपनी रेसिपी सामग्री में जोड़ सकते हैं!`
                : `"${searchQuery}" was not found in default list, but you can add it to your recipe!`}
            </p>
            <button
              type="button"
              onClick={() => {
                if (customExtra.trim()) {
                  setCustomExtra(customExtra.trim() + ', ' + searchQuery.trim());
                } else {
                  setCustomExtra(searchQuery.trim());
                }
                setSearchQuery('');
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-xs hover:bg-amber-600 transition-all inline-flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
            >
              <Plus className="w-4 h-4 pointer-events-none" />
              <span>{isHi ? `"${searchQuery}" सामग्री जोड़ें` : `Add "${searchQuery}"`}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {filteredIngredients.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between relative cursor-pointer select-none touch-manipulation min-h-[84px] w-full active:scale-[0.98] ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xl sm:text-2xl">{item.emoji}</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div>
                    <p className={`font-bold text-xs leading-tight ${isSelected ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-100'}`}>
                      {item.nameEn}
                    </p>
                    <p className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {item.nameHi}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Items Summary Bar */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-xs">
                ✓ {selectedIds.length} {isHi ? 'सामान चुना गया' : 'Items Selected'}
              </span>
              {selectedIds.length > 0 && (
                <button
                  onClick={clearAllSelections}
                  className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isHi ? 'सब हटाएं' : 'Clear All'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1 pt-1 border-t border-amber-200/80 dark:border-amber-900/40">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300">
              ⚡ {isHi ? 'रेडी मिक्स (क्विक कॉम्बिनेशन):' : 'Quick Combo Presets:'}
            </span>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <button
                onClick={() => applyPreset('aloo_pyaaz')}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-amber-300 dark:border-amber-700/60 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                🥔 {isHi ? 'आलू-प्याज' : 'Potato-Onion'}
              </button>
              <button
                onClick={() => applyPreset('paneer_special')}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-amber-300 dark:border-amber-700/60 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                🧀 {isHi ? 'पनीर मिक्स' : 'Paneer Mix'}
              </button>
              <button
                onClick={() => applyPreset('quick_breakfast')}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-amber-300 dark:border-amber-700/60 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                🥣 {isHi ? 'पोहा स्पेशल' : 'Poha Special'}
              </button>
              <button
                onClick={() => applyPreset('dal_rice')}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-amber-300 dark:border-amber-700/60 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                🍛 {isHi ? 'दाल-चावल' : 'Dal-Rice'}
              </button>
            </div>
          </div>
        </div>

        {/* Selected preview string */}
        <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-medium leading-relaxed">
          {compiledIngredientsText ? (
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {compiledIngredientsText}
            </span>
          ) : (
            <span className="text-slate-400 italic">
              {isHi ? 'नीचे सूची में से सामान पर टिक करें...' : 'Select ingredients from the list above...'}
            </span>
          )}
        </div>

        {/* Extra Custom Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customExtra}
            onChange={(e) => setCustomExtra(e.target.value)}
            placeholder={isHi ? 'कोई अन्य सामान (जैसे: बची हुई रोटी, बची दाल)...' : 'Add extra ingredient (e.g. leftover roti, leftover rice)...'}
            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleGenerateRecipeWithDish()}
          disabled={(!compiledIngredientsText.trim() && !dishNameInput.trim()) || loading}
          className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-[#000080] via-blue-800 to-[#138808] hover:opacity-95 active:scale-[0.98] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-900/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0 drop-shadow-sm" />
          )}
          <span className="drop-shadow-sm font-black tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
            {isHi ? '✨ व्यारोन AI से पूरी विधि पाएं (शुद्ध हिंदी में)' : '✨ Get Complete Recipe from Vyron AI'}
          </span>
        </button>
      </div>

      {/* Recipe AI Output */}
      {loading ? (
        <AISolutionSkeleton />
      ) : recipeResult ? (
        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-white/95 via-amber-50/50 to-emerald-50/40 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-[#000080]/30 backdrop-blur-xl border-2 border-amber-400/60 dark:border-amber-400/40 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3.5 border-b border-amber-200/80 dark:border-slate-800 flex-wrap gap-2.5">
            <div className="flex items-center gap-2.5 text-orange-600 font-black">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF9933] to-[#ea580c] flex items-center justify-center text-white shadow-xs shrink-0">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm sm:text-base text-slate-900 dark:text-white font-black block leading-tight">
                  {isHi ? '🍽️ व्यारोन AI मास्टर शेफ — संपूर्ण रेसिपी' : '🍽️ Vyron AI Master Chef Recipe'}
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-300 font-bold block">
                  {isHi ? 'शुद्ध व सरल हिंदी में क्या और कैसे करना है' : 'Step-by-step cooking guide in pure Hindi'}
                </span>
              </div>
              {isResultFromCache && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-300">
                  <Database className="w-3 h-3" />
                  {isHi ? 'कैश्ड' : 'Cached'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Listen / Stop Audio Readout in pure Hindi */}
              <button
                type="button"
                onClick={() => toggleSpeech(recipeResult)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                <span>{isSpeaking ? (isHi ? 'रोकें' : 'Stop') : (isHi ? '🔊 शुद्ध हिंदी में सुनें' : 'Listen')}</span>
              </button>

              {/* Copy Recipe */}
              <button
                type="button"
                onClick={handleCopyRecipe}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700 shadow-2xs"
              >
                {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copySuccess ? (isHi ? 'कॉपी हो गया' : 'Copied!') : (isHi ? 'कॉपी' : 'Copy')}</span>
              </button>

              {/* Save Recipe */}
              <button
                type="button"
                onClick={handleSaveRecipeToProfile}
                className="px-3.5 py-2 rounded-xl bg-[#138808] hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isHi ? 'सेव करें' : 'Save'}</span>
              </button>

              {/* Ask Vyron AI Follow-up */}
              {onOpenAssistant && (
                <button
                  type="button"
                  onClick={() => {
                    const topic = dishNameInput || 'रेसिपी';
                    onOpenAssistant(`नमस्ते व्यारोन AI, मुझे इस रेसिपी के बारे में कुछ और पूछना है: ${topic}`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isHi ? 'व्यारोन AI से पूछें' : 'Ask Vyron AI'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="text-xs sm:text-sm md:text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere] min-w-0 w-full overflow-hidden font-medium">
            {recipeResult}
          </div>
        </div>
      ) : null}

      {/* Saved Recipes List */}
      {profile.savedRecipes.length > 0 && (
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <span>{isHi ? `📖 सहेजी गई रेसिपी (${profile.savedRecipes.length})` : `📖 Saved Recipes (${profile.savedRecipes.length})`}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.savedRecipes.map((rec) => (
              <SwipeToDeleteItem
                key={rec.id}
                id={rec.id}
                onDelete={(id) => {
                  onUpdateProfile({
                    savedRecipes: profile.savedRecipes.filter((r) => r.id !== id),
                  });
                }}
                language={profile.language}
                confirmMessage={isHi ? 'क्या आप इस रेसिपी को हटाना चाहते हैं?' : 'Remove this recipe?'}
              >
                <div className="p-5 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-xs">
                      {rec.prepTime} • {rec.diet.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-700 dark:text-slate-300">{isHi ? `परोसें: ${rec.servings}` : `Serves: ${rec.servings}`}</span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{rec.title}</h4>
                  {rec.titleHindi && <p className="text-xs font-semibold text-emerald-600">{rec.titleHindi}</p>}

                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{isHi ? 'मुख्य विधि:' : 'Method Highlights:'}</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {rec.instructions.slice(0, 3).map((st, i) => (
                        <li key={i} className="line-clamp-1">{st}</li>
                      ))}
                    </ul>
                  </div>

                  {rec.jugaadTip && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-medium border border-amber-200/50">
                      💡 <strong>{isHi ? 'जुगाड़ टिप:' : 'Jugaad Tip:'}</strong> {rec.jugaadTip}
                    </div>
                  )}
                </div>
              </SwipeToDeleteItem>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
