const fs = require('fs');
const L = require('./lib.js');
const { C, W, P, B, N, H, sp, pageBreak, cell, table, banner, timehacks, shadedBox, headerTable, qCard, makeDoc, TableRow, AlignmentType, Packer } = L;
const { Paragraph: Pa, ImageRun } = require('docx');
const CEN = AlignmentType.CENTER;
const note = (t) => P([[t, { size: 18, color: C.grey }]], { after: 80 });
const sec = (t, o = {}) => H(t, { before: o.before ?? 200, size: 26 });

const DAYS = [
  { n: 1, name: 'Show of Force', time: '0920-0940', plan: '0920-0933', brief: '0933-0938', dice: '0938-0940', lead: 'GLP Lead #1',
    sit: 'China is massing forces for a large exercise across the Strait. Higher headquarters wants a visible US air presence over the Marianas.',
    taskers: [
      ['Fly a show of force over the Marianas', "China's exercise winds down early.", 'China keeps massing. The pressure on Guam grows.'],
      ['Fly a deterrence CAP', 'The CAP holds. No Chinese aircraft approach.', 'Chinese fighters probe the air defense zone unchallenged.'],
      ['Escort the bomber task force', 'The bombers complete the flyover.', 'The bombers turn back early without escort.'],
    ],
    inject: ['0930', 'C-17 inject', 'Success: they refuel it (1 point) and say how the 8 crew are housed and fed (the C-17\'s own pallets, beds, water, and tents are a good answer). Failure: the crew is never addressed.'],
    push: 'Nothing shoots back today, so most wings fly everything. Ask what that costs them on Day 4.' },
  { n: 2, name: 'FONOP Escort', time: '0940-1000', plan: '0940-0953', brief: '0953-0958', dice: '0958-1000', lead: 'GLP Lead #1',
    sit: 'A Navy surface group transits international waters west of Guam, shadowed by Chinese destroyers and J-15s. The Navy spent most of its missiles in Iran. The wing provides air cover.',
    taskers: [
      ['Provide air cover for the Navy FONOP', "The FONOP completes its transit. China's ships break off.", 'Chinese fighters harass the Navy ships through the transit.'],
      ['Fly DCA over Guam', "Guam's airspace stays clear.", 'A Chinese drone overflies Andersen.'],
      ['Escort the P-8 patrol', 'The P-8 locates the Chinese carrier.', 'The P-8 is chased off before finding the carrier.'],
    ],
    push: 'Ask whether they are fixing jets for tomorrow or only flying today. Lead #1 should name what the wing must protect going forward.' },
  { n: 3, name: 'Strike Ashore', time: '1005-1025', plan: '1005-1018', brief: '1018-1023', dice: '1023-1025', lead: 'GLP Lead #2',
    sit: 'China has landed forces on foreign shores under surface-to-air missile cover. Higher headquarters orders a strike on Chinese forces ashore.',
    taskers: [
      ['Strike Chinese forces ashore (no F-22)', "China's forces ashore are hit hard.", "The strike misses. China's forces hold their ground."],
      ['Escort the strike package', 'The strike package is covered in and out.', 'The strike package fights its way in alone.'],
      ['Fly DCA over Guam', "Guam's airspace stays clear.", "Chinese aircraft reach the edge of Guam's airspace."],
    ],
    inject: ['1015', 'Casualty inject', 'Success: they request a MEDEVAC from higher headquarters and treat the arterial bleed first, then the two with shallow breathing, then the impalement (leave the pole in), then the concussions. Failure: no MEDEVAC request, or the bleed is not first.'],
    push: 'Lead #2 is new and working from the Bunker Card. Watch whether they rebuild the picture before committing jets.' },
  { n: 4, name: 'Defend Andersen', time: '1025-1045', plan: '1025-1038', brief: '1038-1043', dice: '1043-1045', lead: 'GLP Lead #2',
    sit: 'China launches a missile and fighter raid on Andersen AFB. The opening strike knocks out 2 Ready jets before planning.',
    taskers: [
      ['Intercept the cruise missile wave', 'The missiles are shot down short of the base.', 'Missiles hit the flightline.'],
      ['Engage the Chinese fighters escorting the raid', 'The fighter escort is broken up.', 'Chinese fighters press the attack on Andersen.'],
      ['Protect the tanker orbit', 'The tankers stay on station.', 'The tankers withdraw. Jets are short on fuel.'],
      ['Cover Apra Harbor and the Navy ships in port', 'The harbor is covered.', 'Navy ships in port take hits.'],
      ['Fly a CAP over Saipan and Tinian', 'The northern islands stay covered.', 'Chinese aircraft roam the northern Marianas.'],
      ["Strike China's missile launchers (no F-22)", 'The launchers are destroyed.', 'The launchers survive to fire again.'],
    ],
    push: 'Six taskers and not enough jets. Ask which tasker they left thin or uncovered on purpose, and why.' },
];

// ================= PROCTOR GUIDE =================
const g = [];
g.push(banner('PROCTOR GUIDE  -  OPERATION ISLAND SPOKE', 'For the POC Proctor and the 2 Support POC in each group  |  Level II - Directive Performance'));
g.push(sp(120));
g.push(P([['The Proctor ', { bold: true }], 'runs the game and plays the Colonel: hands out orders, reads the injects, takes each brief, runs the calculator, and reads the outcome. ', ['The 2 Support POC ', { bold: true }], 'work for the Proctor: setup, hand-outs, the lockdown, and cleanup. Evaluators have their own card.']));
g.push(table([1900, W - 1900], [new TableRow({ children: [
  cell([new Pa({ alignment: CEN, children: [new ImageRun({ type: 'png', data: fs.readFileSync(__dirname + '/calc_qr.png'), transformation: { width: 110, height: 110 } })] })], { w: 1900 }),
  cell([[['PROCTOR CALCULATOR', { bold: true, color: C.navy, size: 22 }]], 'Scan with a phone or open on a laptop. No sign-in needed. Press Reset game before 0920. If the calculator blocks something, a red message appears at the bottom of the screen.',
    '1. Add the jets Ops assigned to each tasker, and the repairs Maintenance planned.', '2. Press Execute. Every jet gets a success roll and a damage roll.', '3. Read the readout aloud, then press Close Day.',
    [['jtfassbinder-lab.github.io/island-spoke', { color: C.grey, size: 18 }]]], { w: W - 1900 }),
] })]));
g.push(sec('Timeline'));
g.push(headerTable([1300, 4300, W - 5600], ['Time', 'Proctor', 'Support POC'], [
  ['0850', '', 'Set up the room (Setup checklist).'],
  ['0920', 'Read the scenario. Name GLP Lead #1. Clock starts.', 'Hand out GMC Guides, Aircraft Cards, Day 1 Orders and Worksheet.'],
  ['0930', 'Read the C-17 inject.', ''],
  ['0933', 'Day 1 brief (5 min). You are the Colonel.', ''],
  ['0938', 'Execute Day 1. Read the readout. Close the day.', ''],
  ['0940', 'Day 2 begins.', 'Hand out Day 2 Orders and Worksheet.'],
  ['0953 / 0958', 'Day 2 brief, then Execute and readout.', ''],
  ['1000', 'Read the assassination inject. Name Lead #2.', 'Run the lockdown (Turnaround section).'],
  ['1005', 'Give Lead #2 the Bunker Card.', 'Hand out Day 3 Orders and Worksheet.'],
  ['1015', 'Read the casualty inject.', ''],
  ['1018 / 1023', 'Day 3 brief, then Execute and readout.', ''],
  ['1025', 'Press Apply opening strike. Tell Maintenance which 2 jets went Down.', 'Hand out Day 4 Orders and Worksheet.'],
  ['1038 / 1043', 'Day 4 brief, then Execute. Read the readout and end state.', ''],
  ['1045', 'Flight debrief (Debrief section).', ''],
  ['1050', 'ENDEX. Press Copy summary (or Export) and send it to the Activity Lead.', 'Collect papers. Reset the room.'],
], { firstFill: C.label, firstBold: true, firstCenter: true }));

// ---- how the game works
g.push(sec('How the game works'));
g.push(P('Each day the wing gets orders with taskers. Ops assigns jets to taskers. Maintenance reports which jets are Ready, Down, or Out, and plans repairs. The Wing Commander splits 14 Wing Points between flying and fixing, then briefs you. You roll and read what happened.'));
g.push(shadedBox([P([['THE ONE RULE: ', { bold: true, color: C.gold }], ['Each jet on a tasker rolls against its success %. If at least one jet succeeds, the tasker SUCCEEDS. If every jet fails or no jet was assigned, it FAILS. Every jet that flew also rolls for damage. A damaged jet is Down until Maintenance pays to fix it.', { bold: true, color: C.navy }]], { after: 0 })], C.cream));
g.push(sec('Hard rules to enforce'));
g.push(B([['Maintenance reports first. ', { bold: true }], 'Ops cannot plan until Maintenance says how many jets are Ready, Down, and Out.']));
g.push(B([['A Down jet cannot fly. ', { bold: true }], 'The calculator will not let you add one.']));
g.push(B([['An F-22 cannot fly a strike tasker. ', { bold: true }], 'It carries air-to-air weapons only.']));
g.push(B([['14 Wing Points per day, ', { bold: true }], 'flying and repairs together. Unused points are lost. The calculator blocks anything over budget.']));
g.push(B([['Repairs are planned before the roll. ', { bold: true }], 'Only jets that were Down at the start of the day can be fixed. A repaired jet is Ready the next day.']));
g.push(B([['Weapons are briefed, not calculated. ', { bold: true }], 'Ask what each jet carries. If they brief air-to-air missiles for a strike, ask what that does to a ground target.']));
g.push(sec('Aircraft (same numbers as the cards)'));
g.push(headerTable([1700, 900, 1700, 1700, 1500, 1860], ['Aircraft', 'Qty', 'Success', 'Damage', 'Points to fly', 'Points to fix'], [
  ['F-22', '2', '83%', '67%', '4', '5'], ['F-35A', '3', '67%', '50%', '2', '3'], ['F-15EX', '4', '50% (67% strike)', '33%', '2', '3'], ['F-16', '5', '33%', '17%', '1', '2'],
], { firstFill: C.label, firstBold: true, center: true }));
g.push(note('Day 1 start: 11 of 14 Ready. 1 F-35A, 1 F-15EX, and 1 F-16 are Down.'));
g.push(sec('Odds on one tasker (at least one jet succeeds)'));
g.push(headerTable([2340, 2340, 2340, 2340], ['Jets', 'Odds', 'Jets', 'Odds'], [
  ['1 F-16', '33%', '1 F-35A', '67%'], ['2 F-16s', '56%', '1 F-35A + 1 F-16', '78%'], ['1 F-15EX', '50%', '1 F-22', '83%'], ['2 F-15EXs', '75%', '1 F-22 + 1 F-16', '89%'],
], { firstFill: C.label, firstBold: true, center: true }));
g.push(sec('Maintenance options (all cost Wing Points)'));
g.push(headerTable([2600, 1800, W - 4400], ['Option', 'Points', 'Effect'], [
  ['Repair', 'Points to fix', 'Ready tomorrow'],
  ['Cannibalize', '0', 'Needs 2 Down jets of the same type. One is stripped for parts and is Out for good, the other is fixed. Not possible on Day 1.'],
  ['Extended shifts (12s)', 'Costs 3', 'Every repair costs 1 less today'],
  ['Rest', 'Gives +3', 'Every jet flown costs 1 more today'],
], { firstFill: C.label, firstBold: true }));
g.push(note('Anything not covered: the cadet states the action, the result, and up to 3 reasons. You rule Likely, Unlikely, or Uncertain (calculator argument roll, 50%).'));

// ---- setup
g.push(sec('Setup (Support POC, 0850-0920)'));
g.push(N('Check the room: tables for 14.', { ref: 'nums' }));
g.push(N('Stack the Day 1-4 Orders and the Day 1-4 Worksheets in order. Each day\'s Worksheet goes out with that day\'s Orders.', { ref: 'nums' }));
g.push(N('At seats: 14 GMC Guides, Aircraft Reference Cards, pencils.', { ref: 'nums' }));
g.push(N('Hold for the Proctor: Day 1-4 Orders in order, the Bunker Card, 2 dice as backup.', { ref: 'nums' }));
g.push(N('Give Evaluators their Form 2s and the Evaluator Card.', { ref: 'nums' }));
g.push(N('Open the calculator on the Proctor\'s device, select the group, and press Reset game.', { ref: 'nums' }));
g.push(headerTable([3000, W - 3000], ['Group', 'Room'], [['Group 1', 'SAC Basement'], ['Group 2', 'Navy Classroom'], ['Group 3', 'Army Classroom'], ['Group 4', 'Cadet Classroom']], { firstFill: C.label, firstBold: true, center: true }));
g.push(sec('Scenario (Proctor reads at 0920)'));
g.push(P([['"You are the leadership of a fighter wing at Andersen Air Force Base, Guam. Recent activity on the Chinese mainland shows China is mobilizing. Your job is to keep Andersen at the highest readiness possible and to be seen doing it, as a visual deterrent. You have 14 fighters and 14 Wing Points each day. Points pay for flying jets and fixing them. You will not have enough to do everything. Each day you get orders with taskers. Brief the Colonel on what you will do and why. If this turns into a fight, you fight with what you kept ready."', { italics: true }]]));
g.push(P([['Then: ', { bold: true }], 'name GLP Lead #1 (BCL only). Cadets split into Ops and Maintenance. ', ['No questions after this point.', { bold: true }]]));
g.push(sec('Worked example (optional, 1 minute)'));
g.push(B('Maintenance reports 11 of 14 Ready. The Wing CC puts an F-35A and an F-16 on one tasker (3 points, 78%) and Maintenance spends 3 points to repair the Down F-35A.'));
g.push(B('The roll: the F-35A misses, the F-16 hits, so the tasker SUCCEEDS. The F-35A is damaged and goes Down.'));
g.push(B('Readout: "1 success. 1 F-35A lost today. 1 F-35A repaired and back tomorrow."'));
g.push(sec('At every brief (5 minutes)'));
g.push(P('The Wing CC should cover: how many jets are Ready, which jets go on each tasker and what weapons they carry, what was left uncovered, how the 14 points are split, and why. Push back on assumptions. Act stern and keep it to time. Ask at least one Colonel question.'));

// ---- pages 4-5: day by day
g.push(pageBreak());
g.push(sec('Day by Day', { before: 0 }));
g.push(note('Hand out each Day\'s Orders at the start. Do not read them aloud. Read the success or failure line for each tasker from the calculator readout.'));
DAYS.forEach(d => {
  g.push(P([[`DAY ${d.n}: ${d.name.toUpperCase()}`, { bold: true, color: C.white, size: 22 }], [`   ${d.time}  |  Plan ${d.plan}, brief ${d.brief}, dice ${d.dice}  |  ${d.lead}`, { color: C.white, size: 18 }]], { shade: C.bannerSub, before: 200, after: 80 }));
  g.push(P([['Situation: ', { bold: true }], d.sit]));
  if (d.n === 4) g.push(P([['Before planning: ', { bold: true }], 'press Apply opening strike in the calculator and tell Maintenance which 2 jets went Down.']));
  g.push(headerTable([3000, 3180, 3180], ['TASKER', 'SUCCESS (read)', 'FAILURE (read)'], d.taskers, { hdr: C.navy, firstFill: C.label, firstBold: true }));
  if (d.inject) g.push(P([[`${d.inject[0]} ${d.inject[1]}: `, { bold: true, color: C.red }], d.inject[2]], { before: 80 }));
  g.push(P([['Push at the brief: ', { bold: true }], d.push], { before: 60 }));
});

// ---- page 5/6: turnaround, injects text
g.push(sec('Injects (read word for word)'));
g.push(P([['0930 C-17: ', { bold: true }], ['"A lost plane from the 62nd Airlift Wing needs refueling and is redirected to your base. It carries 3 food pallets, 5 beds, 20 gallons of water and 10 individual tents. Along with the resources, it has 2 pilots, 1 loadmaster and 5 crew. You must account for this into your resources and take care of the crew indefinitely."', { italics: true }]]));
g.push(P([['1015 Casualties: ', { bold: true }], ['"Six U.S. military personnel are requesting urgent medical assistance after their ship was struck by adversarial troops; all members request a place to stay and immediate physical examination. Two are conscious but report concussion symptoms. One was impaled by a metal pole through their stomach. Two have shallow breathing after being shot in the back. One suffered a wound to the arm with massive arterial bleeding. They request an emergency helicopter to pick them up."', { italics: true }]]));
g.push(note('Mark each inject as success or failure in the calculator before you press Execute.'));
g.push(sec('Turnaround (1000-1005)'));
g.push(P([['Proctor reads: ', { bold: true }], ['"Your Wing Commander has been assassinated by an insider threat. As a result, your base goes into FPCON Delta. You are forced to go into a bunker."', { italics: true }]]));
g.push(headerTable([1300, 4000, W - 5300], ['Time', 'Proctor', 'Support POC (lockdown)'], [
  ['1000', 'Read the inject. Evaluator takes Lead #1 outside.', 'Move every GMC out. Anyone inside after 30 seconds is eliminated from the GLP.'],
  ['1001', 'Name GLP Lead #2 (BCL only).', 'Remove every note and the Day 1 and Day 2 Orders and Worksheets.'],
  ['1003', 'Give Lead #2 only the Bunker Card.', 'Tell the Proctor the room is clear. Bring GMC back in.'],
  ['1005', 'Day 3 begins.', 'Hand out Day 3 Orders and Worksheet.'],
], { firstFill: C.label, firstBold: true, firstCenter: true }));
g.push(shadedBox([P([['BUNKER CARD: ', { bold: true }], '"14 jets assigned. Status unknown. 14 Wing Points per day."'], { after: 60 }),
  P('Maintenance rebuilds the Day 3 Worksheet board by asking you about one aircraft type at a time. Answer each truthfully from the calculator\'s Fleet panel. Lead #1 rejoins Ops after their debrief.', { after: 0 })], C.cream));
g.push(sec('End state (after the Day 4 roll)'));
g.push(B([['4 or more of the 6 Day 4 taskers succeeded: ', { bold: true }], ['"Andersen holds."', { italics: true }]]));
g.push(B([['3 or fewer: ', { bold: true }], ['"Andersen is overwhelmed."', { italics: true }]]));
g.push(B('Then read how many jets are Ready out of 14. The calculator readout shows both.'));

// ---- page 6: questions, failure modes, debrief
g.push(pageBreak());
g.push(sec('Colonel\'s questions (at least one per brief)', { before: 0 }));
g.push(headerTable([3000, 3400, W - 6400], ['QUESTION', 'GOOD ANSWER', 'IF THEY ARE WRONG'], [
  ['Why did you put your best jets on that tasker?', 'Ties it to the intent (deter China, defend Guam) and says what failing it would cost.', 'Ask what happens if that tasker fails versus the others.'],
  ['What did you leave uncovered, and what does that cost you?', 'Names the tasker and the risk, and why it was the right one to give up.', 'If they covered everything thinly, ask what the odds were on each.'],
  ['How many jets will you have left if China attacks the base?', 'Explains what they held back and what they are repairing.', 'If they flew everything, ask where those jets will be on Day 4.'],
  ['What weapons is each jet carrying, and why?', 'Matches weapons to the tasker: air-to-air missiles for DCA and escort, bombs for a strike.', 'Ask what an air-to-air missile does against a ground target.'],
], { hdr: C.navy, firstFill: C.label, firstBold: true, italicCol: 2 }));
g.push(sec('Common problems'));
g.push(headerTable([2400, 3400, W - 5800], ['PROBLEM', 'WHAT IT LOOKS LIKE', 'HOW TO HANDLE'], [
  ['Ops plans first', 'Assigns jets that are Down', 'The calculator blocks it. Ask who told them the jet was Ready.'],
  ['Flies everything early', 'No repairs, availability drops', 'Let it happen. On Day 4 ask where those jets went.'],
  ['F-22 on a strike', 'Briefs an F-22 on a strike tasker', 'Illegal. Correct it on the spot.'],
  ['No rationale', 'Cannot explain the plan', '"Walk me through your reasoning."'],
  ['New lead freezes', 'Lead #2 defers, room argues', 'Let it play out unless it fully breaks down.'],
], { hdr: C.red, firstFill: C.pink, firstBold: true, italicCol: 2 }));
g.push(sec('Debrief (1045-1050)'));
g.push(P('The Evaluator takes Lead #2 aside. You run the flight debrief in a horseshoe, most junior first. Redirect only when needed.'));
g.push(B([['Event recap: ', { bold: true }], 'read each day\'s Worksheet in order. What happened?']));
g.push(B([['Focal point: ', { bold: true }], 'which day cost the wing the jets it needed on Day 4?']));
g.push(B([['Root cause: ', { bold: true }], 'push past "bad dice" to the decision behind it.']));
g.push(B([['Fix: ', { bold: true }], 'each lead names one thing they would change.']));

(async () => {
  fs.writeFileSync('Island_Spoke_Proctor_Guide.docx', await Packer.toBuffer(makeDoc(g, 720)));
  console.log('done');
})();
