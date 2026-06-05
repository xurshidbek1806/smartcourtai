import 'package:flutter/material.dart';

import 'pages/ai_assistant_page.dart';
import 'pages/claim_detail_page.dart';
import 'pages/claim_validator_page.dart';
import 'pages/claim_wizard_page.dart';
import 'pages/configured_page.dart';
import 'pages/dashboard_page.dart';
import 'theme/app_theme.dart';

void main() => runApp(const SmartCourtApp());

class SmartCourtApp extends StatelessWidget {
  const SmartCourtApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartCourt — Fuqaro portali',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      initialRoute: '/portal/dashboard',
      onGenerateRoute: _generateRoute,
    );
  }

  Route<dynamic> _generateRoute(RouteSettings settings) {
    final name = settings.name ?? '/portal/dashboard';
    Widget page;

    if (name == '/portal/dashboard') {
      page = const DashboardPage();
    } else if (name == '/portal/claim-validator') {
      page = const ClaimValidatorPage();
    } else if (name == '/portal/claims/new') {
      page = const ClaimWizardPage();
    } else if (name == '/portal/ai-assistant') {
      page = const AiAssistantPage();
    } else if (RegExp(r'^/portal/claims/[^/]+$').hasMatch(name)) {
      page = ClaimDetailPage(name.split('/').last);
    } else {
      page = ConfiguredPage(name);
    }

    return MaterialPageRoute(builder: (_) => page, settings: settings);
  }
}
