/**
 * Exportadores de historial: CSV (compatible con Excel),
 * Excel (.xlsx con exceljs) y PDF (pdfkit).
 */

function serializeRecord(r) {
  return {
    id: r.id,
    fecha: new Date(r.createdAt).toLocaleString('es-CO'),
    capitalInicial: Number(r.initialCapital),
    cuota: Number(r.odd),
    apuestas: Number(r.totalBets),
    meta: Number(r.goal),
    modalidad: r.mode,
    riesgoPct: Number(r.riskPercent),
    victorias: Number(r.wins),
    derrotas: Number(r.losses),
    capitalFinal: Number(r.finalCapital),
    gananciaNeta: Number(r.netGain),
    rentabilidadPct: Number(r.profitability),
    totalApostado: Number(r.totalStaked),
    totalRecuperado: Number(r.totalReturned),
    metaAlcanzada: r.goalAchieved ? 'Sí' : 'No',
  };
}

function toCsv(records) {
  const rows = records.map(serializeRecord);
  const headers = [
    'ID',
    'Fecha',
    'Capital inicial',
    'Cuota',
    'Apuestas',
    'Meta',
    'Modalidad',
    '% Riesgo',
    'Victorias',
    'Derrotas',
    'Capital final',
    'Ganancia neta',
    'Rentabilidad %',
    'Total apostado',
    'Total recuperado',
    'Meta alcanzada',
  ];
  const keys = [
    'id', 'fecha', 'capitalInicial', 'cuota', 'apuestas', 'meta', 'modalidad',
    'riesgoPct', 'victorias', 'derrotas', 'capitalFinal', 'gananciaNeta',
    'rentabilidadPct', 'totalApostado', 'totalRecuperado', 'metaAlcanzada',
  ];

  const escape = (value) => {
    const str = String(value ?? '');
    if (/[";\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const lines = [headers.map(escape).join(';')];
  rows.forEach((row) => {
    lines.push(keys.map((k) => escape(row[k])).join(';'));
  });
  return Buffer.from(`\uFEFF${lines.join('\r\n')}`, 'utf8'); // BOM para Excel
}

async function toExcel(records) {
  const ExcelJS = require('exceljs');
  const rows = records.map(serializeRecord);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Historial');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Fecha', key: 'fecha', width: 22 },
    { header: 'Capital inicial', key: 'capitalInicial', width: 16 },
    { header: 'Cuota', key: 'cuota', width: 10 },
    { header: 'Apuestas', key: 'apuestas', width: 10 },
    { header: 'Meta', key: 'meta', width: 16 },
    { header: 'Modalidad', key: 'modalidad', width: 22 },
    { header: '% Riesgo', key: 'riesgoPct', width: 10 },
    { header: 'Victorias', key: 'victorias', width: 10 },
    { header: 'Derrotas', key: 'derrotas', width: 10 },
    { header: 'Capital final', key: 'capitalFinal', width: 16 },
    { header: 'Ganancia neta', key: 'gananciaNeta', width: 16 },
    { header: 'Rentabilidad %', key: 'rentabilidadPct', width: 14 },
    { header: 'Total apostado', key: 'totalApostado', width: 16 },
    { header: 'Total recuperado', key: 'totalRecuperado', width: 16 },
    { header: 'Meta alcanzada', key: 'metaAlcanzada', width: 14 },
  ];

  rows.forEach((row) => sheet.addRow(row));

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  return workbook.xlsx.writeBuffer();
}

function toPdf(records) {
  const PDFDocument = require('pdfkit');
  const rows = records.map(serializeRecord);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).fillColor('#0F172A').text('BetCalculator Pro - Historial de simulaciones', {
      align: 'center',
    });
    doc.moveDown(0.6);
    doc
      .fontSize(9)
      .fillColor('#475569')
      .text(`Generado: ${new Date().toLocaleString('es-CO')}  |  Registros: ${rows.length}`, {
        align: 'center',
      });
    doc.moveDown(1);

    const colWidths = [30, 90, 80, 50, 60, 80, 120, 50, 90, 70, 80];
    const headers = [
      'ID', 'Fecha', 'Capital inicial', 'Cuota', 'Meta', 'Modalidad',
      '% Riesgo', 'V/D', 'Capital final', 'Neto', 'Rent. %',
    ];
    const startX = 30;
    let y = doc.y;
    const rowHeight = 18;

    const drawHeader = () => {
      let x = startX;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#0F172A');
      headers.forEach((h, i) => {
        doc.fillColor('#FFFFFF').text(h, x + 4, y + 5, { width: colWidths[i] - 8 });
        x += colWidths[i];
      });
      y += rowHeight;
    };

    drawHeader();

    doc.font('Helvetica').fontSize(7.5);
    rows.forEach((r, idx) => {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 30;
        drawHeader();
        doc.font('Helvetica').fontSize(7.5);
      }
      const cells = [
        String(r.id),
        r.fecha,
        r.capitalInicial.toLocaleString('es-CO'),
        r.cuota.toFixed(2),
        r.meta.toLocaleString('es-CO'),
        r.modalidad,
        `${r.riesgoPct}%`,
        `${r.victorias}/${r.derrotas}`,
        r.capitalFinal.toLocaleString('es-CO'),
        r.gananciaNeta.toLocaleString('es-CO'),
        `${r.rentabilidadPct}%`,
      ];
      let x = startX;
      if (idx % 2 === 0) {
        doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#F8FAFC');
      }
      cells.forEach((cell, i) => {
        doc.fillColor('#0F172A').text(cell, x + 4, y + 5, { width: colWidths[i] - 8 });
        x += colWidths[i];
      });
      y += rowHeight;
    });

    doc.end();
  });
}

module.exports = { toCsv, toExcel, toPdf, serializeRecord };
