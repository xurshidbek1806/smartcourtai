import 'package:flutter/material.dart';

import '../services/api.dart';
import '../services/toast.dart';
import '../theme/tokens.dart';
import '../widgets/role_shell.dart';
import '../widgets/ui.dart';

class ClaimDetailPage extends StatefulWidget {
  final String id;
  const ClaimDetailPage(this.id, {super.key});
  @override
  State<ClaimDetailPage> createState() => _ClaimDetailPageState();
}

class _ClaimDetailPageState extends State<ClaimDetailPage> {
  String tab = 'Tafsilot';
  Map<String, dynamic>? claim;
  List<dynamic> documents = [];
  Map<String, dynamic>? prediction;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      await api.ensureAuth();
      final c = await api.getClaim(widget.id);
      List<dynamic> docs = [];
      Map<String, dynamic>? pred;
      try {
        docs = await api.listClaimDocuments(widget.id);
      } catch (_) {}
      try {
        pred = await api.lexPredictor({
          'dispute_type': c['dispute_type'],
          'description': c['description'] ?? c['title'],
        });
      } catch (_) {}
      if (!mounted) return;
      setState(() {
        claim = c;
        documents = docs;
        prediction = pred;
        loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => loading = false);
      showToast(context, type: ToastType.error, title: 'Ariza topilmadi', text: e.toString());
    }
  }

  int get _score => (prediction?['win_probability'] ?? 0) is num
      ? (prediction?['win_probability'] ?? 0).round()
      : 0;
  Color get _scoreColor =>
      _score >= 75 ? AppColors.statGreen : (_score >= 50 ? AppColors.statBlue : AppColors.statRed);

  @override
  Widget build(BuildContext context) {
    return RoleShell(
      title: 'Ariza tafsilotlari',
      subtitle: 'Sud jarayoni holati',
      currentPath: '/portal/claims/${widget.id}',
      child: Panel(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            InkWell(
              onTap: () => Navigator.pushReplacementNamed(context, '/portal/dashboard'),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.arrow_back, size: 18, color: AppColors.gray600),
                SizedBox(width: 8),
                Text('Orqaga', style: TextStyle(color: AppColors.gray600, fontWeight: FontWeight.w600)),
              ]),
            ),
            const SizedBox(height: 16),
            if (loading)
              const Muted('Yuklanmoqda...')
            else if (claim != null) ...[
              Eyebrow('Yaratilgan: ${_date(claim!['created_at'])}'),
              const SizedBox(height: 8),
              Text(claim!['reference']?.toString() ?? "Ariza #${claim!['id']}",
                  style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w700)),
              const SizedBox(height: 6),
              Muted(claim!['title']?.toString() ?? ''),
              const SizedBox(height: 16),
              _tabs(),
              const SizedBox(height: 14),
              if (tab == 'Tafsilot') _detailTab(),
              if (tab == 'Hujjatlar') _docsTab(),
              if (tab == 'AI') _aiTab(),
            ],
          ],
        ),
      ),
    );
  }

  String _date(dynamic raw) {
    if (raw == null) return '—';
    try {
      final d = DateTime.parse(raw.toString());
      return '${d.day.toString().padLeft(2, '0')}.${d.month.toString().padLeft(2, '0')}.${d.year}';
    } catch (_) {
      return '—';
    }
  }

  Widget _tabs() {
    const tabs = ['Tafsilot', 'Hujjatlar', 'AI'];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.gray100,
        borderRadius: AppRadius.r(AppRadius.full),
      ),
      child: Row(children: [
        for (final t in tabs)
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => tab = t),
              child: Container(
                height: 36,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: tab == t ? AppColors.white : Colors.transparent,
                  borderRadius: AppRadius.r(AppRadius.full),
                  boxShadow: tab == t ? AppShadow.sm : null,
                ),
                child: Text(t,
                    style: TextStyle(
                        color: tab == t ? AppColors.gray900 : AppColors.gray500,
                        fontWeight: FontWeight.w700,
                        fontSize: 13)),
              ),
            ),
          ),
      ]),
    );
  }

  Widget _detailTab() {
    final c = claim!;
    final status = (c['status'] ?? '').toString().replaceAll('_', ' ');
    return Column(children: [
      BaseCard(
        variant: CardVariant.filled,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const H2('Holat'),
          const SizedBox(height: 8),
          Row(children: [
            Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(right: 8),
                decoration: const BoxDecoration(color: AppColors.gray900, shape: BoxShape.circle)),
            Text(status, style: const TextStyle(color: AppColors.gray800)),
          ]),
          const SizedBox(height: 6),
          Muted('Nizo turi: ${c['dispute_type'] ?? '—'}'),
          Muted('Summa: ${c['amount'] != null ? '${c['amount']} ${c['currency'] ?? ''}' : '—'}'),
          Muted('Davlat boji: ${c['state_fee'] != null ? '${c['state_fee']} UZS' : '—'}'),
        ]),
      ),
      const SizedBox(height: 12),
      BaseCard(
        variant: CardVariant.filled,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const H2('Mohiyati'),
          const SizedBox(height: 8),
          Muted(c['description']?.toString() ?? 'Tavsif kiritilmagan.'),
        ]),
      ),
    ]);
  }

  Widget _docsTab() {
    if (documents.isEmpty) return const Muted('Hujjat yuklanmagan.');
    return Column(
      children: [
        for (final d in documents) ...[
          BaseCard(
            variant: CardVariant.filled,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(d['filename']?.toString() ?? '',
                  style: const TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              Muted('${d['kind'] ?? ''} · ${((d['size_bytes'] ?? 0) / 1024).round()} KB'),
              if (d['ai_analysis']?['summary'] != null)
                Muted('AI: ${d['ai_analysis']['summary']}'),
            ]),
          ),
          const SizedBox(height: 10),
        ],
      ],
    );
  }

  Widget _aiTab() {
    return Column(children: [
      Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.white,
          border: Border(
            top: BorderSide(color: _scoreColor, width: 3),
            left: const BorderSide(color: AppColors.borderSubtle),
            right: const BorderSide(color: AppColors.borderSubtle),
            bottom: const BorderSide(color: AppColors.borderSubtle),
          ),
          borderRadius: AppRadius.r(AppRadius.lg),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const H2('LexPredictor — yutish ehtimoli'),
          const SizedBox(height: 8),
          Text('$_score%',
              style: TextStyle(color: _scoreColor, fontSize: 44, fontWeight: FontWeight.w800)),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: AppRadius.r(AppRadius.full),
            child: LinearProgressIndicator(
              value: _score / 100,
              minHeight: 10,
              backgroundColor: AppColors.gray100,
              valueColor: AlwaysStoppedAnimation(_scoreColor),
            ),
          ),
          const SizedBox(height: 10),
          Muted(prediction != null
              ? "${prediction!['similar_cases_found'] ?? 0} ta o'xshash pretsedent topildi."
              : 'AI tahlil mavjud emas.'),
        ]),
      ),
      if (prediction?['precedents'] is List && (prediction!['precedents'] as List).isNotEmpty) ...[
        const SizedBox(height: 14),
        BaseCard(
          variant: CardVariant.filled,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const H2("O'xshash pretsedentlar"),
            const SizedBox(height: 8),
            for (final p in (prediction!['precedents'] as List))
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Muted(
                    "${p['reference'] ?? ''} — ${p['outcome'] ?? ''} (${(((p['similarity'] ?? 0) as num) * 100).round()}%)"),
              ),
          ]),
        ),
      ],
    ]);
  }
}
