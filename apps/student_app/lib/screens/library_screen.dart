import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import '../state/student_app_state.dart';
import '../widgets/interactive_3d_dialog.dart';
import '../games/katana/katana_game_dialog.dart';

class LibraryScreen extends StatefulWidget {
  final StudentAppState state;

  const LibraryScreen({Key? key, required this.state}) : super(key: key);

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  String _selectedCategory = 'All';
  String _searchFilter = '';

  final List<Map<String, dynamic>> _models = [
    {'id': 'plant_cell', 'title': 'Plant Cell Micro-Structure', 'subject': 'Biology', 'parts': 5},
    {'id': 'solar_system', 'title': 'Solar System Orbital Dynamics', 'subject': 'Astronomy', 'parts': 9},
    {'id': 'atom_structure', 'title': 'Bohr Atomic Model (Carbon-12)', 'subject': 'Chemistry', 'parts': 4},
    {'id': 'human_heart', 'title': 'Human Heart & Double Circulation', 'subject': 'Biology', 'parts': 6},
    {'id': 'water_molecule', 'title': 'Water Dipole & Hydrogen Bonding', 'subject': 'Chemistry', 'parts': 3},
    {'id': 'volcano_cross_section', 'title': 'Volcanic Magma Chamber Cross-Section', 'subject': 'Earth Science', 'parts': 5},
  ];

  @override
  Widget build(BuildContext context) {
    return StudyAiResponsiveContainer(
      maxWidth: 1380,
      child: SingleChildScrollView(
        padding: StudyAiBreakpoints.pagePadding(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
          // Header
          const Text(
            'Visual Learning Library',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: StudyAiColors.textLight),
          ),
          const SizedBox(height: 4),
          const Text(
            'Explore verified curriculum textbooks, scientific diagrams, audio lessons, and arcade learning games',
            style: TextStyle(fontSize: 13, color: StudyAiColors.textMuted),
          ),
          const SizedBox(height: 20),

          // Category Pills
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['All', 'Weekly Examinations & Mock Tests', 'Scientific Diagrams & Visuals', 'Curriculum Textbooks', 'Games Arcade'].map((cat) {
                final isSelected = (_selectedCategory == cat);
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: StudyAiGlassPill(
                    label: cat,
                    isSelected: isSelected,
                    onTap: () {
                      setState(() {
                        _selectedCategory = cat;
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 20),

          // Top Feature Banner: WEEKLY EXAMINATIONS & MOCK TESTS
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: StudyAiColors.primary.withOpacity(0.5), width: 1.5),
              boxShadow: [
                BoxShadow(color: StudyAiColors.primary.withOpacity(0.18), blurRadius: 20, offset: const Offset(0, 6)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [StudyAiColors.primary, StudyAiColors.primaryDark]),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.assignment_turned_in_rounded, size: 14, color: Colors.white),
                          SizedBox(width: 6),
                          Text('CENTRAL ASSESSMENT HUB', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.5)),
                        ],
                      ),
                    ),
                    const Text('Official Board & AI Adaptive', style: TextStyle(fontSize: 11, color: StudyAiColors.textMuted)),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'WEEKLY EXAMINATIONS & MOCK TESTS',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 0.3),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Simulated board exams with timers, question ribbons, auto-save, and diagnostics. Choose admin scheduled tests or AI 40-mark practice tests (Objective, Mixed, Descriptive).',
                  style: TextStyle(fontSize: 12, color: Colors.white70, height: 1.5),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() => _selectedCategory = 'Weekly Examinations & Mock Tests');
                      },
                      icon: const Icon(Icons.rocket_launch_rounded, size: 16),
                      label: const Text('Browse Weekly Exams', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: StudyAiColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    OutlinedButton.icon(
                      onPressed: () {
                        setState(() => _selectedCategory = 'Weekly Examinations & Mock Tests');
                      },
                      icon: const Icon(Icons.tune_rounded, size: 16, color: StudyAiColors.cyanAccent),
                      label: const Text('Generate 40M Test', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Colors.white)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: StudyAiColors.cyanAccent),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // 0. WEEKLY EXAMINATIONS & MOCK TESTS SECTION
          if (_selectedCategory == 'All' || _selectedCategory == 'Weekly Examinations & Mock Tests') ...[
            // SECTION A: Weekly Mock Examinations
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text('Section A — Weekly Mock Examinations', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
                Text('Admin Scheduled', style: TextStyle(fontSize: 12, color: StudyAiColors.primary, fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 12),
            LayoutBuilder(
              builder: (ctx, constraints) {
                final isWide = constraints.maxWidth >= 700;
                return Wrap(
                  spacing: 14,
                  runSpacing: 14,
                  children: [
                    {
                      'title': 'Grade 10 Science Weekly Assessment #4',
                      'subject': 'Science',
                      'duration': '90 mins',
                      'marks': '80 Marks',
                      'status': 'Published',
                      'date': 'Weekly • Active Now',
                    },
                    {
                      'title': 'Mathematics Quadratic & Trigonometry Mock Exam',
                      'subject': 'Mathematics',
                      'duration': '60 mins',
                      'marks': '40 Marks',
                      'status': 'Published',
                      'date': 'Scheduled • Closes Sunday',
                    },
                    {
                      'title': 'CBSE Target Biology Mock Examination',
                      'subject': 'Biology',
                      'duration': '120 mins',
                      'marks': '70 Marks',
                      'status': 'Scheduled',
                      'date': 'Starts Friday 10:00 AM',
                    },
                  ].map((exam) {
                    return Container(
                      width: isWide ? (constraints.maxWidth - 14) / 2 : constraints.maxWidth,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white.withOpacity(0.1)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: StudyAiColors.primary.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(exam['subject']!, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: StudyAiColors.primary)),
                              ),
                              Text(exam['marks']!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: StudyAiColors.cyanAccent)),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(exam['title']!, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                          const SizedBox(height: 6),
                          Text('Duration: ${exam['duration']} • ${exam['date']}', style: const TextStyle(fontSize: 11, color: StudyAiColors.textMuted)),
                          const SizedBox(height: 14),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              ElevatedButton(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Starting attempt for "${exam['title']}"...'), backgroundColor: StudyAiColors.primary),
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: StudyAiColors.primary,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                child: const Text('Attempt Mock Exam', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                );
              },
            ),
            const SizedBox(height: 24),

            // SECTION B: Topic-Based Practice Tests (Default 40 Marks)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text('Section B — Topic-Based Practice Tests (40 Marks)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
                Text('3 Blueprint Options', style: TextStyle(fontSize: 12, color: Color(0xFF38BDF8), fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 12),
            StudyAiGlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Customize & Generate Strict 40-Mark Examination Blueprint', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                  const SizedBox(height: 6),
                  const Text('Select subject, topic, and exam composition. Marks strictly total 40.0 marks.', style: TextStyle(fontSize: 12, color: StudyAiColors.textMuted)),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      {
                        'option': 'Option 1: Objective Only',
                        'desc': '40 marks total: 40 questions × 1 mark each. MCQs, fill-ins, assertion-reason.',
                        'badge': '100% Objective',
                        'color': StudyAiColors.greenAccent,
                      },
                      {
                        'option': 'Option 2: Mixed (Objective + Descriptive)',
                        'desc': 'Default: 20M Objective + 20M Descriptive (or 25+15, 15+25, 10+30). Perfectly sums to 40M.',
                        'badge': 'Recommended (20+20)',
                        'color': StudyAiColors.primary,
                      },
                      {
                        'option': 'Option 3: Descriptive Only',
                        'desc': '40 marks total: Short answers (2M/3M), long answers (5M), diagram & numerical problems.',
                        'badge': '100% Subjective',
                        'color': StudyAiColors.cyanAccent,
                      },
                    ].map((opt) {
                      return Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.04),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: (opt['color'] as Color).withOpacity(0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(opt['option'] as String, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Colors.white)),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(color: (opt['color'] as Color).withOpacity(0.2), borderRadius: BorderRadius.circular(4)),
                                  child: Text(opt['badge'] as String, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: opt['color'] as Color)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(opt['desc'] as String, style: const TextStyle(fontSize: 11, color: StudyAiColors.textMuted, height: 1.4)),
                            const SizedBox(height: 10),
                            Align(
                              alignment: Alignment.centerRight,
                              child: ElevatedButton(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('Generating 40-Mark Test with ${opt['option']}...'),
                                      backgroundColor: StudyAiColors.primary,
                                    ),
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: opt['color'] as Color,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                child: const Text('Generate 40M Test', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],

          // 1. Scientific Visuals & Diagrams Grid
          if (_selectedCategory == 'All' || _selectedCategory == 'Scientific Diagrams & Visuals') ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Curriculum Scientific Visuals', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                Text('${_models.length} visuals', style: const TextStyle(fontSize: 12, color: StudyAiColors.primary)),
              ],
            ),
            const SizedBox(height: 12),
            LayoutBuilder(
              builder: (ctx, constraints) {
                final crossAxisCount = constraints.maxWidth >= 900 ? 3 : (constraints.maxWidth >= 600 ? 2 : 1);
                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _models.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: crossAxisCount,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.6,
                  ),
                  itemBuilder: (ctx, i) {
                    final m = _models[i];
                    return StudyAiGlassCard(
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: StudyAiColors.greenAccent.withOpacity(0.18),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  m['subject'] as String,
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: StudyAiColors.greenAccent),
                                ),
                              ),
                              const Icon(Icons.view_in_ar_rounded, size: 20, color: StudyAiColors.primary),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            m['title'] as String,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${m['parts']} interactive sub-layers with exploded anatomy',
                            style: const TextStyle(fontSize: 11, color: StudyAiColors.textMuted),
                          ),
                          const Spacer(),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Interactive3DDialog.show(context, modelTitle: m['id'] as String);
                              },
                              icon: const Icon(Icons.play_arrow_rounded, size: 16),
                              label: const Text('Launch 3D Lab', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: StudyAiColors.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
            const SizedBox(height: 28),
          ],

          // 2. Games Arcade Section (Three Adaptive Educational Games)
          if (_selectedCategory == 'All' || _selectedCategory == 'Games Arcade') ...[
            const Text('Adaptive Educational Games', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
            const SizedBox(height: 12),
            ...[
              {
                'id': 'katana_shadow_warriors',
                'title': 'KATANA: SHADOW WARRIORS — THE WISDOM BATTLE',
                'genre': 'Cinematic 2.5D Fantasy Action-Adventure',
                'desc': 'Unleash katana strikes charged with academic wisdom. Journey across Moonlit Bamboo Forest, charge your spirit gauge, and defeat shadow warlords through curriculum mastery.',
                'icon': Icons.sports_martial_arts_rounded,
                'color': StudyAiColors.primary,
                'isFlagship': true,
              },
              {
                'id': 'answer_battle',
                'title': 'Concept Duel: Knowledge Arena',
                'genre': 'Fighting-Style Progression',
                'desc': 'Round-based knowledge combat where correct answers unleash non-graphic energy strikes, shields and combos against adaptive opponents.',
                'icon': Icons.sports_mma_rounded,
                'color': StudyAiColors.redAccent,
              },
              {
                'id': 'space_shooter',
                'title': 'Space Answer Shooter 3D (Astro Interceptor)',
                'genre': 'Shooting-Style Educational Arcade',
                'desc': 'Pilot a scientific research probe through asteroid belts, targeting correct answer nodes and evading misconception space debris.',
                'icon': Icons.rocket_launch_rounded,
                'color': StudyAiColors.primary,
              },
              {
                'id': 'learning_runner',
                'title': 'Concept Path Runner & Logic Grid',
                'genre': 'Adaptive Preference Runner',
                'desc': 'Customizable adaptive runner supporting visual diagram matching, speed recall, or logic pathways configured to your personal learning style.',
                'icon': Icons.directions_run_rounded,
                'color': StudyAiColors.cyanAccent,
              },
            ].map((game) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: StudyAiGlassCard(
                    padding: const EdgeInsets.all(18),
                    child: Row(
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: (game['color'] as Color).withOpacity(0.18),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: (game['color'] as Color).withOpacity(0.4)),
                          ),
                          child: Icon(game['icon'] as IconData, color: game['color'] as Color, size: 26),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Wrap(
                                spacing: 8,
                                runSpacing: 4,
                                crossAxisAlignment: WrapCrossAlignment.center,
                                children: [
                                  Text(game['title'] as String, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.08),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(game['genre'] as String, style: const TextStyle(fontSize: 9, color: StudyAiColors.textMuted, fontWeight: FontWeight.w600)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                game['desc'] as String,
                                style: const TextStyle(fontSize: 11, color: StudyAiColors.textMuted, height: 1.4),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 14),
                        ElevatedButton(
                          onPressed: () {
                            if (game['id'] == 'katana_shadow_warriors') {
                              KatanaGameDialog.show(
                                context,
                                apiClient: widget.state.apiClient,
                                topic: widget.state.activeTopic,
                                subject: widget.state.activeSubject,
                                mode: 'campaign',
                                stageIndex: 1,
                              );
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Launching ${game['title']} adaptive game session!'),
                                  backgroundColor: StudyAiColors.primary,
                                ),
                              );
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: StudyAiColors.primary,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: Text(game['id'] == 'katana_shadow_warriors' ? 'Enter Katana' : 'Play', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                        ),
                      ],
                    ),
                  ),
                )),
            const SizedBox(height: 16),
          ],

          // 3. Curriculum Resources
          if (_selectedCategory == 'All' || _selectedCategory == 'Curriculum Textbooks') ...[
            const Text('Curriculum Textbooks & Source Material', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
            const SizedBox(height: 12),
            StudyAiGlassCard(
              padding: const EdgeInsets.all(18),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: StudyAiColors.cyanAccent.withOpacity(0.18),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.picture_as_pdf_rounded, color: StudyAiColors.cyanAccent, size: 24),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('NCERT Grade 10 Science Chapter 6 — Life Processes', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white)),
                        SizedBox(height: 2),
                        Text('PDF • 1.4 MB • CBSE Official Standard Edition', style: TextStyle(fontSize: 11, color: StudyAiColors.textMuted)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.download_rounded, color: StudyAiColors.primary),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Downloading NCERT Chapter 6 Reference PDF...'), backgroundColor: StudyAiColors.surface),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 40),
        ],
      ),
    ),
  );
}
}
