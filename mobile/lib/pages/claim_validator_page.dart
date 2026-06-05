import 'dart:convert';
import 'package:flutter/material.dart';

import '../services/api.dart';
import '../services/toast.dart';
import '../theme/tokens.dart';
import '../widgets/role_shell.dart';
import '../widgets/ui.dart';

class ClaimValidatorPage extends StatefulWidget {
  const ClaimValidatorPage({super.key});
  @override
  State<ClaimValidatorPage> createState() => _ClaimValidatorPageState();
}

class _ClaimValidatorPageState extends State<ClaimValidatorPage> {
  final _text = TextEditingController(
      text:
          "Men Orion LLC bilan tuzilgan mehnat shartnomasi bo'yicha 50 000 000 so'm kompensatsiya talab qilaman. Ish beruvchi shartnomani ogohlantirishsiz bekor qilgan.");
  String fileName = '';
  bool analyzing = false;
  bool analyzed = false;
  Map<String, dynamic>? result;

  dynamic _pick(Map r, List<String> keys) {
    for (final k in keys) {
      if (r[k] != null) return r[k];
    }
    return null;
  }

  Map<String, dynamic> get _view {
    final r = result ?? {};
    return {
      'jurisdiction': _pick(r, ['jurisdiction', 'yurisdiksiya', 'court', 'sud']) ?? 'Aniqlanmadi',
      'disputeType': _pick(r, ['dispute_type', 'nizo_turi', 'category', 'turi']) ?? 'Aniqlanmadi',
      'score': _pick(r, ['completeness_score', 'score', 'tayyorlik', 'completeness']) ?? 0,
      'facts': _pick(r, ['legal_facts', 'facts', 'huquqiy_faktlar', 'topilgan_faktlar']) ?? [],
      'missing': _pick(r, ['missing_fields', 'missing', 'kamchiliklar', 'tuzatish']) ?? [],
    };
  }

  Future<void> _analyze() async {
    if (analyzing) return;
    if (_text.text.trim().isEmpty) {
      showToast(context, type: ToastType.error, title: "Matn bo'sh", text: 'Ariza matnini kiriting.');
      return;
    }
    setState(() {
      analyzing = true;
      analyzed = false;
    });
    try {
      final r = await api.validateClaim(_text.text);
      if (!mounted) return;
      setState(() {
        result = r;
        analyzed = true;
      });
      showToast(context,
          type: ToastType.success,
          title: 'ClaimValidator tahlili tayyor',
          text: 'Lokal AI yurisdiksiya, kamchilik va faktlarni aniqladi.');
    } catch (e) {
      if (!mounted) return;
      showToast(context,
          type: ToastType.error, title: 'Tahlil xatosi', text: "Backend bilan bog'lanib bo'lmadi.");
    } finally {
      if (mounted) setState(() => analyzing = false);
    }
  }

  void _reset() {
    setState(() {
      result = null;
      fileName = '';
      analyzed = false;
    });
    showToast(context, type: ToastType.info, title: 'Tozalandi', text: 'Tahlil tozalandi.');
  }

  @override
  Widget build(BuildContext context) {
    final v = _view;
    return RoleShell(
      title: 'ClaimValidator',
      subtitle: 'Aqlli kantselyariya',
      currentPath: '/portal/claim-validator',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Eyebrow('Kiruvchi oqim va filtrlash'),
                const SizedBox(height: 10),
                const Text('Arizani sudga yuborishdan oldin tekshiring.',
                    style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700, height: 1.05)),
                const SizedBox(height: 12),
                const Muted(
                    "ClaimValidator ariza matnini o'qiydi, yurisdiksiyani aniqlaydi, kamchiliklarni ko'rsatadi va to'g'ri sudga yo'naltiradi.",
                    size: 15),
                const SizedBox(height: 14),
                const BaseBadge('NLP + OCR demo', variant: BadgeVariant.filled),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Source
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  const Expanded(
                      child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [Eyebrow('1. Ariza manbasi'), SizedBox(height: 4), H2('PDF yoki erkin matn')],
                  )),
                  const Icon(Icons.description_outlined, size: 22, color: AppColors.gray700),
                ]),
                const SizedBox(height: 14),
                InkWell(
                  onTap: () => setState(() {
                    fileName = 'mehnat-kompensatsiya-arizasi.pdf';
                    showToast(context,
                        type: ToastType.info, title: 'Namuna matn', text: 'Quyidagi matn tahlil uchun tayyor.');
                  }),
                  borderRadius: AppRadius.r(AppRadius.lg),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 26),
                    decoration: BoxDecoration(
                      color: AppColors.gray100,
                      border: Border.all(color: AppColors.borderDefault),
                      borderRadius: AppRadius.r(AppRadius.lg),
                    ),
                    child: Column(children: [
                      const Icon(Icons.upload_file, size: 30, color: AppColors.gray900),
                      const SizedBox(height: 8),
                      Text(fileName.isEmpty ? 'PDF arizani yuklash' : fileName,
                          style: const TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      const Muted('PDF, JPG yoki DOCX • OCR demo', size: 13),
                    ]),
                  ),
                ),
                const SizedBox(height: 16),
                Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                  BaseButton('Tozalash',
                      variant: BtnVariant.secondary, icon: Icons.restart_alt, onPressed: _reset),
                  const SizedBox(width: 10),
                  BaseButton(analyzing ? 'Tahlil qilinmoqda...' : 'Arizani tahlil qilish',
                      icon: Icons.document_scanner_outlined, loading: analyzing, onPressed: _analyze),
                ]),
                const SizedBox(height: 16),
                const Text('Ariza matni',
                    style: TextStyle(color: AppColors.gray700, fontSize: 13, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                TextField(
                  controller: _text,
                  maxLines: 8,
                  style: const TextStyle(color: AppColors.gray900, height: 1.55),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: AppColors.white,
                    contentPadding: const EdgeInsets.all(14),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: AppRadius.r(AppRadius.md),
                      borderSide: const BorderSide(color: AppColors.borderDefault),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: AppRadius.r(AppRadius.md),
                      borderSide: const BorderSide(color: AppColors.statBlue),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Result
          if (analyzed) ...[
            const SizedBox(height: 16),
            Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Expanded(
                        child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Eyebrow('2. ClaimValidator natijasi'),
                        SizedBox(height: 4),
                        H2('Ariza tayyorlik darajasi')
                      ],
                    )),
                    Text('${v['score']}%',
                        style: const TextStyle(
                            color: AppColors.statBlue, fontSize: 36, fontWeight: FontWeight.w700)),
                  ]),
                  const SizedBox(height: 14),
                  Row(children: [
                    Expanded(child: _resultCard(Icons.check_circle_outline, 'Yurisdiksiya', '${v['jurisdiction']}')),
                    const SizedBox(width: 12),
                    Expanded(child: _resultCard(Icons.description_outlined, 'Nizo turi', '${v['disputeType']}')),
                  ]),
                  const SizedBox(height: 16),
                  const Text('Topilgan huquqiy faktlar', style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  for (final f in (v['facts'] as List)) _resultRow(f.toString(), true),
                  const SizedBox(height: 14),
                  const Text('Tuzatilishi kerak', style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  for (final m in (v['missing'] as List)) _resultRow(m.toString(), false),
                ],
              ),
            ),
          ],

          // JSON preview
          const SizedBox(height: 16),
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Eyebrow("Mashina o'qiydigan natija"),
                const SizedBox(height: 6),
                const H2('JSON preview'),
                const SizedBox(height: 12),
                BaseButton("Ariza wizardiga o'tish",
                    icon: Icons.data_object,
                    expand: true,
                    onPressed: () => Navigator.pushNamed(context, '/portal/claims/new')),
                const SizedBox(height: 14),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                      color: AppColors.gray900, borderRadius: AppRadius.r(AppRadius.md)),
                  child: Text(
                    JsonEncoder.withIndent('  ').convert(result ?? {'hint': 'Tahlil natijasi'}),
                    style: const TextStyle(
                        color: AppColors.white, fontSize: 12, height: 1.5, fontFamily: 'monospace'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _resultCard(IconData icon, String title, String value) {
    return BaseCard(
      variant: CardVariant.filled,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 22, color: AppColors.gray800),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Muted(value),
        ],
      ),
    );
  }

  Widget _resultRow(String text, bool success) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: success ? AppColors.statGreenSoft : AppColors.statRedSoft,
        borderRadius: AppRadius.r(AppRadius.md),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(success ? Icons.check_circle_outline : Icons.cancel_outlined,
            size: 17, color: success ? AppColors.statGreen : AppColors.statRed),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: const TextStyle(color: AppColors.gray800, fontSize: 13))),
      ]),
    );
  }
}
