import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';

class StudyAiAdminApp extends StatelessWidget {
  const StudyAiAdminApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'STUDYAI Educator & School Admin',
      theme: StudyAiTheme.darkTheme,
      home: const AdminPortalShell(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class AdminPortalShell extends StatefulWidget {
  final String userRole; // admin or accountant
  const AdminPortalShell({Key? key, this.userRole = 'admin'}) : super(key: key);

  @override
  State<AdminPortalShell> createState() => _AdminPortalShellState();
}

class _AdminPortalShellState extends State<AdminPortalShell> {
  int _selectedIndex = 0;
  String _searchFilter = '';

  // 16 Admin Modules
  final List<Map<String, dynamic>> _modules = [
    {'title': 'Overview Dashboard', 'icon': Icons.dashboard_rounded, 'roles': ['admin', 'accountant']},
    {'title': 'Student Roster', 'icon': Icons.school_rounded, 'roles': ['admin']},
    {'title': 'Parent Management', 'icon': Icons.family_restroom_rounded, 'roles': ['admin']},
    {'title': 'Curriculum & Topics', 'icon': Icons.auto_stories_rounded, 'roles': ['admin']},
    {'title': 'Content & Library', 'icon': Icons.menu_book_rounded, 'roles': ['admin']},
    {'title': 'AI Tutor Monitoring', 'icon': Icons.psychology_rounded, 'roles': ['admin']},
    {'title': 'AI Diagram Monitoring', 'icon': Icons.polyline_rounded, 'roles': ['admin']},
    {'title': 'Game Management', 'icon': Icons.sports_esports_rounded, 'roles': ['admin']},
    {'title': 'Weekly Examinations', 'icon': Icons.assignment_turned_in_rounded, 'roles': ['admin']},
    {'title': 'Points & Achievements', 'icon': Icons.emoji_events_rounded, 'roles': ['admin']},
    {'title': 'Progress Analytics', 'icon': Icons.insights_rounded, 'roles': ['admin']},
    {'title': 'Broadcast Notices', 'icon': Icons.campaign_rounded, 'roles': ['admin']},
    {'title': 'Tuition & Payments', 'icon': Icons.payments_rounded, 'roles': ['admin', 'accountant']},
    {'title': 'Accountant Tools', 'icon': Icons.account_balance_wallet_rounded, 'roles': ['accountant', 'admin']},
    {'title': 'Reports & Exports', 'icon': Icons.file_download_rounded, 'roles': ['admin', 'accountant']},
    {'title': 'School Audit Logs', 'icon': Icons.history_edu_rounded, 'roles': ['admin']},
  ];

  @override
  Widget build(BuildContext context) {
    final permittedModules = _modules.where((m) => (m['roles'] as List<String>).contains(widget.userRole)).toList();
    if (_selectedIndex >= permittedModules.length) _selectedIndex = 0;
    final currentModule = permittedModules[_selectedIndex];

    return Scaffold(
      body: Row(
        children: [
          // Navigation Rail
          Container(
            width: 250,
            decoration: BoxDecoration(
              color: StudyAiColors.surface,
              border: Border(right: BorderSide(color: Colors.white.withOpacity(0.08))),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Brand Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [StudyAiColors.primary, StudyAiColors.primaryDark]),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.admin_panel_settings_rounded, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('STUDYAI', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Colors.white, letterSpacing: 1.2)),
                          Text(widget.userRole.toUpperCase(), style: const TextStyle(fontSize: 10, color: StudyAiColors.primary, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                  ),
                ),
                const Divider(color: Colors.white12, height: 1),
                // Module Links
                Expanded(
                  child: ListView.builder(
                    itemCount: permittedModules.length,
                    itemBuilder: (ctx, i) {
                      final item = permittedModules[i];
                      final isSelected = (_selectedIndex == i);
                      return ListTile(
                        leading: Icon(item['icon'] as IconData, size: 18, color: isSelected ? StudyAiColors.primary : StudyAiColors.textMuted),
                        title: Text(item['title'] as String, style: TextStyle(fontSize: 13, fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500, color: isSelected ? Colors.white : Colors.white70)),
                        selected: isSelected,
                        selectedTileColor: StudyAiColors.primary.withOpacity(0.12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        onTap: () => setState(() => _selectedIndex = i),
                      );
                    },
                  ),
                ),
                // Tenant Info
                Container(
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.04),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('National Public School', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                      Text('Bengaluru • CBSE Affiliation', style: TextStyle(fontSize: 10, color: StudyAiColors.textMuted)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Main Work Area
          Expanded(
            child: Column(
              children: [
                // Top App Bar
                Container(
                  height: 65,
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  decoration: BoxDecoration(
                    color: StudyAiColors.surface.withOpacity(0.5),
                    border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.08))),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(currentModule['title'] as String, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
                      Row(
                        children: [
                          SizedBox(
                            width: 220,
                            height: 38,
                            child: TextField(
                              onChanged: (val) => setState(() => _searchFilter = val),
                              style: const TextStyle(color: Colors.white, fontSize: 13),
                              decoration: InputDecoration(
                                hintText: 'Search records...',
                                hintStyle: const TextStyle(color: StudyAiColors.textMuted, fontSize: 12),
                                prefixIcon: const Icon(Icons.search, size: 16, color: StudyAiColors.textMuted),
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.04),
                                contentPadding: EdgeInsets.zero,
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          IconButton(icon: const Icon(Icons.notifications_none_rounded, color: Colors.white70), onPressed: () {}),
                          const SizedBox(width: 8),
                          const CircleAvatar(radius: 16, backgroundColor: StudyAiColors.primary, child: Text('A', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold))),
                        ],
                      ),
                    ],
                  ),
                ),
                // Workspace Body
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(28),
                    child: _buildModuleContent(currentModule['title'] as String),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModuleContent(String title) {
    if (title == 'Tuition & Payments' || title == 'Accountant Tools') {
      return _buildFinanceSection();
    } else if (title == 'Student Roster') {
      return _buildStudentRoster();
    } else if (title == 'Weekly Examinations') {
      return _buildExaminationsSection();
    } else {
      return _buildDefaultDashboardOverview();
    }
  }

  Widget _buildDefaultDashboardOverview() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            _buildStatCard('Total Enrolled Students', '142', StudyAiColors.cyanAccent, Icons.school),
            const SizedBox(width: 16),
            _buildStatCard('Weekly Assessments Completed', '389', StudyAiColors.greenAccent, Icons.assignment_turned_in),
            const SizedBox(width: 16),
            _buildStatCard('Average Mastery Score', '87.4%', StudyAiColors.primary, Icons.auto_graph),
            const SizedBox(width: 16),
            _buildStatCard('AI Tutor Inquiries Today', '248', StudyAiColors.purpleAccent, Icons.psychology),
          ],
        ),
        const SizedBox(height: 24),
        StudyAiGlassCard(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Academic Performance & Examination Pulse', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 12),
              const Text('Class 10 CBSE Science Assessment 6 achieved 100% submission compliance across batch A and B.', style: TextStyle(fontSize: 13, color: StudyAiColors.textMuted)),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                icon: const Icon(Icons.file_download, size: 16),
                label: const Text('Export Batch Report'),
                onPressed: () {},
                style: ElevatedButton.styleFrom(backgroundColor: StudyAiColors.primary),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStudentRoster() {
    return StudyAiGlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Student Roster (Class 10 A & B)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 16),
          DataTable(
            columns: const [
              DataColumn(label: Text('Student Name', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
              DataColumn(label: Text('Grade', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
              DataColumn(label: Text('Streak', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
              DataColumn(label: Text('Mastery', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
              DataColumn(label: Text('Actions', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
            ],
            rows: [
              DataRow(cells: [
                const DataCell(Text('Vishwak Sai', style: TextStyle(color: Colors.white))),
                const DataCell(Text('Grade 10', style: TextStyle(color: StudyAiColors.textMuted))),
                const DataCell(Text('15 Days 🔥', style: TextStyle(color: StudyAiColors.primary))),
                const DataCell(Text('94.0%', style: TextStyle(color: StudyAiColors.greenAccent))),
                DataCell(TextButton(child: const Text('View Profile'), onPressed: () {})),
              ]),
              DataRow(cells: [
                const DataCell(Text('Bob Vance', style: TextStyle(color: Colors.white))),
                const DataCell(Text('Grade 10', style: TextStyle(color: StudyAiColors.textMuted))),
                const DataCell(Text('3 Days 🔥', style: TextStyle(color: StudyAiColors.primary))),
                const DataCell(Text('81.5%', style: TextStyle(color: StudyAiColors.cyanAccent))),
                DataCell(TextButton(child: const Text('View Profile'), onPressed: () {})),
              ]),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFinanceSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            _buildStatCard('Total Billed', '₹ 14,20,000', StudyAiColors.greenAccent, Icons.receipt_long),
            const SizedBox(width: 16),
            _buildStatCard('Collected Fees', '₹ 12,80,000', StudyAiColors.cyanAccent, Icons.account_balance),
            const SizedBox(width: 16),
            _buildStatCard('Pending Dues', '₹ 1,40,000', StudyAiColors.amberAccent, Icons.pending_actions),
            const SizedBox(width: 16),
            _buildStatCard('Collection Rate', '90.1%', StudyAiColors.primary, Icons.pie_chart),
          ],
        ),
      ],
    );
  }

  Widget _buildExaminationsSection() {
    return StudyAiGlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Weekly Examinations Overview', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ElevatedButton.icon(
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Create Examination'),
                onPressed: () {},
                style: ElevatedButton.styleFrom(backgroundColor: StudyAiColors.primary),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text('Assessment 6: Cellular Energy and Plant Respiration (Week 6) • 100% pass rate recorded.', style: TextStyle(color: StudyAiColors.textMuted)),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, Color accent, IconData icon) {
    return Expanded(
      child: StudyAiGlassCard(
        padding: const EdgeInsets.all(18),
        borderColor: accent.withOpacity(0.35),
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
