const fs = require('fs');
const L = require('./lib.js');
const { C, W, P, sp, pageBreak, cell, table, banner, shadedBox, headerTable, makeDoc, TableRow, Packer } = L;

// ---------------- ROLE SHEETS ----------------
const ROLES = [
  {
    title: 'WING COMMANDER', sub: 'GMC Lead #1, then GMC Lead #2  |  LoC 2.1, EC 3.2, WF 1.3',
    own: 'You own the plan. Ops and Maintenance bring you options. You decide and you brief the Colonel.',
    jobs: [
      ['Set the intent',
        'Within the first 2 minutes of each day, tell the room in 3 sentences or fewer what the wing is protecting, what it is willing to lose, and why.',
        'Any cadet in the room can repeat the intent when asked. The brief to the Colonel matches it.'],
      ['Delegate, then decide',
        'Give Ops and Maintenance their tasks and a time to report back. Hear both before you split the 14 points. Make the call yourself.',
        'The cells are working, not waiting on you. You make the final call on points and can say why.'],
      ['Adjust when the picture changes',
        'When an inject or a bad roll changes things, restate the intent and change the plan that same day. Lead #2: take charge within 1 minute of the bunker.',
        'The brief explains what changed and why. Nobody had to ask who was in charge.'],
    ],
  },
  {
    title: 'OPERATIONS GROUP COMMANDER (OG/CC)', sub: 'Ops Lead  |  EC 2.1, EC 3.1',
    own: 'You own the jets in the air: which jets fly, on which tasker, carrying what.',
    jobs: [
      ['Match jets to taskers',
        'Put Ready jets on each tasker the Wing Commander wants covered. Name the weapons each jet carries. No F-22 on a strike.',
        'The plan reaches the dice with no rule breaks (no red message in the calculator). You can say what each jet carries and why.'],
      ['Argue for the mission',
        'Tell the Wing Commander what each option costs in points and in jets that may come back broken. Push for the sorties you think matter, with a reason.',
        'You disagree with Maintenance in the open and with reasons. Once the commander decides, you carry it out.'],
      ['Name the risk',
        'Before the brief, tell the Wing Commander which tasker is thin or uncovered and what happens if it fails.',
        'You answer "What are you giving up?" without hesitating.'],
    ],
  },
  {
    title: 'MAINTENANCE GROUP COMMANDER (MXG/CC)', sub: 'Maintenance Lead  |  EC 2.1, EC 3.1, LoC 2.1',
    own: 'You own the jets on the ground, and the people and supplies on the base.',
    jobs: [
      ['Own the board',
        'Report Ready, Down, and Out by aircraft type before Ops plans each day. After the bunker, rebuild the board by asking the Proctor about one aircraft type at a time.',
        'Your worksheet board matches the calculator at the start of each day. Ops never plans a Down jet.'],
      ['Fix for tomorrow',
        'Commit repair points before every roll, or tell the Wing Commander why you are not. Tie each repair to what the wing will need next.',
        'You can say why that jet was fixed first. You argue for repair points against Ops with reasons.'],
      ['Take care of people and supplies',
        'Work the C-17 (fuel, beds, food, and water for 8 crew) and the casualties (MEDEVAC request and triage order) with the Wing Commander.',
        'Each inject meets the success criteria in the Proctor Guide.'],
    ],
  },
];

const doc = [];
ROLES.forEach((r, i) => {
  if (i) doc.push(pageBreak());
  doc.push(banner(r.title, r.sub));
  doc.push(sp(120));
  doc.push(shadedBox([P(r.own, { after: 0 })], C.boxBlue));
  r.jobs.forEach((j, k) => {
    doc.push(P([[`Job ${k + 1}: ${j[0]}`, { bold: true, color: C.navy, size: 26 }]], { before: 240, after: 80 }));
    doc.push(table([2400, W - 2400], [
      new TableRow({ children: [cell([[['Measurable action', { bold: true }]]], { w: 2400, fill: C.label }), cell([j[1]], { w: W - 2400 })] }),
      new TableRow({ children: [cell([[['Proctor evaluation', { bold: true }]]], { w: 2400, fill: C.label }), cell([j[2]], { w: W - 2400 })] }),
    ]));
  });
  doc.push(P([['Everyone else on your cell takes tasks from you. Everyone in the room answers to the Wing Commander.', { size: 18, color: C.grey }]], { before: 280 }));
});

// ---------------- FPCON SHEET (given to Lead #2 at the turnaround) ----------------
const fp = [];
for (let n = 0; n < 1; n++) {
  fp.push(banner('FPCON DELTA', 'Operation Island Spoke  |  Hand to GMC Lead #2 at the turnaround'));
  fp.push(sp(240));
  fp.push(P([['Your Wing Commander has been killed by an insider threat. You are now in command.', { bold: true, size: 28 }]], { after: 200 }));
  fp.push(shadedBox([
    P([['14 jets assigned. Status unknown.', { bold: true, size: 32, color: C.navy }]], { after: 120 }),
    P([['14 Wing Points per day.', { bold: true, size: 32, color: C.navy }]], { after: 0 }),
  ], C.boxBlue));
  fp.push(P('All records and notes are gone. Maintenance may ask the Proctor about one aircraft type at a time to rebuild the board.', { before: 240 }));
  fp.push(P('FPCON Delta applies in the immediate area where an attack has occurred, or when intelligence shows an attack against a specific location is likely. Access is restricted. Nobody moves without the commander knowing.', { before: 160, size: 20 }));
}

// ---------------- INJECT SHEET (Proctor reads; one per room) ----------------
const ij = [];
const say = (t) => P([[t, { italics: true }]], { after: 80 });
const head = (t) => P([[t, { bold: true, color: C.white, size: 24 }]], { shade: C.navy, before: 200, after: 80 });
const crit = (ok, bad) => P([['Success: ', { bold: true, color: C.green }], ok, '   ', ['Failure: ', { bold: true, color: C.red }], bad], { after: 60, size: 20 });
ij.push(banner('INJECT SHEET', 'Operation Island Spoke  |  Proctor reads these aloud, word for word'));
ij.push(head('0920  SCENARIO'));
ij.push(say('"You are the leadership of a fighter wing at Andersen Air Force Base, Guam. Recent activity on the Chinese mainland shows China is mobilizing. Your job is to keep Andersen at the highest readiness possible and to be seen doing it, as a visual deterrent. You have 14 fighters and 14 Wing Points each day. Points pay for flying jets and fixing them. You will not have enough to do everything. Each day you get orders with taskers. Brief the Colonel on what you will do and why. Should deterrence fail, the wing will defend Guam with whatever it has kept ready."'));
ij.push(head('0930  START STATUS (to Maintenance)'));
ij.push(say('"11 of 14 Ready. One F-35A, one F-15EX, and one F-16 are Down."'));
ij.push(head('0937  C-17'));
ij.push(say('"A lost plane from the 62nd Airlift Wing needs refueling and is redirected to your base. It carries 3 food pallets, 5 beds, 20 gallons of water and 10 individual tents. Along with the resources, it has 2 pilots, 1 loadmaster and 5 crew. You must account for this into your resources and take care of the crew indefinitely."'));
ij.push(crit('they refuel it (1 point) and say how the 8 crew are housed and fed.', 'the crew is never addressed.'));
ij.push(head('1005  TURNAROUND'));
ij.push(say('"Your Wing Commander has been assassinated by an insider threat. As a result, your base goes into FPCON Delta. You are forced to go into a bunker."'));
ij.push(P('Then: lockdown. GMC out, 30 seconds. Clear every note and the Day 1 and 2 papers. Lead #2 gets the FPCON Sheet. GMC back in at 1010.', { size: 20 }));
ij.push(head('1015  CASUALTIES'));
ij.push(say('"Six U.S. military personnel are requesting urgent medical assistance after their ship was struck by adversarial troops; all members request a place to stay and immediate physical examination. Two are conscious but report concussion symptoms. One was impaled by a metal pole through their stomach. Two have shallow breathing after being shot in the back. One suffered a wound to the arm with massive arterial bleeding. They request an emergency helicopter to pick them up."'));
ij.push(crit('MEDEVAC requested; arterial bleed first, then breathing, then the impalement (pole stays in), then concussions.', 'no MEDEVAC, or the bleed is not first.'));
ij.push(head('1025  OPENING STRIKE (Day 4)'));
ij.push(say('"China’s missiles hit the flightline before you can plan. You have lost two jets." Then name the 2 jets the calculator picked.'));
ij.push(head('1040  END STATE (after the Day 4 readout)'));
ij.push(say('4 or more of 6 taskers succeeded: "Andersen holds."   3 or fewer: "Andersen is overwhelmed."   Then: "You have ___ of 14 jets Ready."'));

(async () => {
  fs.writeFileSync('Island_Spoke_Role_Sheets.docx', await Packer.toBuffer(makeDoc(doc, 1080)));
  fs.writeFileSync('Island_Spoke_FPCON_Sheet.docx', await Packer.toBuffer(makeDoc(fp, 1440)));
  fs.writeFileSync('Island_Spoke_Inject_Sheet.docx', await Packer.toBuffer(makeDoc(ij, 720)));
  console.log('done');
})();
