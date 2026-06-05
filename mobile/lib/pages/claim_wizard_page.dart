import 'package:flutter/material.dart';

import '../services/api.dart';
import '../services/toast.dart';
import '../theme/tokens.dart';
import '../widgets/role_shell.dart';
import '../widgets/ui.dart';

class _DType {
  final String title;
  final IconData icon;
  final String text;
  const _DType(this.title, this.icon, this.text);
}

class ClaimWizardPage extends StatefulWidget {
  const ClaimWizardPage({super.key});
  @override
  State<ClaimWizardPage> createState() => _ClaimWizardPageState();
}

class _ClaimWizardPageState extends State<ClaimWizardPage> {
  int step = 1;
  bool submitting = false;
  bool validating = false;
  Map<String, dynamic>? validation;

  String selectedType = 'Mehnat nizosi';
  String partyType = 'Jismoniy shaxs';

  final c = {
    for (final k in [
      'claimantName', 'claimantPinfl', 'claimantAddress', 'claimantPhone',
      'respondentName', 'respondentPinfl', 'respondentAddress', 'respondentPhone',
      'title', 'description', 'amount', 'eventDate'
    ])
      k: TextEditingController()
  };

  static const _disputeMap = {
    'Fuqarolik nizosi': 'civil',
    'Mehnat nizosi': 'labor',
    'Iqtisodiy nizosi': 'economic',
    'Oilaviy nizosi': 'family',
    "Ma'muriy shikoyat": 'administrative',
  };

  static const _types = [
    _DType('Fuqarolik nizosi', Icons.home_outlined, 'Shaxsiy va mulkiy munosabatlar.'),
    _DType('Mehnat nizosi', Icons.apartment, 'Ish haqi, kompensatsiya, shartnoma.'),
    _DType('Iqtisodiy nizosi', Icons.account_balance, "Yuridik shaxslar o'rtasidagi kelishuvlar."),
    _DType('Oilaviy nizosi', Icons.balance, "Ajrim, aliment, mol-mulk bo'linishi."),
    _DType("Ma'muriy shikoyat", Icons.description_outlined, 'Davlat organi qarori yoki harakati.'),
  ];

  static const _steps = ['Nizo turi', 'Tomonlar', 'Tafsilotlar', 'Dalillar', 'Yuborish'];

  @override
  void dispose() {
    for (final ctrl in c.values) {
      ctrl.dispose();
    }
    super.dispose();
  }

  void _next() => setState(() => step = step < 5 ? step + 1 : 5);
  void _prev() => setState(() => step = step > 1 ? step - 1 : 1);

  int? _parseAmount(String raw) {
    final digits = raw.replaceAll(RegExp(r'[^\d]'), '');
    final n = int.tryParse(digits);
    return (n != null && n > 0) ? n : null;
  }

  Future<void> _runValidator() async {
    final parts = <String>[
      'Nizo turi: $selectedType',
      if (c['title']!.text.isNotEmpty) 'Sarlavha: ${c['title']!.text}',
      if (c['claimantName']!.text.isNotEmpty) "Da'vogar: ${c['claimantName']!.text}",
      if (c['respondentName']!.text.isNotEmpty) 'Javobgar: ${c['respondentName']!.text}',
      if (c['amount']!.text.isNotEmpty) 'Nizo summasi: ${c['amount']!.text}',
      if (c['eventDate']!.text.isNotEmpty) 'Voqea sanasi: ${c['eventDate']!.text}',
      if (c['description']!.text.isNotEmpty) '\nMohiyati: ${c['description']!.text}',
    ];
    final text = parts.join('\n');
    if (text.trim().length < 20) {
      showToast(context, type: ToastType.error, title: 'Matn juda qisqa', text: 'Kamida 20 belgi kiriting.');
      return;
    }
    setState(() {
      validating = true;
      validation = null;
    });
    try {
      final r = await api.validateClaim(text);
      if (!mounted) return;
      setState(() => validation = r);
      showToast(context,
          type: ToastType.success,
          title: 'AI tahlil tayyor',
          text: (r['summary']?.toString() ?? 'ClaimValidator natija qaytardi.'));
    } catch (e) {
      if (!mounted) return;
      showToast(context, type: ToastType.error, title: 'AI tahlil xatosi', text: "Backend bilan bog'lanib bo'lmadi.");
    } finally {
      if (mounted) setState(() => validating = false);
    }
  }

  Future<void> _submit() async {
    if (submitting) return;
    if (c['title']!.text.trim().isEmpty) {
      showToast(context, type: ToastType.error, title: 'Sarlavha kerak', text: '3-bosqichda sarlavha kiriting.');
      setState(() => step = 3);
      return;
    }
    setState(() => submitting = true);
    try {
      await api.ensureAuth();
      final payload = {
        'dispute_type': _disputeMap[selectedType] ?? 'civil',
        'title': c['title']!.text,
        'description': c['description']!.text,
        'amount': _parseAmount(c['amount']!.text),
        'currency': 'UZS',
        'location': c['claimantAddress']!.text.isNotEmpty
            ? c['claimantAddress']!.text
            : (c['respondentAddress']!.text.isNotEmpty ? c['respondentAddress']!.text : null),
        if (c['respondentName']!.text.isNotEmpty)
          'respondents': {
            'name': c['respondentName']!.text,
            'pinfl': c['respondentPinfl']!.text,
            'phone': c['respondentPhone']!.text,
            'address': c['respondentAddress']!.text,
          },
      };
      final claim = await api.createClaim(payload);
      await api.submitClaim(claim['id']);
      if (!mounted) return;
      showToast(context,
          type: ToastType.success,
          title: 'Ariza yuborildi',
          text: "Sud tizimiga ${claim['reference'] ?? '#${claim['id']}'} bilan qabul qilindi.");
      Navigator.pushReplacementNamed(context, '/portal/claims/${claim['id']}');
    } catch (e) {
      if (!mounted) return;
      showToast(context, type: ToastType.error, title: 'Yuborish xatosi', text: "Backend bilan bog'lanib bo'lmadi.");
    } finally {
      if (mounted) setState(() => submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RoleShell(
      title: 'Yangi ariza',
      subtitle: '5 bosqichli ariza wizardi',
      currentPath: '/portal/claims/new',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header + stepper
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Expanded(
                      child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Eyebrow('Qoralama avtomatik saqlanadi'),
                      SizedBox(height: 4),
                      H2('Arizani sudga yuborish'),
                    ],
                  )),
                  BaseButton('Qoralama',
                      variant: BtnVariant.secondary,
                      size: BtnSize.sm,
                      onPressed: () => showToast(context,
                          type: ToastType.success,
                          title: 'Qoralama saqlandi',
                          text: 'Ariza qoralamasi saqlandi.')),
                ]),
                const SizedBox(height: 16),
                _stepper(),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: AppRadius.r(AppRadius.full),
                  child: LinearProgressIndicator(
                    value: step / 5,
                    minHeight: 8,
                    backgroundColor: AppColors.gray100,
                    valueColor: const AlwaysStoppedAnimation(AppColors.statBlue),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Body
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (step == 1) ..._step1(),
                if (step == 2) ..._step2(),
                if (step == 3) ..._step3(),
                if (step == 4) ..._step4(),
                if (step == 5) ..._step5(),
                const SizedBox(height: 20),
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  BaseButton('Orqaga',
                      variant: BtnVariant.secondary, disabled: step == 1, onPressed: _prev),
                  BaseButton(
                      step == 5 ? (submitting ? 'Yuborilmoqda...' : 'Yuborish') : 'Davom etish',
                      loading: submitting,
                      onPressed: step == 5 ? _submit : _next),
                ]),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _stepper() {
    return Column(
      children: [
        for (var i = 0; i < _steps.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: GestureDetector(
              onTap: () => setState(() => step = i + 1),
              child: Container(
                height: 44,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: step == i + 1
                      ? AppColors.statBlueSoft
                      : (step > i + 1 ? AppColors.statGreenSoft : AppColors.gray100),
                  border: Border.all(
                    color: step == i + 1
                        ? AppColors.statBlue
                        : (step > i + 1 ? AppColors.statGreen : AppColors.borderSubtle),
                  ),
                  borderRadius: AppRadius.r(AppRadius.full),
                ),
                child: Row(children: [
                  Container(
                    width: 26,
                    height: 26,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(color: AppColors.white, shape: BoxShape.circle),
                    child: Text(step > i + 1 ? '✓' : '${i + 1}',
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                  ),
                  const SizedBox(width: 9),
                  Text(_steps[i],
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: step == i + 1
                              ? AppColors.statBlue
                              : (step > i + 1 ? AppColors.statGreen : AppColors.gray500))),
                ]),
              ),
            ),
          ),
      ],
    );
  }

  // ── Step 1 ──
  List<Widget> _step1() {
    return [
      const H2('1. Nizo turini tanlang'),
      const SizedBox(height: 14),
      BaseCard(
        variant: CardVariant.filled,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Eyebrow('Tanlangan huquqiy shablon'),
          const SizedBox(height: 6),
          Text('$selectedType — rasmiy struktura',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          const Muted('PDF/PDF-A • Tegishli kodeks moddalari asosida'),
        ]),
      ),
      const SizedBox(height: 14),
      for (final t in _types) ...[
        _typeCard(t),
        const SizedBox(height: 12),
      ],
    ];
  }

  Widget _typeCard(_DType t) {
    final sel = selectedType == t.title;
    return GestureDetector(
      onTap: () => setState(() => selectedType = t.title),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.white,
          border: Border.all(color: sel ? AppColors.gray900 : AppColors.borderSubtle, width: sel ? 2 : 1),
          borderRadius: AppRadius.r(AppRadius.lg),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(t.icon, size: 26, color: AppColors.gray800),
            const Spacer(),
            if (sel) const Icon(Icons.check, size: 20, color: AppColors.gray900),
          ]),
          const SizedBox(height: 10),
          Text(t.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Muted(t.text),
        ]),
      ),
    );
  }

  // ── Step 2 ──
  List<Widget> _step2() {
    return [
      const H2('2. Tomonlar'),
      const SizedBox(height: 14),
      Row(children: [
        BaseButton('Jismoniy shaxs',
            variant: partyType == 'Jismoniy shaxs' ? BtnVariant.primary : BtnVariant.secondary,
            onPressed: () => setState(() => partyType = 'Jismoniy shaxs')),
        const SizedBox(width: 10),
        BaseButton('Yuridik shaxs',
            variant: partyType == 'Yuridik shaxs' ? BtnVariant.primary : BtnVariant.secondary,
            onPressed: () => setState(() => partyType = 'Yuridik shaxs')),
      ]),
      const SizedBox(height: 16),
      _input('claimantName', "Da'vogar F.I.Sh / tashkilot", 'Karimov Akmal'),
      _input('claimantPinfl', "Da'vogar PINFL / INN", '12345678901234'),
      _input('claimantAddress', "Da'vogar manzili", 'Toshkent, Yunusobod'),
      _input('claimantPhone', "Da'vogar telefon / email", '+998 90 000 00 00'),
      _input('respondentName', 'Javobgar F.I.Sh / tashkilot', 'Alfa MChJ'),
      _input('respondentPinfl', 'Javobgar PINFL / INN', '987654321'),
      _input('respondentAddress', 'Javobgar manzili', 'Toshkent, Chilonzor'),
      _input('respondentPhone', 'Javobgar telefon / email', '+998 71 000 00 00'),
    ];
  }

  // ── Step 3 ──
  List<Widget> _step3() {
    final v = validation;
    return [
      const H2('3. Nizo tafsilotlari'),
      const SizedBox(height: 14),
      _input('title', 'Sarlavha', "Mehnat kompensatsiyasi bo'yicha da'vo"),
      const Text('Nizo mohiyati',
          style: TextStyle(color: AppColors.gray700, fontSize: 13, fontWeight: FontWeight.w600)),
      const SizedBox(height: 8),
      TextField(
        controller: c['description'],
        maxLines: 6,
        decoration: InputDecoration(
          filled: true,
          fillColor: AppColors.white,
          hintText: 'Kamida 200 belgi...',
          contentPadding: const EdgeInsets.all(12),
          enabledBorder: OutlineInputBorder(
              borderRadius: AppRadius.r(AppRadius.md),
              borderSide: const BorderSide(color: AppColors.borderDefault)),
          focusedBorder: OutlineInputBorder(
              borderRadius: AppRadius.r(AppRadius.md),
              borderSide: const BorderSide(color: AppColors.statBlue)),
        ),
      ),
      const SizedBox(height: 12),
      Row(children: [
        Expanded(child: _input('amount', 'Nizo summasi', '50 000 000', noBottom: true)),
        const SizedBox(width: 10),
        Expanded(child: _input('eventDate', 'Voqea sanasi', '15.01.2026', icon: Icons.event, noBottom: true)),
      ]),
      const SizedBox(height: 14),
      BaseButton(validating ? 'AI tahlil qilmoqda...' : 'AI bilan tekshirish (ClaimValidator)',
          icon: Icons.auto_awesome, loading: validating, expand: true, onPressed: _runValidator),
      if (v != null) ...[
        const SizedBox(height: 12),
        BaseCard(
          variant: CardVariant.filled,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Eyebrow('AI: ClaimValidator natijasi'),
            if (v['summary'] != null) ...[
              const SizedBox(height: 8),
              Text(v['summary'].toString(),
                  style: const TextStyle(fontSize: 15, height: 1.5, fontWeight: FontWeight.w600)),
            ],
            if (v['dispute_type'] != null) _aiRow('Nizo turi', v['dispute_type'].toString()),
            if (v['jurisdiction'] != null) _aiRow('Yurisdiksiya', v['jurisdiction'].toString()),
            if (v['missing_fields'] is List && (v['missing_fields'] as List).isNotEmpty) ...[
              const SizedBox(height: 12),
              const Muted("Yetishmayotgan ma'lumotlar", size: 12),
              for (final f in (v['missing_fields'] as List)) Muted('• $f', size: 13),
            ],
            if (v['recommendations'] is List && (v['recommendations'] as List).isNotEmpty) ...[
              const SizedBox(height: 12),
              const Muted('Tavsiyalar', size: 12),
              for (final r in (v['recommendations'] as List)) Muted('• $r', size: 13),
            ],
          ]),
        ),
      ],
    ];
  }

  Widget _aiRow(String k, String val) {
    return Container(
      decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppColors.borderSubtle))),
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(k, style: const TextStyle(color: AppColors.gray500, fontSize: 13)),
        Flexible(
          child: Text(val,
              textAlign: TextAlign.right,
              style: const TextStyle(color: AppColors.gray900, fontSize: 13, fontWeight: FontWeight.w700)),
        ),
      ]),
    );
  }

  // ── Step 4 ──
  List<Widget> _step4() {
    return [
      const H2('4. Dalillar'),
      const SizedBox(height: 14),
      InkWell(
        onTap: () => showToast(context,
            type: ToastType.info,
            title: 'Dalil',
            text: 'Mobil qurilmada fayl tanlash — demo. Dalilsiz ham davom etish mumkin.'),
        borderRadius: AppRadius.r(AppRadius.lg),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 32),
          decoration: BoxDecoration(
            color: AppColors.gray100,
            border: Border.all(color: AppColors.borderDefault),
            borderRadius: AppRadius.r(AppRadius.lg),
          ),
          child: const Column(children: [
            Icon(Icons.upload_file, size: 34, color: AppColors.gray900),
            SizedBox(height: 10),
            Text('Fayllarni tanlash uchun bosing', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 6),
            Muted('PDF, DOCX, TXT, JPG, PNG, MP3 • AI tahlil qiladi', size: 13),
          ]),
        ),
      ),
      const SizedBox(height: 10),
      const Muted("Dalil ixtiyoriy — fayl yuklamasdan ham davom etishingiz mumkin."),
    ];
  }

  // ── Step 5 ──
  List<Widget> _step5() {
    return [
      const H2("5. Ko'rib chiqish va yuborish"),
      const SizedBox(height: 14),
      BaseCard(
        variant: CardVariant.filled,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Eyebrow('Yuklanadigan ariza paketi'),
          const SizedBox(height: 6),
          Text(selectedType, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          const Muted(
              "Foydalanuvchi uchun .doc, backend uchun JSON metadata. Yakuniy topshirishda PDF/PDF-A va ERI backendda shakllantiriladi."),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.statBlueSoft,
              border: Border.all(color: AppColors.statBlue.withOpacity(0.24)),
              borderRadius: AppRadius.r(AppRadius.md),
            ),
            child: const Text(
                "Bu hujjat avtomatik tayyorlangan. Yakuniy tasdiq mas'ul shaxs tomonidan amalga oshiriladi.",
                style: TextStyle(
                    color: AppColors.gray800, fontSize: 13, fontWeight: FontWeight.w700, height: 1.5)),
          ),
        ]),
      ),
      const SizedBox(height: 14),
      BaseCard(
        variant: CardVariant.filled,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const H2('MediatoBot tavsiyasi'),
          const SizedBox(height: 6),
          const Muted(
              'Bu nizoni sudga bermasdan mediatsiya orqali hal qilish mumkin. 67% holatlarda muvaffaqiyatli yechilgan.'),
          const SizedBox(height: 12),
          Row(children: [
            BaseButton("Mediatsiyani sinash",
                variant: BtnVariant.secondary,
                onPressed: () => Navigator.pushReplacementNamed(context, '/portal/mediation')),
            const SizedBox(width: 10),
            BaseButton('Sudga yuborish', onPressed: _submit),
          ]),
        ]),
      ),
    ];
  }

  Widget _input(String key, String label, String hint, {IconData? icon, bool noBottom = false}) {
    final field = BaseInput(label: label, controller: c[key], placeholder: hint, icon: icon);
    if (noBottom) return field;
    return Padding(padding: const EdgeInsets.only(bottom: 12), child: field);
  }
}
