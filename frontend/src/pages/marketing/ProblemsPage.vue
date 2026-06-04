<script setup>
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  FileWarning,
  Scale,
  ShieldAlert
} from 'lucide-vue-next';

import GlassNav from '@/components/marketing/GlassNav.vue';
import SiteFooter from '@/components/marketing/SiteFooter.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const stats = [
  { value: '4M+', label: 'ish va material yiliga', note: '2025-yil yakunlari bo‘yicha' },
  { value: '556', label: 'fuqarolik sudyasiga oyiga ish', note: 'tavsiya etilgan 16 ta o‘rniga' },
  { value: '35x', label: 'xalqaro me’yordan yuqori yuklama', note: 'eng og‘riqli nuqta' },
  { value: '450–730', label: 'kunlik global ko‘rib chiqish muddati', note: '1.5–2 yil' }
];

const issues = [
  {
    icon: Scale,
    title: 'Sudyalar yuklamasi',
    text: 'Noreal ish hajmi sudyaning har bir ishni chuqur tahlil qilish vaqtini qisqartiradi.',
    solution: 'ClaimValidator + SmartJudge'
  },
  {
    icon: FileWarning,
    title: 'Byurokratiya va rutina',
    text: 'Protokol, anonimlashtirish va shablon hujjatlar ko‘p vaqtni texnik ishlarga sarflaydi.',
    solution: 'JustiScribe + AnonimusLaw'
  },
  {
    icon: Clock3,
    title: 'Adolatning kechikishi',
    text: 'Qo‘lda bajariladigan jarayonlar va navbatlar ish ko‘rish muddatini uzaytiradi.',
    solution: 'Yagona AI konveyeri'
  },
  {
    icon: AlertTriangle,
    title: 'Raqamli dalillar xavfi',
    text: 'Audio, video va skrinshotlarni qo‘lda tekshirish deepfake hamda montaj xavfini oshiradi.',
    solution: 'EvidenceAnalyzer'
  },
  {
    icon: ShieldAlert,
    title: 'Korrupsion xavflar',
    text: 'Bilvosita aloqalar va manfaatlar to‘qnashuvini oddiy jadvalda aniqlash qiyin.',
    solution: 'CorruptAlert'
  }
];

const globalStats = [
  { value: '13 224', label: 'jinoiy ish yarashuv instituti orqali yopilgan' },
  { value: '60–70%', label: 'sud apparati vaqti texnik ishlarga sarflanadi' },
  { value: '85%+', label: 'sud ishlaridagi raqamli dalillar ulushi' },
  { value: '20%+', label: 'manipulyatsiya yoki deepfake xavfi bo‘lishi mumkin' }
];

const workload = [
  ['Fuqarolik ishlari', '2M+', '556 ta/oy', 'ClaimValidator, SmartJudge'],
  ['Iqtisodiy ishlar', '690K+', '388 ta/oy', 'LexPredictor, MediatoBot'],
  ['Ma’muriy huquqbuzarliklar', '691K', 'Yuqori navbat', 'SentencAI'],
  ['Jinoiy ishlar', '63K+', '79.5K+ shaxs', 'JustiScribe, EvidenceAnalyzer']
];
</script>

<template>
  <GlassNav />
  <main>
    <section class="hero container">
      <p class="eyebrow">Sud tizimidagi inqirozli nuqtalar</p>
      <h1 class="page-title">Muammo aniq: adolatga vaqt yetmayapti.</h1>
      <p class="lead">
        Byurokratiya, sansalorlik, katta ish hajmi va korrupsion xavflar fuqarolarning adolatga
        ishonchini pasaytiradi hamda davlat resurslarini ortiqcha sarflaydi.
      </p>
      <RouterLink to="/portal/claim-validator">
        <BaseButton size="xl" :icon="ArrowRight" icon-position="right">Yechimni sinash</BaseButton>
      </RouterLink>
    </section>

    <section class="stats container" aria-label="Sud tizimi statistikasi">
      <article v-for="item in stats" :key="item.label">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
        <small>{{ item.note }}</small>
      </article>
    </section>

    <section class="section container">
      <p class="eyebrow">Asosiy muammolar</p>
      <h2 class="section-title">SmartCourt AI nimani hal qiladi?</h2>
      <div class="grid grid-3 issue-grid">
        <BaseCard v-for="item in issues" :key="item.title" variant="elevated">
          <component :is="item.icon" :size="26" :stroke-width="1.5" />
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
          <strong>{{ item.solution }}</strong>
        </BaseCard>
      </div>
    </section>

    <section class="section container">
      <p class="eyebrow">Global tendensiyalar</p>
      <h2 class="section-title">Texnik ishlar va raqamli dalillar yangi bosim yaratmoqda.</h2>
      <div class="stats secondary-stats" aria-label="Global sud tizimi statistikasi">
        <article v-for="item in globalStats" :key="item.label">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </article>
      </div>
    </section>

    <section class="section container">
      <p class="eyebrow">Yuklama tafsilotlari</p>
      <h2 class="section-title">Ish hajmi sudlov yo‘nalishlari kesimida.</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Yo‘nalish</th>
              <th>Yillik hajm</th>
              <th>Muammo</th>
              <th>Frontenddagi yechim</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in workload" :key="row[0]">
              <td v-for="cell in row" :key="cell">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="cta container">
      <div>
        <p class="eyebrow">Yagona oqim</p>
        <h2>Arizadan ijrogacha barcha bosqichni frontend demo orqali ko‘ring.</h2>
      </div>
      <RouterLink to="/modules"
        ><BaseButton size="xl">10 ta modulni ko‘rish</BaseButton></RouterLink
      >
    </section>
  </main>
  <SiteFooter />
</template>

<style scoped>
.hero {
  display: grid;
  justify-items: start;
  gap: 20px;
  padding: 96px 0 54px;
}

.lead {
  width: min(820px, 100%);
  margin: 0;
  color: var(--gray-500);
  font-size: 20px;
  line-height: 1.6;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stats article {
  display: grid;
  gap: 8px;
  border: 1px solid var(--border-subtle);
  border-top: 3px solid var(--stat-red);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  padding: 20px;
}

.secondary-stats article {
  border-top-color: var(--stat-blue);
}

.stats strong {
  font-size: clamp(34px, 5vw, 56px);
  line-height: 1;
}

.stats span {
  font-weight: 800;
}

.stats small,
.issue-grid p {
  color: var(--gray-500);
  line-height: 1.5;
}

.issue-grid h3,
.issue-grid p {
  margin: 10px 0 0;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-white);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid var(--border-subtle);
  padding: 16px;
  text-align: left;
}

th {
  color: var(--gray-500);
  font-size: 12px;
  text-transform: uppercase;
}

.cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 80px;
  border-radius: var(--radius-xl);
  background: var(--gray-900);
  color: var(--color-white);
  padding: 32px;
}

.cta h2 {
  max-width: 720px;
  margin: 0;
}

@media (max-width: 980px) {
  .stats {
    grid-template-columns: 1fr 1fr;
  }

  .cta {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
