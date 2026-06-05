import 'package:flutter/material.dart';

import '../theme/tokens.dart';

// ── BaseButton (web BaseButton.vue) ─────────────────────────
enum BtnVariant { primary, secondary, ghost, destructive }

enum BtnSize { sm, md, lg, xl }

class BaseButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final BtnVariant variant;
  final BtnSize size;
  final IconData? icon;
  final bool iconRight;
  final bool loading;
  final bool disabled;
  final bool expand;

  const BaseButton(
    this.label, {
    super.key,
    this.onPressed,
    this.variant = BtnVariant.primary,
    this.size = BtnSize.md,
    this.icon,
    this.iconRight = false,
    this.loading = false,
    this.disabled = false,
    this.expand = false,
  });

  @override
  Widget build(BuildContext context) {
    final h = switch (size) {
      BtnSize.sm => 34.0,
      BtnSize.md => 42.0,
      BtnSize.lg => 50.0,
      BtnSize.xl => 58.0,
    };
    final fs = switch (size) {
      BtnSize.sm => 13.0,
      BtnSize.md => 14.0,
      BtnSize.lg => 15.0,
      BtnSize.xl => 17.0,
    };
    final padH = switch (size) {
      BtnSize.sm => 14.0,
      BtnSize.md => 18.0,
      BtnSize.lg => 24.0,
      BtnSize.xl => 30.0,
    };

    Color bg;
    Color fg;
    Border? border;
    switch (variant) {
      case BtnVariant.primary:
        bg = AppColors.gray900;
        fg = AppColors.white;
        break;
      case BtnVariant.secondary:
        bg = AppColors.white;
        fg = AppColors.gray900;
        border = Border.all(color: AppColors.borderDefault);
        break;
      case BtnVariant.ghost:
        bg = Colors.transparent;
        fg = AppColors.gray800;
        break;
      case BtnVariant.destructive:
        bg = AppColors.white;
        fg = AppColors.gray900;
        border = Border.all(color: AppColors.borderDefault);
        break;
    }

    final enabled = !loading && !disabled && onPressed != null;
    final iconWidget = loading
        ? SizedBox(
            width: fs + 2,
            height: fs + 2,
            child: CircularProgressIndicator(strokeWidth: 2, color: fg),
          )
        : (icon != null ? Icon(icon, size: 18, color: fg) : null);

    final children = <Widget>[
      if (iconWidget != null && !iconRight) iconWidget,
      Flexible(
        child: Text(
          label,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
              color: fg, fontSize: fs, fontWeight: FontWeight.w600, letterSpacing: 0),
        ),
      ),
      if (iconWidget != null && iconRight) iconWidget,
    ];

    return Opacity(
      opacity: loading || disabled ? 0.7 : 1,
      child: Material(
        color: bg,
        borderRadius: AppRadius.r(AppRadius.full),
        child: InkWell(
          borderRadius: AppRadius.r(AppRadius.full),
          onTap: enabled ? onPressed : null,
          child: Container(
            height: h,
            width: expand ? double.infinity : null,
            padding: EdgeInsets.symmetric(horizontal: padH),
            decoration: BoxDecoration(
              borderRadius: AppRadius.r(AppRadius.full),
              border: border,
            ),
            child: Row(
              mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                for (var i = 0; i < children.length; i++) ...[
                  if (i > 0) const SizedBox(width: 8),
                  children[i],
                ]
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── BaseCard (web BaseCard.vue) ─────────────────────────────
enum CardVariant { outlined, filled, elevated }

class BaseCard extends StatelessWidget {
  final Widget child;
  final CardVariant variant;
  final bool interactive;
  final VoidCallback? onTap;
  final EdgeInsets padding;
  final Color? topAccent;

  const BaseCard({
    super.key,
    required this.child,
    this.variant = CardVariant.outlined,
    this.interactive = false,
    this.onTap,
    this.padding = const EdgeInsets.all(18),
    this.topAccent,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Border? border;
    List<BoxShadow>? shadow;
    switch (variant) {
      case CardVariant.outlined:
        bg = AppColors.white;
        border = Border.all(color: AppColors.borderSubtle);
        break;
      case CardVariant.filled:
        bg = AppColors.gray100;
        break;
      case CardVariant.elevated:
        bg = AppColors.white;
        border = Border.all(color: AppColors.borderSubtle);
        shadow = AppShadow.sm;
        break;
    }

    Widget content = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: AppRadius.r(AppRadius.lg),
        border: topAccent != null
            ? Border(top: BorderSide(color: topAccent!, width: 3))
            : border,
        boxShadow: shadow,
      ),
      child: child,
    );

    if (onTap != null) {
      content = InkWell(
        borderRadius: AppRadius.r(AppRadius.lg),
        onTap: onTap,
        child: content,
      );
    }
    return content;
  }
}

// ── BaseBadge (web BaseBadge.vue) ───────────────────────────
enum BadgeVariant { defaultDark, outline, filled }

class BaseBadge extends StatelessWidget {
  final String text;
  final BadgeVariant variant;
  const BaseBadge(this.text, {super.key, this.variant = BadgeVariant.defaultDark});

  @override
  Widget build(BuildContext context) {
    Color bg = Colors.transparent;
    Color fg = AppColors.gray800;
    Border? border;
    switch (variant) {
      case BadgeVariant.defaultDark:
        bg = AppColors.gray900;
        fg = AppColors.white;
        break;
      case BadgeVariant.outline:
        fg = AppColors.gray700;
        border = Border.all(color: AppColors.borderDefault);
        break;
      case BadgeVariant.filled:
        bg = AppColors.gray100;
        fg = AppColors.gray800;
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        border: border,
        borderRadius: AppRadius.r(AppRadius.full),
      ),
      child: Text(text,
          style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }
}

// ── BaseInput (web BaseInput.vue) ───────────────────────────
class BaseInput extends StatelessWidget {
  final String label;
  final TextEditingController? controller;
  final String? placeholder;
  final IconData? icon;
  final int maxLines;
  final TextInputType? keyboardType;
  final ValueChanged<String>? onChanged;

  const BaseInput({
    super.key,
    required this.label,
    this.controller,
    this.placeholder,
    this.icon,
    this.maxLines = 1,
    this.keyboardType,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                color: AppColors.gray700, fontSize: 13, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: AppColors.white,
            border: Border.all(color: AppColors.borderDefault),
            borderRadius: AppRadius.r(AppRadius.md),
          ),
          child: Row(
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18, color: AppColors.gray500),
                const SizedBox(width: 10),
              ],
              Expanded(
                child: TextField(
                  controller: controller,
                  onChanged: onChanged,
                  maxLines: maxLines,
                  keyboardType: keyboardType,
                  style: const TextStyle(color: AppColors.gray900, fontSize: 14),
                  decoration: InputDecoration(
                    isCollapsed: true,
                    contentPadding: EdgeInsets.symmetric(vertical: maxLines > 1 ? 14 : 13),
                    border: InputBorder.none,
                    hintText: placeholder,
                    hintStyle: const TextStyle(color: AppColors.gray400, fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Panel + helpers ─────────────────────────────────────────
class Panel extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  const Panel({super.key, required this.child, this.padding = const EdgeInsets.all(18)});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.white,
        border: Border.all(color: AppColors.borderSubtle),
        borderRadius: AppRadius.r(AppRadius.lg),
        boxShadow: AppShadow.sm,
      ),
      child: child,
    );
  }
}

class Eyebrow extends StatelessWidget {
  final String text;
  const Eyebrow(this.text, {super.key});
  @override
  Widget build(BuildContext context) => Text(
        text.toUpperCase(),
        style: const TextStyle(
            color: AppColors.gray500,
            fontSize: 12,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.4),
      );
}

class Muted extends StatelessWidget {
  final String text;
  final double size;
  const Muted(this.text, {super.key, this.size = 14});
  @override
  Widget build(BuildContext context) => Text(text,
      style: TextStyle(color: AppColors.gray500, fontSize: size, height: 1.5));
}

class H1 extends StatelessWidget {
  final String text;
  const H1(this.text, {super.key});
  @override
  Widget build(BuildContext context) => Text(text,
      style: const TextStyle(
          color: AppColors.gray900, fontSize: 30, fontWeight: FontWeight.w700, height: 1.05));
}

class H2 extends StatelessWidget {
  final String text;
  const H2(this.text, {super.key});
  @override
  Widget build(BuildContext context) => Text(text,
      style: const TextStyle(
          color: AppColors.gray900, fontSize: 20, fontWeight: FontWeight.w700));
}
