import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';

class StudyAiSuperAdminApp extends StatelessWidget {
  const StudyAiSuperAdminApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'STUDYAI Enterprise Super Admin Console',
      theme: StudyAiTheme.darkTheme,
      home: const SuperAdminPortalShell(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class SuperAdminPortalShell extends StatefulWidget {
  const SuperAdminPortalShell({Key? key}) : super(key: key);

  @override
  State<SuperAdminPortalShell> createState() => _SuperAdminPortalShellState();
}

class _SuperAdminPortalShellState extends State<SuperAdminPortalShell> {
  int _selectedIndex = 0;

  final List<Map<String, dynamic>> _sections = [
    {'title': 'Platform Overview', 'icon': Icons.public_rounded},
    {'title': 'Tenant & Admin Accounts', 'icon': Icons.apartment_rounded},
    {'title': 'Roles & RBAC Matrix', 'icon': Icons.admin_panel_settings_rounded},
    {'title': 'Platform Configuration', 'icon': Icons.tune_rounded},
    {'title': 'AI Provider Management', 'icon': Icons.memory_rounded},
    {'title': 'AI Cost & Token Analytics', 'icon': Icons.query_stats_rounded},
    {'title': 'System & Database Health', 'icon': Icons.monitor_heart_rounded},
    {'title': 'Feature Flags & Locks', 'icon': Icons.flag_rounded},
    {'title': 'Security & MFA Posture', 'icon': Icons.security_rounded},
    {'title': 'Enterprise Audit Logs', 'icon': Icons.history_toggle_off_rounded},
    {'title': 'Deployment & Edge Status', 'icon': Icons.cloud_done_rounded},
  ];

  @override
  Widget build(BuildContext context) {
    final activeSection = _sections[_selectedIndex];

    return Scaffold(
      body: Row(
        children: [
          // Elevated Operations Sidebar
          Container(
            width: 260,
            decoration: BoxDecoration(
              color: const Color(0xFF090D16),
              border: Border(right: BorderSide(color: Colors.white.withOpacity(0.08))),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Super Admin Brand
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [StudyAiColors.purpleAccent, StudyAiColors.primary]),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.shield_rounded, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('STUDYAI', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Colors.white, letterSpacing: 1.2)),
                          Text('SUPER ADMIN • ELEVATED', style: TextStyle(fontSize: 9, color: StudyAiColors.amberAccent, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                        ],
                      ),
                    ],
                  ),
                ),
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: StudyAiColors.redAccent.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: StudyAiColors.redAccent.withOpacity(0.3)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.lock, size: 12, color: StudyAiColors.redAccent),
                      SizedBox(width: 6),
                      Text('MFA Token Active (TOTP Verified)', style: TextStyle(fontSize: 10, color: StudyAiColors.redAccent, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                const Divider(color: Colors.white12, height: 1),
                // Sections
                Expanded(
                  child: ListView.builder(
                    itemCount: _sections.length,
                    itemBuilder: (ctx, i) {
                      final s = _sections[i];
                      final isSelected = (_selectedIndex == i);
                      return ListTile(
                        leading: Icon(s['icon'] as IconData, size: 18, color: isSelected ? StudyAiColors.primary : StudyAiColors.textMuted),
                        title: Text(s['title'] as String, style: TextStyle(fontSize: 13, fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500, color: isSelected ? Colors.white : Colors.white70)),
                        selected: isSelected,
                        selectedTileColor: StudyAiColors.primary.withOpacity(0.14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        onTap: () => setState(() => _selectedIndex = i),
                      );
                    },
                  ),
                ),
                // Deployment Indicator
                Container(
                  padding: const EdgeInsets.all(14),
                  margin: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withOpacity(0.06)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.public, size: 14, color: StudyAiColors.greenAccent),
                      SizedBox(width: 8),
                      Text('superadmin.studyai.com', style: TextStyle(fontSize: 11, color: StudyAiColors.textMuted)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Operations Body
          Expanded(
            child: Column(
              children: [
                // Top Brand Bar
                Container(
                  height: 65,
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A).withOpacity(0.8),
                    border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.08))),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Text(activeSection['title'] as String, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: StudyAiColors.greenAccent.withOpacity(0.18),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text('PRODUCTION CLUSTER ACTIVE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: StudyAiColors.greenAccent)),
                          ),
                        ],
                      ),
                      const Row(
                        children: [
                          Icon(Icons.vpn_key_rounded, size: 16, color: StudyAiColors.amberAccent),
                          SizedBox(width: 6),
                          Text('Superadmin Session #001', style: TextStyle(fontSize: 12, color: StudyAiColors.textMuted)),
                        ],
                      ),
                    ],
                  ),
                ),
                // Work Area
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(28),
                    child: _buildSectionContent(activeSection['title'] as String),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionContent(String title) {
    if (title == 'AI Provider Management' || title == 'AI Cost & Token Analytics') {
      return _buildAiProvidersSection();
    } else if (title == 'Feature Flags & Locks') {
      return _buildFeatureFlagsSection();
    } else if (title == 'Deployment & Edge Status') {
      return _buildDeploymentStatusSection();
    } else {
      return _buildOverviewSection();
    }
  }

  Widget _buildOverviewSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            _buildTile('Active Schools (Tenants)', '28', StudyAiColors.cyanAccent, Icons.apartment),
            const SizedBox(width: 16),
            _buildTile('Global Active Students', '14,820', StudyAiColors.greenAccent, Icons.groups),
            const SizedBox(width: 16),
            _buildTile('Platform Uptime', '99.98%', StudyAiColors.primary, Icons.cloud_done),
            const SizedBox(width: 16),
            _buildTile('Video Generation Policy', 'DISABLED', StudyAiColors.redAccent, Icons.block),
          ],
        ),
        const SizedBox(height: 24),
        StudyAiGlassCard(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Global Infrastructure & Database Heartbeat', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 12),
              const Text('PostgreSQL / Supabase connection pool active with zero degraded read replicas. Local Ollama Qwen 2.5 7B serving requests with p95 latency under 420ms.', style: TextStyle(fontSize: 13, color: StudyAiColors.textMuted, height: 1.5)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAiProvidersSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            _buildTile('Tokens Consumed (Nov 2026)', '28.4 M', StudyAiColors.purpleAccent, Icons.memory),
            const SizedBox(width: 16),
            _buildTile('Estimated Cloud AI Cost', '\$42.18', StudyAiColors.greenAccent, Icons.attach_money),
            const SizedBox(width: 16),
            _buildTile('Local Ollama Savings', '\$128.40', StudyAiColors.primary, Icons.savings),
          ],
        ),
        const SizedBox(height: 20),
        StudyAiGlassCard(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Connected AI Providers (Masked Credentials)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 8),
              const Text('Secret keys are strictly masked in client displays and never leaked.', style: TextStyle(fontSize: 12, color: StudyAiColors.textMuted)),
              const SizedBox(height: 16),
              DataTable(
                columns: const [
                  DataColumn(label: Text('Provider', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                  DataColumn(label: Text('Model', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                  DataColumn(label: Text('Key Fingerprint', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                  DataColumn(label: Text('Status', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                ],
                rows: const [
                  DataRow(cells: [
                    DataCell(Text('Ollama Local', style: TextStyle(color: Colors.white))),
                    DataCell(Text('qwen2.5:7b', style: TextStyle(color: StudyAiColors.textMuted))),
                    DataCell(Text('LOCAL_HOST_DAEMON', style: TextStyle(color: StudyAiColors.primary))),
                    DataCell(Text('ACTIVE', style: TextStyle(color: StudyAiColors.greenAccent, fontWeight: FontWeight.bold))),
                  ]),
                  DataRow(cells: [
                    DataCell(Text('Google Gemini', style: TextStyle(color: Colors.white))),
                    DataCell(Text('gemini-3.8-flash', style: TextStyle(color: StudyAiColors.textMuted))),
                    DataCell(Text('sk-proj-****************', style: TextStyle(color: StudyAiColors.textMuted))),
                    DataCell(Text('ACTIVE', style: TextStyle(color: StudyAiColors.greenAccent, fontWeight: FontWeight.bold))),
                  ]),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFeatureFlagsSection() {
    return StudyAiGlassCard(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Master Platform Feature Flags', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 8),
          const Text('Certain flags (such as Video Generation) are locked by master architecture policy and cannot be enabled by any role.', style: TextStyle(fontSize: 12, color: StudyAiColors.textMuted)),
          const SizedBox(height: 20),
          SwitchListTile(
            title: const Text('AI Video Generation', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            subtitle: const Text('Status: LOCKED DISABLED. Server enforces 403 FEATURE_DISABLED policy.', style: TextStyle(color: StudyAiColors.redAccent, fontSize: 12)),
            value: false,
            onChanged: null, // Disabled / Locked
            secondary: const Icon(Icons.block, color: StudyAiColors.redAccent),
          ),
          const Divider(color: Colors.white12),
          SwitchListTile(
            title: const Text('Super Admin Mandatory MFA', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            subtitle: const Text('Enforces 6-digit TOTP verification for all elevated administrative actions.', style: TextStyle(color: StudyAiColors.greenAccent, fontSize: 12)),
            value: true,
            onChanged: (val) {},
            secondary: const Icon(Icons.verified_user_rounded, color: StudyAiColors.greenAccent),
          ),
        ],
      ),
    );
  }

  Widget _buildDeploymentStatusSection() {
    return StudyAiGlassCard(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Independent Three-App Deployment Architecture', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 16),
          _buildDeployRow('Student Web / Mobile App', 'studyai.com', 'apps/student_app', 'Production Active'),
          const SizedBox(height: 12),
          _buildDeployRow('School Admin Portal', 'admin.studyai.com', 'apps/admin_portal', 'Production Active'),
          const SizedBox(height: 12),
          _buildDeployRow('Enterprise Super Admin Console', 'superadmin.studyai.com', 'apps/superadmin_portal', 'Isolated VPC Deployment'),
        ],
      ),
    );
  }

  Widget _buildDeployRow(String appName, String host, String path, String status) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.04), borderRadius: BorderRadius.circular(10)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(appName, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
              Text('$host • $path', style: const TextStyle(fontSize: 11, color: StudyAiColors.textMuted)),
            ],
          ),
          Text(status, style: const TextStyle(color: StudyAiColors.greenAccent, fontWeight: FontWeight.bold, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildTile(String title, String value, Color accent, IconData icon) {
    return Expanded(
      child: StudyAiGlassCard(
        padding: const EdgeInsets.all(18),
        borderColor: accent.withOpacity(0.4),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: accent.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: accent, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 11, color: StudyAiColors.textMuted, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: accent)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
