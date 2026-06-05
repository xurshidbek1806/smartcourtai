import 'package:flutter/material.dart';

/// Design tokens — 1:1 web `styles/main.css` :root bilan bir xil.
class AppColors {
  static const white = Color(0xFFFFFFFF);
  static const black = Color(0xFF000000);

  static const gray50 = Color(0xFFFAFAFA);
  static const gray100 = Color(0xFFF5F5F7);
  static const gray200 = Color(0xFFE8E8ED);
  static const gray300 = Color(0xFFD2D2D7);
  static const gray400 = Color(0xFFA1A1A6);
  static const gray500 = Color(0xFF86868B);
  static const gray600 = Color(0xFF6E6E73);
  static const gray700 = Color(0xFF424245);
  static const gray800 = Color(0xFF1D1D1F);
  static const gray900 = Color(0xFF0A0A0A);

  static const statBlue = Color(0xFF0071E3);
  static const statGreen = Color(0xFF248A3D);
  static const statRed = Color(0xFFD70015);

  // soft = ~7% alpha
  static const statBlueSoft = Color(0x120071E3);
  static const statGreenSoft = Color(0x12248A3D);
  static const statRedSoft = Color(0x12D70015);

  static const borderSubtle = Color(0x0E000000); // rgba(0,0,0,.055)
  static const borderDefault = Color(0x1A000000); // rgba(0,0,0,.1)
}

class AppRadius {
  static const sm = 6.0;
  static const md = 8.0;
  static const lg = 8.0;
  static const xl = 10.0;
  static const xxl = 12.0;
  static const full = 999.0;

  static BorderRadius r(double v) => BorderRadius.circular(v);
}

class AppShadow {
  static const sm = [
    BoxShadow(color: Color(0x06000000), blurRadius: 2, offset: Offset(0, 1)),
  ];
  static const md = [
    BoxShadow(color: Color(0x0B000000), blurRadius: 24, offset: Offset(0, 8)),
  ];
  static const lg = [
    BoxShadow(color: Color(0x10000000), blurRadius: 44, offset: Offset(0, 18)),
  ];
  static const xl = [
    BoxShadow(color: Color(0x17000000), blurRadius: 70, offset: Offset(0, 28)),
  ];
}
