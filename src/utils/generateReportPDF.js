import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DIMENSION_LABELS } from '@/lib/scoring';

const PAGE = {
  width: 210,
  height: 297,
  marginX: 16,
};

function hexToRgb(hex) {
  const value = String(hex || '#2563EB').replace('#', '');
  const normalized = value.length === 3 ? value.split('').map((x) => x + x).join('') : value;
  const n = Number.parseInt(normalized, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function drawHeaderGradient(doc, from, to) {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const steps = 45;
  for (let i = 0; i < steps; i += 1) {
    const t = i / (steps - 1);
    const r = Math.round(start.r + (end.r - start.r) * t);
    const g = Math.round(start.g + (end.g - start.g) * t);
    const b = Math.round(start.b + (end.b - start.b) * t);
    doc.setFillColor(r, g, b);
    doc.rect(0, (42 / steps) * i, PAGE.width, 42 / steps + 0.35, 'F');
  }
}

function sectionTitle(doc, title, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(title, PAGE.marginX, y);
  doc.setDrawColor(226, 232, 240);
  doc.line(PAGE.marginX, y + 2.5, PAGE.width - PAGE.marginX, y + 2.5);
  return y + 9;
}

function drawWrappedText(doc, text, x, y, maxWidth, lineHeight = 5.1) {
  const lines = doc.splitTextToSize(text || '', maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function ensurePage(doc, y, reserve = 20) {
  if (y + reserve > PAGE.height - 14) {
    doc.addPage();
    return 20;
  }
  return y;
}

function drawTraitBars(doc, scores, y, colorHex) {
  const entries = Object.entries(scores || {})
    .map(([key, value]) => ({ key, value: Number(value) || 0 }))
    .sort((a, b) => b.value - a.value);

  const barW = 68;
  const colGap = 16;
  const rowGap = 10;
  const startX = PAGE.marginX;
  const secondColX = startX + 84 + colGap;
  const color = hexToRgb(colorHex);

  entries.forEach((entry, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = col === 0 ? startX : secondColX;
    const yy = y + row * rowGap;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const label = DIMENSION_LABELS[entry.key] || entry.key;
    doc.text(label, x, yy);

    doc.setFillColor(226, 232, 240);
    doc.roundedRect(x, yy + 2, barW, 3.3, 1, 1, 'F');
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(x, yy + 2, Math.max(2, (barW * Math.min(100, entry.value)) / 100), 3.3, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${entry.value}%`, x + barW + 4, yy + 4.6);
  });

  return y + Math.ceil(entries.length / 2) * rowGap + 3;
}

function drawBulletList(doc, items, y, colorHex, maxWidth = PAGE.width - PAGE.marginX * 2) {
  const color = hexToRgb(colorHex);
  (items || []).forEach((item) => {
    y = ensurePage(doc, y, 14);
    doc.setFillColor(color.r, color.g, color.b);
    doc.circle(PAGE.marginX + 1.2, y - 1.2, 0.75, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.2);
    doc.setTextColor(51, 65, 85);
    y = drawWrappedText(doc, item, PAGE.marginX + 4.3, y, maxWidth - 4.3, 5.2) + 1.2;
  });
  return y;
}

function getTopTraits(scores, count = 3) {
  return Object.entries(scores || {})
    .map(([key, value]) => ({
      key,
      label: DIMENSION_LABELS[key] || key,
      value: Number(value) || 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

function drawTopTraitCards(doc, scores, y, accentHex) {
  const cards = getTopTraits(scores, 3);
  const gap = 6;
  const cardWidth = (PAGE.width - PAGE.marginX * 2 - gap * 2) / 3;
  const cardHeight = 28;
  const accent = hexToRgb(accentHex);

  cards.forEach((trait, index) => {
    const x = PAGE.marginX + index * (cardWidth + gap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2.5, 2.5, 'FD');

    doc.setFillColor(accent.r, accent.g, accent.b);
    doc.roundedRect(x + 3, y + 3, cardWidth - 6, 3, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`#${index + 1} ${trait.label}`, x + 4, y + 12.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(`${Math.round(trait.value)}%`, x + cardWidth - 4, y + 22, { align: 'right' });
  });

  return y + cardHeight + 8;
}

function drawTraitComparisonTable(doc, scores, y) {
  const entries = Object.entries(scores || {})
    .map(([key, value]) => ({
      key,
      label: DIMENSION_LABELS[key] || key,
      value: Math.round(Number(value) || 0),
    }))
    .sort((a, b) => b.value - a.value);

  const tableX = PAGE.marginX;
  const tableWidth = PAGE.width - PAGE.marginX * 2;
  const rowHeight = 7.4;
  const colTrait = 74;
  const colScore = 20;
  const colInterpretation = tableWidth - colTrait - colScore;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(tableX, y, tableWidth, rowHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.6);
  doc.setTextColor(30, 41, 59);
  doc.text('Trait', tableX + 2, y + 5);
  doc.text('Score', tableX + colTrait + 2, y + 5);
  doc.text('Interprétation', tableX + colTrait + colScore + 2, y + 5);
  y += rowHeight;

  entries.forEach((entry, index) => {
    y = ensurePage(doc, y, rowHeight + 2);

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(tableX, y, tableWidth, rowHeight, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(tableX, y, tableWidth, rowHeight, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.3);
    doc.setTextColor(51, 65, 85);
    doc.text(entry.label, tableX + 2, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${entry.value}%`, tableX + colTrait + 2, y + 5);
    doc.setFont('helvetica', 'normal');
    const interpretation =
      entry.value >= 75
        ? 'Très dominant'
        : entry.value >= 55
          ? 'Dominant'
          : entry.value >= 40
            ? 'Modéré'
            : 'Faible';
    doc.text(interpretation, tableX + colTrait + colScore + 2, y + 5);
    y += rowHeight;
  });

  return y + 3;
}

function formatDate(dateValue) {
  try {
    return new Date(dateValue || Date.now()).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return new Date().toLocaleDateString('fr-FR');
  }
}

function safeFilePart(value, fallback) {
  const clean = String(value || fallback)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
  return clean || fallback;
}

export async function generateReportPDF({
  result,
  profile,
  userName,
  radarElement,
}) {
  const from = profile?.theme?.from || profile?.color || '#2563EB';
  const to = profile?.theme?.to || '#8B5CF6';
  const accent = profile?.color || from;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  drawHeaderGradient(doc, from, to);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('MindScan', PAGE.marginX, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text('Rapport de personnalité premium', PAGE.marginX, 23);

  doc.setFontSize(10);
  doc.text(`Utilisateur: ${userName || result?.user_name || 'Invité'}`, PAGE.marginX, 31);
  doc.text(`Date: ${formatDate(result?.created_date)}`, PAGE.width - PAGE.marginX, 31, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(profile?.name || 'Profil', PAGE.marginX, 38);

  let y = 52;
  y = sectionTitle(doc, 'Résumé de personnalité', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.8);
  doc.setTextColor(51, 65, 85);
  y = drawWrappedText(
    doc,
    profile?.description || 'Aucune description disponible.',
    PAGE.marginX,
    y,
    PAGE.width - PAGE.marginX * 2,
    5.4
  );
  y += 2.5;

  const badgeColor = hexToRgb(accent);
  doc.setFillColor(badgeColor.r, badgeColor.g, badgeColor.b);
  doc.roundedRect(PAGE.marginX, y, 54, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(profile?.code?.toUpperCase() || 'PROFILE', PAGE.marginX + 27, y + 5.25, { align: 'center' });
  y += 14;

  y = sectionTitle(doc, 'Répartition des traits', y);
  y = drawTraitBars(doc, result?.scores || {}, y, accent);

  if (radarElement) {
    try {
      y = ensurePage(doc, y, 76);
      const canvas = await html2canvas(radarElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imageData = canvas.toDataURL('image/png');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Vue radar', PAGE.marginX, y);
      y += 3;
      doc.addImage(imageData, 'PNG', PAGE.marginX, y, 74, 56, undefined, 'FAST');
      y += 62;
    } catch {
      // If capture fails, keep PDF generation successful without chart image.
    }
  }

  y = ensurePage(doc, y, 18);
  y = sectionTitle(doc, 'Points forts', y);
  y = drawBulletList(doc, profile?.strengths || [], y, '#059669');

  y = ensurePage(doc, y, 18);
  y = sectionTitle(doc, 'Axes de progression', y);
  y = drawBulletList(doc, profile?.weaknesses || [], y, '#D97706');

  y = ensurePage(doc, y, 18);
  y = sectionTitle(doc, 'Métiers recommandés', y);
  y = drawBulletList(doc, profile?.recommended_careers || [], y, accent);

  y = ensurePage(doc, y, 18);
  y = sectionTitle(doc, 'Conseils de développement', y);
  y = drawBulletList(doc, profile?.advice || [], y, '#334155');

  // Executive second page: quick snapshot for sharing/printing.
  doc.addPage();
  drawHeaderGradient(doc, from, to);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('MindScan - Executive Snapshot', PAGE.marginX, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${profile?.name || 'Profil'} | ${formatDate(result?.created_date)}`, PAGE.marginX, 23);

  y = 34;
  y = sectionTitle(doc, 'Top 3 traits dominants', y);
  y = drawTopTraitCards(doc, result?.scores || {}, y, accent);

  y = ensurePage(doc, y, 28);
  y = sectionTitle(doc, 'Tableau comparatif des traits', y);
  y = drawTraitComparisonTable(doc, result?.scores || {}, y);

  const fileName = `MindScan_Report_${safeFilePart(
    userName || result?.user_name || 'Guest',
    'Guest'
  )}_${safeFilePart(formatDate(result?.created_date), 'Date')}.pdf`;

  doc.save(fileName);
}

