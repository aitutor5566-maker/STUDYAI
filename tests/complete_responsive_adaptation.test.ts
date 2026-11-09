import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('STUDYAI Complete Responsive UI/UX Adaptation For All Devices', () => {
  const rootDir = process.cwd();

  it('1. Reusable Flutter Responsive System: StudyAiBreakpoints & ResponsiveBuilder', () => {
    const responsiveDartPath = path.join(rootDir, 'packages', 'shared_ui', 'lib', 'src', 'responsive.dart');
    assert.ok(fs.existsSync(responsiveDartPath), 'packages/shared_ui/lib/src/responsive.dart must exist');
    const content = fs.readFileSync(responsiveDartPath, 'utf8');

    // Verify 5-tier canonical breakpoints
    assert.ok(content.includes('static const double compactMobile = 360.0'), 'compactMobile breakpoint (<360px) must be defined');
    assert.ok(content.includes('static const double mobile = 600.0'), 'mobile breakpoint (360-599px) must be defined');
    assert.ok(content.includes('static const double tablet = 1024.0'), 'tablet breakpoint (600-1023px) must be defined');
    assert.ok(content.includes('static const double desktop = 1440.0'), 'desktop breakpoint (1024-1439px) must be defined');
    assert.ok(content.includes('class ResponsiveBuilder'), 'ResponsiveBuilder widget must be implemented');
    assert.ok(content.includes('class StudyAiResponsiveContainer'), 'StudyAiResponsiveContainer must be implemented');
    assert.ok(content.includes('pagePadding'), 'Adaptive pagePadding helper must be provided');
  });

  it('2. Flutter MainShell: Adaptive Navigation for Phones, Tablets, and Desktops', () => {
    const mainShellPath = path.join(rootDir, 'apps', 'student_app', 'lib', 'screens', 'main_shell.dart');
    assert.ok(fs.existsSync(mainShellPath), 'main_shell.dart must exist');
    const content = fs.readFileSync(mainShellPath, 'utf8');

    assert.ok(content.includes('StudyAiBreakpoints.tablet'), 'MainShell must use StudyAiBreakpoints.tablet');
    assert.ok(content.includes('StudyAiBreakpoints.mobile'), 'MainShell must use StudyAiBreakpoints.mobile');
    assert.ok(content.includes('SafeArea('), 'Floating bottom nav must be wrapped in SafeArea for iOS/Android home indicators');
    assert.ok(content.includes('_buildSideNav(context, isCompact: isTablet)'), 'Tablets must receive compact side navigation rail');
    assert.ok(content.includes('isCompactMobile'), 'Compact mobile (<360px) must be specifically detected and adapted');
  });

  it('3. Flutter Screens: Home, Notes, Tutor, Library, Profile use Responsive Containers', () => {
    const screens = [
      'apps/student_app/lib/screens/home_screen.dart',
      'apps/student_app/lib/screens/notes_screen.dart',
      'apps/student_app/lib/screens/tutor_screen.dart',
      'apps/student_app/lib/screens/library_screen.dart',
      'apps/student_app/lib/screens/profile_screen.dart'
    ];

    for (const screenRel of screens) {
      const fullPath = path.join(rootDir, screenRel);
      assert.ok(fs.existsSync(fullPath), `${screenRel} must exist`);
      const code = fs.readFileSync(fullPath, 'utf8');
      assert.ok(
        code.includes('StudyAiResponsiveContainer') || code.includes('StudyAiBreakpoints'),
        `${screenRel} must utilize StudyAiResponsiveContainer or StudyAiBreakpoints for adaptive width constraints`
      );
    }
  });

  it('4. Web CSS: Full 5-Tier Breakpoint Architecture in apple-glass.css', () => {
    const cssPath = path.join(rootDir, 'src', 'styles', 'apple-glass.css');
    assert.ok(fs.existsSync(cssPath), 'apple-glass.css must exist');
    const css = fs.readFileSync(cssPath, 'utf8');

    // 1. Large desktop
    assert.ok(css.includes('@media (min-width: 1440px)'), 'Large desktop breakpoint (1440px+) query must exist');
    // 2. Desktop
    assert.ok(css.includes('@media (min-width: 1024px) and (max-width: 1439px)'), 'Desktop (1024-1439px) query must exist');
    // 3. Tablet
    assert.ok(css.includes('@media (min-width: 600px) and (max-width: 1023px)'), 'Tablet (600-1023px) query must exist');
    // 4. Mobile
    assert.ok(css.includes('@media (min-width: 360px) and (max-width: 599px)'), 'Mobile (360-599px) query must exist');
    // 5. Compact mobile
    assert.ok(css.includes('@media (max-width: 359px)'), 'Compact mobile (<360px) query must exist');

    // Orientation
    assert.ok(css.includes('orientation: landscape'), 'Mobile landscape orientation optimization must exist');
    // Safe areas
    assert.ok(css.includes('env(safe-area-inset-bottom'), 'Safe area inset support must exist');
  });

  it('5. Responsive Layout Classes: Tables, Diagrams, 3D Studio, Search, Forms', () => {
    const cssPath = path.join(rootDir, 'src', 'styles', 'apple-glass.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.ok(css.includes('.table-responsive-wrapper'), '.table-responsive-wrapper class must exist for smooth horizontal scrolling');
    assert.ok(css.includes('.diagram-responsive-frame'), '.diagram-responsive-frame must exist for proportional SVG/image scaling');
    assert.ok(css.includes('.diagrams-3d-layout'), '.diagrams-3d-layout must adapt 3D catalog on desktop and mobile');
    assert.ok(css.includes('.library-search-bar'), '.library-search-bar must stack on mobile and span on desktop');
    assert.ok(css.includes('.responsive-student-form'), '.responsive-student-form must prevent 4-column squashing on mobile');
    assert.ok(css.includes('.top-brand-bar-header'), '.top-brand-bar-header must adapt header padding and border radius across devices');
  });

  it('6. Mobile Touch Targets & Accessibility: Floating Navigation is minimum 44px', () => {
    const cssPath = path.join(rootDir, 'src', 'styles', 'apple-glass.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    // Ensure buttons have at least 44px touch targets on mobile
    assert.ok(css.includes('min-height: 48px') || css.includes('min-height: 44px'), 'Mobile touch targets must be at least 44px');
  });

  it('7. Orange-and-White Design Identity Integrity Preserved Across All Devices', () => {
    const cssPath = path.join(rootDir, 'src', 'styles', 'apple-glass.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.ok(css.includes('--brand-orange: #FF6A00'), 'Brand orange #FF6A00 must be preserved');
    assert.ok(css.includes('--bg-primary: #FFFFFF'), 'Brand white #FFFFFF must be preserved');
    assert.ok(css.includes('--soft-orange: #FFF3E8'), 'Soft orange #FFF3E8 must be preserved');
  });
});
