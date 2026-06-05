import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'tokens.dart';

/// Apple-style light theme — web bilan bir xil shrift (Inter) va ranglar.
ThemeData buildAppTheme() {
  final base = ThemeData(brightness: Brightness.light, useMaterial3: true);
  final textTheme = GoogleFonts.interTextTheme(base.textTheme).apply(
    bodyColor: AppColors.gray800,
    displayColor: AppColors.gray900,
  );

  return base.copyWith(
    scaffoldBackgroundColor: AppColors.gray100,
    canvasColor: AppColors.gray100,
    textTheme: textTheme,
    primaryColor: AppColors.gray900,
    colorScheme: const ColorScheme.light(
      primary: AppColors.gray900,
      onPrimary: AppColors.white,
      secondary: AppColors.statBlue,
      surface: AppColors.white,
      onSurface: AppColors.gray800,
      error: AppColors.statRed,
    ),
    dividerColor: AppColors.borderSubtle,
    splashFactory: InkRipple.splashFactory,
    iconTheme: const IconThemeData(color: AppColors.gray900, size: 18),
  );
}
