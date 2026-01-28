import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Ebook } from '../types';

export const generatePDF = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with id ${elementId} not found`);
    }

    try {
        const pages = Array.from(element.querySelectorAll('[data-pdf-page]')) as HTMLElement[];
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();

        const renderTarget = async (target: HTMLElement) => {
            const canvas = await html2canvas(target, {
                scale: 1.4,
                useCORS: true,
                logging: false,
                windowWidth: target.scrollWidth,
                windowHeight: target.scrollHeight
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.82);
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        };

        if (pages.length > 0) {
            for (let i = 0; i < pages.length; i++) {
                if (i > 0) pdf.addPage();
                await renderTarget(pages[i]);
            }
            pdf.save(`${fileName}.pdf`);
            return;
        }

        const canvas = await html2canvas(element, {
            scale: 1.2,
            useCORS: true,
            logging: false,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.82);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileName}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

const normalizeText = (text: string) =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const stripMarkdown = (text: string) => {
  let out = text || '';
  out = out.replace(/^\s*#{1,6}\s+/gm, '');
  out = out.replace(/^\s*[-*+]\s+/gm, '• ');
  out = out.replace(/\*\*(.*?)\*\*/g, '$1');
  out = out.replace(/[_*`>]/g, '');
  return normalizeText(out);
};

const cleanChapterText = (title: string, content: string) => {
  const lines = normalizeText(content).split('\n');
  const cleaned = lines.filter((line, idx) => {
    const lower = line.trim().toLowerCase();
    if (idx < 6 && lower.includes('capítulo')) return false;
    if (idx < 6 && (lower === title.toLowerCase() || lower.includes(title.toLowerCase().slice(0, 12)))) return false;
    if (idx < 6 && lower.startsWith('aqui está o conteúdo')) return false;
    return true;
  });
  return cleaned.join('\n').trim();
};

export const generateEbookPDF = async (ebook: Ebook) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;

  const addPageTitle = (label: string, title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(label.toUpperCase(), margin, margin);
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    const lines = doc.splitTextToSize(title, maxWidth);
    doc.text(lines, margin, margin + 10);
    return margin + 10 + lines.length * 8 + 6;
  };

  const addParagraphs = (text: string, startY: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11.5);
    doc.setTextColor(30, 41, 59);
    const paragraphs = normalizeText(text).split('\n\n');
    let y = startY;
    const lineHeight = 6.2;
    paragraphs.forEach((para) => {
      const lines = doc.splitTextToSize(para, maxWidth);
      const blockHeight = lines.length * lineHeight;
      if (y + blockHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines, margin, y);
      y += blockHeight + 4;
    });
  };

  // Cover
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(ebook.author || '', margin, margin);
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  const coverLines = doc.splitTextToSize(ebook.title || 'E-book', maxWidth);
  doc.text(coverLines, margin, margin + 14);

  // Table of contents
  doc.addPage();
  let tocY = addPageTitle('Sumário', 'Mapa de Leitura');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  ebook.chapters.forEach((ch, idx) => {
    const line = `${String(idx + 1).padStart(2, '0')}. ${ch.title}`;
    const lines = doc.splitTextToSize(line, maxWidth);
    lines.forEach((l: string) => {
      if (tocY > pageHeight - margin) {
        doc.addPage();
        tocY = margin;
      }
      doc.text(l, margin, tocY);
      tocY += 6.2;
    });
    tocY += 2;
  });

  // Intro
  if (ebook.introduction && ebook.introduction.trim().length > 80) {
    doc.addPage();
    let y = addPageTitle('Introdução', 'Introdução');
    const intro = cleanChapterText('Introdução', stripMarkdown(ebook.introduction));
    addParagraphs(intro, y);
  }

  // Chapters
  ebook.chapters
    .filter(ch => ch.content && ch.content.trim().length > 80)
    .forEach((ch, i) => {
      doc.addPage();
      const label = `Capítulo ${i + 1}`;
      let y = addPageTitle(label, ch.title);
      const body = cleanChapterText(ch.title, stripMarkdown(ch.content));
      addParagraphs(body, y);
    });

  // Conclusion
  if (ebook.conclusion && ebook.conclusion.trim().length > 80) {
    doc.addPage();
    let y = addPageTitle('Conclusão', 'Conclusão');
    const conclusion = cleanChapterText('Conclusão', stripMarkdown(ebook.conclusion));
    addParagraphs(conclusion, y);
  }

  doc.save(`${ebook.title || 'ebook'}.pdf`);
};

export const generateEbookChapterPDF = async (ebook: Ebook, chapterId: string) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;

  const addPageTitle = (label: string, title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(label.toUpperCase(), margin, margin);
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    const lines = doc.splitTextToSize(title, maxWidth);
    doc.text(lines, margin, margin + 10);
    return margin + 10 + lines.length * 8 + 6;
  };

  const addParagraphs = (text: string, startY: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11.5);
    doc.setTextColor(30, 41, 59);
    const paragraphs = normalizeText(text).split('\n\n');
    let y = startY;
    const lineHeight = 6.2;
    paragraphs.forEach((para) => {
      const lines = doc.splitTextToSize(para, maxWidth);
      const blockHeight = lines.length * lineHeight;
      if (y + blockHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines, margin, y);
      y += blockHeight + 4;
    });
  };

  if (chapterId === 'intro' && ebook.introduction) {
    const intro = cleanChapterText('Introdução', stripMarkdown(ebook.introduction));
    const y = addPageTitle('Introdução', 'Introdução');
    addParagraphs(intro, y);
    doc.save(`${ebook.title || 'ebook'}_introducao.pdf`);
    return;
  }

  if (chapterId === 'conclusion' && ebook.conclusion) {
    const conclusion = cleanChapterText('Conclusão', stripMarkdown(ebook.conclusion));
    const y = addPageTitle('Conclusão', 'Conclusão');
    addParagraphs(conclusion, y);
    doc.save(`${ebook.title || 'ebook'}_conclusao.pdf`);
    return;
  }

  const chapter = ebook.chapters.find(ch => ch.id === chapterId);
  if (!chapter) return;
  const y = addPageTitle('Capítulo', chapter.title);
  const body = cleanChapterText(chapter.title, stripMarkdown(chapter.content));
  addParagraphs(body, y);
  doc.save(`${ebook.title || 'ebook'}_${chapter.title}.pdf`);
};
