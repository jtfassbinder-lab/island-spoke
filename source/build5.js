const fs = require('fs');
const L = require('./lib.js');
const { C, W, P, sp, pageBreak, cell, table, banner, headerTable, makeDoc, TableRow, Packer } = L;

const QTY = { 'F-22': '2', 'F-35A': '3', 'F-15EX': '4', 'F-16': '5' };
const doc = [];
[1, 2, 3, 4].forEach((n, i) => {
  if (i) doc.push(pageBreak());
  doc.push(banner(`DAY ${n} WORKSHEET`, 'Operation Island Spoke'));
  doc.push(sp(40));
  doc.push(P([['1. Availability Board', { bold: true, color: C.navy, size: 24 }], n > 1 ? ['   Fill Ready, Down, and Out from the last readout', { size: 18, color: C.grey }] : ''], { after: 60 }));
  const rows = Object.keys(QTY).map(a => [a, QTY[a], '', '', '', '']);
  rows.push(['Total', '14', '', '', '', '']);
  doc.push(headerTable([1700, 1000, 1500, 1500, 1500, 2160], ['Aircraft', 'Qty', 'Ready', 'Down', 'Out', 'Repair today'], rows, { firstFill: C.label, firstBold: true, center: true }));
  doc.push(sp(40));
  doc.push(P([['2. Plan', { bold: true, color: C.navy, size: 24 }]], { after: 60 }));
  doc.push(headerTable([3100, 2300, 1900, 2060], ['Tasker', 'Jets assigned', 'Weapons', 'Why'], [1, 2, 3, 4, 5, 6].map(() => [' ', ' ', ' ', ' ']), { firstFill: C.label }));
  doc.push(sp(40));
  doc.push(table([3120, 3120, 3120], [new TableRow({ children: [
    cell([[['Points for flying', { bold: true }]], '', '______'], { w: 3120 }),
    cell([[['Points for repairs', { bold: true }]], '', '______'], { w: 3120 }),
    cell([[['Total', { bold: true }]], '', '______'], { w: 3120 }),
  ] })]));
  doc.push(sp(40));
  doc.push(P([['3. Notes', { bold: true, color: C.navy, size: 24 }]], { after: 60 }));
  doc.push(table([W], [new TableRow({ children: [cell(['', ''], { w: W })] })]));
  doc.push(sp(40));
  doc.push(P([['4. Results', { bold: true, color: C.navy, size: 24 }]], { after: 60 }));
  doc.push(P('Taskers succeeded: ____ of ____     Jets lost: ______________________     Jets repaired: ______________________'));
});

(async () => {
  fs.writeFileSync('Island_Spoke_GMC_Daily_Worksheets.docx', await Packer.toBuffer(makeDoc(doc, 720)));
  console.log('done');
})();
