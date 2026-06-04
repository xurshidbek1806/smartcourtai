import {
  AudioLines,
  Bot,
  BrainCircuit,
  FileCheck,
  FileSearch,
  Fingerprint,
  Gavel,
  GitBranch,
  Landmark,
  Lock,
  Mic,
  Network,
  Scale,
  ShieldCheck
} from 'lucide-vue-next';

export const modules = [
  { name: 'JustiScribe', icon: Mic, text: 'Sud majlislarini real-time stenogramma qiladi.' },
  {
    name: 'LexPredictor',
    icon: BrainCircuit,
    text: 'Pretsedentlar asosida natija ehtimolini baholaydi.'
  },
  {
    name: 'SmartJudge',
    icon: Gavel,
    text: 'Qaror qoralamasini qonun moddalari bilan tayyorlaydi.'
  },
  {
    name: 'EvidentAI',
    icon: FileSearch,
    text: 'Dalillarni tekshiradi va huquqiy faktlarni ajratadi.'
  },
  { name: 'MediatoBot', icon: Scale, text: 'Sudgacha kelishuv ehtimolini tahlil qiladi.' },
  {
    name: 'AnonimusLaw',
    icon: Fingerprint,
    text: 'Shaxsiy ma’lumotlarni nashrdan oldin yashiradi.'
  },
  { name: 'CorruptAlert', icon: Network, text: 'Aloqalar grafidan xavf signallarini topadi.' },
  { name: 'SentencAI', icon: FileCheck, text: 'Jazo proporsionalligini hisoblaydi.' },
  {
    name: 'SecureCourt',
    icon: ShieldCheck,
    text: 'Audit, shifrlash va ruxsatlarni nazorat qiladi.'
  },
  {
    name: 'AudioVault',
    icon: AudioLines,
    text: 'Yozuvlar, diarizatsiya va waveform arxivini yuritadi.'
  }
];

export const stats = [
  { value: '556 → 16', label: 'sudyaga ish yuklamasi' },
  { value: '4M+', label: 'ish yiliga tahlil qilinadi' },
  { value: '60%', label: 'operatsion yuk kamayadi' },
  { value: '0s', label: 'protokol kutish vaqti' }
];

export const claims = [
  {
    id: '2026-001234',
    title: 'Mehnat shartnomasi bo‘yicha kompensatsiya',
    status: 'Sudga qabul qilindi',
    judge: 'Karimov A.A.',
    date: '15.01.2026',
    next: '22.02.2026',
    score: 73
  },
  {
    id: '2026-001209',
    title: 'Oilaviy mol-mulk bo‘linishi',
    status: 'Dalillar tekshirilmoqda',
    judge: 'Rahimova M.S.',
    date: '12.01.2026',
    next: '18.02.2026',
    score: 64
  },
  {
    id: '2026-001178',
    title: 'Yetkazib berish shartnomasi nizosi',
    status: 'Mediatsiya tavsiya qilindi',
    judge: 'Aliyev F.N.',
    date: '09.01.2026',
    next: 'Kutilmoqda',
    score: 81
  }
];

export const hearings = [
  { time: '09:20', speaker: 'Sudya', text: 'Tomonlar shaxsini tasdiqladi.' },
  { time: '09:26', speaker: 'Da’vogar', text: 'Shartnoma 2025 yil 14 noyabrda imzolangan.' },
  {
    time: '09:31',
    speaker: 'Javobgar',
    text: '50 000 000 so‘m miqdoridagi qarzni qisman tan oladi.'
  },
  { time: '09:38', speaker: 'AI', text: '167-modda va 985-modda bo‘yicha havolalar aniqlandi.' }
];

export const auditRows = [
  ['14:32', 'Karimov A.', 'Judge', 'SmartJudge draft', '10.20.4.18', 'Success'],
  ['14:30', 'Admin Root', 'Admin', 'Model setting update', '10.20.1.2', 'Success'],
  ['14:28', 'Rahimova M.', 'Judge', 'Evidence opened', '10.20.4.22', 'Success'],
  ['14:21', 'Unknown', 'External', 'Login attempt', '172.16.4.7', 'Blocked'],
  ['14:15', 'OneID Bridge', 'Service', 'Citizen verified', '10.20.8.3', 'Success']
];

export const graphNodes = [
  { name: 'S. Karimov', x: 42, y: 34, risk: 84 },
  { name: 'Orion LLC', x: 64, y: 50, risk: 71 },
  { name: 'Toshkent sudi', x: 30, y: 58, risk: 42 },
  { name: 'A. Rahimov', x: 76, y: 28, risk: 66 },
  { name: 'Delta Bank', x: 52, y: 76, risk: 58 }
];

export const kpis = [
  { label: 'Aktiv foydalanuvchilar', value: '128,420', delta: '+12%' },
  { label: 'Bugungi ishlar', value: '4,812', delta: '+7%' },
  { label: 'AI murojaatlar', value: '31,907', delta: '+18%' },
  { label: 'Tizim yuklamasi', value: '42%', delta: 'normal' }
];

export const modelCards = [
  {
    name: 'Llama-3 Legal',
    version: '3.1-court',
    accuracy: '94.2%',
    status: 'Faol',
    requests: '18,240'
  },
  {
    name: 'Whisper Court',
    version: 'large-v3',
    accuracy: '96.8%',
    status: 'Faol',
    requests: '7,913'
  },
  {
    name: 'LexPredictor',
    version: '2026.02',
    accuracy: '88.5%',
    status: 'Faol',
    requests: '12,604'
  },
  { name: 'Deepfake Guard', version: '1.9', accuracy: '91.1%', status: 'Pauza', requests: '2,018' }
];

export const trustItems = [
  {
    title: 'On-Premise',
    text: 'Sud infratuzilmasida ishlaydi, data tashqi servisga chiqmaydi.',
    icon: Landmark
  },
  {
    title: 'ISO 27001 ready',
    text: 'Audit, kirish nazorati va logging standartlari bilan.',
    icon: Lock
  },
  {
    title: 'UzPrivacy',
    text: 'Anonimlashtirish va shaxsiy ma’lumotlarni minimallashtirish.',
    icon: Bot
  }
];
