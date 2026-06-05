import 'package:flutter/material.dart';

import '../data/navigation.dart';
import '../services/toast.dart';
import '../theme/tokens.dart';

/// Top-level bo'limga o'tish (web sidebar bosilgani kabi — stack o'smaydi).
void navigateTo(BuildContext context, String path, {String? currentPath}) {
  if (path == currentPath) return;
  Navigator.of(context).pushReplacementNamed(path);
}

/// Web `layouts/RoleShell.vue` ekvivalenti — drawer + topbar + bottom-nav.
class RoleShell extends StatelessWidget {
  final String title;
  final String subtitle;
  final String currentPath;
  final Widget child;
  final bool scrollable;

  const RoleShell({
    super.key,
    required this.title,
    required this.subtitle,
    required this.currentPath,
    required this.child,
    this.scrollable = true,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.gray100,
      drawer: _Drawer(currentPath: currentPath),
      appBar: _topBar(context),
      bottomNavigationBar: _BottomNav(currentPath: currentPath),
      body: SafeArea(
        top: false,
        child: scrollable
            ? SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(14, 14, 14, 100),
                child: child,
              )
            : Padding(
                padding: const EdgeInsets.fromLTRB(14, 14, 14, 8),
                child: child,
              ),
      ),
    );
  }

  PreferredSizeWidget _topBar(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.gray100,
      surfaceTintColor: AppColors.gray100,
      elevation: 0,
      scrolledUnderElevation: 0,
      shape: const Border(bottom: BorderSide(color: AppColors.borderSubtle)),
      titleSpacing: 0,
      iconTheme: const IconThemeData(color: AppColors.gray900),
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(title,
              style: const TextStyle(
                  color: AppColors.gray900, fontSize: 16, fontWeight: FontWeight.w700)),
          Text(subtitle,
              style: const TextStyle(color: AppColors.gray500, fontSize: 12)),
        ],
      ),
      actions: [
        _circleBtn(Icons.search,
            () => showToast(context, type: ToastType.info, title: 'Qidiruv', text: 'Global qidiruv oynasi tayyorlanmoqda.')),
        _bell(context),
        _profile(context),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _circleBtn(IconData icon, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(left: 6),
      child: InkResponse(
        onTap: onTap,
        radius: 24,
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.white,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Icon(icon, size: 18, color: AppColors.gray900),
        ),
      ),
    );
  }

  Widget _bell(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 6),
      child: InkResponse(
        radius: 24,
        onTap: () => showToast(context,
            type: ToastType.info, title: 'Notification Center', text: '4 ta yangi signal.'),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.white,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: const Icon(Icons.notifications_none, size: 18, color: AppColors.gray900),
            ),
            Positioned(
              top: -2,
              right: -2,
              child: Container(
                width: 18,
                height: 18,
                alignment: Alignment.center,
                decoration: const BoxDecoration(color: AppColors.statRed, shape: BoxShape.circle),
                child: const Text('4',
                    style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _profile(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 6),
      child: PopupMenuButton<String>(
        tooltip: 'Profil',
        offset: const Offset(0, 48),
        color: AppColors.white,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.r(AppRadius.lg),
          side: const BorderSide(color: AppColors.borderSubtle),
        ),
        onSelected: (v) {
          switch (v) {
            case 'profile':
              navigateTo(context, '/portal/profile', currentPath: currentPath);
              break;
            case 'settings':
              navigateTo(context, '/settings/account', currentPath: currentPath);
              break;
            case 'theme':
              showToast(context, type: ToastType.info, title: 'Dark mode', text: 'Mavzu sozlamasi tez orada.');
              break;
            case 'logout':
              showToast(context, type: ToastType.success, title: 'Chiqish', text: 'Sessiya yopildi.');
              break;
          }
        },
        itemBuilder: (_) => [
          _menu('profile', Icons.account_circle_outlined, 'Profil'),
          _menu('settings', Icons.settings_outlined, 'Sozlamalar'),
          _menu('theme', Icons.dark_mode_outlined, 'Dark mode'),
          _menu('logout', Icons.logout, 'Chiqish'),
        ],
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.white,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: const Icon(Icons.account_circle_outlined, size: 20, color: AppColors.gray900),
        ),
      ),
    );
  }

  PopupMenuItem<String> _menu(String value, IconData icon, String label) {
    return PopupMenuItem<String>(
      value: value,
      height: 40,
      child: Row(children: [
        Icon(icon, size: 16, color: AppColors.gray800),
        const SizedBox(width: 8),
        Text(label,
            style: const TextStyle(
                color: AppColors.gray800, fontWeight: FontWeight.w700, fontSize: 14)),
      ]),
    );
  }
}

class _Drawer extends StatelessWidget {
  final String currentPath;
  const _Drawer({required this.currentPath});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.white,
      width: 268,
      shape: const Border(right: BorderSide(color: AppColors.borderSubtle)),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(14, 20, 14, 20),
          children: [
            // Brand
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 0, 8, 24),
              child: Row(children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: const BoxDecoration(color: AppColors.gray900, shape: BoxShape.circle),
                  child: const Icon(Icons.balance, size: 18, color: AppColors.white),
                ),
                const SizedBox(width: 10),
                const Text('SmartCourt AI',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              ]),
            ),
            for (final group in groupedNav) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 5),
                child: Text(group.label.toUpperCase(),
                    style: const TextStyle(
                        color: AppColors.gray400,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.3)),
              ),
              for (final item in group.items) _link(context, item),
              const SizedBox(height: 10),
            ],
          ],
        ),
      ),
    );
  }

  Widget _link(BuildContext context, NavItem item) {
    final active = currentPath == item.to;
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Material(
        color: active ? AppColors.white : Colors.transparent,
        borderRadius: AppRadius.r(AppRadius.md),
        child: InkWell(
          borderRadius: AppRadius.r(AppRadius.md),
          onTap: () {
            Navigator.of(context).pop();
            navigateTo(context, item.to, currentPath: currentPath);
          },
          child: Container(
            height: 42,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              borderRadius: AppRadius.r(AppRadius.md),
              border: active ? Border.all(color: AppColors.borderSubtle) : null,
            ),
            child: Row(
              children: [
                Icon(item.icon,
                    size: 18, color: active ? AppColors.gray900 : AppColors.gray600),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(item.label,
                      style: TextStyle(
                          color: active ? AppColors.gray900 : AppColors.gray600,
                          fontSize: 14,
                          fontWeight: FontWeight.w600)),
                ),
                if (item.badge != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                        color: AppColors.gray100, borderRadius: AppRadius.r(AppRadius.full)),
                    child: Text(item.badge!,
                        style: const TextStyle(
                            color: AppColors.gray800, fontSize: 12, fontWeight: FontWeight.w600)),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BottomNav extends StatelessWidget {
  final String currentPath;
  const _BottomNav({required this.currentPath});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
        padding: const EdgeInsets.all(7),
        decoration: BoxDecoration(
          color: AppColors.white,
          border: Border.all(color: AppColors.borderSubtle),
          borderRadius: AppRadius.r(AppRadius.xl),
          boxShadow: AppShadow.lg,
        ),
        child: Row(
          children: [
            for (final item in bottomNav) Expanded(child: _tab(context, item)),
          ],
        ),
      ),
    );
  }

  Widget _tab(BuildContext context, NavItem item) {
    final active = currentPath == item.to;
    return Material(
      color: active ? AppColors.gray900 : Colors.transparent,
      borderRadius: AppRadius.r(AppRadius.md),
      child: InkWell(
        borderRadius: AppRadius.r(AppRadius.md),
        onTap: () => navigateTo(context, item.to, currentPath: currentPath),
        child: Container(
          height: 50,
          alignment: Alignment.center,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(item.icon,
                  size: 18, color: active ? AppColors.white : AppColors.gray500),
              const SizedBox(height: 3),
              Text(item.label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                      color: active ? AppColors.white : AppColors.gray500,
                      fontSize: 11,
                      fontWeight: FontWeight.w700)),
            ],
          ),
        ),
      ),
    );
  }
}
