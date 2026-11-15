import {
  DifficultyLevel,
  SkyStrikerOption,
  SkyStrikerQuestion,
  SkyStrikerSubject
} from './types';

interface RawQuestion {
  id: string;
  subject: Exclude<SkyStrikerSubject, 'All Subjects'>;
  grade: number;
  topic: string;
  difficulty: DifficultyLevel;
  questionText: string;
  correct: string;
  distractors: [string, string];
  explanation: string;
  optionalHint?: string;
}

const RAW_QUESTIONS: RawQuestion[] = [
  // SCIENCE (12)
  {
    id: 'sci-1',
    subject: 'Science',
    grade: 6,
    topic: 'Solar System',
    difficulty: 'easy',
    questionText: 'Which planet is known as the Red Planet?',
    correct: 'Mars',
    distractors: ['Neptune', 'Jupiter'],
    explanation: 'Mars appears reddish because its surface is rich in iron oxide (rust).',
    optionalHint: 'It is the fourth planet from the Sun.'
  },
  {
    id: 'sci-2',
    subject: 'Science',
    grade: 7,
    topic: 'Photosynthesis',
    difficulty: 'easy',
    questionText: 'Which gas do green plants absorb from the air for photosynthesis?',
    correct: 'Carbon dioxide',
    distractors: ['Nitrogen', 'Argon'],
    explanation: 'Plants take in carbon dioxide through stomata and combine it with water using sunlight to make glucose.',
    optionalHint: 'Humans exhale this gas.'
  },
  {
    id: 'sci-3',
    subject: 'Science',
    grade: 8,
    topic: 'Photosynthesis',
    difficulty: 'medium',
    questionText: 'Which green pigment in chloroplasts captures light energy for photosynthesis?',
    correct: 'Chlorophyll',
    distractors: ['Hemoglobin', 'Melanin'],
    explanation: 'Chlorophyll absorbs red and blue wavelengths of sunlight and reflects green light.',
    optionalHint: 'It gives leaves their green color.'
  },
  {
    id: 'sci-4',
    subject: 'Science',
    grade: 9,
    topic: 'Mitosis',
    difficulty: 'medium',
    questionText: 'During which phase of mitosis do sister chromatids separate and move to opposite poles?',
    correct: 'Anaphase',
    distractors: ['Metaphase', 'Telophase'],
    explanation: 'In anaphase, spindle fibers shorten and pull sister chromatids apart toward opposite ends of the cell.',
    optionalHint: 'Think "A" for Apart.'
  },
  {
    id: 'sci-5',
    subject: 'Science',
    grade: 10,
    topic: 'Mitosis',
    difficulty: 'hard',
    questionText: 'How many genetically identical daughter cells are produced from one parent cell in mitosis?',
    correct: 'Two diploid cells',
    distractors: ['Four haploid cells', 'One tetraploid cell'],
    explanation: 'Mitosis produces two genetically identical diploid daughter cells for growth and tissue repair.',
    optionalHint: 'Meiosis makes four; mitosis makes half that.'
  },
  {
    id: 'sci-6',
    subject: 'Science',
    grade: 9,
    topic: 'Newtons Laws of Motion',
    difficulty: 'medium',
    questionText: "According to Newton's Second Law, force equals mass multiplied by what?",
    correct: 'Acceleration',
    distractors: ['Velocity', 'Momentum'],
    explanation: 'Newton’s Second Law states F = m × a, meaning net force equals mass times acceleration.',
    optionalHint: 'Measured in m/s².'
  },
  {
    id: 'sci-7',
    subject: 'Science',
    grade: 8,
    topic: 'Newtons Laws of Motion',
    difficulty: 'easy',
    questionText: "What property of matter resists changes in its state of motion (Newton's First Law)?",
    correct: 'Inertia',
    distractors: ['Friction', 'Density'],
    explanation: 'Inertia is the tendency of an object to stay at rest or keep moving at constant velocity unless acted on by a net force.',
    optionalHint: 'Greater mass means greater resistance to change.'
  },
  {
    id: 'sci-8',
    subject: 'Science',
    grade: 10,
    topic: 'Human Heart and Blood Circulation',
    difficulty: 'medium',
    questionText: 'Which chamber of the human heart pumps oxygenated blood into the aorta?',
    correct: 'Left ventricle',
    distractors: ['Right atrium', 'Right ventricle'],
    explanation: 'The thick muscular wall of the left ventricle pumps oxygen-rich blood through the aorta to the entire body.',
    optionalHint: 'It is the strongest lower chamber on the left side.'
  },
  {
    id: 'sci-9',
    subject: 'Science',
    grade: 8,
    topic: 'Electricity',
    difficulty: 'medium',
    questionText: 'What is the SI unit of electrical resistance?',
    correct: 'Ohm (Ω)',
    distractors: ['Volt (V)', 'Ampere (A)'],
    explanation: 'Electrical resistance is measured in Ohms (Ω), defined by R = V / I.',
    optionalHint: 'Named after Georg Simon Ohm.'
  },
  {
    id: 'sci-10',
    subject: 'Science',
    grade: 7,
    topic: 'States of Matter',
    difficulty: 'easy',
    questionText: 'What is the process called when water vapor cools and turns back into liquid water?',
    correct: 'Condensation',
    distractors: ['Evaporation', 'Sublimation'],
    explanation: 'Condensation happens when water vapor loses thermal energy and forms liquid droplets, such as clouds.',
    optionalHint: 'Opposite of evaporation.'
  },
  {
    id: 'sci-11',
    subject: 'Science',
    grade: 10,
    topic: 'Chemistry',
    difficulty: 'hard',
    questionText: 'What is the pH value of pure neutral water at 25°C?',
    correct: '7',
    distractors: ['1', '14'],
    explanation: 'Pure water has equal concentrations of H⁺ and OH⁻ ions, giving a neutral pH of 7.',
    optionalHint: 'Right in the middle of the 0–14 scale.'
  },
  {
    id: 'sci-12',
    subject: 'Science',
    grade: 9,
    topic: 'Energy',
    difficulty: 'medium',
    questionText: 'Which type of energy is stored in an object because of its height above the ground?',
    correct: 'Gravitational potential energy',
    distractors: ['Kinetic energy', 'Thermal energy'],
    explanation: 'Gravitational potential energy depends on mass, gravity, and height (PE = mgh).',
    optionalHint: 'Stored energy of position.'
  },

  // MATHEMATICS (10)
  {
    id: 'math-1',
    subject: 'Mathematics',
    grade: 6,
    topic: 'Arithmetic',
    difficulty: 'easy',
    questionText: 'What is the value of 15 × 12?',
    correct: '180',
    distractors: ['165', '195'],
    explanation: '15 × 10 = 150 and 15 × 2 = 30; 150 + 30 = 180.',
    optionalHint: 'Split 12 into 10 + 2.'
  },
  {
    id: 'math-2',
    subject: 'Mathematics',
    grade: 7,
    topic: 'Geometry',
    difficulty: 'easy',
    questionText: 'What is the sum of the three interior angles of any triangle?',
    correct: '180°',
    distractors: ['90°', '360°'],
    explanation: 'In Euclidean geometry, the interior angles of every triangle always add up to 180 degrees.',
    optionalHint: 'Half of a full circle.'
  },
  {
    id: 'math-3',
    subject: 'Mathematics',
    grade: 8,
    topic: 'Algebra',
    difficulty: 'medium',
    questionText: 'Solve for x: 3x + 7 = 22.',
    correct: 'x = 5',
    distractors: ['x = 4', 'x = 6'],
    explanation: 'Subtract 7 from both sides: 3x = 15, then divide by 3 to get x = 5.',
    optionalHint: 'Undo +7 first, then divide by 3.'
  },
  {
    id: 'math-4',
    subject: 'Mathematics',
    grade: 9,
    topic: 'Pythagorean Theorem',
    difficulty: 'medium',
    questionText: 'In a right triangle with legs 6 cm and 8 cm, what is the length of the hypotenuse?',
    correct: '10 cm',
    distractors: ['12 cm', '14 cm'],
    explanation: 'By a² + b² = c², 6² + 8² = 36 + 64 = 100, and √100 = 10 cm.',
    optionalHint: 'It is a 3-4-5 triangle scaled by 2.'
  },
  {
    id: 'math-5',
    subject: 'Mathematics',
    grade: 10,
    topic: 'Quadratic Equations',
    difficulty: 'hard',
    questionText: 'What are the roots of the quadratic equation x² − 5x + 6 = 0?',
    correct: 'x = 2 and x = 3',
    distractors: ['x = 1 and x = 6', 'x = −2 and x = −3'],
    explanation: 'Factoring gives (x − 2)(x − 3) = 0, so the roots are x = 2 and x = 3.',
    optionalHint: 'Find two numbers that multiply to 6 and add to 5.'
  },
  {
    id: 'math-6',
    subject: 'Mathematics',
    grade: 10,
    topic: 'Quadratic Equations',
    difficulty: 'hard',
    questionText: 'In ax² + bx + c = 0, what is the expression b² − 4ac called?',
    correct: 'The discriminant',
    distractors: ['The vertex', 'The asymptote'],
    explanation: 'The discriminant (b² − 4ac) determines whether a quadratic equation has two real, one repeated, or complex roots.',
    optionalHint: 'It sits inside the square root of the quadratic formula.'
  },
  {
    id: 'math-7',
    subject: 'Mathematics',
    grade: 6,
    topic: 'Fractions & Percentages',
    difficulty: 'easy',
    questionText: 'What is 25% of 200?',
    correct: '50',
    distractors: ['25', '75'],
    explanation: '25% equals one quarter (1/4), and 200 ÷ 4 = 50.',
    optionalHint: 'Divide by 4.'
  },
  {
    id: 'math-8',
    subject: 'Mathematics',
    grade: 8,
    topic: 'Circles',
    difficulty: 'medium',
    questionText: 'If a circle has radius 7 cm, what is its diameter?',
    correct: '14 cm',
    distractors: ['7 cm', '21 cm'],
    explanation: 'Diameter is twice the radius: d = 2 × r = 2 × 7 = 14 cm.',
    optionalHint: 'Double the radius.'
  },
  {
    id: 'math-9',
    subject: 'Mathematics',
    grade: 9,
    topic: 'Coordinate Geometry',
    difficulty: 'medium',
    questionText: 'What is the slope of the line y = 4x − 3?',
    correct: '4',
    distractors: ['−3', '3'],
    explanation: 'In slope-intercept form y = mx + b, m is the slope, so m = 4.',
    optionalHint: 'Look at the coefficient of x.'
  },
  {
    id: 'math-10',
    subject: 'Mathematics',
    grade: 7,
    topic: 'Number Theory',
    difficulty: 'easy',
    questionText: 'Which of the following is a prime number?',
    correct: '19',
    distractors: ['21', '27'],
    explanation: '19 has only two positive divisors: 1 and 19. 21 = 3×7 and 27 = 3×9.',
    optionalHint: 'Prime numbers have no divisors other than 1 and themselves.'
  },

  // ENGLISH (9)
  {
    id: 'eng-1',
    subject: 'English',
    grade: 6,
    topic: 'Synonyms',
    difficulty: 'easy',
    questionText: 'Which word is a synonym for "courageous"?',
    correct: 'Brave',
    distractors: ['Timid', 'Careless'],
    explanation: '"Brave" and "courageous" both mean showing strength in the face of fear or difficulty.',
    optionalHint: 'Think of a hero.'
  },
  {
    id: 'eng-2',
    subject: 'English',
    grade: 7,
    topic: 'Antonyms',
    difficulty: 'easy',
    questionText: 'Which word is an antonym of "expand"?',
    correct: 'Contract',
    distractors: ['Enlarge', 'Extend'],
    explanation: '"Expand" means to grow larger, while "contract" means to shrink or become smaller.',
    optionalHint: 'Opposite of growing wider.'
  },
  {
    id: 'eng-3',
    subject: 'English',
    grade: 8,
    topic: 'Grammar',
    difficulty: 'medium',
    questionText: 'Identify the adverb in: "The jet climbed swiftly above the clouds."',
    correct: 'Swiftly',
    distractors: ['Clouds', 'Jet'],
    explanation: '"Swiftly" modifies the verb "climbed", describing how the action happened.',
    optionalHint: 'Many adverbs end in "-ly".'
  },
  {
    id: 'eng-4',
    subject: 'English',
    grade: 8,
    topic: 'Vocabulary',
    difficulty: 'medium',
    questionText: 'What does the word "resilient" mean?',
    correct: 'Able to recover quickly from difficulties',
    distractors: ['Easily broken', 'Silent and shy'],
    explanation: 'A resilient person or material bounces back and adapts after stress or setbacks.',
    optionalHint: 'Think of bouncing back.'
  },
  {
    id: 'eng-5',
    subject: 'English',
    grade: 9,
    topic: 'Idioms',
    difficulty: 'medium',
    questionText: 'What does the idiom "burn the midnight oil" mean?',
    correct: 'Work or study late into the night',
    distractors: ['Waste fuel unnecessarily', 'Start a campfire'],
    explanation: 'Historically, people used oil lamps to read or work late at night.',
    optionalHint: 'Commonly used before exams.'
  },
  {
    id: 'eng-6',
    subject: 'English',
    grade: 9,
    topic: 'Grammar',
    difficulty: 'hard',
    questionText: 'Which sentence uses the passive voice?',
    correct: 'The experiment was completed by the students.',
    distractors: ['The students completed the experiment.', 'Students love science experiments.'],
    explanation: 'In passive voice, the subject receives the action ("was completed by...").',
    optionalHint: 'Look for "was + past participle + by".'
  },
  {
    id: 'eng-7',
    subject: 'English',
    grade: 7,
    topic: 'Spelling',
    difficulty: 'easy',
    questionText: 'Which spelling is correct?',
    correct: 'Accommodate',
    distractors: ['Acommodate', 'Accomodate'],
    explanation: '"Accommodate" has two c’s and two m’s.',
    optionalHint: 'Double C and double M.'
  },
  {
    id: 'eng-8',
    subject: 'English',
    grade: 10,
    topic: 'Literary Devices',
    difficulty: 'hard',
    questionText: '"The wind whispered through the canyon" is an example of which device?',
    correct: 'Personification',
    distractors: ['Hyperbole', 'Onomatopoeia'],
    explanation: 'Personification gives human qualities ("whispered") to non-human things ("the wind").',
    optionalHint: 'Giving human actions to nature.'
  },
  {
    id: 'eng-9',
    subject: 'English',
    grade: 8,
    topic: 'Synonyms',
    difficulty: 'medium',
    questionText: 'Which word is closest in meaning to "meticulous"?',
    correct: 'Careful and precise',
    distractors: ['Reckless', 'Forgetful'],
    explanation: 'Someone who is meticulous pays great attention to every small detail.',
    optionalHint: 'Think of checking every detail.'
  },

  // HISTORY (8)
  {
    id: 'hist-1',
    subject: 'History',
    grade: 9,
    topic: 'French Revolution',
    difficulty: 'medium',
    questionText: 'In what year did the French Revolution begin with the storming of the Bastille?',
    correct: '1789',
    distractors: ['1776', '1815'],
    explanation: 'Parisians stormed the Bastille fortress on July 14, 1789, marking the start of the French Revolution.',
    optionalHint: '13 years after 1776.'
  },
  {
    id: 'hist-2',
    subject: 'History',
    grade: 9,
    topic: 'French Revolution',
    difficulty: 'hard',
    questionText: 'What were the three famous ideals championed by the French Revolution?',
    correct: 'Liberty, Equality, Fraternity',
    distractors: ['Peace, Land, Bread', 'Order, Crown, Empire'],
    explanation: 'Liberté, Égalité, Fraternité became the enduring motto of the French Republic.',
    optionalHint: 'Freedom, fairness, and brotherhood.'
  },
  {
    id: 'hist-3',
    subject: 'History',
    grade: 8,
    topic: 'Indian Independence',
    difficulty: 'easy',
    questionText: 'In which year did India gain independence?',
    correct: '1947',
    distractors: ['1942', '1950'],
    explanation: 'India achieved independence on August 15, 1947, and adopted its Constitution in 1950.',
    optionalHint: 'Three years before 1950.'
  },
  {
    id: 'hist-4',
    subject: 'History',
    grade: 7,
    topic: 'Ancient Civilizations',
    difficulty: 'easy',
    questionText: 'Along which river did Ancient Egyptian civilization flourish?',
    correct: 'The Nile',
    distractors: ['The Amazon', 'The Danube'],
    explanation: 'Annual flooding of the Nile deposited fertile silt that sustained Egyptian agriculture.',
    optionalHint: 'The longest river in Africa.'
  },
  {
    id: 'hist-5',
    subject: 'History',
    grade: 8,
    topic: 'Industrial Revolution',
    difficulty: 'medium',
    questionText: 'Which invention powered factories and locomotives during the First Industrial Revolution?',
    correct: 'The steam engine',
    distractors: ['The microchip', 'Solar panels'],
    explanation: 'James Watt’s improved steam engine transformed manufacturing, mining, and transport in the 18th century.',
    optionalHint: 'Powered by boiling water and coal.'
  },
  {
    id: 'hist-6',
    subject: 'History',
    grade: 10,
    topic: 'World History',
    difficulty: 'medium',
    questionText: 'In which year did humans first land on the Moon during the Apollo 11 mission?',
    correct: '1969',
    distractors: ['1957', '1975'],
    explanation: 'Neil Armstrong and Buzz Aldrin landed on the Moon on July 20, 1969.',
    optionalHint: 'End of the 1960s.'
  },
  {
    id: 'hist-7',
    subject: 'History',
    grade: 8,
    topic: 'Renaissance',
    difficulty: 'medium',
    questionText: 'In which European country did the Renaissance begin in the 14th century?',
    correct: 'Italy',
    distractors: ['Norway', 'Portugal'],
    explanation: 'The Renaissance began in Italian city-states like Florence, Venice, and Rome.',
    optionalHint: 'Home to Florence and Leonardo da Vinci.'
  },
  {
    id: 'hist-8',
    subject: 'History',
    grade: 9,
    topic: 'Aviation History',
    difficulty: 'easy',
    questionText: 'Who achieved the first powered, controlled airplane flight in 1903?',
    correct: 'The Wright brothers',
    distractors: ['The Montgolfier brothers', 'Charles Lindbergh'],
    explanation: 'Orville and Wilbur Wright flew the Wright Flyer at Kitty Hawk, North Carolina, on December 17, 1903.',
    optionalHint: 'Orville and Wilbur.'
  },

  // GEOGRAPHY (8)
  {
    id: 'geo-1',
    subject: 'Geography',
    grade: 6,
    topic: 'Continents & Oceans',
    difficulty: 'easy',
    questionText: 'Which is the largest ocean on Earth?',
    correct: 'Pacific Ocean',
    distractors: ['Atlantic Ocean', 'Indian Ocean'],
    explanation: 'The Pacific Ocean covers more than 30% of Earth’s surface, larger than all landmasses combined.',
    optionalHint: 'Stretches between Asia and the Americas.'
  },
  {
    id: 'geo-2',
    subject: 'Geography',
    grade: 7,
    topic: 'Plate Tectonics',
    difficulty: 'medium',
    questionText: 'What is the boundary called where two tectonic plates collide and one slides under the other?',
    correct: 'Subduction zone (convergent boundary)',
    distractors: ['Rift valley', 'Transform fault'],
    explanation: 'At convergent subduction zones, denser oceanic crust sinks beneath continental crust, forming trenches and volcanoes.',
    optionalHint: 'Plates move toward each other.'
  },
  {
    id: 'geo-3',
    subject: 'Geography',
    grade: 6,
    topic: 'Mountains',
    difficulty: 'easy',
    questionText: 'Which mountain range contains Mount Everest, the highest peak above sea level?',
    correct: 'The Himalayas',
    distractors: ['The Andes', 'The Alps'],
    explanation: 'The Himalayas span across Asia and contain Mount Everest at 8,848.86 meters.',
    optionalHint: 'Located in South Asia.'
  },
  {
    id: 'geo-4',
    subject: 'Geography',
    grade: 8,
    topic: 'Climate & Atmosphere',
    difficulty: 'medium',
    questionText: 'Which layer of Earth’s atmosphere contains the ozone layer that absorbs UV radiation?',
    correct: 'Stratosphere',
    distractors: ['Troposphere', 'Thermosphere'],
    explanation: 'The stratosphere lies above the troposphere and houses the protective ozone layer.',
    optionalHint: 'The second layer up from the surface.'
  },
  {
    id: 'geo-5',
    subject: 'Geography',
    grade: 7,
    topic: 'Deserts',
    difficulty: 'easy',
    questionText: 'Which is the largest hot desert in the world?',
    correct: 'The Sahara Desert',
    distractors: ['The Gobi Desert', 'The Mojave Desert'],
    explanation: 'The Sahara spans roughly 9.2 million square kilometers across North Africa.',
    optionalHint: 'Located in North Africa.'
  },
  {
    id: 'geo-6',
    subject: 'Geography',
    grade: 9,
    topic: 'Earth Coordinates',
    difficulty: 'medium',
    questionText: 'What is the 0° line of latitude that divides Earth into Northern and Southern Hemispheres?',
    correct: 'The Equator',
    distractors: ['The Prime Meridian', 'The Tropic of Cancer'],
    explanation: 'The Equator runs east-west at 0° latitude around the widest part of Earth.',
    optionalHint: 'Equal distance from both poles.'
  },
  {
    id: 'geo-7',
    subject: 'Geography',
    grade: 8,
    topic: 'Rivers',
    difficulty: 'medium',
    questionText: 'Which river carries the largest volume of water on Earth?',
    correct: 'The Amazon River',
    distractors: ['The Mississippi River', 'The Rhine River'],
    explanation: 'The Amazon River in South America discharges more water than the next several largest rivers combined.',
    optionalHint: 'Flows through the largest tropical rainforest.'
  },
  {
    id: 'geo-8',
    subject: 'Geography',
    grade: 10,
    topic: 'Monsoons & Winds',
    difficulty: 'hard',
    questionText: 'What causes winds to curve to the right in the Northern Hemisphere and left in the Southern Hemisphere?',
    correct: 'The Coriolis effect',
    distractors: ['Tidal friction', 'Solar flares'],
    explanation: 'Earth’s rotation produces the Coriolis effect, deflecting moving air and ocean currents.',
    optionalHint: 'Caused by Earth spinning on its axis.'
  },

  // GENERAL KNOWLEDGE (7)
  {
    id: 'gk-1',
    subject: 'General Knowledge',
    grade: 6,
    topic: 'Computing',
    difficulty: 'easy',
    questionText: 'What does CPU stand for in computing?',
    correct: 'Central Processing Unit',
    distractors: ['Computer Power Utility', 'Core Program Uploader'],
    explanation: 'The Central Processing Unit executes instructions and acts as the primary processor of a computer.',
    optionalHint: 'The "brain" of the computer.'
  },
  {
    id: 'gk-2',
    subject: 'General Knowledge',
    grade: 7,
    topic: 'Human Body',
    difficulty: 'easy',
    questionText: 'Which organ is the largest external organ of the human body?',
    correct: 'Skin',
    distractors: ['Liver', 'Heart'],
    explanation: 'The skin protects internal tissues, regulates temperature, and senses touch.',
    optionalHint: 'It covers your entire body.'
  },
  {
    id: 'gk-3',
    subject: 'General Knowledge',
    grade: 8,
    topic: 'Astronomy',
    difficulty: 'medium',
    questionText: 'Approximately how long does light from the Sun take to reach Earth?',
    correct: '8 minutes',
    distractors: ['8 seconds', '8 hours'],
    explanation: 'Sunlight travels about 150 million km at 300,000 km/s, taking roughly 8 minutes 20 seconds.',
    optionalHint: 'Less than ten minutes.'
  },
  {
    id: 'gk-4',
    subject: 'General Knowledge',
    grade: 8,
    topic: 'Sound & Flight',
    difficulty: 'medium',
    questionText: 'What term describes a speed faster than the speed of sound?',
    correct: 'Supersonic',
    distractors: ['Subsonic', 'Ultrasonic'],
    explanation: 'Supersonic flight exceeds Mach 1, the local speed of sound in air.',
    optionalHint: 'Prefix "super-" means above or beyond.'
  },
  {
    id: 'gk-5',
    subject: 'General Knowledge',
    grade: 9,
    topic: 'Chemistry in Life',
    difficulty: 'medium',
    questionText: 'Which element makes up about 78% of Earth’s atmosphere?',
    correct: 'Nitrogen',
    distractors: ['Oxygen', 'Carbon dioxide'],
    explanation: 'Earth’s dry atmosphere is roughly 78% nitrogen, 21% oxygen, and 1% other gases.',
    optionalHint: 'Even more abundant than oxygen.'
  },
  {
    id: 'gk-6',
    subject: 'General Knowledge',
    grade: 9,
    topic: 'Environment',
    difficulty: 'easy',
    questionText: 'Which renewable energy source converts sunlight directly into electricity using photovoltaic cells?',
    correct: 'Solar power',
    distractors: ['Geothermal power', 'Biomass'],
    explanation: 'Photovoltaic solar panels absorb photons and release electrons to generate clean electricity.',
    optionalHint: 'Comes from the Sun.'
  },
  {
    id: 'gk-7',
    subject: 'General Knowledge',
    grade: 10,
    topic: 'Logic & Navigation',
    difficulty: 'hard',
    questionText: 'What does GPS stand for?',
    correct: 'Global Positioning System',
    distractors: ['General Pilot Scanner', 'Guided Path Satellite'],
    explanation: 'GPS uses a constellation of satellites to calculate precise 3D coordinates anywhere on Earth.',
    optionalHint: 'Used for worldwide navigation.'
  }
];

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function hydrateQuestion(raw: RawQuestion): SkyStrikerQuestion {
  const rawOptions = [
    { id: `${raw.id}-opt-correct`, text: raw.correct, isCorrect: true },
    { id: `${raw.id}-opt-d1`, text: raw.distractors[0], isCorrect: false },
    { id: `${raw.id}-opt-d2`, text: raw.distractors[1], isCorrect: false }
  ];
  const shuffled = shuffleArray(rawOptions);
  const labels: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];
  const options: SkyStrikerOption[] = shuffled.map((o, idx) => ({
    answerId: o.id,
    label: labels[idx],
    text: o.text
  }));

  return {
    questionId: raw.id,
    subject: raw.subject,
    grade: raw.grade,
    topic: raw.topic,
    difficulty: raw.difficulty,
    questionText: raw.questionText,
    options,
    correctAnswerId: `${raw.id}-opt-correct`,
    explanation: raw.explanation,
    optionalHint: raw.optionalHint
  };
}

export const SKY_STRIKER_QUESTION_COUNT = RAW_QUESTIONS.length;

export function buildSkyStrikerDeck(
  subject: SkyStrikerSubject,
  difficulty: DifficultyLevel,
  grade: number,
  missedQuestions: SkyStrikerQuestion[] = [],
  topicHint?: string,
  count = 10
): SkyStrikerQuestion[] {
  if (missedQuestions.length > 0) {
    const uniqueMissed = Array.from(
      new Map(missedQuestions.map((q) => [q.questionId, q])).values()
    );
    return uniqueMissed.slice(0, count).map((q) => {
      const raw = RAW_QUESTIONS.find((r) => r.id === q.questionId);
      return raw ? hydrateQuestion(raw) : q;
    });
  }

  let pool = RAW_QUESTIONS;
  if (subject !== 'All Subjects') {
    const bySub = pool.filter((q) => q.subject === subject);
    if (bySub.length > 0) pool = bySub;
  }

  const cleanTopic = (topicHint || '').trim().toLowerCase();
  const topicMatched = cleanTopic
    ? pool.filter(
        (q) =>
          q.topic.toLowerCase().includes(cleanTopic) ||
          cleanTopic.includes(q.topic.toLowerCase()) ||
          q.questionText.toLowerCase().includes(cleanTopic)
      )
    : [];

  const diffMatched = pool.filter(
    (q) =>
      (q.difficulty === difficulty || Math.abs(q.grade - grade) <= 2) &&
      !topicMatched.some((tm) => tm.id === q.id)
  );

  const remaining = pool.filter(
    (q) =>
      !topicMatched.some((tm) => tm.id === q.id) &&
      !diffMatched.some((dm) => dm.id === q.id)
  );

  const fallbackAll = RAW_QUESTIONS.filter(
    (q) =>
      !topicMatched.some((tm) => tm.id === q.id) &&
      !diffMatched.some((dm) => dm.id === q.id) &&
      !remaining.some((rm) => rm.id === q.id)
  );

  const ordered = [
    ...shuffleArray(topicMatched),
    ...shuffleArray(diffMatched),
    ...shuffleArray(remaining),
    ...shuffleArray(fallbackAll)
  ];

  // Guarantee zero duplicate questions in the session
  const unique = Array.from(new Map(ordered.map((q) => [q.id, q])).values());
  return unique.slice(0, Math.min(count, unique.length)).map(hydrateQuestion);
}
