const fs = require('fs');
const L = require('./lib.js');
const { C, W, P, B, N, H, sp, pageBreak, cell, table, titleBlock, banner, timehacks, shadedBox, headerTable, qCard, makeDoc, TableRow, AlignmentType, Packer } = L;
const CEN = AlignmentType.CENTER;

// ---------- phase data ----------
const PHASES = [
  { n: 1, name: 'SHOW OF FORCE', time: '0920-0940  |  20 Minutes  |  Led by: GLP Lead #1',
    hacks: ['0920 - Read the scenario. Hand out the GMC Guide, Aircraft Reference Cards, and Day 1 Orders. Planning begins', '0930 - Read the C-17 inject', '0933 - Plan locked. GMC brief begins', '0938 - Roll Day 1. Read results, losses, and repairs', '0940 - Day 1 ends'],
    situation: 'China is massing forces on the mainland for a large-scale exercise across the Strait. Higher headquarters wants a visible US air presence over the Marianas to deter further escalation.',
    taskers: [
      ['Fly a show of force over the Marianas', 'Any jet', "China's exercise winds down early.", 'China keeps massing. The pressure on Guam grows.'],
      ['Fly a deterrence CAP', 'Any jet', 'The CAP holds. No Chinese aircraft approach.', 'Chinese fighters probe the air defense zone unchallenged.'],
      ['Escort the bomber task force', 'Any jet', 'The bombers complete the flyover.', 'The bombers turn back early without escort.'],
    ],
    inject: ['0930 INJECT (read aloud)', '"A lost plane from the 62nd Airlift Wing needs refueling and is redirected to your base. It carries 3 food pallets, 5 beds, 20 gallons of water and 10 individual tents. Along with the resources, it has 2 pilots, 1 loadmaster and 5 crew. You must account for this into your resources and take care of the crew indefinitely."',
      'Refueling the C-17 costs 1 Wing Point. The Wing CC must state how the 8 crew are housed and fed. Using the C-17\'s own pallets, beds, water, and tents is a valid answer.'],
    injectResult: ['C-17 inject', 'Wing CC decision', 'The C-17 is refueled and all 8 crew are housed and fed.', 'The crew is left unaccounted for, or the C-17 is ignored.'],
    forecast: "Intelligence expects China's exercise to continue for several more days. A US Navy surface group plans a Freedom of Navigation Operation in international waters near Guam tomorrow, and higher headquarters will likely task the wing to cover it. Chinese destroyers and carrier-based fighters are expected to shadow the transit." },
  { n: 2, name: 'FONOP ESCORT', time: '0940-1000  |  20 Minutes  |  Led by: GLP Lead #1',
    hacks: ['0940 - Hand out Day 2 Orders. Planning begins', '0953 - Plan locked. GMC brief begins', '0958 - Roll Day 2. Read results, losses, and repairs', '1000 - Day 2 ends'],
    situation: 'A US Navy surface group is conducting a Freedom of Navigation Operation (FONOP) in international waters west of Guam. Chinese destroyers and carrier-based J-15 fighters are shadowing it. The Navy destroyers have some anti-air capability, but most of their missiles were expended in recent operations against Iran. Your wing provides air cover.',
    taskers: [
      ['Provide air cover for the Navy FONOP', 'Any jet', "The FONOP completes its transit. China's ships break off.", 'Chinese fighters harass the Navy ships through the transit.'],
      ['Fly DCA over Guam', 'Any jet', "Guam's airspace stays clear.", 'A Chinese drone overflies Andersen.'],
      ['Escort the P-8 patrol', 'Any jet', 'The P-8 locates the Chinese carrier.', 'The P-8 is chased off before finding the carrier.'],
    ],
    forecast: "Higher headquarters is preparing offensive operations if China continues to escalate. Expect strike taskings against Chinese forces in the region within the next 24 hours. Plan to have jets ready that can carry bombs, and expect China to respond against Guam." },
  { n: 3, name: 'STRIKE ASHORE', time: '1005-1025  |  20 Minutes  |  Led by: GLP Lead #2',
    hacks: ['1005 - Hand out Day 3 Orders. Planning begins', '1015 - Read the casualty inject', '1018 - Plan locked. GMC brief begins', '1023 - Roll Day 3. Read results, losses, and repairs', '1025 - Day 3 ends'],
    situation: 'China has landed forces on foreign shores in the region under surface-to-air missile cover. Higher headquarters orders a strike on Chinese forces ashore.',
    taskers: [
      ['Strike Chinese forces ashore', 'Any jet except F-22', "China's forces ashore are hit hard.", "The strike misses. China's forces hold their ground."],
      ['Escort the strike package', 'Any jet', 'The strike package is covered in and out.', 'The strike package fights its way in alone.'],
      ['Fly DCA over Guam', 'Any jet', "Guam's airspace stays clear.", "Chinese aircraft reach the edge of Guam's airspace."],
    ],
    inject: ['1015 INJECT (read aloud)', '"Six U.S. military personnel are requesting urgent medical assistance after their ship was struck by adversarial troops; all members request a place to stay and immediate physical examination. Two are conscious but report concussion symptoms. One was impaled by a metal pole through their stomach. Two have shallow breathing after being shot in the back. One suffered a wound to the arm with massive arterial bleeding. They request an emergency helicopter to pick them up."',
      'The wing has no helicopter. The Wing CC must request a MEDEVAC from higher headquarters and state a triage order. Correct order: arterial bleed first, then the two with shallow breathing, then the impalement (do not remove the pole), then the two concussions.'],
    injectResult: ['Casualty inject', 'Wing CC decision', 'MEDEVAC is requested and the triage order puts the arterial bleed first.', 'No MEDEVAC request, or the arterial bleed is not treated first.'],
    forecast: "China is massing aircraft, missiles, and ships for a direct attack on Andersen AFB. Intelligence assesses a combined missile and fighter raid within the next 24 hours. Every jet the wing keeps Ready tonight will be needed to defend the base tomorrow." },
  { n: 4, name: 'DEFEND ANDERSEN', time: '1025-1045  |  20 Minutes  |  Led by: GLP Lead #2',
    hacks: ['1025 - Hand out Day 4 Orders. Apply the opening strike in the calculator and tell Maintenance which 2 jets went Down', '1038 - Plan locked. GMC brief begins', '1043 - Roll Day 4, then read the end state', '1045 - Day 4 ends'],
    situation: "China launches a missile and fighter raid on Andersen AFB. A first salvo has already hit the flightline. Everything the wing kept ready is what it has left.",
    opening: 'Opening strike: 2 Ready jets go Down before planning (the Proctor Calculator picks which).',
    taskers: [
      ['Intercept the cruise missile wave', 'Any jet', 'The missiles are shot down short of the base.', 'Missiles hit the flightline.'],
      ['Engage the Chinese fighters escorting the raid', 'Any jet', 'The fighter escort is broken up.', 'Chinese fighters press the attack on Andersen.'],
      ['Protect the tanker orbit', 'Any jet', 'The tankers stay on station.', 'The tankers withdraw. Jets are short on fuel.'],
      ['Cover Apra Harbor and the Navy ships in port', 'Any jet', 'The harbor is covered.', 'Navy ships in port take hits.'],
      ['Fly a CAP over Saipan and Tinian', 'Any jet', 'The northern islands stay covered.', 'Chinese aircraft roam the northern Marianas.'],
      ["Strike China's missile launchers", 'Any jet except F-22', 'The launchers are destroyed.', 'The launchers survive to fire again.'],
    ],
    forecast: "None. This is the final day. What the wing kept ready is what it has." },
];

// ===================================================================
// POC GUIDE
// ===================================================================
const poc = [];
poc.push(...titleBlock('SCENARIO - OPERATION ISLAND SPOKE', 'Level II - Directive Performance (intense - stern - no yelling - evaluation/testing environment)'));
poc.push(P([['LLAB 7  |  6 Nov 2026  |  LOC 2.1, EC 2.1, EC 3.1, EC 3.2, WF 1.3 (wargaming)', { size: 18, color: C.grey }]], { align: CEN, after: 200 }));
poc.push(shadedBox([
  P([['END STATE', { bold: true }]], { after: 40 }), P('GMC:', { after: 60 }),
  B('Understand that every jet flown today is a jet that may be broken tomorrow, and that availability decides what a wing can do.'),
  B('Rank competing taskers, match aircraft and munitions to them, and accept risk on purpose.'),
  B('Operate a well planned GLP through the Wing Commander, Ops, and Maintenance cells.'),
  B('Brief the plan and the reasoning behind it in a concise, well thought out manner.', { after: 200 }),
  P('POC:', { after: 60 }),
  B('Enforce the order: Maintenance reports availability before Ops plans.'),
  B('Roll every phase in the open with the Proctor Calculator and read the success or failure line aloud.'),
  B('Run the change of command at the turnaround.'),
  B('Read the assassination inject and run the lockdown.', { level: 1 }),
  B('POC Evaluator takes GLP Lead #1 for debrief.', { level: 1 }),
]));
poc.push(sp(240));
poc.push(headerTable([2200, W - 2200], ['Time', 'Event'], [
  ['0850-0920', 'Setup POC check classrooms and prepare equipment'], ['0910-0920', 'Transit to assigned location'],
  ['0920-0940', 'Day 1: Show of Force. Plan 13 min, GMC brief 5 min, dice 2 min. C-17 inject at 0930'],
  ['0940-1000', 'Day 2: FONOP Escort. Plan 13 min, GMC brief 5 min, dice 2 min'],
  ['1000-1005', 'Turnaround: Wing CC assassinated, lockdown, GLP Lead #2'],
  ['1005-1025', 'Day 3: Strike Ashore. Plan 13 min, GMC brief 5 min, dice 2 min. Casualty inject at 1015'],
  ['1025-1045', 'Day 4: Defend Andersen. Plan 13 min, GMC brief 5 min, dice 2 min, end state'],
  ['1045-1050', 'POC Debrief'], ['1050', 'ENDEX'],
], { firstBold: true, firstCenter: true, center: true }));
poc.push(sp(200));
poc.push(headerTable([3000, W - 3000], ['Group', 'Location'], [['Group 1', 'SAC Basement'], ['Group 2', 'Navy Classroom'], ['Group 3', 'Army Classroom'], ['Group 4', 'Cadet Classroom']], { firstBold: true, firstCenter: true, center: true }));
poc.push(H('Personnel (per group)', { size: 24 }));
poc.push(B('1 POC Proctor: plays the Colonel, reads the situation and injects, runs the Proctor Calculator, rules on arguments'));
poc.push(B('POC Evaluators: at least one per GLP lead (Form 2)'));
poc.push(B('2 attached POC: setup, lockdown, removing materials at the turnaround'));
poc.push(H('Equipment (per group)', { size: 24 }));
poc.push(B('14 GMC Guides and 1 set of Aircraft Reference Cards per cell'));
poc.push(B('1 set of Day 1-4 Orders and Day 1-4 Worksheets (handed out one day at a time)'));
poc.push(B('1 laptop or phone with the Proctor Calculator open, 2 dice as backup, 1 Bunker Card, Form 2s, pencils'));
poc.push(P([['Proctor Calculator: ', { bold: true }], 'https://jtfassbinder-lab.github.io/island-spoke/ (opens on any phone, no sign-in)'], { before: 80 }));
{ const { Paragraph: Pa, ImageRun } = require('docx');
  poc.push(table([2400, W - 2400], [new TableRow({ children: [
    cell([new Pa({ alignment: CEN, children: [new ImageRun({ type: 'png', data: fs.readFileSync(__dirname + '/calc_qr.png'), transformation: { width: 130, height: 130 } })] })], { w: 2400, valign: 'center' }),
    cell([[['PROCTOR CALCULATOR', { bold: true, color: C.navy, size: 24 }]], 'Scan with a phone or open the link on a laptop. Plan the jets and repairs, press Execute, and read the readout aloud.', [['jtfassbinder-lab.github.io/island-spoke', { color: C.grey }]]], { w: W - 2400, valign: 'center' }),
  ] })])); }

// ---------- WHAT IS ACTUALLY GOING ON ----------
poc.push(pageBreak());
poc.push(P([['WHAT IS ACTUALLY GOING ON', { bold: true, size: 30, color: C.navy }]], { align: CEN, after: 60 }));
poc.push(P([['Read this before you proctor. This is how the game works and what you are looking for.', { italics: true, color: C.red }]], { align: CEN, after: 240 }));
poc.push(H('The question the game asks', { before: 0 }));
poc.push(P('How does a commander balance flying today against having jets tomorrow? The wing has 14 fighters and 14 Wing Points per phase. Points pay for flying jets and for fixing them. Every jet that flies may come back broken. The commander never has enough to do everything well.'));
poc.push(H('How a phase works'));
poc.push(N([['The Proctor hands out the Day Orders. ', { bold: true }], 'Each phase has 3 taskers (Phase 4 has 6). Higher headquarters does not rank them.'], { ref: 'nums' }));
poc.push(N([['Maintenance reports. ', { bold: true }], 'How many of each jet are Ready, Down, or Out. Ops cannot plan until this is done.'], { ref: 'nums' }));
poc.push(N([['The Wing CC ranks the taskers ', { bold: true }], 'and splits the 14 points between Ops (flying) and Maintenance (fixing).'], { ref: 'nums' }));
poc.push(N([['Ops assigns jets to taskers. ', { bold: true }], 'Any number of jets can go on one tasker. A tasker can be left uncovered on purpose. Maintenance commits its points to repairs at the same time, before any dice are rolled.'], { ref: 'nums' }));
poc.push(N([['The Wing CC briefs the Colonel (5 min) ', { bold: true }], 'on the ranking, the jets on each tasker, and why.'], { ref: 'nums' }));
poc.push(N([['The Proctor rolls every tasker in the Proctor Calculator ', { bold: true }], 'and reads the success or failure line it shows (also in the guide at the back of this document).'], { ref: 'nums' }));
poc.push(N([['The Proctor reads the outcome: ', { bold: true }], 'which taskers succeeded or failed, which jets were damaged, which jets were repaired, and what is still Down going into the next phase.'], { ref: 'nums' }));
poc.push(H('The one rule for success'));
poc.push(shadedBox([P([['Each jet on a tasker rolls its Mission Success Rate from its aircraft card. If at least one jet on that tasker succeeds, the tasker is a SUCCESS. If every jet fails, or no jet was assigned, it is a FAILURE.', { bold: true, color: C.navy }]], { after: 0 })], C.cream));
poc.push(sp(120));
poc.push(P('There are no other modifiers. A success or failure in one phase never changes the odds in the next. The only thing that carries forward is which jets are broken, repaired, or gone.'));
poc.push(H('What the commander decides'));
poc.push(B([['Which tasker matters most, ', { bold: true }], 'and which can be covered thinly or not at all.']));
poc.push(B([['How many jets, and which jets, ', { bold: true }], 'go on each tasker. More jets or better jets raise the odds, but cost more points and risk more broken jets.']));
poc.push(B([['How to split the points ', { bold: true }], 'between flying now and fixing for later.']));
poc.push(H('Why success is not automatic'));
poc.push(B('There are more taskers than the wing can cover with good odds. A single F-16 is only 33%.'));
poc.push(B('Every jet that flies may break, and fixing it takes points away from flying.'));
poc.push(B('Phase 4 has 6 taskers, 14 points, and starts with 2 jets knocked out. A wing that spent its jets early cannot cover it.'));
poc.push(H('What you are grading'));
poc.push(P('The commander thinking through the problem, not the dice. A Wing CC who ranks taskers with clear reasoning, matches jets to that ranking, and accepts risk on purpose earns a strong Form 2 even if the dice go against them. A Wing CC who wins by luck and cannot explain the plan does not.'));
poc.push(H('Odds reference (at least one success on a tasker)', { size: 24 }));
poc.push(headerTable([5400, W - 5400], ['Jets assigned to one tasker', 'Chance of SUCCESS'], [
  ['1 F-16', '33%'], ['2 F-16s', '56%'], ['3 F-16s', '70%'], ['1 F-15EX', '50% (67% on a strike)'], ['2 F-15EXs', '75%'],
  ['1 F-35A', '67%'], ['1 F-35A + 1 F-16', '78%'], ['1 F-22', '83%'], ['1 F-22 + 1 F-16', '89%'],
], { firstFill: C.label, firstBold: true, center: true }));

// ---------- Explanation ----------
poc.push(pageBreak());
poc.push(banner('START OF THE GLP', '0920  |  No separate explanation. The clock starts on Day 1  |  Led by: POC Proctor'));
poc.push(sp(160));
poc.push(timehacks(['0920 - Read the scenario and hand out materials. Day 1 planning starts immediately', '0920 - No questions after the scenario is read']));
poc.push(H('POC Lead Instructions', { before: 300 }));
poc.push(P('Read the scenario below aloud to all GMC cadets. Establish the following conditions before beginning:'));
poc.push(P([['Scenario:', { bold: true }]], { before: 120, after: 60 }));
poc.push(P('"You are the leadership of a fighter wing at Andersen Air Force Base, Guam. Recent activity on the Chinese mainland shows China is mobilizing. Your job is to keep Andersen at the highest readiness possible and to be seen doing it, as a visual deterrent. If the conflict crosses into open combat, you fight with what you kept ready. You have 14 fighters and 14 Wing Points each phase. Points pay for flying jets and fixing them. You will not have enough to do everything. Each phase you will get a list of taskers. Your Wing Commander decides which matter most. Then brief the Colonel on what you did and why."'));
poc.push(P('Then hand over the GMC Guides and Aircraft Reference Cards. GLP Lead #1 is pre-assigned and takes command. Cadets split into Ops and Maintenance.'));
poc.push(P([['Worked example (optional, 1 minute, counts against Day 1 planning):', { bold: true }]], { before: 120, after: 60 }));
poc.push(B('Maintenance reports: 11 of 14 jets are Ready. 1 F-35A, 1 F-15EX, and 1 F-16 are Down.'));
poc.push(B('Before the roll: the Wing CC ranks a sample tasker #1 and puts an F-35A and an F-16 on it (3 points, 78%). Maintenance commits 3 points to repair the Down F-35A.'));
poc.push(B('The roll: the F-35A fails, the F-16 succeeds, so the tasker is a SUCCESS. The F-35A rolls a 2 on its damage die and goes Down. Proctor reads out: 1 success, 1 F-35A lost today, 1 F-35A repaired and back tomorrow.'));
poc.push(P([['You MAY NOT answer any questions after the briefing has been provided.', { bold: true }]], { before: 200 }));

// ---------- PHASES ----------
function phaseSection(ph) {
  const out = [pageBreak(), banner(`PHASE ${ph.n}  -  ${ph.name}`, ph.time), sp(160), timehacks(ph.hacks)];
  out.push(H(`Day ${ph.n} Orders (hand out at the start of the phase)`, { before: 300 }));
  out.push(P([['The orders sheet gives the GMC the situation, the taskers, the points, and the outlook. Do not read them aloud. Contents for reference:', { italics: true, color: C.grey }]]));
  out.push(P([[`"${ph.situation}"`, { italics: true }]]));
  if (ph.opening) out.push(P([['Before planning: ', { bold: true }], ph.opening]));
  out.push(P([['Wing Points this phase: ', { bold: true }], '14']));
  out.push(H('Taskers on the orders (unranked)'));
  ph.taskers.forEach(t => out.push(B([[t[0], { bold: true }], `  (${t[1]})`])));
  if (ph.inject) {
    out.push(sp(120));
    out.push(shadedBox([P([[ph.inject[0], { bold: true, color: C.red }]], { after: 60 }), P([[ph.inject[1], { italics: true }]], { after: 100 }), P([['Proctor note: ', { bold: true }], ph.inject[2]], { after: 0 })], C.pink));
  }
  out.push(H('GMC Brief (5 min)'));
  out.push(B('The Wing CC briefs the Colonel: availability, the tasker ranking, which jets are on each tasker, what was left uncovered, the points split, and why.'));
  out.push(B('Provide pushback on the assumptions made by the presentation. Use at least one Q&A bank question. Act stern and with limited time.'));
  out.push(H('Dice and Readout (2 min)'));
  out.push(B('Repairs and jets are already committed in the plan. Roll every tasker live in the Proctor Calculator, in the Wing CC\'s ranked order.'));
  out.push(B('Read the outcome aloud: each success or failure line, which jets were damaged, which jets were repaired, and what is still Down going into the next phase.'));
  out.push(H('Outlook printed on the orders'));
  out.push(P(ph.forecast));
  return out;
}
poc.push(...phaseSection(PHASES[0]));
poc.push(...phaseSection(PHASES[1]));

// ---------- TURNAROUND ----------
poc.push(pageBreak());
poc.push(banner('TURNAROUND', '1000-1005  |  5 Minutes  |  Led by: POC Proctor'));
poc.push(sp(160));
poc.push(timehacks(['1000 - Read the inject. Lockdown begins', '1003 - Switch finalized. GMC back in the room', '1005 - Hand out Day 3 Orders. Day 3 planning begins']));
poc.push(H('Read aloud', { before: 300 }));
poc.push(P([['"Your Wing Commander has been assassinated by an insider threat. As a result, your base goes into FPCON Delta. You are forced to go into a bunker."', { italics: true }]]));
poc.push(N('POC Evaluator takes GLP Lead #1 outside for their debrief.', { ref: 'nums2' }));
poc.push(N([['Lockdown: ', { bold: true }], 'all GMC leave the classroom. Any GMC still in the area after 30 seconds is eliminated from the GLP.'], { ref: 'nums2' }));
poc.push(N('Attached POC remove every cadet note and the Day 1 and Day 2 Orders and Worksheets. The Proctor keeps the official record in the calculator.', { ref: 'nums2' }));
poc.push(N('The Day 1 and Day 2 Orders are taken away with everything else. Lead #2 starts Day 3 with only the Bunker Card and the Day 3 Orders.', { ref: 'nums2' }));
poc.push(N('GLP Lead #2 (pre-assigned) takes command. GMC return to the room.', { ref: 'nums2' }));
poc.push(N([['Lead #2 receives only the Bunker Card: ', {}], ['"14 jets assigned. Status unknown. 14 Wing Points per phase."', { italics: true }]], { ref: 'nums2' }));
poc.push(N('During Day 3 planning, Maintenance rebuilds the Day 3 Worksheet board by asking the Proctor about one aircraft type at a time. Answer each truthfully.', { ref: 'nums2' }));
poc.push(N('Lead #1 rejoins Ops after their debrief.', { ref: 'nums2' }));
poc.push(H('What this tests'));
poc.push(B('Whether Lead #2 takes charge without hesitation.'));
poc.push(B('Whether Maintenance can rebuild an accurate picture under pressure.'));

poc.push(...phaseSection(PHASES[2]));
poc.push(...phaseSection(PHASES[3]));
poc.push(sp(120));
poc.push(shadedBox([
  P([['END STATE (read after the Phase 4 dice)', { bold: true, color: C.navy }]], { after: 80 }),
  B([['4 or more of the 6 Phase 4 taskers succeeded: ', { bold: true }], ['"Andersen holds."', { italics: true }]]),
  B([['3 or fewer succeeded: ', { bold: true }], ['"Andersen is overwhelmed."', { italics: true }]]),
  B('Then read how many jets are still Ready out of 14.'),
], C.cream));

// ---------- DEBRIEF ----------
poc.push(sp(300));
poc.push(banner('POC DEBRIEF', '1045-1050  |  5 Minutes  |  Led by: POC Proctor + Evaluators'));
poc.push(sp(160));
poc.push(timehacks(['1045 - Evaluator takes GLP Lead #2 aside for debrief', '1045 - Flight debrief begins (Lead #1 was debriefed at the turnaround)', '1050 - ENDEX']));
poc.push(sp(80));
poc.push(B('Debrief follows the framework: Event Recap, Learning Focal Points, Contributing Factors, Root Causes, Instructional Fixes.'));
poc.push(B('Read the Daily Worksheets in order. Which day cost the wing the jets it needed in Phase 4?'));
poc.push(B('POC should act only to redirect. Minimally intervene.'));

// ---------- APPENDIX ----------
poc.push(pageBreak());
poc.push(P([['APPENDIX - POC EVALUATION GUIDE', { bold: true, size: 28, color: C.navy }]], { align: CEN, after: 300 }));
poc.push(H('Adjudication Steps (every phase)', { align: CEN }));
poc.push(N([['Check the plan. ', { bold: true }], 'Every assigned jet must be Ready, flying and repairs together must fit within the points, and no F-22 on a strike tasker. An illegal jet does not fly.'], { ref: 'nums3' }));
poc.push(N([['Roll each tasker in the Wing CC\'s ranked order. ', { bold: true }], 'Each assigned jet rolls once. Any success = SUCCESS.'], { ref: 'nums3' }));
poc.push(N([['Read the success or failure line aloud ', { bold: true }], 'from the guide at the back.'], { ref: 'nums3' }));
poc.push(N([['Damage check. ', { bold: true }], 'Every jet that flew rolls its Needs Repair number. On a hit it goes Down.'], { ref: 'nums3' }));
poc.push(N([['Apply the planned repairs. ', { bold: true }], 'Jets Maintenance paid to fix before the roll are Ready next phase. Jets damaged today stay Down until a later phase pays to fix them.'], { ref: 'nums3' }));
poc.push(N([['Read out and forecast. ', { bold: true }], 'Read results, losses, repairs, and what is still Down.'], { ref: 'nums3' }));
poc.push(P([['Proctor Calculator: ', { bold: true }], 'before the roll, enter the jets on each tasker and the repairs Maintenance planned. Press Execute. Each jet gets two random numbers from 0 to 99.9, one against its success % and one against its damage %, and the calculator shows both rolls with a timestamp. It also has a phase timer (Plan 13:00, Brief 5:00, Dice 2:00). It says SUCCESS or FAILURE, gives the line to read, moves damaged jets to Down, applies the planned repairs, and only lets the wing use the jets and points it actually has. It carries every day into the next and gives the Proctor a readout to read aloud. If it is unavailable, roll two real dice per jet and use the odds table and the Success/Failure Guide.'], { before: 160 }));
poc.push(H('Points and Maintenance Options', { align: CEN }));
poc.push(headerTable([2600, 1800, W - 4400], ['ACTION', 'POINTS', 'EFFECT'], [
  ['Fly a jet', 'Points to Fly (card)', 'Jet rolls on its assigned tasker'],
  ['Full repair', 'Points to Fix (card)', 'Ready next phase'],
  ['Cannibalize', '0', 'Strip one Down jet to fix another of the same type. The stripped jet is Out for the game'],
  ['Extended shifts (12s)', 'Costs 3', 'Every repair costs 1 less this phase (min 1)'],
  ['Rest', 'Gives +3', 'Every jet flown costs 1 more this phase'],
  ['Refuel the lost C-17', '1', 'Phase 1 inject only'],
], { firstFill: C.label, firstBold: true }));
poc.push(P([['Arguments: ', { bold: true }], 'anything not covered, the player states the action, the result they want, and up to 3 reasons. The Proctor rules Likely (it happens), Unlikely (it does not), or Uncertain (roll 1 die, 4+ succeeds).'], { before: 160 }));

poc.push(pageBreak());
poc.push(H('What Strong Performance Looks Like', { align: CEN }));
poc.push(headerTable([2600, W - 2600], ['CRITERION', 'WHAT TO LOOK FOR'], [
  ['Ranking the Taskers', 'Wing CC ranks taskers every phase and can say why #1 is #1.'],
  ['Jets Match the Ranking', 'The best odds go on the top-ranked tasker. Thin or uncovered taskers are the low-ranked ones, by choice.'],
  ['Availability Drives the Plan', 'Ops waits for the Maintenance report and only plans with Ready jets.'],
  ['Points Split Logic', 'Wing CC splits points between flying and fixing with a stated reason.'],
  ['Saving for Phase 4', 'The wing protects enough jets and points to cover Phase 4. Says so out loud.'],
  ['Inject Handling', 'Accounts for the C-17 crew. Requests a MEDEVAC and triages the arterial bleed first.'],
  ['Brief Clarity', 'Covers availability, ranking, jets per tasker, points split, and why. Military bearing maintained.'],
  ['New Lead', 'Lead #2 takes charge without hesitation and has Maintenance rebuild the picture fast.'],
], { hdr: C.green, firstFill: C.lightGreen, firstBold: true, firstCenter: true, center: true }));
poc.push(H('Common Failure Modes', { align: CEN, before: 360 }));
poc.push(P('Note: for the POC in charge/"Colonel," this should be provided during the brief or debrief, not during execution. If they fail during execution, provide pushback during their brief and act upset.', { align: CEN }));
poc.push(headerTable([2300, 3400, W - 5700], ['FAILURE MODE', 'WHAT IT LOOKS LIKE', 'HOW TO HANDLE'], [
  ['No ranking', 'Every tasker gets one jet, no priority stated', 'Ask: "Which of these mattered most, and does your plan show it?"'],
  ['Ops plans before Maintenance reports', 'Ops picks jets that are Down', 'Rule the jet illegal. Ask who told them it was Ready.'],
  ['Fly everything early', 'All points to flying, no repairs, availability drops', 'Let it happen. In Phase 4 ask: "Where are the jets you flew in Phase 1?"'],
  ['Wrong weapons', 'Cadets brief air-to-air missiles for a strike, or an F-22 on a strike tasker', 'Ask what that weapon does against a ground target. An F-22 on a strike is illegal.'],
  ['Ignoring the inject', 'C-17 crew or casualties never addressed', 'Mark it a FAILURE and ask about it at the brief.'],
  ['No rationale', 'Cadet assigns jets but cannot explain why', "Push: 'Walk me through your reasoning.' Note if unable to articulate."],
  ['New Lead paralysis', 'Lead #2 defers, group argues, no one rebuilds the picture', 'Note as leadership observation. Do not intervene unless full breakdown.'],
], { hdr: C.red, firstFill: C.pink, firstBold: true, firstCenter: true, center: true, italicCol: 2 }));
poc.push(H('Grader Reminders', { before: 360 }));
poc.push(B('The standard is REASONING, not the dice. A strong plan that loses a roll still earns a strong Form 2.'));
poc.push(B('A jet that is Down cannot fly, and an F-22 cannot fly a strike tasker. Immediate correction. This is a hard knowledge failure.'));
poc.push(B('Probe every phase where the plan does not match the stated ranking.'));
poc.push(sp(160));
poc.push(shadedBox([P([['KEY TEACHING MOMENT:  ', { bold: true, color: C.gold }], ['Most cadets will try to do every tasker every phase. Push them on three things: (1) a commander chooses what matters most and accepts risk on the rest, (2) every sortie today is a repair tomorrow, and (3) readiness is a decision the wing makes every phase, not something it is handed.', { color: C.navy }]], { after: 0 })], C.cream));

poc.push(pageBreak());
poc.push(P([['POC Q&A BANK', { bold: true, size: 28, color: C.navy }]], { after: 60 }));
poc.push(P([['Inject at least 2 questions per group during each brief.', { italics: true, color: C.red }]], { after: 200 }));
[
  ['Why was that tasker your #1?', 'Prioritization / commander intent', "Ties the #1 tasker to the higher headquarters intent (deter China, defend Guam) and explains what failing it would cost.", 'If the ranking is arbitrary: ask what happens to the mission if that tasker fails versus the others.'],
  ['Do your jets match your ranking?', 'Resourcing the priority', 'The highest odds are on the #1 tasker. The commander can name which tasker they covered thinly on purpose.', 'If the #1 tasker has one F-16: ask what the odds were and why they accepted them.'],
  ['Why did you fly that many jets this early?', 'Flying today vs. jets tomorrow', 'Explains how many jets and points they expect to need in later phases and what they held back.', 'If they flew everything: ask what they will have left if China attacks the base.'],
  ['Lead #2, how did you rebuild the picture after the bunker?', 'Mission command / taking charge', 'Had Maintenance query the Proctor by aircraft type, set the ranking fast, and kept the wing moving.', 'If Lead #2 froze: ask what they knew at 1005 and how they found it out.'],
  ['Which Phase 4 tasker did you leave uncovered, and why?', 'Accepting risk', 'Names it, explains why it ranked last, and what the wing loses if it fails.', 'If they spread jets evenly: ask which failure would hurt Andersen most.'],
].forEach((q, i) => { poc.push(qCard(i + 1, ...q)); poc.push(sp(200)); });

// ---------- FORMS ----------
poc.push(pageBreak());
poc.push(P([['FORMS', { bold: true, size: 28, color: C.navy }]], { align: CEN, after: 200 }));
poc.push(P('The wing keeps one Daily Worksheet per day (separate document: Island_Spoke_GMC_Daily_Worksheets). The top half is that day\'s Availability Board, which Maintenance fills and briefs first. The bottom half is the plan, points split, and results.'));

// ---------- SUCCESS / FAILURE GUIDE (bottom) ----------
poc.push(pageBreak());
poc.push(P([['SUCCESS / FAILURE GUIDE', { bold: true, size: 30, color: C.navy }]], { align: CEN, after: 60 }));
poc.push(P([['Read the line that matches each result aloud. A tasker is a SUCCESS if at least one assigned jet succeeds.', { italics: true, color: C.red }]], { align: CEN, after: 240 }));
PHASES.forEach(ph => {
  poc.push(H(`Phase ${ph.n}: ${['Show of Force','FONOP Escort','Strike Ashore','Defend Andersen'][ph.n-1]}`, { before: 200 }));
  const rows = ph.taskers.map(t => [t[0], t[1], t[2], t[3]]);
  if (ph.injectResult) rows.push(ph.injectResult);
  poc.push(headerTable([2500, 1300, 2780, 2780], ['TASKER', 'WHO CAN FLY', 'SUCCESS', 'FAILURE'], rows, { hdr: C.navy, firstFill: C.label, firstBold: true }));
});
poc.push(sp(400));
poc.push(P([['- END OF GLP - OPERATION ISLAND SPOKE -', { bold: true, size: 28, color: C.navy }]], { align: CEN }));

// ===================================================================
// GMC GUIDE (one page)
// ===================================================================
const gmc = [];
gmc.push(P([['SCENARIO - OPERATION ISLAND SPOKE', { bold: true, size: 32, color: C.navy }]], { align: CEN, after: 80, bottomRule: true }));
const sh = (parts, o = {}) => P(parts, { shade: C.boxBlue, after: 0, size: 20, ...o });
const sb = (parts) => B(parts, { shade: C.boxBlue, after: 0, size: 20 });
gmc.push(P([['Scenario:', { bold: true }]], { after: 40, before: 120 }));
gmc.push(sh('You are the leadership of a fighter wing at Andersen AFB, Guam. China is mobilizing. Keep Andersen at the highest readiness possible and be seen doing it. If the conflict turns into a fight, you fight with what you kept ready.'));
gmc.push(P([['Mission:', { bold: true }]], { after: 40, before: 160 }));
gmc.push(sb([['Intent from higher headquarters: ', { bold: true }], 'Deter China. If deterrence fails, defend Guam.']));
gmc.push(sb('Each day you get printed Day Orders with the situation and taskers. The Wing Commander ranks the taskers.'));
gmc.push(sb('Assign jets to each tasker. You do not have enough to do everything well.'));
gmc.push(sb('Keep enough jets ready for later. A jet that flies today may be broken tomorrow.'));
gmc.push(sb([['Brief the Colonel after every phase ', { bold: true }], 'on what you did and ', ['why', { bold: true }], '.']));
gmc.push(P([['Your Cells:', { bold: true }]], { after: 40, before: 160 }));
gmc.push(headerTable([2400, W - 2400], ['Cell', 'Your job each phase'], [
  ['Wing Commander', 'Rank the taskers. Split the 14 points between Ops and Maintenance. Brief the Colonel.'],
  ['Ops', 'Assign Ready jets to taskers. Decide how many jets go on each.'],
  ['Maintenance', 'Report how many jets are Ready, Down, and Out. Commit points to fix broken jets before the roll.'],
], { firstFill: C.label, firstBold: true }));
gmc.push(P([['Rules:', { bold: true }]], { after: 40, before: 160 }));
[
  [['Success: ', { bold: true }], 'each jet on a tasker rolls its success rate from its card. If at least one jet succeeds, the tasker succeeds.'],
  [['Points: ', { bold: true }], 'you get 14 per phase. Flying and fixing jets both cost points. Unused points are lost.'],
  'Every jet that flies may come back broken. It stays down until Maintenance pays to fix it.',
  'An F-22 carries air-to-air weapons only, so it cannot fly a strike. When you brief, say what weapons each jet carries (see the Aircraft Reference Cards).',
  'Repairs are planned with the rest of the plan, before the dice. A repaired jet is Ready the next day.',
  'Maintenance reports first. Ops cannot plan until it does.',
  'Anything not covered: state the action, the result you want, and up to 3 reasons. The Proctor rules.',
].forEach(r => gmc.push(sb(r)));
gmc.push(P([['Each Day (20 min): ', { bold: true }], 'Plan 13 min, brief the Colonel 5 min, dice 2 min.'], { after: 40, before: 160 }));
gmc.push(P([['What to Brief (every phase):', { bold: true }]], { after: 40, before: 100 }));
gmc.push(N([['Availability: ', { bold: true }], 'how many jets are Ready, by type.'], { ref: 'nums4' }));
gmc.push(N([['Ranking: ', { bold: true }], 'your taskers in order, and why #1 is #1.'], { ref: 'nums4' }));
gmc.push(N([['Jets: ', { bold: true }], 'which jets on which tasker, and what you left uncovered.'], { ref: 'nums4' }));
gmc.push(N([['Points: ', { bold: true }], 'how you split flying and fixing, and why.'], { ref: 'nums4' }));


// ===================================================================
// GMC DAY ORDERS (one page per day)
// ===================================================================
const ord = [];
const OTIME = [
  ['Plan 0920-0933', 'Brief the Colonel 0933-0938', 'Dice and readout 0938-0940'],
  ['Plan 0940-0953', 'Brief the Colonel 0953-0958', 'Dice and readout 0958-1000'],
  ['Plan 1005-1018', 'Brief the Colonel 1018-1023', 'Dice and readout 1023-1025'],
  ['Plan 1025-1038', 'Brief the Colonel 1038-1043', 'Dice and readout 1043-1045'],
];
const OUTLOOK = PHASES.map(p => p.forecast);
PHASES.forEach((ph, i) => {
  if (i) ord.push(pageBreak());
  ord.push(banner(`DAY ${ph.n} ORDERS  -  ${ph.name}`, 'FROM: Higher Headquarters   |   TO: Wing Commander, Andersen AFB'));
  ord.push(sp(160));
  ord.push(P([['1. Situation', { bold: true, color: C.navy, size: 24 }]], { after: 60 }));
  ord.push(P(ph.situation));
  if (ph.opening) ord.push(shadedBox([P([['Before you plan: ', { bold: true }], "China's opening strike has knocked out 2 of your Ready jets. Maintenance will confirm which."], { after: 0 })], C.pink));
  ord.push(P([['2. Intent', { bold: true, color: C.navy, size: 24 }]], { before: 160, after: 60 }));
  ord.push(P("Deter China. If deterrence fails, defend Guam. The Wing Commander decides where the wing's jets and points go today."));
  ord.push(P([['3. Taskers', { bold: true, color: C.navy, size: 24 }]], { before: 160, after: 60 }));
  ph.taskers.forEach(t => ord.push(B(t[0])));
  ord.push(P([['4. Resources', { bold: true, color: C.navy, size: 24 }]], { before: 160, after: 60 }));
  ord.push(B([['Wing Points today: ', { bold: true }], '14', ' (flying and repairs together)']));
  ord.push(B('Jets: as reported by Maintenance on today\'s Worksheet.'));
  ord.push(B('Repairs are planned with the rest of the plan, before the dice. A repaired jet is Ready tomorrow.'));
  ord.push(P([['5. Timeline', { bold: true, color: C.navy, size: 24 }]], { before: 160, after: 60 }));
  OTIME[i].forEach(t => ord.push(B(t)));
  ord.push(P([['6. Outlook', { bold: true, color: C.navy, size: 24 }]], { before: 160, after: 60 }));
  ord.push(P(OUTLOOK[i]));
});

(async () => {
  fs.writeFileSync('Operation_Island_Spoke_POC_Guide.docx', await Packer.toBuffer(makeDoc(poc)));
  fs.writeFileSync('Operation_Island_Spoke_GMC_Guide.docx', await Packer.toBuffer(makeDoc(gmc)));
  fs.writeFileSync('Operation_Island_Spoke_GMC_Day_Orders.docx', await Packer.toBuffer(makeDoc(ord)));
  console.log('done');
})();
