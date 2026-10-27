const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, BorderStyle, LevelFormat, PageBreak, VerticalAlign, 
} = require('docx');

// ---------- palette (matched to the Silver Bullet ConOps) ----------
const C = {
  navy: '1F3864', banner: '1F3A68', bannerSub: '2F5597', blueHdr: '2E75B6',
  boxBlue: 'D9E8F0', label: 'DEEAF1', gold: 'C9A400', cream: 'FFF2CC',
  green: '38571A', lightGreen: 'E2EFDA', red: 'C00000', pink: 'F8D7D7',
  qGold: 'E0A800', grey: '666666', line: 'A6C3DC', white: 'FFFFFF', hl: 'FFE599',
};
const FONT = 'Arial';
const W = 9360; // content width, 1" margins on Letter

const border = (color = C.line) => ({ style: BorderStyle.SINGLE, size: 4, color });
const allBorders = (color) => ({ top: border(color), bottom: border(color), left: border(color), right: border(color) });

function run(text, o = {}) {
  return new TextRun({ text, font: FONT, size: o.size || 22, bold: o.bold, italics: o.italics, color: o.color, highlight: o.highlight });
}
function runs(parts, base = {}) {
  // parts: string or [text, opts]
  return (Array.isArray(parts) ? parts : [parts]).map(p => typeof p === 'string' ? run(p, base) : run(p[0], { ...base, ...p[1] }));
}
function P(parts, o = {}) {
  return new Paragraph({
    children: runs(parts, o), alignment: o.align, spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line },
    border: o.bottomRule ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999', space: 8 } } : undefined,
    shading: o.shade ? { type: ShadingType.CLEAR, fill: o.shade, color: 'auto' } : undefined,
  });
}
function B(parts, o = {}) {
  return new Paragraph({
    children: runs(parts, o), numbering: { reference: 'bullets', level: o.level || 0 },
    spacing: { after: o.after ?? 60 },
    shading: o.shade ? { type: ShadingType.CLEAR, fill: o.shade, color: 'auto' } : undefined,
  });
}
function N(parts, o = {}) {
  return new Paragraph({ children: runs(parts, o), numbering: { reference: o.ref || 'nums', level: 0 }, spacing: { after: 60 } });
}
const H = (t, o = {}) => P([[t, { bold: true, color: C.navy, size: o.size || 26 }]], { before: o.before ?? 240, after: 100, align: o.align });
const sp = (n = 120) => new Paragraph({ children: [], spacing: { after: n } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

function cell(children, o = {}) {
  const kids = (Array.isArray(children) ? children : [children]).map(c =>
    (typeof c === 'string' || Array.isArray(c)) ? P(c, { size: o.size || 20, bold: o.bold, color: o.color, italics: o.italics, align: o.align, after: 40 }) : c);
  return new TableCell({
    children: kids, width: { size: o.w, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
    borders: allBorders(o.borderColor || C.line), columnSpan: o.span,
    margins: { top: 90, bottom: 90, left: 140, right: 140 }, verticalAlign: o.valign || VerticalAlign.TOP,
  });
}
function table(widths, rows) {
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, rows });
}

// ---------- reusable styled blocks ----------
function titleBlock(title, sub) {
  const out = [P([[title, { bold: true, size: 40, color: C.navy }]], { align: AlignmentType.CENTER, after: 60 })];
  if (sub) out.push(P([[sub, { highlight: 'yellow', size: 22 }]], { align: AlignmentType.CENTER, after: 240 }));
  return out;
}
function banner(title, sub) {
  return table([W], [
    new TableRow({ children: [cell([[[title, { bold: true, size: 30, color: C.white }]]], { w: W, fill: C.banner, align: AlignmentType.CENTER, borderColor: C.banner })] }),
    new TableRow({ children: [cell([[[sub, { size: 20, color: C.white }]]], { w: W, fill: C.bannerSub, align: AlignmentType.CENTER, borderColor: C.bannerSub })] }),
  ]);
}
function timehacks(lines) {
  return table([W], [
    new TableRow({ children: [cell([[['TIMEHACK GUIDE FOR POC PROCTOR', { bold: true, color: C.white }]]], { w: W, fill: C.gold, borderColor: '999999' })] }),
    ...lines.map(l => new TableRow({ children: [cell(l, { w: W, fill: C.cream, borderColor: '999999' })] })),
  ]);
}
function shadedBox(children, fill = C.boxBlue) {
  return table([W], [new TableRow({ children: [new TableCell({ children, width: { size: W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill, color: 'auto' }, borders: allBorders('BBBBBB'), margins: { top: 140, bottom: 140, left: 180, right: 180 } })] })]);
}
function headerTable(widths, header, rows, o = {}) {
  const hdrFill = o.hdr || C.blueHdr;
  return table(widths, [
    new TableRow({ tableHeader: true, children: header.map((h, i) => cell([[[h, { bold: true, color: C.white, size: 20 }]]], { w: widths[i], fill: hdrFill, align: AlignmentType.CENTER })) }),
    ...rows.map(r => new TableRow({ children: r.map((v, i) => {
      const first = i === 0;
      const fill = first && o.firstFill ? o.firstFill : (o.bodyFill || undefined);
      return cell(v, { w: widths[i], fill, bold: first && o.firstBold, align: o.center || (first && o.firstCenter) ? AlignmentType.CENTER : undefined, size: first && o.firstBold ? 21 : 20, italics: o.italicCol === i });
    }) })),
  ]);
}
function keyValueTable(widths, rows, labelFill = C.label) {
  return table(widths, rows.map(([k, v]) => new TableRow({ children: [cell([[[k, { bold: true, size: 20 }]]], { w: widths[0], fill: labelFill }), cell(v, { w: widths[1] })] })));
}
function qCard(n, q, theme, good, wrong) {
  const wd = [1800, W - 1800];
  return table(wd, [
    new TableRow({ children: [cell([[[`Q${n}:  `, { bold: true, color: C.qGold, size: 24 }], [q, { bold: true, color: C.white, size: 24 }]]], { w: W, span: 2, fill: C.navy, borderColor: C.navy })] }),
    new TableRow({ children: [cell([[['Theme', { bold: true, size: 20 }]]], { w: wd[0], fill: C.label }), cell([[[theme, { italics: true, size: 20 }]]], { w: wd[1] })] }),
    new TableRow({ children: [cell([[['Good Answer', { bold: true, size: 20 }]]], { w: wd[0], fill: C.lightGreen }), cell(good, { w: wd[1] })] }),
    new TableRow({ children: [cell([[["If They're Wrong", { bold: true, size: 20 }]]], { w: wd[0], fill: C.pink }), cell([[[wrong, { italics: true, color: C.grey, size: 20 }]]], { w: wd[1] })] }),
  ]);
}
function makeDoc(children, tb = 1440) {
  return new Document({
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    numbering: { config: [
      { reference: 'bullets', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '●', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: '○', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } } ] },
      ...['nums', 'nums2', 'nums3', 'nums4', 'nums5', 'nums6'].map(r => ({ reference: r, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] })),
    ] },
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: tb, bottom: tb, left: 1440, right: 1440 } } }, children }],
  });
}
module.exports = { C, W, FONT, P, B, N, H, sp, pageBreak, cell, table, titleBlock, banner, timehacks, shadedBox, headerTable, keyValueTable, qCard, makeDoc, TableRow, AlignmentType, Packer };
