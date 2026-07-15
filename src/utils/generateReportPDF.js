import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DIMENSION_LABELS } from '@/lib/scoring';

const PAGE = { width: 210, height: 297, marginX: 16 };
const BRAND = 'PsychoScan IOS';

function hexToRgb(hex) {
  const value = String(hex || '#1D4ED8').replace('#', '');
  const normalized = value.length === 3 ? value.split('').map((x) => x + x).join('') : value;
  const n = Number.parseInt(normalized, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function drawHeaderGradient(doc, from, to, height = 42) {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const steps = 45;
  for (let i = 0; i < steps; i += 1) {
    const t = i / (steps - 1);
    const r = Math.round(start.r + (end.r - start.r) * t);
    const g = Math.round(start.g + (end.g - start.g) * t);
    const b = Math.round(start.b + (end.b - start.b) * t);
    doc.setFillColor(r, g, b);
    doc.rect(0, (height / steps) * i, PAGE.width, height / steps + 0.35, 'F');
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
    doc.text(DIMENSION_LABELS[entry.key] || entry.key, x, yy);

    doc.setFillColor(226, 232, 240);
    doc.roundedRect(x, yy + 2, barW, 3.3, 1, 1, 'F');
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(x, yy + 2, Math.max(2, (barW * Math.min(100, entry.value)) / 100), 3.3, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${Math.round(entry.value)}%`, x + barW + 4, yy + 4.6);
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

export async function generateReportPDF({ result, profile, department, employee, insights, radarElement }) {
  const from = profile?.theme?.from || profile?.color || '#1D4ED8';
  const to = profile?.theme?.to || '#7C3AED';
  const accent = profile?.color || from;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

  // --- En-tête corporate ---
  drawHeaderGradient(doc, from, to);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(BRAND, PAGE.marginX, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text("Bilan d'évaluation des compétences", PAGE.marginX, 22);

  doc.setFontSize(9.5);
  doc.text(`Collaborateur : ${employee?.full_name || result?.user_name || 'N/A'}`, PAGE.marginX, 30);
  doc.text(`Date : ${formatDate(result?.created_at)}`, PAGE.width - PAGE.marginX, 30, { align: 'right' });
  if (employee?.position) doc.text(`Poste : ${employee.position}`, PAGE.marginX, 35.5);
  if (department?.name) doc.text(`Département : ${department.name}`, PAGE.width - PAGE.marginX, 35.5, { align: 'right' });

  // --- Bandeau profil + adéquation ---
  let y = 52;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(profile?.name || 'Profil professionnel', PAGE.marginX, y);
  y += 6;

  const fit = Math.round(result?.department_fit ?? insights?.departmentFit ?? 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const badge = hexToRgb(accent);
  doc.setFillColor(badge.r, badge.g, badge.b);
  doc.roundedRect(PAGE.marginX, y, 70, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(`Adéquation au poste : ${fit}%`, PAGE.marginX + 3, y + 5.3);
  y += 16;

  y = sectionTitle(doc, 'Synthèse', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.8);
  doc.setTextColor(51, 65, 85);
  y = drawWrappedText(doc, insights?.summary || profile?.description || '', PAGE.marginX, y, PAGE.width - PAGE.marginX * 2, 5.4);
  y += 3;

  y = sectionTitle(doc, 'Compétences évaluées', y);
  y = drawTraitBars(doc, result?.scores || {}, y, accent);

  if (radarElement) {
    try {
      y = ensurePage(doc, y, 76);
      const canvas = await html2canvas(radarElement, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const imageData = canvas.toDataURL('image/png');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Radar des compétences', PAGE.marginX, y);
      y += 3;
      doc.addImage(imageData, 'PNG', PAGE.marginX, y, 74, 56, undefined, 'FAST');
      y += 62;
    } catch {
      /* capture échouée : PDF généré sans image */
    }
  }

  y = ensurePage(doc, y, 18);
  y = sectionTitle(doc, 'Points forts', y);
  y = drawBulletList(doc, insights?.strengths || profile?.strengths || [], y, '#059669');

  y = ensurePage(doc, y, 18);
  y = sectionTitle(doc, "Axes d'amélioration", y);
  y = drawBulletList(doc, insights?.improvementAreas || profile?.weaknesses || [], y, '#D97706');

  // --- Page 2 : plan de développement ---
  doc.addPage();
  drawHeaderGradient(doc, from, to, 30);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`${BRAND} — Plan de développement`, PAGE.marginX, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${employee?.full_name || ''} · ${department?.name || ''}`, PAGE.marginX, 21);

  y = 40;
  y = sectionTitle(doc, 'Formations recommandées', y);
  const trainings = (insights?.trainingSuggestions || []).map(
    (t) => `${t.title} (${t.duration || ''} · ${t.format || ''})`
  );
  y = drawBulletList(doc, trainings.length ? trainings : ['Aucune formation prioritaire — profil équilibré.'], y, accent);

  y = ensurePage(doc, y, 18);
  y = sectionTitle(doc, 'Recommandations de carrière', y);
  y = drawBulletList(doc, insights?.careerRecommendations || profile?.recommended_careers || [], y, '#2563EB');

  if (department) {
    y = ensurePage(doc, y, 18);
    y = sectionTitle(doc, `Insights — ${department.name}`, y);
    const deptMessages = (insights?.departmentInsights || []).map((d) => d.message);
    y = drawBulletList(doc, deptMessages, y, '#7C3AED');
  }

  // --- Pied de page ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`${BRAND} · Document confidentiel · Page ${i}/${pageCount}`, PAGE.width / 2, PAGE.height - 8, { align: 'center' });
  }

  const fileName = `PsychoScanIOS_Bilan_${safeFilePart(employee?.full_name || result?.user_name, 'Collaborateur')}_${safeFilePart(formatDate(result?.created_at), 'Date')}.pdf`;
  doc.save(fileName);
}
