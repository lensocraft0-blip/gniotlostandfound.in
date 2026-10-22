import { ItemCategory } from '../types/database';

export const GNIOT_CAMPUS_LOCATIONS = [
  'Academic Block A - Ground Floor',
  'Academic Block A - 1st Floor Classrooms',
  'Academic Block A - 2nd Floor Faculty Lounge',
  'Academic Block B - Computer Science Labs',
  'Academic Block B - IT & AI Labs (Lab 3 & 4)',
  'Academic Block C - Electronics & Mechanical Labs',
  'Central Library - Ground Floor Reading Hall',
  'Central Library - 1st Floor Digital Resource Room',
  'Central Library - 2nd Floor Reference Section',
  'Campus Cafeteria & Student Food Court',
  'Main Auditorium & Seminar Hall 1',
  'Administrative Block - Student Welfare Office',
  'Administrative Block - Reception & Registrar',
  'Main Sports Ground & Pavilion',
  'Indoor Sports Complex & Badminton Courts',
  'Boys Hostel 1 - Common Room & Lawn',
  'Boys Hostel 2 - Entrance Lobby',
  'Girls Hostel - Main Reception & Dining Hall',
  'Main Gate Security Checkpoint (Gate 1)',
  'Gate 2 Parking & Bus Stand Area',
] as const;

export const GNIOT_CAMPUS_ZONES = [
  'North Academic Quad',
  'South Engineering Wing',
  'Central Plaza & Lawn',
  'Library & Research Hub',
  'Hostel Residential Zone',
  'Sports & Recreation Arena',
  'Main Gate & Parking Zone',
] as const;

export const ITEM_CATEGORIES: ItemCategory[] = [
  'Phones & Electronics',
  'Student ID Cards',
  'Wallets & Bags',
  'Keys & Smart Fobs',
  'Books & Stationery',
  'Clothing & Accessories',
  'Bottles & Lunch Boxes',
  'Calculators & Gear',
  'Other Belongings',
];

export const ITEM_COLORS = [
  'Black',
  'Silver / Grey',
  'White',
  'Blue',
  'Red',
  'Gold / Bronze',
  'Green',
  'Brown',
  'Pink / Rose Gold',
  'Multi-colored',
];

export interface HelpDeskInfo {
  name: string;
  location: string;
  operatingHours: string;
  notes: string;
  isVerifiedSample: boolean;
}

export const GNIOT_HELPDESKS: HelpDeskInfo[] = [
  {
    name: 'Central Campus Security & Lost Property Desk',
    location: 'Main Gate 1 Security Cabin & Ground Floor Admin Block',
    operatingHours: 'Monday – Saturday: 08:30 AM – 06:00 PM IST',
    notes: 'Primary physical repository for verified high-value belongings (smartphones, wallets, laptops, ID cards).',
    isVerifiedSample: true, // Marked transparently as campus reference
  },
  {
    name: 'Student Welfare Department (SWD)',
    location: 'Administrative Block, Room 104',
    operatingHours: 'Monday – Friday: 09:30 AM – 04:30 PM IST',
    notes: 'Handles disputed claims, official university ID replacement clearances, and administrative verification.',
    isVerifiedSample: true,
  },
  {
    name: 'Central Library Circulation & Help Desk',
    location: 'Central Library Ground Floor',
    operatingHours: 'Monday – Saturday: 08:00 AM – 08:00 PM IST',
    notes: 'Holding area for items left in study carrels, books, and calculator gear.',
    isVerifiedSample: true,
  },
];

export const CAMPUS_RULES_AND_FAQS = [
  {
    question: 'What should I do immediately after losing an item at GNIOT?',
    answer:
      'File a "Report Lost Item" immediately on this platform with specific details (approximate location like Academic Block B or Library, time, brand, color). Check the "AI Suggested Matches" tab regularly for compatibility hits.',
  },
  {
    question: 'How do I claim a found item without public disclosure of private details?',
    answer:
      'When you locate your item in "Browse Reports", click "Claim Item". You will be asked for private verification answers (e.g. lock screen wallpaper description, engraving, or specific markings). Only authorized campus administrators and the item finder can review these answers.',
  },
  {
    question: 'Where do I surrender high-value found items (phones, laptops, wallets)?',
    answer:
      'High-value items must be handed over to the Central Campus Security Desk at Gate 1 or the Admin Block Student Welfare Office within 2 hours. File a "Report Found Item" marking "Handed to Security Desk".',
  },
  {
    question: 'How does the heuristic AI matching work?',
    answer:
      'The engine evaluates category alignment (+30), keyword overlap in title and description (+25), color match (+15), brand match (+10), campus location proximity (+15), and date proximity (+5). A score above 60 indicates a strong potential match.',
  },
  {
    question: 'Can I use this app without an active internet connection?',
    answer:
      'Yes! GNIOT Lost & Found AI includes an offline engine. You can draft lost or found reports while offline; they are securely preserved in your local device storage and can be synced with one click as soon as you reconnect.',
  },
];
