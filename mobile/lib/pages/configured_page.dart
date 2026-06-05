import 'package:flutter/material.dart';

import '../data/page_registry.dart';
import '../services/toast.dart';
import '../theme/tokens.dart';
import '../widgets/data_table.dart';
import '../widgets/role_shell.dart';
import '../widgets/ui.dart';

/// Web `ConfiguredPage.vue` — registry config asosida generic portal sahifasi.
class ConfiguredPage extends StatefulWidget {
  final String path;
  const ConfiguredPage(this.path, {super.key});

  @override
  State<ConfiguredPage> createState() => _ConfiguredPageState();
}

class _ConfiguredPageState extends State<ConfiguredPage> {
  late PageConfig page;
  final Map<String, TextEditingController> _ctrls = {};

  @override
  void initState() {
    super.initState();
    page = lookupPage(widget.path);
    for (final f in page.formFields) {
      _ctrls[f] = TextEditingController();
    }
  }

  @override
  void dispose() {
    for (final c in _ctrls.values) {
      c.dispose();
    }
    super.dispose();
  }

  bool _isTextarea(String label) =>
      label.toLowerCase().contains('matn') || label.toLowerCase().contains('izoh');

  @override
  Widget build(BuildContext context) {
    return RoleShell(
      title: 'Fuqaro portali',
      subtitle: page.title,
      currentPath: widget.path,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Eyebrow(page.eyebrow),
                const SizedBox(height: 8),
                H1(page.title),
                const SizedBox(height: 12),
                Muted(page.description),
                if (page.primaryAction != null || page.secondaryAction != null) ...[
                  const SizedBox(height: 16),
                  Wrap(spacing: 10, runSpacing: 10, children: [
                    if (page.secondaryAction != null)
                      BaseButton(page.secondaryAction!,
                          variant: BtnVariant.secondary,
                          icon: Icons.tune,
                          onPressed: () => showToast(context,
                              type: ToastType.info,
                              title: 'Tozalandi',
                              text: 'Kiritilgan qiymatlar tozalandi.')),
                    if (page.primaryAction != null)
                      BaseButton(page.primaryAction!,
                          icon: Icons.arrow_forward,
                          iconRight: true,
                          onPressed: () => showToast(context,
                              type: ToastType.success,
                              title: page.primaryAction!,
                              text: 'Bajarildi.')),
                  ]),
                ],
              ],
            ),
          ),

          // Metrics
          if (page.metrics.isNotEmpty) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                for (var i = 0; i < page.metrics.length; i++) ...[
                  if (i > 0) const SizedBox(width: 10),
                  Expanded(child: _metricTile(page.metrics[i], i % 3)),
                ]
              ],
            ),
          ],

          // Form
          if (page.formFields.isNotEmpty) ...[
            const SizedBox(height: 16),
            Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    const Expanded(child: H2("Ma'lumotlar")),
                    const Icon(Icons.assignment_outlined, color: AppColors.gray700),
                  ]),
                  const SizedBox(height: 14),
                  for (final f in page.formFields) ...[
                    BaseInput(
                      label: f,
                      controller: _ctrls[f],
                      placeholder: f,
                      maxLines: _isTextarea(f) ? 4 : 1,
                    ),
                    const SizedBox(height: 12),
                  ],
                  Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                    BaseButton('Tozalash',
                        variant: BtnVariant.secondary,
                        onPressed: () {
                          for (final c in _ctrls.values) {
                            c.clear();
                          }
                          showToast(context,
                              type: ToastType.info,
                              title: 'Tozalandi',
                              text: 'Kiritilgan qiymatlar tozalandi.');
                        }),
                    const SizedBox(width: 10),
                    BaseButton('Saqlash',
                        onPressed: () => showToast(context,
                            type: ToastType.success,
                            title: 'Saqlandi',
                            text: "Ma'lumotlar saqlandi.")),
                  ]),
                ],
              ),
            ),
          ],

          // Table
          if (page.table != null) ...[
            const SizedBox(height: 16),
            Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    const Expanded(child: H2('Jadval')),
                    const Icon(Icons.description_outlined, color: AppColors.gray700),
                  ]),
                  const SizedBox(height: 14),
                  SmartDataTable(columns: page.table!.columns, rows: page.table!.rows),
                ],
              ),
            ),
          ],

          // Cards
          if (page.cards.isNotEmpty) ...[
            const SizedBox(height: 16),
            for (final c in page.cards) ...[
              BaseCard(
                interactive: true,
                onTap: () => showToast(context, type: ToastType.info, title: c.title, text: c.text),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.check_circle_outline, color: AppColors.gray800),
                    const SizedBox(height: 8),
                    H2(c.title),
                    const SizedBox(height: 6),
                    Muted(c.text),
                    if (c.meta != null) ...[
                      const SizedBox(height: 8),
                      Text(c.meta!,
                          style: const TextStyle(
                              color: AppColors.gray500, fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],
          ],

          // Timeline
          if (page.timeline.isNotEmpty) ...[
            const SizedBox(height: 4),
            Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    const Expanded(child: H2('Vaqt jadvali')),
                    const Icon(Icons.view_sidebar_outlined, color: AppColors.gray700),
                  ]),
                  const SizedBox(height: 8),
                  for (final t in page.timeline) _timelineRow(t),
                ],
              ),
            ),
          ],

          // Side items
          if (page.sideTitle != null || page.sideItems.isNotEmpty) ...[
            const SizedBox(height: 16),
            Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Eyebrow(page.sideTitle ?? 'Yon panel'),
                  const SizedBox(height: 8),
                  H2(page.sideTitle ?? page.title),
                  const SizedBox(height: 10),
                  for (final s in page.sideItems)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(children: [
                        Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.only(right: 8),
                          decoration: const BoxDecoration(
                              color: AppColors.gray900, shape: BoxShape.circle),
                        ),
                        Expanded(
                            child: Text(s,
                                style: const TextStyle(color: AppColors.gray800, fontSize: 14))),
                      ]),
                    ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _metricTile(Metric m, int tone) {
    final color = switch (tone) {
      0 => AppColors.statBlue,
      1 => AppColors.statGreen,
      _ => AppColors.statRed,
    };
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        border: Border(
          top: BorderSide(color: color, width: 3),
          left: const BorderSide(color: AppColors.borderSubtle),
          right: const BorderSide(color: AppColors.borderSubtle),
          bottom: const BorderSide(color: AppColors.borderSubtle),
        ),
        borderRadius: AppRadius.r(AppRadius.lg),
        boxShadow: AppShadow.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(m.label,
              style: const TextStyle(
                  color: AppColors.gray500, fontSize: 12, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text(m.value,
              style: TextStyle(color: color, fontSize: 26, fontWeight: FontWeight.w700, height: 1)),
          if (m.note != null) ...[
            const SizedBox(height: 4),
            Text(m.note!, style: const TextStyle(color: AppColors.gray500, fontSize: 12)),
          ],
        ],
      ),
    );
  }

  Widget _timelineRow(TimelineItem t) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.borderSubtle)),
      ),
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 8,
            height: 8,
            margin: const EdgeInsets.only(top: 5, right: 14),
            decoration: const BoxDecoration(color: AppColors.gray900, shape: BoxShape.circle),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t.title,
                    style: const TextStyle(
                        color: AppColors.gray900, fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(height: 3),
                Muted(t.text),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
