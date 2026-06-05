import 'package:flutter/material.dart';

import '../theme/tokens.dart';

enum ToastType { success, error, info }

/// Web `ui.pushToast` ekvivalenti — chap chetida rangli aksent bo'lgan snackbar.
void showToast(
  BuildContext context, {
  required ToastType type,
  required String title,
  String? text,
}) {
  final color = switch (type) {
    ToastType.success => AppColors.statGreen,
    ToastType.error => AppColors.statRed,
    ToastType.info => AppColors.statBlue,
  };
  final icon = switch (type) {
    ToastType.success => Icons.check_circle_outline,
    ToastType.error => Icons.cancel_outlined,
    ToastType.info => Icons.info_outline,
  };

  final messenger = ScaffoldMessenger.of(context);
  messenger.clearSnackBars();
  messenger.showSnackBar(
    SnackBar(
      behavior: SnackBarBehavior.floating,
      backgroundColor: AppColors.white,
      elevation: 8,
      margin: const EdgeInsets.fromLTRB(14, 0, 14, 84),
      padding: EdgeInsets.zero,
      duration: const Duration(seconds: 3),
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.r(AppRadius.md),
        side: const BorderSide(color: AppColors.borderSubtle),
      ),
      content: Container(
        decoration: BoxDecoration(
          border: Border(left: BorderSide(color: color, width: 3)),
        ),
        padding: const EdgeInsets.fromLTRB(13, 11, 13, 11),
        child: Row(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(
                          color: AppColors.gray900,
                          fontWeight: FontWeight.w700,
                          fontSize: 14)),
                  if (text != null && text.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(text,
                        style: const TextStyle(
                            color: AppColors.gray500, fontSize: 13, height: 1.35)),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
