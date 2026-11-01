import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import '../state/student_app_state.dart';
import '../widgets/interactive_3d_dialog.dart';

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
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
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
            'Explore interactive 3D simulations, curriculum textbooks, scientific diagrams, and arcade learning games',
            style: TextStyle(fontSize: 13, color: StudyAiColors.textMuted),
          ),
          const SizedBox(height: 20),

          // Category Pills
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['All', '3D Science Models', 'Curriculum Textbooks', 'Games Arcade'].map((cat) {
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
          const SizedBox(height: 24),

          // 1. 3D Science Models Grid
          if (_selectedCategory == 'All' || _selectedCategory == '3D Science Models') ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('3D Science Simulations (Three.js)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                Text('${_models.length} models', style: const TextStyle(fontSize: 12, color: StudyAiColors.primary)),
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
            const Text('Three Adaptive Educational Games', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
            const SizedBox(height: 12),
            ...[
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
                              Row(
                                children: [
                                  Text(game['title'] as String, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
                                  const SizedBox(width: 8),
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
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Launching ${game['title']} adaptive game session!'),
                                backgroundColor: StudyAiColors.primary,
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: StudyAiColors.primary,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('Play', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
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
    );
  }
}
