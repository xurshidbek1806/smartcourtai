import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../services/api.dart';
import '../services/toast.dart';
import '../theme/tokens.dart';
import '../widgets/role_shell.dart';
import '../widgets/ui.dart';

class _Msg {
  String text;
  final bool ai;
  _Msg(this.text, {this.ai = true});
}

class AiAssistantPage extends StatefulWidget {
  const AiAssistantPage({super.key});
  @override
  State<AiAssistantPage> createState() => _AiAssistantPageState();
}

class _AiAssistantPageState extends State<AiAssistantPage> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  bool streaming = false;
  String lastPrompt = '';
  final List<_Msg> messages = [
    _Msg("Assalomu alaykum. Qaysi huquqiy masalada yordam beray? Mehnat, oila, fuqarolik yoki jinoyat huquqi bo'yicha savol bering."),
  ];

  void _scrollDown() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  Future<void> _send([String? preset]) async {
    final prompt = (preset ?? _input.text).trim();
    if (prompt.isEmpty || streaming) return;
    setState(() {
      messages.add(_Msg(prompt, ai: false));
      _input.clear();
    });
    _scrollDown();
    await _stream(prompt);
  }

  Future<void> _stream(String prompt) async {
    lastPrompt = prompt;
    setState(() => streaming = true);
    final ai = _Msg('');
    setState(() => messages.add(ai));
    try {
      await for (final chunk in api.streamAssistant(prompt)) {
        if (!mounted) return;
        setState(() => ai.text += chunk);
        _scrollDown();
      }
      if (mounted) {
        showToast(context,
            type: ToastType.success, title: 'AI javob tayyor', text: 'Lokal Llama javob qaytardi.');
      }
    } catch (e) {
      if (mounted) {
        showToast(context, type: ToastType.error, title: 'AI xatosi', text: "Bog'lanib bo'lmadi.");
      }
    } finally {
      if (mounted) setState(() => streaming = false);
    }
  }

  void _newChat() {
    setState(() {
      messages
        ..clear()
        ..add(_Msg('Assalomu alaykum. Qaysi huquqiy masalada yordam beray?'));
      streaming = false;
    });
    showToast(context, type: ToastType.success, title: 'Yangi chat', text: 'Yangi suhbat boshlandi.');
  }

  @override
  Widget build(BuildContext context) {
    const suggestions = [
      'Mehnat nizoni qanday hal qilaman?',
      'Ajrim arizasini qaysi sudga beraman?',
      'Davlat boji qancha?',
    ];

    return RoleShell(
      title: 'AI Yuridik maslahatchi',
      subtitle: 'Claude-style huquqiy chat',
      currentPath: '/portal/ai-assistant',
      scrollable: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            BaseButton('Yangi chat', size: BtnSize.sm, onPressed: _newChat),
            const SizedBox(width: 8),
            const Expanded(child: Muted('Mehnat nizosi · Aliment · Shartnoma', size: 13)),
          ]),
          const SizedBox(height: 12),
          Expanded(
            child: ListView(
              controller: _scroll,
              children: [
                for (final m in messages) _bubble(m),
                if (streaming) _typing(),
              ],
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 38,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                for (final s in suggestions) ...[
                  _chip(s),
                  const SizedBox(width: 8),
                ],
              ],
            ),
          ),
          const SizedBox(height: 10),
          _composer(),
          const SizedBox(height: 4),
        ],
      ),
    );
  }

  Widget _bubble(_Msg m) {
    final isAi = m.ai;
    return Align(
      alignment: isAi ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 320),
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
        decoration: BoxDecoration(
          color: isAi ? AppColors.white : AppColors.gray100,
          border: isAi ? Border.all(color: AppColors.borderSubtle) : null,
          borderRadius: AppRadius.r(AppRadius.lg),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isAi) ...[
                  const Icon(Icons.auto_awesome, size: 18, color: AppColors.gray800),
                  const SizedBox(width: 10),
                ],
                Flexible(
                  child: Text(m.text,
                      style: const TextStyle(color: AppColors.gray800, height: 1.55, fontSize: 14)),
                ),
              ],
            ),
            if (isAi && m.text.isNotEmpty) ...[
              const SizedBox(height: 10),
              Row(mainAxisSize: MainAxisSize.min, children: [
                _msgAction(Icons.copy, 'Nusxa', () {
                  Clipboard.setData(ClipboardData(text: m.text));
                  showToast(context, type: ToastType.success, title: 'Nusxa olindi', text: 'AI javobi clipboardga.');
                }),
                const SizedBox(width: 7),
                _msgAction(Icons.refresh, 'Qayta', () => streaming ? null : _stream(lastPrompt)),
              ]),
            ],
          ],
        ),
      ),
    );
  }

  Widget _msgAction(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: AppRadius.r(AppRadius.full),
      child: Container(
        height: 30,
        padding: const EdgeInsets.symmetric(horizontal: 9),
        decoration: BoxDecoration(
          color: AppColors.white,
          border: Border.all(color: AppColors.borderSubtle),
          borderRadius: AppRadius.r(AppRadius.full),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 15, color: AppColors.gray600),
          const SizedBox(width: 6),
          Text(label,
              style: const TextStyle(color: AppColors.gray600, fontSize: 12, fontWeight: FontWeight.w700)),
        ]),
      ),
    );
  }

  Widget _typing() {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.white,
        border: Border.all(color: AppColors.borderSubtle),
        borderRadius: AppRadius.r(AppRadius.lg),
      ),
      child: const Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.auto_awesome, size: 18, color: AppColors.gray800),
        SizedBox(width: 12),
        SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.gray500)),
      ]),
    );
  }

  Widget _chip(String s) {
    return InkWell(
      onTap: () => _send(s),
      borderRadius: AppRadius.r(AppRadius.full),
      child: Container(
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: AppColors.white,
          border: Border.all(color: AppColors.borderSubtle),
          borderRadius: AppRadius.r(AppRadius.full),
        ),
        child: Text(s, style: const TextStyle(color: AppColors.gray900, fontSize: 13)),
      ),
    );
  }

  Widget _composer() {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.borderDefault),
        borderRadius: AppRadius.r(AppRadius.xl),
      ),
      child: Row(children: [
        IconButton(
          icon: const Icon(Icons.attach_file, size: 18, color: AppColors.gray700),
          onPressed: () => showToast(context,
              type: ToastType.info, title: 'Fayl', text: 'EvidenceAnalyzer sahifasidan foydalaning.'),
        ),
        Expanded(
          child: TextField(
            controller: _input,
            minLines: 1,
            maxLines: 4,
            textInputAction: TextInputAction.send,
            onSubmitted: (_) => _send(),
            style: const TextStyle(color: AppColors.gray900),
            decoration: const InputDecoration(
              isCollapsed: true,
              contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 8),
              border: InputBorder.none,
              hintText: 'Savolingizni yozing...',
              hintStyle: TextStyle(color: AppColors.gray400),
            ),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.mic_none, size: 18, color: AppColors.gray700),
          onPressed: () => showToast(context,
              type: ToastType.info, title: 'Ovozli savol', text: 'Jonli majlis modulida mavjud.'),
        ),
        IconButton(
          icon: const Icon(Icons.send, size: 18, color: AppColors.gray900),
          onPressed: () => _send(),
        ),
      ]),
    );
  }
}
