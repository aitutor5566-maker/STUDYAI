import fs from 'node:fs';
import path from 'node:path';
import { SCIENTIFIC_VECTOR_REGISTRY } from '../server/scientificVectorLibrary.ts';

const visualLearningDir = path.join(process.cwd(), 'visual_learning', 'assets');
const publicImagesDir = path.join(process.cwd(), 'public', 'images', 'educational');

// Remove old outdated files in visual_learning/assets
const oldFiles = [
  path.join(visualLearningDir, 'biology', 'human_heart_circulation.svg'),
  path.join(visualLearningDir, 'chemistry', 'water_molecule_geometry.svg'),
  path.join(visualLearningDir, 'history', 'wwi_causes_timeline.svg'),
  path.join(visualLearningDir, 'physics', 'principle_of_moments_lever.svg'),
  path.join(visualLearningDir, 'geography', 'volcano_anatomy_cross_section.svg'),
  path.join(visualLearningDir, 'mathematics', 'cone_volume_mensuration.svg')
];

for (const oldFile of oldFiles) {
  try {
    if (fs.existsSync(oldFile)) {
      fs.unlinkSync(oldFile);
      console.log('Deleted old image file:', oldFile);
    }
  } catch (err: any) {
    console.warn('Notice removing old file:', err?.message);
  }
}

fs.mkdirSync(publicImagesDir, { recursive: true });

interface ManifestItem {
  key: string;
  topic: string;
  subtopic: string;
  subject: string;
  visualType: string;
  title: string;
  caption: string;
  publicUrl: string;
  visualLearningPath: string;
  labelsCount: number;
  walkthrough: any;
}

const manifest: ManifestItem[] = [];

for (const [key, asset] of Object.entries(SCIENTIFIC_VECTOR_REGISTRY)) {
  const subjFolder = asset.subject.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const targetSubjDir = path.join(visualLearningDir, subjFolder);
  fs.mkdirSync(targetSubjDir, { recursive: true });

  const fileName = key + '.svg';
  const vlPath = path.join(targetSubjDir, fileName);
  const pubPath = path.join(publicImagesDir, fileName);

  fs.writeFileSync(vlPath, asset.svgXml, 'utf-8');
  fs.writeFileSync(pubPath, asset.svgXml, 'utf-8');

  manifest.push({
    key,
    topic: asset.topic,
    subtopic: asset.subtopic,
    subject: asset.subject,
    visualType: asset.visualType,
    title: asset.title,
    caption: asset.caption,
    publicUrl: '/images/educational/' + fileName,
    visualLearningPath: 'visual_learning/assets/' + subjFolder + '/' + fileName,
    labelsCount: asset.labels.length,
    walkthrough: asset.walkthrough
  });
  console.log('Exported updated image:', key, '->', fileName);
}

fs.writeFileSync(path.join(publicImagesDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
console.log('Successfully exported ' + manifest.length + ' updated educational vector images and manifest.json!');
