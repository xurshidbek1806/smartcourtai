import 'package:flutter/material.dart';

class NavItem {
  final String label;
  final String to;
  final IconData icon;
  final String? badge;
  const NavItem(this.label, this.to, this.icon, {this.badge});
}

/// Web `data/navigation.js` → portalNav (aynan bir xil tartib va badge'lar).
const portalNav = <NavItem>[
  NavItem('Dashboard', '/portal/dashboard', Icons.home_outlined),
  NavItem('ClaimValidator', '/portal/claim-validator', Icons.document_scanner_outlined),
  NavItem('Arizalarim', '/portal/claims', Icons.description_outlined, badge: '3'),
  NavItem('Yangi ariza', '/portal/claims/new', Icons.create_new_folder_outlined),
  NavItem('Mediatsiya', '/portal/mediation', Icons.handshake_outlined),
  NavItem('AI Maslahatchi', '/portal/ai-assistant', Icons.auto_awesome),
  NavItem('Xabarlar', '/portal/messages', Icons.chat_bubble_outline, badge: '8'),
  NavItem('Kutubxona', '/portal/library', Icons.local_library_outlined),
  NavItem('Profil', '/portal/profile', Icons.person_outline),
  NavItem('Sozlamalar', '/settings/account', Icons.settings_outlined),
];

class NavGroup {
  final String label;
  final List<NavItem> items;
  const NavGroup(this.label, this.items);
}

/// Web RoleShell `groupedNav` bilan bir xil bo'linish.
List<NavGroup> get groupedNav => [
      NavGroup('Asosiy', portalNav.sublist(0, 3)),
      NavGroup('Ishlar va AI', portalNav.sublist(3, 7)),
      NavGroup('Sozlamalar', portalNav.sublist(7)),
    ].where((g) => g.items.isNotEmpty).toList();

/// Pastki navigatsiya — birinchi 4 ta (web `bottomNav`).
List<NavItem> get bottomNav => portalNav.sublist(0, 4);
