import 'package:flutter/material.dart';

import '../theme/tokens.dart';
import 'ui.dart';

/// Web `DataTable.vue` — qidiruv + status-pill rangli hujayralar + bo'sh holat.
class SmartDataTable extends StatefulWidget {
  final List<String> columns;
  final List<List<String>> rows;
  const SmartDataTable({super.key, required this.columns, required this.rows});

  @override
  State<SmartDataTable> createState() => _SmartDataTableState();
}

class _SmartDataTableState extends State<SmartDataTable> {
  String _query = '';

  List<List<String>> get _filtered {
    final q = _query.trim().toLowerCase();
    if (q.isEmpty) return widget.rows;
    return widget.rows.where((r) => r.join(' ').toLowerCase().contains(q)).toList();
  }

  // Web statusTone() — regex tone aniqlash.
  String _tone(String cell) {
    final v = cell.toLowerCase();
    if (RegExp(r'(blocked|xavf|rad|pauza|signal|xato|external)').hasMatch(v)) return 'red';
    if (RegExp(r'(success|faol|bajarildi|tasdiqlandi|published|qanoat|ochiq)').hasMatch(v)) {
      return 'green';
    }
    if (RegExp(r'(kutil|ijro|tekshir|draft|queue|running|qabul|yangi)').hasMatch(v)) return 'blue';
    return '';
  }

  Color _toneColor(String tone) => switch (tone) {
        'green' => AppColors.statGreen,
        'blue' => AppColors.statBlue,
        'red' => AppColors.statRed,
        _ => AppColors.gray700,
      };
  Color _toneBg(String tone) => switch (tone) {
        'green' => AppColors.statGreenSoft,
        'blue' => AppColors.statBlueSoft,
        'red' => AppColors.statRedSoft,
        _ => AppColors.gray100,
      };

  @override
  Widget build(BuildContext context) {
    final rows = _filtered;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Toolbar: search + count
        Container(
          height: 40,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: AppColors.gray100,
            border: Border.all(color: AppColors.borderSubtle),
            borderRadius: AppRadius.r(AppRadius.full),
          ),
          child: Row(
            children: [
              const Icon(Icons.search, size: 17, color: AppColors.gray500),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  onChanged: (v) => setState(() => _query = v),
                  style: const TextStyle(fontSize: 14, color: AppColors.gray900),
                  decoration: const InputDecoration(
                    isCollapsed: true,
                    border: InputBorder.none,
                    hintText: 'Jadvaldan qidirish',
                    hintStyle: TextStyle(color: AppColors.gray400, fontSize: 14),
                  ),
                ),
              ),
              Text('${rows.length} ta',
                  style: const TextStyle(
                      color: AppColors.gray500, fontSize: 12, fontWeight: FontWeight.w700)),
            ],
          ),
        ),
        const SizedBox(height: 10),
        if (rows.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(26),
            decoration: BoxDecoration(
              color: AppColors.gray100,
              border: Border.all(color: AppColors.borderDefault, style: BorderStyle.solid),
              borderRadius: AppRadius.r(AppRadius.lg),
            ),
            child: const Column(
              children: [
                Icon(Icons.inventory_2_outlined, size: 36, color: AppColors.gray500),
                SizedBox(height: 10),
                Text("Bo'sh ro'yxat",
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                SizedBox(height: 4),
                Muted('Mos yozuv topilmadi.'),
              ],
            ),
          )
        else
          Container(
            decoration: BoxDecoration(
              color: AppColors.white,
              border: Border.all(color: AppColors.borderSubtle),
              borderRadius: AppRadius.r(AppRadius.lg),
            ),
            clipBehavior: Clip.antiAlias,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTableTheme(
                data: const DataTableThemeData(
                  headingTextStyle: TextStyle(
                      color: AppColors.gray500, fontSize: 12, fontWeight: FontWeight.w600),
                  dataTextStyle: TextStyle(color: AppColors.gray800, fontSize: 13),
                  dividerThickness: 1,
                ),
                child: DataTable(
                  headingRowColor: WidgetStateProperty.all(AppColors.white),
                  columnSpacing: 28,
                  horizontalMargin: 14,
                  columns: [
                    for (final c in widget.columns)
                      DataColumn(label: Text(c.toUpperCase())),
                  ],
                  rows: [
                    for (final row in rows)
                      DataRow(
                        cells: [
                          for (final cell in row)
                            DataCell(_cell(cell)),
                        ],
                      ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _cell(String cell) {
    final tone = _tone(cell);
    if (tone.isEmpty) return Text(cell);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
      decoration: BoxDecoration(
        color: _toneBg(tone),
        borderRadius: AppRadius.r(AppRadius.full),
      ),
      child: Text(cell,
          style: TextStyle(
              color: _toneColor(tone), fontSize: 12, fontWeight: FontWeight.w700)),
    );
  }
}
