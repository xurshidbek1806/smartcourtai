import 'dart:convert';
import 'package:http/http.dart' as http;

/// Backend API manzili.
///  • Android emulyator:  http://10.0.2.2:8000  (host mashina = 10.0.2.2)
///  • iOS simulyator / web / desktop:  http://localhost:8000
///  • Haqiqiy telefon:  http://<kompyuter-LAN-IP>:8000
/// Kerak bo'lsa shu yerda o'zgartiring.
class ApiConfig {
  static const String baseUrl = 'http://10.0.2.2:8000';
  static String get api => '$baseUrl/api/v1';
}

/// Web `lib/api.js` ning Dart ekvivalenti — demo fuqaro avtologin bilan.
class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  final http.Client _http = http.Client();
  String? _token;
  Map<String, dynamic>? _user;

  // Demo fuqaro (web bilan bir xil seed).
  static const _citizen = {'email': 'fuqaro@smartcourt.uz', 'password': 'Demo1234!'};

  Map<String, String> _headers([Map<String, String>? extra]) => {
        if (_token != null) 'Authorization': 'Bearer $_token',
        ...?extra,
      };

  Future<dynamic> _request(
    String path, {
    String method = 'GET',
    Object? body,
    bool auth = false,
  }) async {
    final uri = Uri.parse('${ApiConfig.api}$path');
    final headers = <String, String>{
      'Accept': 'application/json',
      if (body != null) 'Content-Type': 'application/json',
      ..._headers(),
    };
    late http.Response res;
    final enc = body == null ? null : jsonEncode(body);
    switch (method) {
      case 'POST':
        res = await _http.post(uri, headers: headers, body: enc);
        break;
      case 'PATCH':
        res = await _http.patch(uri, headers: headers, body: enc);
        break;
      case 'DELETE':
        res = await _http.delete(uri, headers: headers);
        break;
      default:
        res = await _http.get(uri, headers: headers);
    }
    if (res.statusCode == 401) _token = null;
    if (res.statusCode < 200 || res.statusCode >= 300) {
      String detail = 'API ${res.statusCode}';
      try {
        detail = (jsonDecode(res.body)['detail'] ?? detail).toString();
      } catch (_) {}
      throw ApiException(detail);
    }
    if (res.statusCode == 204 || res.body.isEmpty) return null;
    return jsonDecode(utf8.decode(res.bodyBytes));
  }

  // ── Auth ──────────────────────────────────────────────
  Map<String, dynamic>? get user => _user;

  Future<Map<String, dynamic>?> login(String email, String password) async {
    final data = await _request('/auth/login',
        method: 'POST', body: {'email': email, 'password': password});
    _token = data['access_token'] as String?;
    _user = {
      'id': data['user_id'],
      'role': data['role'],
      'full_name': data['full_name'],
    };
    return _user;
  }

  /// Demo fuqaro JWT mavjudligini ta'minlaydi (web `ensureAuth('citizen')`).
  Future<Map<String, dynamic>?> ensureAuth() async {
    if (_token != null && _user?['role'] == 'citizen') return _user;
    try {
      return await login(_citizen['email']!, _citizen['password']!);
    } catch (_) {
      return null; // backend yo'q — sahifa baribir ko'rsatiladi
    }
  }

  void logout() {
    _token = null;
    _user = null;
  }

  // ── Dashboard / claims ────────────────────────────────
  Future<Map<String, dynamic>> getCitizenDashboard() async =>
      Map<String, dynamic>.from(await _request('/dashboard/citizen'));

  Future<List<dynamic>> listClaims() async =>
      List<dynamic>.from(await _request('/claims') ?? const []);

  Future<Map<String, dynamic>> getClaim(dynamic id) async =>
      Map<String, dynamic>.from(await _request('/claims/$id'));

  Future<Map<String, dynamic>> createClaim(Map<String, dynamic> payload) async =>
      Map<String, dynamic>.from(await _request('/claims', method: 'POST', body: payload));

  Future<void> submitClaim(dynamic id) =>
      _request('/claims/$id/submit', method: 'POST');

  Future<List<dynamic>> listClaimDocuments(dynamic id) async =>
      List<dynamic>.from(await _request('/documents/claim/$id') ?? const []);

  // ── AI ────────────────────────────────────────────────
  /// Auth-free MVP ClaimValidator.
  Future<Map<String, dynamic>> validateClaim(String text) async =>
      Map<String, dynamic>.from(
          await _request('/mvp/claim-validator', method: 'POST', body: {'text': text}));

  Future<Map<String, dynamic>> lexPredictor(Map<String, dynamic> payload) async =>
      Map<String, dynamic>.from(
          await _request('/ai/lex-predictor', method: 'POST', body: payload));

  /// AI yuridik maslahatchi — SSE token streaming (auth talab qiladi).
  Stream<String> streamAssistant(String message) async* {
    await ensureAuth();
    final req = http.Request('POST', Uri.parse('${ApiConfig.api}/ai/assistant/stream'))
      ..headers.addAll({
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        ..._headers(),
      })
      ..body = jsonEncode({'message': message, 'use_context': true});

    final res = await _http.send(req);
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException('HTTP ${res.statusCode}');
    }
    final lines = res.stream.transform(utf8.decoder).transform(const LineSplitter());
    await for (final line in lines) {
      if (!line.startsWith('data:')) continue;
      final data = line.substring(5).trim();
      if (data.isEmpty) continue;
      try {
        final ev = jsonDecode(data) as Map<String, dynamic>;
        if (ev['type'] == 'error') throw ApiException(ev['message']?.toString() ?? 'AI xatosi');
        if (ev['type'] == 'done') return;
        if (ev['content'] != null) yield ev['content'].toString();
      } catch (_) {
        // keep-alive yoki bo'sh frame — e'tiborsiz
      }
    }
  }
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override
  String toString() => message;
}

final api = ApiClient.instance;
