const fs = require('fs');
const L = require('./lib.js');
const { C, W, P, B, H, sp, pageBreak, cell, table, banner, headerTable, makeDoc, TableRow, Packer } = L;

const DAYS = [
  { n: 1, name: 'SHOW OF FORCE', time: '0920-0940', brief: '0933', taskers: ['Fly a show of force over the Marianas', 'Fly a deterrence CAP', 'Escort the bomber task force'], extra: 'C-17 inject (0930): refuel it? ____  How are the 8 crew housed and fed? ______________________________' },
  { n: 2, name: 'FONOP ESCORT', time: '0940-1000', brief: '0953', taskers: ['Provide air cover for the Navy FONOP', 'Fly DCA over Guam', 'Escort the P-8 patrol'] },
  { n: 3, name: 'STRIKE ASHORE', time: '1005-1025', brief: '1018', taskers: ['Strike Chinese forces ashore (no F-22)', 'Escort the strike package', 'Fly DCA over Guam'], extra: 'Casualty inject (1015): MEDEVAC requested? ____  Triage order: 1. ____________ 2. ____________ 3. ____________ 4. ____________' },
  { n: 4, name: 'DEFEND ANDERSEN', time: '1025-1045', brief: '1038', taskers: ['Intercept the cruise missile wave', 'Engage the Chinese fighters escorting the raid', 'Protect the tanker orbit', 'Cover Apra Harbor and the Navy ships in port', 'Fly a CAP over Saipan and Tinian', "Strike China's missile launchers (no F-22)"], extra: 'Opening strike: which 2 jets went Down? ______________________________' },
];
const START = { 'F-22': ['2', '0', '0'], 'F-35A': ['2', '1', '0'], 'F-15EX': ['3', '1', '0'], 'F-16': ['4', '1', '0'] };
const QTY = { 'F-22': '2', 'F-35A': '3', 'F-15EX': '4', 'F-16': '5' };
const FIX = { 'F-22': '5', 'F-35A': '3', 'F-15EX': '3', 'F-16': '2' };

const doc = [];
DAYS.forEach((d, i) => {
  if (i) doc.push(pageBreak());
  doc.push(banner(`DAY ${d.n} WORKSHEET  -  ${d.name}`, `${d.time}  |  Brief the Colonel at ${d.brief}  |  Keep this sheet with the wing`));
  doc.push(sp(80));
  if (d.n === 4) doc.push(P([[d.extra, { bold: true, color: C.red }]], { after: 100 }));
  doc.push(P([['1. Availability Board ', { bold: true, color: C.navy, size: 24 }], ['(Maintenance fills this first and briefs it before Ops plans)', { size: 18, color: C.grey }]], { after: 60 }));
  const pre = d.n === 1;
  const rows = Object.keys(QTY).map(a => [a, QTY[a], pre ? START[a][0] : '', pre ? START[a][1] : '', pre ? START[a][2] : '', '', FIX[a]]);
  rows.push(['Total', '14', pre ? '11' : '', pre ? '3' : '', pre ? '0' : '', '', '']);
  doc.push(headerTable([1600, 900, 1300, 1300, 1300, 1660, 1300], ['Aircraft', 'Qty', 'Ready', 'Down', 'Out', 'Repair today (how many)', 'Points per repair'], rows, { firstFill: C.label, firstBold: true, center: true }));
  doc.push(P([['Ready + Down + Out = Qty. ', { size: 18, color: C.grey }], ['Repairs are paid before the roll and come back Ready tomorrow.', { size: 18, color: C.grey }], d.n > 1 ? ['   Taskers succeeded yesterday: ____ of ____', { size: 18, bold: true }] : ''], { before: 60, after: 120 }));
  doc.push(P([['2. Plan ', { bold: true, color: C.navy, size: 24 }], ['(Ops fills, Wing Commander approves)', { size: 18, color: C.grey }]], { after: 60 }));
  doc.push(headerTable([3300, 2300, 1800, 1960], ['Tasker', 'Jets assigned', 'Weapons', 'Why'], d.taskers.map(t => [t, ['', ''], ['', ''], ['', '']]), { firstFill: C.label, firstBold: true }));
  doc.push(sp(80));
  doc.push(table([3120, 3120, 3120], [new TableRow({ children: [
    cell([[['Points for flying (Ops)', { bold: true }]], '______'], { w: 3120 }),
    cell([[['Points for repairs (Maint)', { bold: true }]], '______'], { w: 3120 }),
    cell([[['Total (max 14)', { bold: true }]], '______'], { w: 3120 }),
  ] }), new TableRow({ children: [
    cell([[['Shift posture', { bold: true }]], 'Normal  /  Extended (costs 3)  /  Rest (+3)'], { w: 6240, span: 2 }),
    cell([[['Wing CC initials', { bold: true }]], '______'], { w: 3120 }),
  ] })]));
  if (d.extra && d.n !== 4) doc.push(P([[d.extra, { size: 20 }]], { before: 120 }));
  doc.push(P([['3. Results ', { bold: true, color: C.navy, size: 24 }], ['(fill in from the Proctor readout)', { size: 18, color: C.grey }]], { before: 160, after: 60 }));
  doc.push(P('Taskers succeeded: ____ of ____     Jets lost today: ____________________     Jets repaired: ____________________'));
});

(async () => {
  fs.writeFileSync('Island_Spoke_GMC_Daily_Worksheets.docx', await Packer.toBuffer(makeDoc(doc, 720)));
  console.log('done');
})();
