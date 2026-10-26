// Mock catalog. Every name, price, rating and image comes from the Figma file;
// there is no backend yet, so search, "similar", "themed" and "refine" all
// pick from these lists.
import type { ImageKey } from './images';

export type Category = 'dress' | 'jacket' | 'cardigan' | 'shoes' | 'bag' | 'trousers';

export type Product = {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: ImageKey;
  category: Category;
  tone: 'light' | 'dark' | 'colour';
  colours?: string[];
  description?: string;
};

export const products: Product[] = [
  { id: 'pink-long-dress', name: 'Pink Long Dress', price: 2400, rating: 102, image: 'pinkLongDress', category: 'dress', tone: 'light' },
  { id: 'blue-long-dress', name: 'Blue Long Dress', price: 2700, rating: 52, image: 'blueLongDress', category: 'dress', tone: 'colour', colours: ['#5F7897', '#423535', '#A09C9C'] },
  { id: 'green-midi-dress', name: 'Green Midi Dress', price: 2300, rating: 48, image: 'greenMidiDress', category: 'dress', tone: 'colour' },
  { id: 'maroon-long-dress', name: 'Maroon Long Dress', price: 2700, rating: 52, image: 'maroonLongDress', category: 'dress', tone: 'dark' },
  { id: 'cream-long-dress', name: 'Cream Long Dress', price: 2400, rating: 102, image: 'creamLongDress', category: 'dress', tone: 'light' },
  { id: 'black-long-dress', name: 'Black Long Dress', price: 2500, rating: 98, image: 'blackLongDress', category: 'dress', tone: 'dark' },
  { id: 'green-dress', name: 'Green Dress', price: 2000, rating: 53, image: 'greenDress', category: 'dress', tone: 'colour' },
  { id: 'black-dress', name: 'Black Dress', price: 2300, rating: 48, image: 'blackDress', category: 'dress', tone: 'dark' },
  { id: 'red-long-dress', name: 'Red Long Dress', price: 2400, rating: 102, image: 'redLongDress', category: 'dress', tone: 'dark' },
  { id: 'emerald-midi-dress', name: 'Emerald Midi Dress', price: 2300, rating: 48, image: 'emeraldMidiDress', category: 'dress', tone: 'dark' },
  { id: 'green-long-dress', name: 'Green Long Dress', price: 1700, rating: 102, image: 'greenDress', category: 'dress', tone: 'colour' },
  { id: 'emerald-long-dress', name: 'Emerald Long Dress', price: 2700, rating: 54, image: 'greenLongDress2', category: 'dress', tone: 'dark' },
  { id: 'light-pink-dress', name: 'Light Pink Dress', price: 2300, rating: 48, image: 'lightPinkDress', category: 'dress', tone: 'light' },
  { id: 'pink-dress', name: 'Pink Dress', price: 2700, rating: 52, image: 'pinkDress', category: 'dress', tone: 'light' },
  { id: 'pink-midi-dress', name: 'Pink Midi Dress', price: 1700, rating: 102, image: 'pinkMidiDress', category: 'dress', tone: 'light' },
  { id: 'pink-formal-dress', name: 'Pink Formal Dress', price: 2000, rating: 53, image: 'pinkFormalDress', category: 'dress', tone: 'light' },
  { id: 'cream-day-dress', name: 'Cream Day Dress', price: 2500, rating: 98, image: 'creamDayDress', category: 'dress', tone: 'light' },
  { id: 'green-day-dress', name: 'Green Day Dress', price: 2700, rating: 52, image: 'greenDayDress', category: 'dress', tone: 'colour' },
  { id: 'long-blue-dress', name: 'Long Blue Dress', price: 1700, rating: 98, image: 'longBlueDress', category: 'dress', tone: 'colour' },
  { id: 'abstract-tulle-dress', name: 'Abstract Tulle Dress', price: 2000, rating: 102, image: 'abstractTulleDress', category: 'dress', tone: 'dark' },
  { id: 'black-puffer-jacket', name: 'Black Puffer Jacket', price: 2400, rating: 102, image: 'blackPufferJacket2', category: 'jacket', tone: 'dark' },
  { id: 'black-leather-jacket', name: 'Black Leather Jacket', price: 1700, rating: 67, image: 'blackLeatherJacket', category: 'jacket', tone: 'dark' },
  { id: 'beige-jacket', name: 'Beige Jacket', price: 2700, rating: 67, image: 'beigeJacket', category: 'jacket', tone: 'light' },
  { id: 'beige-winter-jacket', name: 'Beige Winter Jacket', price: 2500, rating: 12, image: 'beigeWinterJacket', category: 'jacket', tone: 'light' },
  { id: 'burgundy-jacket', name: 'Burgundy Jacket', price: 2000, rating: 87, image: 'burgundyJacket', category: 'jacket', tone: 'dark' },
  { id: 'grey-puffer-jacket', name: 'Grey Puffer Jacket', price: 2400, rating: 34, image: 'greyPufferJacket', category: 'jacket', tone: 'light' },
  { id: 'cream-long-coat', name: 'Cream Long Coat', price: 1700, rating: 98, image: 'creamLongCoat', category: 'jacket', tone: 'light' },
  { id: 'cream-cardigan', name: 'Cream Cardigan', price: 2300, rating: 48, image: 'creamCardigan', category: 'cardigan', tone: 'light' },
  { id: 'beige-cardigan', name: 'Beige Cardigan', price: 2300, rating: 23, image: 'beigeCardigan', category: 'cardigan', tone: 'light' },
  { id: 'brown-cardigan', name: 'Brown Cardigan', price: 2300, rating: 48, image: 'brownCardigan', category: 'cardigan', tone: 'dark' },
  { id: 'brown-turtleneck', name: 'Brown Turtleneck', price: 2400, rating: 102, image: 'brownTurtleneck', category: 'cardigan', tone: 'dark' },
  { id: 'blue-cardigan', name: 'Blue Cardigan', price: 2000, rating: 102, image: 'blueCardigan', category: 'cardigan', tone: 'colour' },
  { id: 'blue-floral-cardigan', name: 'Blue Floral Cardigan', price: 2400, rating: 54, image: 'blueFloralCardigan', category: 'cardigan', tone: 'colour' },
  { id: 'olive-cardigan', name: 'Olive Cardigan', price: 2400, rating: 102, image: 'oliveCardigan', category: 'cardigan', tone: 'colour' },
  { id: 'black-cardigan', name: 'Black Cardigan', price: 2700, rating: 43, image: 'blackCardigan', category: 'cardigan', tone: 'dark' },
  { id: 'ankle-boots', name: 'Ankle Boots', price: 2700, rating: 52, image: 'ankleBoots', category: 'shoes', tone: 'dark' },
  { id: 'kitten-heel-boots', name: 'Kitten Heel Boots', price: 2700, rating: 54, image: 'kittenHeelBoots', category: 'shoes', tone: 'dark' },
  { id: 'stiletto-boots', name: 'Stiletto Boots', price: 2900, rating: 41, image: 'stilettoBoots', category: 'shoes', tone: 'dark' },
  { id: 'open-toe-shoe', name: 'Open Toe Shoe', price: 1700, rating: 36, image: 'openToeShoe', category: 'shoes', tone: 'light' },
  { id: 'coffee-leather-bag', name: 'Coffee Leather Bag', price: 2000, rating: 53, image: 'coffeeLeatherBag', category: 'bag', tone: 'dark' },
  { id: 'tan-bag', name: 'Tan Bag', price: 2700, rating: 54, image: 'tanBag', category: 'bag', tone: 'colour' },
  { id: 'beige-trousers', name: 'Beige Trousers', price: 2500, rating: 98, image: 'beigeTrousers', category: 'trousers', tone: 'light' },
];

export const productById = (id: string) => products.find((p) => p.id === id);

export const dresses = products.filter((p) => p.category === 'dress');

export const newArrivals = [
  'green-dress',
  'black-long-dress',
  'cream-long-dress',
  'blue-long-dress',
  'black-dress',
  'green-midi-dress',
];

export const homeTabs = ['All', 'Apparel', 'Dress', 'Tshirt', 'Bag'] as const;

export const promptSuggestions = [
  'What do you wear for a college reunion?',
  'What are some good autumn outfits?',
  'Show me some women outfits for a rock concert.',
];

export type PromptThread = {
  id: string;
  title: string;
  subtitle: string;
  more: number;
  count: string;
  image: ImageKey;
  date: string;
  steps: { text: string; count: string; image: ImageKey; itemImage?: ImageKey }[];
};

export const promptThreads: PromptThread[] = [
  {
    id: 'college-reunion',
    title: 'Women’s Outfits For College Reunion',
    subtitle: 'Midi length dresses',
    more: 3,
    count: '+25',
    image: 'pinkLongDress',
    date: 'Thu, 15 Feb',
    steps: [
      { text: 'Show in pastel colours', count: '25+', image: 'pinkLongDress' },
      { text: 'More like this', count: '40+', image: 'emeraldMidiDress', itemImage: 'pinkLongDress' },
      { text: 'Show midi length dresses', count: '85+', image: 'greenLongDress2' },
      { text: 'What do you wear for college reunion?', count: '125+', image: 'blackDress' },
    ],
  },
  {
    id: 'trench-coats',
    title: 'Knee Length Trench Coats',
    subtitle: 'Colours that go with grey.',
    more: 2,
    count: '+143',
    image: 'promptTrench',
    date: 'Thu, 15 Feb',
    steps: [{ text: 'Knee length trench coats', count: '143+', image: 'promptTrench' }],
  },
  {
    id: 'athleisure',
    title: 'Men’s Dark Athleisure',
    subtitle: 'Full length sleeves and pants.',
    more: 3,
    count: '+85',
    image: 'promptAthleisure',
    date: 'Mon, 29 Mar',
    steps: [{ text: 'Men’s dark athleisure', count: '85+', image: 'promptAthleisure' }],
  },
  {
    id: 'beach-wear',
    title: 'Women’s Conservative Beach Wear',
    subtitle: 'Pastel colours.',
    more: 3,
    count: '+36',
    image: 'promptBeach',
    date: 'Mon, 29 Mar',
    steps: [{ text: 'Women’s conservative beach wear', count: '36+', image: 'promptBeach' }],
  },
  {
    id: 'fall-shoes',
    title: 'Men’s Fall Shoes',
    subtitle: 'Colours that go with brown.',
    more: 2,
    count: '56+',
    image: 'promptShoes',
    date: 'Mon, 29 Mar',
    steps: [{ text: 'Men’s fall shoes', count: '56+', image: 'promptShoes' }],
  },
];

export const searchCategories: { label: string; image: ImageKey; query: string }[] = [
  { label: 'Winter', image: 'catWinter', query: 'Winter outfits' },
  { label: 'T-Shirts', image: 'catTshirts', query: 'T-shirts' },
  { label: 'Beach', image: 'catBeach', query: 'Beach wear' },
  { label: 'Formal', image: 'catFormal', query: 'Formal wear' },
];

export const menuSections = ['Women', 'Man', 'Kids'] as const;
export const menuItems = ['New', 'Apparel', 'Bag', 'Shoes', 'Beauty', 'Accessories'];

export type Owner = 'mine' | 'sharedByMe' | 'sharedWithMe';

export type Collection = {
  id: string;
  name: string;
  owner: Owner;
  productIds: string[];
  sharedWith: ImageKey[];
  likes?: Record<string, number>;
};

export const seedCollections: Collection[] = [
  {
    id: 'jackets',
    name: 'Jackets',
    owner: 'sharedByMe',
    productIds: [
      'black-leather-jacket',
      'grey-puffer-jacket',
      'black-puffer-jacket',
      'burgundy-jacket',
      'beige-winter-jacket',
      'beige-jacket',
      'beige-cardigan',
    ],
    sharedWith: ['avatarJo', 'avatarManu'],
    likes: { 'black-leather-jacket': 2, 'grey-puffer-jacket': 1 },
  },
  {
    id: 'cardigans',
    name: 'Cardigans',
    owner: 'sharedWithMe',
    productIds: ['brown-turtleneck', 'blue-floral-cardigan', 'cream-cardigan', 'beige-cardigan'],
    sharedWith: ['avatarNiya'],
  },
  {
    id: 'shoes',
    name: 'Shoes',
    owner: 'sharedByMe',
    productIds: ['ankle-boots', 'open-toe-shoe', 'stiletto-boots'],
    sharedWith: ['avatarJoanne'],
  },
  {
    id: 'date-outfit-ideas',
    name: 'Date Outfit Ideas',
    owner: 'mine',
    productIds: [
      'green-long-dress',
      'coffee-leather-bag',
      'kitten-heel-boots',
      'long-blue-dress',
      'cream-cardigan',
      'abstract-tulle-dress',
      'ankle-boots',
    ],
    sharedWith: [],
  },
];

export const seedFavourites = [
  'black-puffer-jacket',
  'ankle-boots',
  'cream-cardigan',
  'green-long-dress',
  'coffee-leather-bag',
  'beige-trousers',
  'olive-cardigan',
  'brown-cardigan',
  'tan-bag',
  'cream-long-coat',
  'blue-cardigan',
];

export const shareContacts: { name: string; avatar: ImageKey }[] = [
  { name: 'Joanne', avatar: 'avatarJoanne' },
  { name: 'Manu', avatar: 'avatarManu' },
  { name: 'Niya', avatar: 'avatarNiya' },
];

export type MeasureKey =
  | 'neck'
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'arm'
  | 'waist'
  | 'hips'
  | 'thigh'
  | 'shoe';

export const measures: { key: MeasureKey; label: string; unit: 'cm' | 'UK'; image: ImageKey; min: number; max: number; step: number }[] = [
  { key: 'neck', label: 'Neck', unit: 'cm', image: 'measNeck', min: 0, max: 60, step: 1 },
  { key: 'chest', label: 'Chest', unit: 'cm', image: 'measChest', min: 0, max: 160, step: 1 },
  { key: 'shoulders', label: 'Shoulders', unit: 'cm', image: 'measShoulders', min: 0, max: 80, step: 1 },
  { key: 'biceps', label: 'Biceps', unit: 'cm', image: 'measBiceps', min: 0, max: 60, step: 1 },
  { key: 'arm', label: 'Arm', unit: 'cm', image: 'measArm', min: 0, max: 100, step: 1 },
  { key: 'waist', label: 'Waist', unit: 'cm', image: 'measWaist', min: 0, max: 160, step: 1 },
  { key: 'hips', label: 'Hips', unit: 'cm', image: 'measHips', min: 0, max: 160, step: 1 },
  { key: 'thigh', label: 'Thigh', unit: 'cm', image: 'measThigh', min: 0, max: 100, step: 1 },
  { key: 'shoe', label: 'Shoe', unit: 'UK', image: 'measShoe', min: 0, max: 13, step: 0.5 },
];

export type Measurements = Record<MeasureKey, number>;

// What the body scan "returns" in the prototype (values from the Confirm
// Measurements screen).
export const scannedMeasurements: Measurements = {
  neck: 14,
  chest: 75,
  shoulders: 40,
  biceps: 30,
  arm: 70,
  waist: 60,
  hips: 90,
  thigh: 55,
  shoe: 5,
};

export const fitOptions = ['Tight', 'Slightly Tight', 'Regular', 'Slightly Relaxed', 'Relaxed'];

export type Profile = {
  id: string;
  name: string;
  avatar?: ImageKey;
  photoUri?: string;
  gender?: 'Male' | 'Female';
  fit: string[];
  measurements?: Measurements;
  bodyType?: string;
};

export const seedProfiles: Profile[] = [
  {
    id: 'leena',
    name: 'Leena A.',
    avatar: 'avatarLeena',
    gender: 'Female',
    fit: ['Slightly Relaxed', 'Relaxed'],
    measurements: { ...scannedMeasurements, neck: 11 },
    bodyType: 'Rectangle',
  },
  { id: 'kid', name: 'Kid', avatar: 'avatarKid', fit: [] },
];

export const accountRows = [
  'Account Details',
  'Orders',
  'Payment Information',
  'Help',
  'Settings',
  'Invite A Friend',
  'Returns & Refunds Policy',
  'Terms & Conditions',
];

// Pre-rendered try-on composites from the design. Keyed by the sorted product
// ids worn; anything not listed falls back to the base photo.
export const tryOnRenders: Record<string, ImageKey> = {
  '': 'tryOnBase',
  'long-blue-dress': 'tryOnBlueDress',
  'kitten-heel-boots|long-blue-dress': 'tryOnBlueDressBoots',
  'ankle-boots|long-blue-dress': 'tryOnBlueDressBoots',
  'abstract-tulle-dress': 'tryOnTulleBoots',
  'abstract-tulle-dress|kitten-heel-boots': 'tryOnTulleBoots',
  'abstract-tulle-dress|ankle-boots': 'tryOnTulleBoots',
};

export const checkoutAddress = {
  name: 'Priya U',
  lines: ['111-2222 Ullamcorper. Street', 'Roseville NH 54321', '(123) 456-7890'],
  card: 'Master Card ending  • • • • 89',
};
