import 'package:flutter/material.dart';

import '../services/api.dart';
import '../services/toast.dart';
import '../theme/tokens.dart';
import '../widgets/role_shell.dart';
import '../widgets/ui.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});
  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  Map<String, dynamic>? dash;
  List<dynamic> claims = [];
  String userName = 'Fuqaro';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final me = await api.ensureAuth();
      if (me?['full_name'] != null) userName = me!['full_name'].toString();
      final d = await api.getCitizenDashboard();
      final c = await api.listClaims();
      if (!mounted) return;
      setState(() {
        dash = d;
        if (d['greeting_name'] != null) userName = d['greeting_name'].toString();
        claims = c;
      });
    } catch (e) {
      if (!mounted) return;
      showToast(context, type: ToastType.error, title: "Yuklab bo'lmadi", text: e.toString());
    }
  }

  String _statusLabel(dynamic s) => (s ?? '').toString().replaceAll('_', ' ');

  @override
  Widget build(BuildContext context) {
    final metrics = [
      ['Jami arizalar', '${dash?['total_claims'] ?? 0}', 'umumiy', AppColors.statBlue],
      ['Aktiv arizalar', '${dash?['active_claims'] ?? 0}', 'jarayonda', AppColors.statGreen],
      ['Qoralamalar', '${dash?['drafts'] ?? 0}', 'tugallanmagan', AppColors.statRed],
      ['AI tavsiya', 'RAG', 'mediatsiya', AppColors.statBlue],
    ];

    return RoleShell(
      title: 'Fuqaro portali',
      subtitle: 'OneID tasdiqlangan profil',
      currentPath: '/portal/dashboard',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.white,
              border: Border.all(color: AppColors.borderSubtle),
              borderRadius: AppRadius.r(AppRadius.lg),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Eyebrow('Bugungi holat'),
                const SizedBox(height: 8),
                Text(userName,
                    style: const TextStyle(
                        fontSize: 30, fontWeight: FontWeight.w700, height: 1.05)),
                const SizedBox(height: 6),
                const Muted("Arizalar, to'lov va majlis sanalari nazoratda."),
                const SizedBox(height: 16),
                Wrap(spacing: 8, runSpacing: 8, children: [
                  BaseButton('Yangi ariza',
                      icon: Icons.add,
                      onPressed: () => Navigator.pushNamed(context, '/portal/claims/new')),
                  BaseButton('Arizani tekshirish',
                      variant: BtnVariant.secondary,
                      icon: Icons.document_scanner_outlined,
                      onPressed: () =>
                          Navigator.pushReplacementNamed(context, '/portal/claim-validator')),
                  BaseButton('AI yordam',
                      variant: BtnVariant.secondary,
                      icon: Icons.auto_awesome,
                      onPressed: () =>
                          Navigator.pushReplacementNamed(context, '/portal/ai-assistant')),
                ]),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Metrics 2x2
          Row(children: [
            Expanded(child: _metric(metrics[0])),
            const SizedBox(width: 10),
            Expanded(child: _metric(metrics[1])),
          ]),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: _metric(metrics[2])),
            const SizedBox(width: 10),
            Expanded(child: _metric(metrics[3])),
          ]),
          const SizedBox(height: 16),

          // Active claims
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [Eyebrow('Arizalar'), SizedBox(height: 4), H2('Aktiv ishlar')],
                      ),
                    ),
                    BaseButton('Eksport',
                        variant: BtnVariant.ghost,
                        size: BtnSize.sm,
                        icon: Icons.ios_share,
                        onPressed: () => showToast(context,
                            type: ToastType.success,
                            title: 'Eksport',
                            text: 'Arizalar JSON yuklab olindi.')),
                  ],
                ),
                const SizedBox(height: 12),
                if (claims.isEmpty)
                  const Muted(
                      'Hozircha arizangiz yo\'q. "Yangi ariza" tugmasi orqali birinchi arizangizni yarating.')
                else
                  for (final claim in claims) ...[
                    _claimCard(claim),
                    const SizedBox(height: 12),
                  ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // AI tavsiyasi
          _compactPanel(
            icon: Icons.auto_awesome,
            title: 'AI tavsiyasi',
            text: "1 ta ariza mediatsiya orqali tezroq hal bo'lishi mumkin.",
            actionLabel: 'Mediatsiya',
            actionIcon: Icons.balance,
            onAction: () => Navigator.pushReplacementNamed(context, '/portal/mediation'),
          ),
          const SizedBox(height: 16),
          _compactPanel(
            icon: Icons.document_scanner_outlined,
            title: 'ClaimValidator',
            text: 'Arizani yuborishdan oldin kamchiliklar va yurisdiksiyani tekshiring.',
            actionLabel: 'Tekshirish',
            onAction: () => Navigator.pushReplacementNamed(context, '/portal/claim-validator'),
          ),
          const SizedBox(height: 16),

          // Keyingi qadamlar
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const H2('Keyingi qadamlar'),
                const SizedBox(height: 6),
                _eventRow(Icons.credit_card, 'Davlat boji holati', 'Portal'),
                _eventRow(Icons.description_outlined, 'Hujjatlarni yuklash', 'Ariza'),
                _eventRow(Icons.calendar_today, 'Sud majlisi sanasi', 'Kutilmoqda', last: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _metric(List<dynamic> m) {
    final color = m[3] as Color;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.white,
        border: Border(
          left: BorderSide(color: color, width: 3),
          top: const BorderSide(color: AppColors.borderSubtle),
          right: const BorderSide(color: AppColors.borderSubtle),
          bottom: const BorderSide(color: AppColors.borderSubtle),
        ),
        borderRadius: AppRadius.r(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(m[0] as String,
              style: const TextStyle(
                  color: AppColors.gray500, fontSize: 12, fontWeight: FontWeight.w700)),
          const SizedBox(height: 5),
          Text(m[1] as String,
              style: const TextStyle(
                  color: AppColors.gray900, fontSize: 28, fontWeight: FontWeight.w700, height: 1)),
          const SizedBox(height: 5),
          Text(m[2] as String,
              style: const TextStyle(
                  color: AppColors.gray500, fontSize: 12, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _claimCard(Map<String, dynamic> claim) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        border: const Border(top: BorderSide(color: AppColors.statBlue, width: 3)),
        borderRadius: AppRadius.r(AppRadius.lg),
        boxShadow: AppShadow.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            BaseBadge(_statusLabel(claim['status']), variant: BadgeVariant.outline),
            const SizedBox(width: 8),
            Flexible(
              child: Text('${claim['dispute_type'] ?? ''}',
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w700)),
            ),
          ]),
          const SizedBox(height: 10),
          Text('${claim['title'] ?? ''}',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Muted('#${claim['reference'] ?? claim['id']}'),
          const SizedBox(height: 10),
          InkWell(
            onTap: () => Navigator.pushNamed(context, '/portal/claims/${claim['id']}'),
            child: const Text('Tafsilotlar',
                style: TextStyle(color: AppColors.gray900, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  Widget _compactPanel({
    required IconData icon,
    required String title,
    required String text,
    required String actionLabel,
    IconData? actionIcon,
    required VoidCallback onAction,
  }) {
    return Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 22, color: AppColors.gray800),
          const SizedBox(height: 10),
          H2(title),
          const SizedBox(height: 6),
          Muted(text),
          const SizedBox(height: 12),
          BaseButton(actionLabel,
              variant: BtnVariant.secondary, size: BtnSize.sm, icon: actionIcon, onPressed: onAction),
        ],
      ),
    );
  }

  Widget _eventRow(IconData icon, String title, String meta, {bool last = false}) {
    return Container(
      decoration: BoxDecoration(
        border: last ? null : const Border(bottom: BorderSide(color: AppColors.borderSubtle)),
      ),
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Icon(icon, size: 17, color: AppColors.gray700),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title,
                  style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.gray900)),
              const SizedBox(height: 3),
              Text(meta,
                  style: const TextStyle(
                      color: AppColors.gray500, fontSize: 12, fontWeight: FontWeight.w700)),
            ],
          ),
        ],
      ),
    );
  }
}
