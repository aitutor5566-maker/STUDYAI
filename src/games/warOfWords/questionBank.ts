import {
  DifficultyLevel,
  EnglishCategory,
  GameModeId,
  OptionId,
  WarWordOption,
  WarWordQuestion
} from './types';

type RawTuple = [
  id: string,
  cat: Exclude<EnglishCategory, 'All Categories'>,
  grade: number,
  diff: DifficultyLevel,
  topic: string,
  vocabLevel: 'Foundation' | 'Intermediate' | 'Advanced',
  prompt: string,
  opts: [string, string, string, string],
  correctIdx: 0 | 1 | 2 | 3,
  pronunciation: string,
  meaning: string,
  exampleSentence: string,
  explanation: string,
  visualEmoji?: string
];

const RAW_QUESTIONS: RawTuple[] = [
  // ==================== A. VOCABULARY QUEST (12) ====================
  ['vw-voc-1', 'Vocabulary Quest', 5, 'easy', 'Adjectives', 'Foundation', 'Which word means "extremely large in size or amount"?', ['Enormous', 'Fragile', 'Brief', 'Narrow'], 0, 'ih-NOR-muhs', 'Very large in size, quantity, or extent.', 'The elephant is an enormous animal.', '"Enormous" describes something huge, unlike fragile (breakable) or brief (short).'],
  ['vw-voc-2', 'Vocabulary Quest', 5, 'easy', 'Nature Words', 'Foundation', 'Which word means "bright and shining with light"?', ['Radiant', 'Gloomy', 'Damp', 'Silent'], 0, 'RAY-dee-uhnt', 'Sending out light; shining brightly.', 'The morning sun looked radiant over the valley.', '"Radiant" means shining or glowing brightly.'],
  ['vw-voc-3', 'Vocabulary Quest', 6, 'easy', 'Character Traits', 'Foundation', 'Which word describes someone who is "willing to give and share freely"?', ['Generous', 'Greedy', 'Timid', 'Hasty'], 0, 'JEN-uh-ruhs', 'Showing a readiness to give more than expected.', 'A generous scholar shared her notes with the class.', '"Generous" means kind and willing to share.'],
  ['vw-voc-4', 'Vocabulary Quest', 6, 'easy', 'Action Verbs', 'Foundation', 'Which word means "to look closely and carefully at something"?', ['Inspect', 'Ignore', 'Wander', 'Scatter'], 0, 'in-SPEKT', 'To examine carefully to check quality or details.', 'The ranger paused to inspect the ancient stone bridge.', '"Inspect" means to examine something with care.'],
  ['vw-voc-5', 'Vocabulary Quest', 7, 'medium', 'Academic Vocabulary', 'Intermediate', 'Which word means "able to recover quickly from difficulties"?', ['Resilient', 'Brittle', 'Hesitant', 'Careless'], 0, 'rih-ZIL-yuhnt', 'Able to withstand or recover quickly from tough conditions.', 'Resilient learners keep trying after a mistake.', '"Resilient" means bouncing back strongly from challenges.'],
  ['vw-voc-6', 'Vocabulary Quest', 7, 'medium', 'Descriptive Words', 'Intermediate', 'Which word means "difficult to understand; full of mystery"?', ['Cryptic', 'Obvious', 'Ordinary', 'Cheerful'], 0, 'KRIP-tik', 'Having a meaning that is mysterious or obscure.', 'They found a cryptic message carved on the gate.', '"Cryptic" means hidden or puzzling in meaning.'],
  ['vw-voc-7', 'Vocabulary Quest', 8, 'medium', 'Precision Words', 'Intermediate', 'Which word means "to make something less severe or painful"?', ['Alleviate', 'Worsen', 'Complicate', 'Delay'], 0, 'uh-LEE-vee-ayt', 'To make suffering, pain, or a problem less severe.', 'Warm tea helped alleviate her sore throat.', '"Alleviate" means to ease or reduce pain or difficulty.'],
  ['vw-voc-8', 'Vocabulary Quest', 8, 'medium', 'Time & Duration', 'Intermediate', 'Which word means "lasting for only a very short time"?', ['Fleeting', 'Permanent', 'Endless', 'Ancient'], 0, 'FLEE-ting', 'Lasting for a very short time.', 'We caught a fleeting glimpse of a shooting star.', '"Fleeting" describes something that passes quickly.'],
  ['vw-voc-9', 'Vocabulary Quest', 9, 'hard', 'Literary Vocabulary', 'Advanced', 'Which word means "present, appearing, or found everywhere"?', ['Ubiquitous', 'Scarce', 'Hidden', 'Isolated'], 0, 'yoo-BIK-wih-tuhs', 'Seeming to be everywhere at the same time.', 'Smartphones have become ubiquitous in modern cities.', '"Ubiquitous" means existing everywhere at once.'],
  ['vw-voc-10', 'Vocabulary Quest', 9, 'hard', 'Academic Verbs', 'Advanced', 'Which word means "to support or strengthen an argument with evidence"?', ['Corroborate', 'Contradict', 'Dismiss', 'Fabricate'], 0, 'kuh-ROB-uh-rayt', 'To confirm or give support to a statement or finding.', 'Two witnesses arrived to corroborate the traveler’s story.', '"Corroborate" means to back up a claim with proof.'],
  ['vw-voc-11', 'Vocabulary Quest', 10, 'hard', 'Rhetoric', 'Advanced', 'Which word means "fluent or persuasive in speaking or writing"?', ['Eloquent', 'Mumbled', 'Clumsy', 'Blunt'], 0, 'EL-uh-kwuhnt', 'Fluent, graceful, and persuasive in expression.', 'The speaker delivered an eloquent speech on unity.', '"Eloquent" describes clear, powerful, persuasive speech.'],
  ['vw-voc-12', 'Vocabulary Quest', 10, 'hard', 'Observation', 'Advanced', 'Which word means "careful and persistent in work or effort"?', ['Diligent', 'Negligent', 'Idle', 'Reckless'], 0, 'DIL-ih-juhnt', 'Showing steady, careful effort in one’s work.', 'Diligent practice builds mastery over time.', '"Diligent" means hardworking and attentive to detail.'],

  // ==================== B. SYNONYM BATTLE (12) ====================
  ['vw-syn-1', 'Synonym Battle', 5, 'easy', 'Emotions', 'Foundation', 'Choose the synonym (similar meaning) for "Happy":', ['Joyful', 'Furious', 'Weary', 'Dull'], 0, 'JOY-fuhl', 'Feeling or expressing great happiness.', 'The villagers felt joyful when dawn arrived.', '"Joyful" has the same meaning as "happy".'],
  ['vw-syn-2', 'Synonym Battle', 5, 'easy', 'Courage', 'Foundation', 'Choose the synonym for "Brave":', ['Courageous', 'Cowardly', 'Shy', 'Weak'], 0, 'kuh-RAY-juhs', 'Not deterred by danger or pain; brave.', 'The courageous warrior stepped onto the bridge.', '"Courageous" means brave and fearless.'],
  ['vw-syn-3', 'Synonym Battle', 6, 'easy', 'Speed', 'Foundation', 'Choose the synonym for "Rapid":', ['Swift', 'Sluggish', 'Heavy', 'Late'], 0, 'SWIFT', 'Happening quickly or promptly.', 'A swift river flowed beneath the stone arch.', '"Swift" and "rapid" both mean very fast.'],
  ['vw-syn-4', 'Synonym Battle', 6, 'easy', 'Wisdom', 'Foundation', 'Choose the synonym for "Clever":', ['Ingenious', 'Foolish', 'Clumsy', 'Boring'], 0, 'in-JEEN-yuhs', 'Clever, original, and inventive.', 'She found an ingenious solution to the riddle.', '"Ingenious" means remarkably clever or inventive.'],
  ['vw-syn-5', 'Synonym Battle', 7, 'medium', 'Quantity', 'Intermediate', 'Choose the synonym for "Abundant":', ['Plentiful', 'Scarce', 'Empty', 'Tiny'], 0, 'PLEN-tih-fuhl', 'Existing in or yielding great quantities.', 'Fresh fruit was plentiful in the valley.', '"Plentiful" means existing in large amounts, like "abundant".'],
  ['vw-syn-6', 'Synonym Battle', 7, 'medium', 'Calmness', 'Intermediate', 'Choose the synonym for "Peaceful":', ['Serene', 'Chaotic', 'Noisy', 'Harsh'], 0, 'suh-REEN', 'Calm, peaceful, and untroubled.', 'The moonlight made the lake look serene.', '"Serene" is a synonym for calm and peaceful.'],
  ['vw-syn-7', 'Synonym Battle', 8, 'medium', 'Precision', 'Intermediate', 'Choose the synonym for "Accurate":', ['Precise', 'Vague', 'Faulty', 'Random'], 0, 'prih-SYSS', 'Exact, accurate, and clearly defined.', 'Her measurements were precise to the millimeter.', '"Precise" means exact and accurate.'],
  ['vw-syn-8', 'Synonym Battle', 8, 'medium', 'Kindness', 'Intermediate', 'Choose the synonym for "Benevolent":', ['Compassionate', 'Cruel', 'Hostile', 'Selfish'], 0, 'kuhm-PASH-uh-nit', 'Feeling or showing sympathy and concern for others.', 'A compassionate mentor guides students patiently.', '"Compassionate" aligns with "benevolent" (kind-hearted).'],
  ['vw-syn-9', 'Synonym Battle', 9, 'hard', 'Intensity', 'Advanced', 'Choose the synonym for "Fierce":', ['Ferocious', 'Mild', 'Gentle', 'Tame'], 0, 'fuh-ROH-shuhs', 'Savagely fierce, intense, or determined.', 'A ferocious wind swept across the mountain pass.', '"Ferocious" is a strong synonym for "fierce".'],
  ['vw-syn-10', 'Synonym Battle', 9, 'hard', 'Clarity', 'Advanced', 'Choose the synonym for "Lucid":', ['Clear', 'Murky', 'Confused', 'Hidden'], 0, 'LOO-sid', 'Expressed clearly; easy to understand.', 'The textbook gave a lucid explanation of gravity.', '"Lucid" means crystal clear and easy to follow.'],
  ['vw-syn-11', 'Synonym Battle', 10, 'hard', 'Stubbornness', 'Advanced', 'Choose the synonym for "Obstinate":', ['Stubborn', 'Flexible', 'Obedient', 'Meek'], 0, 'STUB-urn', 'Refusing to change one’s mind or course of action.', 'The stubborn gate refused to budge.', '"Obstinate" means stubbornly refusing to yield.'],
  ['vw-syn-12', 'Synonym Battle', 10, 'hard', 'Frugal', 'Advanced', 'Choose the synonym for "Thrifty":', ['Economical', 'Wasteful', 'Lavish', 'Reckless'], 0, 'ek-uh-NOM-ih-kuhl', 'Careful not to waste money or resources.', 'Economical habits help families save for the future.', '"Economical" and "thrifty" both mean careful with resources.'],

  // ==================== C. ANTONYM BATTLE (12) ====================
  ['vw-ant-1', 'Antonym Battle', 5, 'easy', 'Time', 'Foundation', 'Choose the antonym (opposite) of "Ancient":', ['Modern', 'Old', 'Dusty', 'Historic'], 0, 'MOD-urn', 'Relating to the present or recent times.', 'Modern bridges use steel cables instead of stone.', '"Modern" (new/present) is the opposite of "ancient" (very old).'],
  ['vw-ant-2', 'Antonym Battle', 5, 'easy', 'Light', 'Foundation', 'Choose the antonym of "Bright":', ['Dim', 'Glowing', 'Sunny', 'Vivid'], 0, 'DIM', 'Not shining brightly or clearly.', 'The lantern cast a dim glow in the mist.', '"Dim" is the opposite of "bright".'],
  ['vw-ant-3', 'Antonym Battle', 6, 'easy', 'Size', 'Foundation', 'Choose the antonym of "Expand":', ['Shrink', 'Grow', 'Stretch', 'Widen'], 0, 'SHRINK', 'To become smaller in size or amount.', 'Wool sweaters can shrink in hot water.', '"Shrink" (get smaller) is the opposite of "expand" (get larger).'],
  ['vw-ant-4', 'Antonym Battle', 6, 'easy', 'Behavior', 'Foundation', 'Choose the antonym of "Polite":', ['Rude', 'Kind', 'Gentle', 'Respectful'], 0, 'ROOD', 'Offensively impolite or ill-mannered.', 'Interrupting others while they speak is rude.', '"Rude" is the opposite of "polite".'],
  ['vw-ant-5', 'Antonym Battle', 7, 'medium', 'Supply', 'Intermediate', 'Choose the antonym of "Scarce":', ['Abundant', 'Rare', 'Limited', 'Sparse'], 0, 'uh-BUN-duhnt', 'Existing or available in large quantities.', 'Clean water is abundant near mountain springs.', '"Abundant" (plentiful) is the opposite of "scarce" (rare).'],
  ['vw-ant-6', 'Antonym Battle', 7, 'medium', 'Strength', 'Intermediate', 'Choose the antonym of "Fragile":', ['Sturdy', 'Delicate', 'Weak', 'Brittle'], 0, 'STUR-dee', 'Strongly and solidly built.', 'The sturdy oak door withstood the storm.', '"Sturdy" (strong) is the opposite of "fragile" (easily broken).'],
  ['vw-ant-7', 'Antonym Battle', 8, 'medium', 'Order', 'Intermediate', 'Choose the antonym of "Chaos":', ['Harmony', 'Turmoil', 'Disorder', 'Panic'], 0, 'HAR-muh-nee', 'Agreement, peace, and orderly arrangement.', 'The orchestra played in perfect harmony.', '"Harmony" (order/peace) is the opposite of "chaos" (confusion).'],
  ['vw-ant-8', 'Antonym Battle', 8, 'medium', 'Honesty', 'Intermediate', 'Choose the antonym of "Genuine":', ['Counterfeit', 'Authentic', 'Real', 'Sincere'], 0, 'KOWN-ter-fit', 'Made in exact imitation of something valuable to deceive.', 'Experts spotted the counterfeit coin immediately.', '"Counterfeit" (fake) is the opposite of "genuine" (real).'],
  ['vw-ant-9', 'Antonym Battle', 9, 'hard', 'Duration', 'Advanced', 'Choose the antonym of "Ephemeral":', ['Permanent', 'Brief', 'Temporary', 'Momentary'], 0, 'PUR-muh-nuhnt', 'Lasting or intended to last forever.', 'Carved stone inscriptions leave a permanent record.', '"Permanent" is the opposite of "ephemeral" (short-lived).'],
  ['vw-ant-10', 'Antonym Battle', 9, 'hard', 'Visibility', 'Advanced', 'Choose the antonym of "Transparent":', ['Opaque', 'Clear', 'Glassy', 'Sheer'], 0, 'oh-PAYK', 'Not able to be seen through; not transparent.', 'Frosted or painted wood is completely opaque.', '"Opaque" (blocking light) is the opposite of "transparent".'],
  ['vw-ant-11', 'Antonym Battle', 10, 'hard', 'Speech', 'Advanced', 'Choose the antonym of "Verbose":', ['Concise', 'Wordy', 'Lengthy', 'Rambling'], 0, 'kun-SYSS', 'Giving a lot of information clearly in a few words.', 'A concise summary saves the reader’s time.', '"Concise" (brief and clear) is the opposite of "verbose" (overly wordy).'],
  ['vw-ant-12', 'Antonym Battle', 10, 'hard', 'Mood', 'Advanced', 'Choose the antonym of "Optimistic":', ['Pessimistic', 'Hopeful', 'Cheerful', 'Confident'], 0, 'pes-uh-MIS-tik', 'Tending to see the worst aspect of things.', 'A pessimistic outlook expects failure before trying.', '"Pessimistic" is the opposite of "optimistic" (hopeful).'],

  // ==================== D. MISSING WORD CHALLENGE (12) ====================
  ['vw-mis-1', 'Missing Word', 5, 'easy', 'Context Clues', 'Foundation', 'Complete the sentence: "The sun ___ in the east every morning."', ['rises', 'falls', 'sleeps', 'melts'], 0, 'RY-ziz', 'Moves upward or appears above the horizon.', 'The sun rises in the east every morning.', 'The sun appears above the eastern horizon each morning ("rises").'],
  ['vw-mis-2', 'Missing Word', 5, 'easy', 'Context Clues', 'Foundation', 'Complete: "A library is a quiet place where people go to ___ books."', ['read', 'bake', 'climb', 'paint'], 0, 'REED', 'To look at and understand written words.', 'Students visit the library to read books.', '"Read" fits the purpose of books in a library.'],
  ['vw-mis-3', 'Missing Word', 6, 'easy', 'Cause & Effect', 'Foundation', 'Complete: "Because it rained heavily all night, the river began to ___."', ['overflow', 'evaporate', 'freeze', 'whisper'], 0, 'oh-ver-FLOH', 'To flow over the brim or banks.', 'Heavy rain caused the river to overflow.', 'Excess rainwater makes a river rise and overflow its banks.'],
  ['vw-mis-4', 'Missing Word', 6, 'easy', 'Prepositions', 'Foundation', 'Complete: "The warrior leaped ___ the narrow stream to reach the path."', ['across', 'under', 'inside', 'below'], 0, 'uh-KROSS', 'From one side to the other.', 'She leaped across the narrow stream.', '"Across" indicates movement from one side to the opposite side.'],
  ['vw-mis-5', 'Missing Word', 7, 'medium', 'Science Context', 'Intermediate', 'Complete: "Plants ___ sunlight into chemical energy during photosynthesis."', ['convert', 'destroy', 'hide', 'ignore'], 0, 'kun-VURT', 'To change from one form into another.', 'Leaves convert sunlight into food energy.', '"Convert" means to transform one form of energy into another.'],
  ['vw-mis-6', 'Missing Word', 7, 'medium', 'Conjunctions', 'Intermediate', 'Complete: "She studied hard for the exam; ___, she earned top marks."', ['consequently', 'meanwhile', 'otherwise', 'unless'], 0, 'KON-sih-kwent-lee', 'As a result; therefore.', 'She practiced daily; consequently, her score improved.', '"Consequently" connects a cause (studying) to its result (top marks).'],
  ['vw-mis-7', 'Missing Word', 8, 'medium', 'Contrast Clues', 'Intermediate', 'Complete: "___ the mountain trail was steep, the hikers reached the summit."', ['Although', 'Because', 'Since', 'Therefore'], 0, 'awl-THOH', 'In spite of the fact that; even though.', 'Although the trail was steep, they reached the top.', '"Although" introduces a contrast between difficulty and success.'],
  ['vw-mis-8', 'Missing Word', 8, 'medium', 'Academic Collocations', 'Intermediate', 'Complete: "The scientist conducted an ___ to test her hypothesis."', ['experiment', 'ornament', 'accident', 'echo'], 0, 'ik-SPER-uh-muhnt', 'A scientific procedure undertaken to test an idea.', 'They ran an experiment in the physics lab.', 'Hypotheses are tested by conducting an experiment.'],
  ['vw-mis-9', 'Missing Word', 9, 'hard', 'Formal Writing', 'Advanced', 'Complete: "The museum displayed ___ artifacts recovered from the sunken ship."', ['authentic', 'imaginary', 'edible', 'audible'], 0, 'aw-THEN-tik', 'Of undisputed origin; genuine.', 'The curator verified the authentic artifacts.', '"Authentic" means genuine and historically real.'],
  ['vw-mis-10', 'Missing Word', 9, 'hard', 'Logical Connectors', 'Advanced', 'Complete: "The evidence was ___, leaving no doubt about the conclusion."', ['irrefutable', 'doubtful', 'trivial', 'ambiguous'], 0, 'ir-ih-FYOO-tuh-buhl', 'Impossible to deny or disprove.', 'DNA proof provided irrefutable evidence.', '"Irrefutable" means impossible to argue against.'],
  ['vw-mis-11', 'Missing Word', 10, 'hard', 'Nuance', 'Advanced', 'Complete: "Her ___ attention to detail prevented any errors in the report."', ['meticulous', 'careless', 'hasty', 'indifferent'], 0, 'muh-TIK-yuh-luhs', 'Showing great attention to detail; very careful.', 'Meticulous proofreading caught every typo.', '"Meticulous" means extremely careful and thorough.'],
  ['vw-mis-12', 'Missing Word', 10, 'hard', 'Literary Context', 'Advanced', 'Complete: "The calm before the storm created an ___ silence in the valley."', ['eerie', 'hilarious', 'crowded', 'fragrant'], 0, 'EER-ee', 'Strange and frightening; mysterious.', 'An eerie silence fell over the misty ruins.', '"Eerie" describes a spooky, unsettling quietness.'],

  // ==================== E. SPELLING CHALLENGE (12) ====================
  ['vw-spl-1', 'Spelling Challenge', 5, 'easy', 'Common Words', 'Foundation', 'Select the correctly spelled word:', ['Believe', 'Beleive', 'Belive', 'Beleeve'], 0, 'bih-LEEV', 'To accept something as true.', 'I believe we can master every level.', 'Remember "i before e, except after c" → Believe.'],
  ['vw-spl-2', 'Spelling Challenge', 5, 'easy', 'Silent Letters', 'Foundation', 'Select the correctly spelled word:', ['Knowledge', 'Knowlege', 'Noledge', 'Knowledj'], 0, 'NOL-ij', 'Facts, information, and skills acquired through learning.', 'Knowledge is our greatest shield.', '"Knowledge" has a silent "k" at the start and "-ledge" at the end.'],
  ['vw-spl-3', 'Spelling Challenge', 6, 'easy', 'Double Consonants', 'Foundation', 'Select the correctly spelled word:', ['Necessary', 'Recessary', 'Necesary', 'Neccessary'], 0, 'NES-uh-ser-ee', 'Required to be done or achieved; essential.', 'Practice is necessary for fluency.', '"Necessary" has ONE "c" and TWO "s"s (one collar, two sleeves).'],
  ['vw-spl-4', 'Spelling Challenge', 6, 'easy', 'Vowel Teams', 'Foundation', 'Select the correctly spelled word:', ['Separate', 'Seperate', 'Sepparate', 'Separete'], 0, 'SEP-uh-rayt', 'To set or keep apart.', 'Keep the two lists in separate folders.', '"Separate" has "a" in the middle (sep-A-rate), not "e".'],
  ['vw-spl-5', 'Spelling Challenge', 7, 'medium', 'Double Letters', 'Intermediate', 'Select the correctly spelled word:', ['Accommodate', 'Acommodate', 'Accomodate', 'Acomodate'], 0, 'uh-KOM-uh-dayt', 'To provide space or adapt to needs.', 'The hall can accommodate two hundred guests.', '"Accommodate" has double "c" AND double "m".'],
  ['vw-spl-6', 'Spelling Challenge', 7, 'medium', 'Suffixes', 'Intermediate', 'Select the correctly spelled word:', ['Definitely', 'Definately', 'Definitly', 'Definetly'], 0, 'DEF-uh-nit-lee', 'Without doubt; clearly.', 'We will definitely finish the quest today.', '"Definitely" comes from "finite" (de-finite-ly), with an "i".'],
  ['vw-spl-7', 'Spelling Challenge', 8, 'medium', 'Academic Terms', 'Intermediate', 'Select the correctly spelled word:', ['Environment', 'Enviroment', 'Enviornment', 'Envyronment'], 0, 'en-VY-ruhn-muhnt', 'The natural world or surroundings.', 'Protecting the environment benefits everyone.', 'Don’t forget the "n" before "m": en-vi-ron-ment.'],
  ['vw-spl-8', 'Spelling Challenge', 8, 'medium', 'Prefixes', 'Intermediate', 'Select the correctly spelled word:', ['Disappear', 'Dissapear', 'Disapear', 'Dissappear'], 0, 'dis-uh-PEER', 'To cease to be visible.', 'Mist makes distant hills disappear.', 'Prefix "dis-" + root "appear" = Disappear (one s, two p’s).'],
  ['vw-spl-9', 'Spelling Challenge', 9, 'hard', 'Tricky Consonants', 'Advanced', 'Select the correctly spelled word:', ['Embarrass', 'Embarass', 'Embarras', 'Emberass'], 0, 'im-BAIR-uhs', 'To cause someone to feel awkward or self-conscious.', 'A small slip shouldn’t embarrass a learner.', '"Embarrass" has double "r" AND double "s".'],
  ['vw-spl-10', 'Spelling Challenge', 9, 'hard', 'Silent Letters', 'Advanced', 'Select the correctly spelled word:', ['Rhythm', 'Rythm', 'Rhythem', 'Rithm'], 0, 'RITH-uhm', 'A strong, regular repeated pattern of sound or movement.', 'The poem has a steady, musical rhythm.', '"Rhythm" has no standard vowels—only "y", with "rh" and "th".'],
  ['vw-spl-11', 'Spelling Challenge', 10, 'hard', 'Derived Nouns', 'Advanced', 'Select the correctly spelled word:', ['Occurrence', 'Occurence', 'Ocurrence', 'Occurrance'], 0, 'uh-KUR-uhns', 'An incident or event.', 'A total solar eclipse is a rare occurrence.', '"Occurrence" has double "c", double "r", and "-ence".'],
  ['vw-spl-12', 'Spelling Challenge', 10, 'hard', 'Classical Roots', 'Advanced', 'Select the correctly spelled word:', ['Conscientious', 'Concientious', 'Consciencious', 'Conscientous'], 0, 'kon-shee-EN-shuhs', 'Wishing to do one’s work thoroughly and well.', 'A conscientious student checks every answer.', 'Derived from "conscience" + "-tious" → Conscientious.'],

  // ==================== F. GRAMMAR BATTLE (12) ====================
  ['vw-grm-1', 'Grammar Battle', 5, 'easy', 'Parts of Speech', 'Foundation', 'Identify the ADJECTIVE in: "The brave knight crossed the stone bridge."', ['brave', 'crossed', 'bridge', 'the'], 0, 'BRAYV', 'A describing word (adjective) modifying "knight".', 'The brave knight stood watch.', '"Brave" describes the noun "knight", making it an adjective.'],
  ['vw-grm-2', 'Grammar Battle', 5, 'easy', 'Verb Tense', 'Foundation', 'Choose the correct past tense verb: "Yesterday, Maya ___ a glowing crystal."', ['found', 'find', 'finding', 'finds'], 0, 'FOWND', 'Past tense of the irregular verb "find".', 'Maya found a crystal in the cavern.', '"Found" is the simple past tense of "find".'],
  ['vw-grm-3', 'Grammar Battle', 6, 'easy', 'Pronouns', 'Foundation', 'Choose the correct pronoun: "Rahul and ___ are studying together."', ['I', 'me', 'us', 'them'], 0, 'EYE', 'Subject pronoun used when the speaker performs the action.', 'Rahul and I are studying together.', 'Use the subject pronoun "I" in the subject position ("I am studying").'],
  ['vw-grm-4', 'Grammar Battle', 6, 'easy', 'Adverbs', 'Foundation', 'Which word is an ADVERB in: "She solved the puzzle quickly."?', ['quickly', 'solved', 'puzzle', 'she'], 0, 'KWIK-lee', 'An adverb modifying how the action "solved" happened.', 'She solved the puzzle quickly.', '"Quickly" modifies the verb "solved".'],
  ['vw-grm-5', 'Grammar Battle', 7, 'medium', 'Subject-Verb Agreement', 'Intermediate', 'Choose the correct verb: "Neither of the answers ___ correct."', ['is', 'are', 'were', 'have'], 0, 'IZ', 'Singular present-tense form of "to be".', 'Neither of the paths is blocked.', '"Neither" is singular and requires the singular verb "is".'],
  ['vw-grm-6', 'Grammar Battle', 7, 'medium', 'Comparative Adjectives', 'Intermediate', 'Choose the correct sentence:', ['This trail is steeper than the valley road.', 'This trail is more steeper than the valley road.', 'This trail is steepest than the valley road.', 'This trail is steep than the valley road.'], 0, 'STEE-per', 'Comparative form of "steep".', 'This trail is steeper than the road.', 'Never combine "more" with an "-er" adjective; use "steeper".'],
  ['vw-grm-7', 'Grammar Battle', 8, 'medium', 'Articles', 'Intermediate', 'Choose the correct article: "He waited for ___ hour at the castle gate."', ['an', 'a', 'few', 'many'], 0, 'AN', 'Indefinite article used before vowel sounds.', 'He waited for an hour.', '"Hour" starts with a silent "h" and a vowel sound ("ow-er"), so use "an".'],
  ['vw-grm-8', 'Grammar Battle', 8, 'medium', 'Passive Voice', 'Intermediate', 'Which sentence is in the PASSIVE voice?', ['The lantern was lit by the guardian.', 'The guardian lit the lantern.', 'The guardian is lighting the lantern.', 'The guardian will light the lantern.'], 0, 'WAZ LIT', 'Subject receives the action ("was + past participle").', 'The lantern was lit by the guardian.', 'In passive voice, the receiver ("The lantern") becomes the subject.'],
  ['vw-grm-9', 'Grammar Battle', 9, 'hard', 'Conditionals', 'Advanced', 'Complete the second conditional: "If I ___ wings, I would soar above the clouds."', ['had', 'have', 'will have', 'am having'], 0, 'HAD', 'Past subjunctive form used in hypothetical "if" clauses.', 'If I had wings, I would fly.', 'Second conditional uses "If + simple past, ... would + base verb".'],
  ['vw-grm-10', 'Grammar Battle', 9, 'hard', 'Relative Pronouns', 'Advanced', 'Choose the correct pronoun: "The scholar ___ discovered the manuscript won an award."', ['who', 'whom', 'which', 'whose'], 0, 'HOO', 'Subject relative pronoun referring to a person.', 'The scholar who solved it smiled.', '"Who" acts as the subject of "discovered".'],
  ['vw-grm-11', 'Grammar Battle', 10, 'hard', 'Parallelism', 'Advanced', 'Select the sentence with correct parallel structure:', ['She likes reading, writing, and debating.', 'She likes reading, to write, and debating.', 'She likes to read, writing, and debate.', 'She likes read, writing, and to debate.'], 0, 'PAR-uh-lel', 'Matching grammatical forms in a list.', 'She likes reading, writing, and debating.', 'All three items use the gerund (-ing) form consistently.'],
  ['vw-grm-12', 'Grammar Battle', 10, 'hard', 'Prepositional Idioms', 'Advanced', 'Choose the correct preposition: "The new library differs ___ the old one in design."', ['from', 'than', 'to', 'with'], 0, 'FRUM', 'Standard preposition paired with "differs" for contrast.', 'The new design differs from the old one.', 'In formal English, "differ from" expresses difference between two things.'],

  // ==================== G. SENTENCE FORMATION (12) ====================
  ['vw-snt-1', 'Sentence Formation', 5, 'easy', 'Word Order', 'Foundation', 'Which phrase best completes: "After finishing his homework, ___."', ['Arjun went out to play', 'went out Arjun to play', 'to play Arjun out went', 'playing went Arjun'], 0, 'AR-jun', 'Subject followed by verb in a main clause.', 'After finishing his homework, Arjun went out to play.', 'Standard English main clauses follow Subject + Verb + Complement order.'],
  ['vw-snt-2', 'Sentence Formation', 5, 'easy', 'Joining Ideas', 'Foundation', 'Complete: "I wanted to explore the forest, ___ it was already getting dark."', ['but', 'because', 'or', 'so'], 0, 'BUT', 'Coordinating conjunction showing contrast.', 'I wanted to explore, but it was dark.', '"But" joins two contrasting ideas clearly.'],
  ['vw-snt-3', 'Sentence Formation', 6, 'easy', 'Clauses', 'Foundation', 'Choose the best opening: "___ the bell rang, the students lined up."', ['As soon as', 'During', 'Despite', 'Without'], 0, 'AZ SOON AZ', 'Time conjunction meaning immediately when.', 'As soon as the bell rang, they lined up.', '"As soon as" introduces a time clause with a subject and verb.'],
  ['vw-snt-4', 'Sentence Formation', 6, 'easy', 'Questions', 'Foundation', 'Select the correctly formed question:', ['Where did you find that ancient map?', 'Where you did find that ancient map?', 'Where found you that ancient map?', 'Where did you found that ancient map?'], 0, 'WAIR DID', 'Wh-word + auxiliary "did" + subject + base verb.', 'Where did you find that map?', 'Questions in past simple use "did + subject + base verb (find)".'],
  ['vw-snt-5', 'Sentence Formation', 7, 'medium', 'Complex Sentences', 'Intermediate', 'Complete: "The bridge, ___ was built centuries ago, still stands strong."', ['which', 'who', 'where', 'what'], 0, 'WICH', 'Non-defining relative pronoun for things.', 'The bridge, which is ancient, still stands.', 'Use "which" (after a comma) to add extra info about an object.'],
  ['vw-snt-6', 'Sentence Formation', 7, 'medium', 'Cause & Result', 'Intermediate', 'Complete: "The fog was ___ thick that we could barely see the lantern."', ['so', 'too', 'very', 'enough'], 0, 'SOH', 'Adverb of degree paired with "that + result clause".', 'The fog was so thick that we slowed down.', 'The pattern is "so + adjective + that + clause".'],
  ['vw-snt-7', 'Sentence Formation', 8, 'medium', 'Modifiers', 'Intermediate', 'Choose the sentence without a dangling modifier:', ['Walking through the valley, we saw glowing fireflies.', 'Walking through the valley, the fireflies glowed brightly.', 'Walking through the valley, a lantern appeared.', 'Walking through the valley, the bridge looked old.'], 0, 'WEE SAW', 'The subject after the comma must be the one walking.', 'Walking through the valley, we saw fireflies.', '"We" were walking, not the fireflies or the bridge.'],
  ['vw-snt-8', 'Sentence Formation', 8, 'medium', 'Paired Conjunctions', 'Intermediate', 'Complete: "Not only did she win the contest, ___ she also helped her teammates."', ['but', 'and', 'or', 'yet'], 0, 'BUT', 'Completes the correlative pair "Not only ... but also".', 'Not only did she win, but she also helped others.', '"Not only" pairs with "but ... also".'],
  ['vw-snt-9', 'Sentence Formation', 9, 'hard', 'Inversion', 'Advanced', 'Complete: "Seldom ___ such a breathtaking sunrise over the mountains."', ['have I seen', 'I have seen', 'seen have I', 'I saw'], 0, 'HAV EYE SEEN', 'Negative adverb at the start triggers auxiliary-subject inversion.', 'Seldom have I seen such a sunrise.', 'Starting with "Seldom" requires inverted word order: auxiliary + subject + verb.'],
  ['vw-snt-10', 'Sentence Formation', 9, 'hard', 'Conciseness', 'Advanced', 'Choose the clearest, most concise sentence:', ['Despite the heavy rain, the team completed the trek.', 'In spite of the fact that it was raining heavily, the team completed the trek.', 'Rain was heavy, and despite that fact, the trek was completed by them.', 'Heavy rain occurring, the trek was finished by the team.'], 0, 'dih-SPYT', 'Preposition meaning "without being prevented by".', 'Despite the rain, the team finished the trek.', '"Despite + noun phrase" expresses contrast cleanly without wordiness.'],
  ['vw-snt-11', 'Sentence Formation', 10, 'hard', 'Reported Speech', 'Advanced', 'Convert to indirect speech: He said, "I will finish the book tomorrow."', ['He said that he would finish the book the next day.', 'He said that he will finish the book tomorrow.', 'He said that I would finish the book tomorrow.', 'He said he finishes the book the next day.'], 0, 'WOOD FIN-ish', 'Backshift "will" → "would" and "tomorrow" → "the next day".', 'He said he would finish it the next day.', 'Indirect speech shifts future "will" to "would" and updates time expressions.'],
  ['vw-snt-12', 'Sentence Formation', 10, 'hard', 'Subordination', 'Advanced', 'Complete: "___ you practice consistently, your vocabulary will grow rapidly."', ['Provided that', 'Unless', 'Whereas', 'Lest'], 0, 'pruh-VY-ded THAT', 'Conjunction meaning "on the condition that; if".', 'Provided that you practice, you will improve.', '"Provided that" sets a positive condition for the outcome.'],

  // ==================== H. IDIOMS AND PHRASES (12) ====================
  ['vw-idm-1', 'Idioms & Phrases', 6, 'easy', 'Common Idioms', 'Foundation', 'What does the idiom "a piece of cake" mean?', ['Something very easy to do', 'A difficult puzzle', 'A type of celebration', 'A broken promise'], 0, 'PEES uv KAYK', 'An informal idiom meaning effortless or simple.', 'With enough practice, the spelling round was a piece of cake.', '"A piece of cake" means a task that is very easy.'],
  ['vw-idm-2', 'Idioms & Phrases', 6, 'easy', 'Common Idioms', 'Foundation', 'What does "break the ice" mean?', ['To start a friendly conversation and ease tension', 'To ruin a frozen lake', 'To stop talking suddenly', 'To make a mistake'], 0, 'BRAYK thee EYESS', 'To initiate conversation in a shy or formal group.', 'A fun riddle helped break the ice at the start of class.', '"Break the ice" means helping people feel comfortable talking.'],
  ['vw-idm-3', 'Idioms & Phrases', 7, 'easy', 'Effort & Focus', 'Foundation', 'What does "hit the books" mean?', ['To begin studying seriously', 'To throw textbooks away', 'To write a novel', 'To close the library'], 0, 'HIT thuh BOOKS', 'To study hard, especially for an exam.', 'It is time to hit the books before Friday’s quiz.', '"Hit the books" is an idiom meaning to study diligently.'],
  ['vw-idm-4', 'Idioms & Phrases', 7, 'easy', 'Timing', 'Foundation', 'What does "once in a blue moon" mean?', ['Very rarely', 'Every single night', 'At midnight only', 'Always on time'], 0, 'WUNS in uh BLOO MOON', 'Happening very infrequently.', 'Such a bright comet appears once in a blue moon.', '"Once in a blue moon" means something happens very rarely.'],
  ['vw-idm-5', 'Idioms & Phrases', 8, 'medium', 'Secrets & Truth', 'Intermediate', 'What does "let the cat out of the bag" mean?', ['To accidentally reveal a secret', 'To adopt a pet', 'To pack a suitcase', 'To solve a math problem'], 0, 'LET thuh KAT owt', 'To disclose a secret unintentionally.', 'Don’t let the cat out of the bag about the surprise party!', 'It means spilling a secret by accident.'],
  ['vw-idm-6', 'Idioms & Phrases', 8, 'medium', 'Accuracy', 'Intermediate', 'What does "hit the nail on the head" mean?', ['To be completely right about something', 'To build a wooden house', 'To miss an opportunity', 'To argue loudly'], 0, 'HIT thuh NAYL', 'To describe or identify something with exact accuracy.', 'Your explanation hit the nail on the head.', 'It means stating the exact truth or solution.'],
  ['vw-idm-7', 'Idioms & Phrases', 8, 'medium', 'Perseverance', 'Intermediate', 'What does "burn the midnight oil" mean?', ['To work or study late into the night', 'To waste fuel', 'To go camping', 'To wake up early'], 0, 'BURN thuh MID-nyt OYL', 'To stay up late working or studying.', 'Engineers burned the midnight oil to finish the bridge.', 'Historically, working late meant burning lamp oil past midnight.'],
  ['vw-idm-8', 'Idioms & Phrases', 9, 'medium', 'Decision Making', 'Intermediate', 'What does "sit on the fence" mean?', ['To avoid making a decision or taking a side', 'To guard a village', 'To rest after a race', 'To agree immediately'], 0, 'SIT on thuh FENS', 'To remain undecided between two choices.', 'You cannot sit on the fence forever; choose a path.', '"Sitting on the fence" means staying neutral or undecided.'],
  ['vw-idm-9', 'Idioms & Phrases', 9, 'hard', 'Courage', 'Advanced', 'What does "bite the bullet" mean?', ['To face a difficult situation with courage', 'To eat too quickly', 'To retreat from danger', 'To complain endlessly'], 0, 'BYT thuh BUL-it', 'To endure something tough or unpleasant bravely.', 'She decided to bite the bullet and give the speech.', 'It means facing a tough task head-on without delaying.'],
  ['vw-idm-10', 'Idioms & Phrases', 9, 'hard', 'Perspective', 'Advanced', 'What does "a blessing in disguise" mean?', ['Something that seems bad at first but brings good results', 'A hidden treasure chest', 'A costume party', 'An ungrateful friend'], 0, 'BLES-ing in dis-GYZ', 'An apparent misfortune that eventually has good results.', 'Missing the early bus was a blessing in disguise when I met my mentor.', 'Something unfortunate-looking that turns out to be helpful.'],
  ['vw-idm-11', 'Idioms & Phrases', 10, 'hard', 'Communication', 'Advanced', 'What does "beat around the bush" mean?', ['To avoid getting to the main point', 'To search a forest', 'To speak very loudly', 'To finish early'], 0, 'BEET uh-ROWND thuh BOOSH', 'To discuss a topic indirectly instead of stating the point.', 'Please don’t beat around the bush—tell us the news.', 'It means delaying or avoiding the direct point.'],
  ['vw-idm-12', 'Idioms & Phrases', 10, 'hard', 'Teamwork', 'Advanced', 'What does "pull together" mean?', ['To cooperate and work as a unified team', 'To tug on a rope', 'To cancel an event', 'To travel alone'], 0, 'POOL tuh-GETH-er', 'To work hard together toward a shared goal.', 'When the storm hit, the villagers pulled together.', '"Pull together" means uniting efforts to succeed.'],

  // ==================== I. PICTURE WORD QUEST (12) ====================
  ['vw-pic-1', 'Picture Word Quest', 5, 'easy', 'Visual Vocabulary', 'Foundation', 'Identify the word matching this symbol: 🧭', ['Compass', 'Telescope', 'Hourglass', 'Anchor'], 0, 'KUM-puhs', 'An instrument showing magnetic north for navigation.', 'Explorers rely on a compass in misty valleys.', '🧭 represents a compass used for finding directions.', '🧭'],
  ['vw-pic-2', 'Picture Word Quest', 5, 'easy', 'Visual Vocabulary', 'Foundation', 'Identify the word matching this symbol: 🔦', ['Lantern', 'Feather', 'Scroll', 'Shield'], 0, 'LAN-tern', 'A portable lamp with a protective case.', 'A warm lantern lights up the dark forest trail.', '🔦/🏮 represents a portable light source (lantern/torch).', '🔦'],
  ['vw-pic-3', 'Picture Word Quest', 6, 'easy', 'Visual Vocabulary', 'Foundation', 'Identify the word matching this symbol: 🔭', ['Telescope', 'Microscope', 'Periscope', 'Pendulum'], 0, 'TEL-uh-skohp', 'An optical instrument for viewing distant stars and moons.', 'Through the telescope, craters on the moon looked sharp.', '🔭 is a telescope used in astronomy.', '🔭'],
  ['vw-pic-4', 'Picture Word Quest', 6, 'easy', 'Visual Vocabulary', 'Foundation', 'Identify the word matching this symbol: ⏳', ['Hourglass', 'Sundial', 'Calendar', 'Metronome'], 0, 'OW-ur-glas', 'A glass timer measuring time with flowing sand.', 'Sand trickled steadily through the hourglass.', '⏳ is an hourglass measuring a fixed interval of time.', '⏳'],
  ['vw-pic-5', 'Picture Word Quest', 7, 'medium', 'Visual Vocabulary', 'Intermediate', 'Identify the word matching this symbol: 📜', ['Manuscript', 'Blueprint', 'Ledger', 'Envelope'], 0, 'MAN-yoo-skript', 'A handwritten or ancient rolled document (scroll).', 'The scholar unrolled the ancient manuscript.', '📜 depicts a traditional scroll or manuscript.', '📜'],
  ['vw-pic-6', 'Picture Word Quest', 7, 'medium', 'Visual Vocabulary', 'Intermediate', 'Identify the word matching this symbol: 🌋', ['Volcano', 'Glacier', 'Canyon', 'Plateau'], 0, 'vol-KAY-noh', 'A mountain opening through which molten lava and ash erupt.', 'Steam rose from the dormant volcano.', '🌋 represents an erupting volcano.', '🌋'],
  ['vw-pic-7', 'Picture Word Quest', 8, 'medium', 'Visual Vocabulary', 'Intermediate', 'Identify the word matching this symbol: 🔬', ['Microscope', 'Stethoscope', 'Barometer', 'Binoculars'], 0, 'MY-kruh-skohp', 'An instrument used to see tiny cells and organisms.', 'We observed plant cells under a microscope.', '🔬 is a laboratory microscope.', '🔬'],
  ['vw-pic-8', 'Picture Word Quest', 8, 'medium', 'Visual Vocabulary', 'Intermediate', 'Identify the word matching this symbol: 🏰', ['Fortress', 'Cottage', 'Lighthouse', 'Observatory'], 0, 'FOR-triss', 'A heavily fortified castle or stronghold.', 'The ancient fortress guarded the mountain pass.', '🏰 depicts a fortified castle or fortress.', '🏰'],
  ['vw-pic-9', 'Picture Word Quest', 9, 'hard', 'Visual Vocabulary', 'Advanced', 'Identify the word matching this symbol: ⚖️', ['Equilibrium', 'Turbulence', 'Velocity', 'Friction'], 0, 'ee-kwuh-LIB-ree-uhm', 'A state of balance between opposing forces.', 'The scales rested in perfect equilibrium.', '⚖️ symbolizes balance, justice, and equilibrium.', '⚖️'],
  ['vw-pic-10', 'Picture Word Quest', 9, 'hard', 'Visual Vocabulary', 'Advanced', 'Identify the word matching this symbol: 🧬', ['Genome', 'Molecule', 'Electron', 'Isotope'], 0, 'JEE-nohm', 'The complete set of genetic material (DNA) in an organism.', 'Scientists mapped the plant’s entire genome.', '🧬 represents the DNA double helix and genetics.', '🧬'],
  ['vw-pic-11', 'Picture Word Quest', 10, 'hard', 'Visual Vocabulary', 'Advanced', 'Identify the word matching this symbol: 🌌', ['Galaxy', 'Atmosphere', 'Horizon', 'Eclipse'], 0, 'GAL-uhk-see', 'A vast system of millions or billions of stars held by gravity.', 'The Milky Way is our home galaxy.', '🌌 depicts a starry spiral galaxy.', '🌌'],
  ['vw-pic-12', 'Picture Word Quest', 10, 'hard', 'Visual Vocabulary', 'Advanced', 'Identify the word matching this symbol: 🛡️', ['Aegis', 'Scepter', 'Quill', 'Chalice'], 0, 'EE-jis', 'A shield, protection, or sponsorship.', 'Under the aegis of wisdom, the village thrived.', '🛡️ represents a protective shield or aegis.', '🛡️']
];

const OPTION_IDS: OptionId[] = ['A', 'B', 'C', 'D'];

function inferPartOfSpeech(word: string, topic: string, category: string): string {
  const lower = word.toLowerCase();
  const top = topic.toLowerCase();
  if (category === 'Idioms & Phrases' || word.includes(' ')) return 'Idiom / Phrase';
  if (top.includes('adjective') || /(ous|ful|ant|ent|ic|ive|ble|al)$/.test(lower)) return 'Adjective';
  if (top.includes('adverb') || lower.endsWith('ly')) return 'Adverb';
  if (top.includes('verb') || ['inspect', 'alleviate', 'corroborate', 'shrink', 'convert', 'overflow', 'read', 'rises', 'found'].includes(lower)) return 'Verb';
  if (top.includes('preposition') || ['across', 'from', 'despite'].includes(lower)) return 'Preposition';
  if (top.includes('conjunction') || ['although', 'but'].includes(lower)) return 'Conjunction';
  if (top.includes('pronoun') || ['who', 'which', 'i'].includes(lower)) return 'Pronoun';
  return 'Noun / Academic Term';
}

function buildSyllableBreakdown(word: string, pronunciation: string): string {
  if (pronunciation && pronunciation.includes('-')) {
    return pronunciation.toLowerCase();
  }
  return word.toLowerCase();
}

export const WAR_OF_WORDS_QUESTIONS: WarWordQuestion[] = RAW_QUESTIONS.map((row) => {
  const [
    id,
    category,
    grade,
    difficulty,
    topic,
    vocabLevel,
    prompt,
    opts,
    correctIdx,
    pronunciation,
    meaning,
    exampleSentence,
    explanation,
    visualEmoji
  ] = row;

  const targetWord = opts[correctIdx];
  const distractors = opts.filter((_, idx) => idx !== correctIdx);
  const partOfSpeech = inferPartOfSpeech(targetWord, topic, category);
  const syllables = buildSyllableBreakdown(targetWord, pronunciation);
  const synonyms =
    category === 'Antonym Battle'
      ? [meaning.split(/[;,]/)[0].trim()]
      : [topic, `${targetWord} (related)`];
  const antonyms = distractors.slice(0, 2);
  const commonUsage = `Commonly used in Grade ${grade}+ ${topic.toLowerCase()} and ${category.toLowerCase()} contexts.`;
  const memoryTip = `Connect "${targetWord}" (${pronunciation}) with: "${meaning.slice(0, 48)}${meaning.length > 48 ? '...' : ''}"`;

  return {
    id,
    category,
    grade,
    difficulty,
    topic,
    vocabLevel,
    prompt,
    visualEmoji,
    targetWord,
    pronunciation,
    syllables,
    partOfSpeech,
    meaning,
    exampleSentence,
    synonyms,
    antonyms,
    commonUsage,
    memoryTip,
    explanation,
    options: opts.map((text, idx) => ({ id: OPTION_IDS[idx], text })),
    correctOptionId: OPTION_IDS[correctIdx]
  };
});

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Selects 3 distinct options for the 3 Answer Characters in the 2.5D arena.
 * Always includes the correct option and 2 distinct distractors, randomized in position.
 */
export function selectThreeTargets(question: WarWordQuestion): WarWordOption[] {
  const correct = question.options.find((o) => o.id === question.correctOptionId);
  if (!correct) return question.options.slice(0, 3);
  const distractors = shuffleArray(
    question.options.filter((o) => o.id !== question.correctOptionId)
  ).slice(0, 2);
  return shuffleArray([correct, ...distractors]);
}

/**
 * Strict ID-based validation with duplicate-attack prevention.
 * Prevents repeated attacks from evaluating or scoring the same question more than once.
 */
export function validateWarOfWordsAnswer(
  question: WarWordQuestion,
  selectedOptionId: OptionId,
  evaluatedQuestionIds: Set<string>
): { accepted: boolean; isCorrect: boolean; pointsAwarded: number } {
  if (!question || !question.id || evaluatedQuestionIds.has(question.id)) {
    return { accepted: false, isCorrect: false, pointsAwarded: 0 };
  }
  evaluatedQuestionIds.add(question.id);
  const isCorrect = selectedOptionId === question.correctOptionId;
  return {
    accepted: true,
    isCorrect,
    pointsAwarded: isCorrect ? 100 : 0
  };
}

const MODE_CATEGORY_MAP: Partial<Record<GameModeId, EnglishCategory>> = {
  word_quest: 'Vocabulary Quest',
  synonym_battle: 'Synonym Battle',
  antonym_battle: 'Antonym Battle',
  grammar_challenge: 'Grammar Battle',
  spelling_arena: 'Spelling Challenge',
  sentence_master: 'Sentence Formation'
};

export function buildWarOfWordsDeck(
  mode: GameModeId,
  category: EnglishCategory,
  difficulty: DifficultyLevel,
  grade: number,
  missedQuestions: WarWordQuestion[] = []
): WarWordQuestion[] {
  if (mode === 'revision_mode' && missedQuestions.length > 0) {
    return shuffleArray(missedQuestions);
  }

  const effectiveCat = MODE_CATEGORY_MAP[mode] || category;

  let pool = WAR_OF_WORDS_QUESTIONS.filter((q) => {
    const catOk = effectiveCat === 'All Categories' || q.category === effectiveCat;
    const diffOk = q.difficulty === difficulty;
    const gradeOk = Math.abs(q.grade - grade) <= 3;
    return catOk && diffOk && gradeOk;
  });

  if (pool.length < 6) {
    pool = WAR_OF_WORDS_QUESTIONS.filter(
      (q) => effectiveCat === 'All Categories' || q.category === effectiveCat
    );
  }

  if (pool.length < 6) {
    pool = WAR_OF_WORDS_QUESTIONS;
  }

  const limit = mode === 'shadow_boss' ? 12 : 10;
  return shuffleArray(pool).slice(0, limit);
}
