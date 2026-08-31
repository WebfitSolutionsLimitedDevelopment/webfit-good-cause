const LOGO_JPEG_BASE64 = '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';

function ascii(value: string) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '?');
}

function pdfString(value: string) {
  return ascii(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function money(cents: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(cents / 100);
}

function wrap(value: string, maxChars: number) {
  const words = ascii(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (!line) {
      line = word;
      continue;
    }
    if ((line + ' ' + word).length <= maxChars) line += ' ' + word;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function buildContributionReceiptPdf(input: {
  receiptNumber: string;
  donorName: string;
  campaignTitle: string;
  amountCents: number;
  paidAt: string;
  processorReference: string;
  supportEmail: string;
  businessAddress?: string;
}) {
  const width = 595;
  const height = 842;
  const logo = Buffer.from(LOGO_JPEG_BASE64, 'base64');
  const commands: string[] = [];
  const add = (value: string) => commands.push(value);

  const text = (x: number, y: number, size: number, value: string, bold = false, color = '0.07 0.16 0.25') => {
    add(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${color} rg ${x} ${y} Td (${pdfString(value)}) Tj ET`);
  };
  const line = (x1: number, y1: number, x2: number, y2: number, color = '0.86 0.89 0.87') => {
    add(`${color} RG 0.7 w ${x1} ${y1} m ${x2} ${y2} l S`);
  };
  const fill = (x: number, y: number, w: number, h: number, color: string) => {
    add(`${color} rg ${x} ${y} ${w} ${h} re f`);
  };

  fill(0, height - 150, width, 150, '0.96 0.98 0.96');
  add('q 72 0 0 72 42 724 cm /Im1 Do Q');
  text(132, 782, 13, 'GOOD CAUSE', true, '0.07 0.27 0.20');
  text(132, 752, 24, 'Contribution receipt', true);
  const issuedBy = input.businessAddress ? `Issued by Webfit Solutions Limited, ${input.businessAddress}` : 'Issued by Webfit Solutions Limited';
  text(132, 726, 10, issuedBy, false, '0.34 0.43 0.39');

  text(42, 660, 12, `Thank you, ${input.donorName}. Your contribution has been successfully received.`);
  fill(42, 585, 511, 58, '0.96 0.98 0.96');
  text(58, 617, 10, 'CONTRIBUTION AMOUNT', true, '0.34 0.43 0.39');
  text(58, 594, 22, money(input.amountCents), true, '0.07 0.27 0.20');

  let y = 550;
  const row = (label: string, value: string) => {
    text(42, y, 10, label.toUpperCase(), true, '0.34 0.43 0.39');
    const lines = wrap(value, 50);
    lines.forEach((item, index) => text(205, y - index * 14, 11, item, index === 0));
    y -= Math.max(40, lines.length * 14 + 16);
    line(42, y + 14, 553, y + 14);
  };

  row('Receipt number', input.receiptNumber);
  row('Contributor', input.donorName);
  row('Cause', input.campaignTitle);
  row('Payment date', input.paidAt);
  row('Payment reference', input.processorReference);

  y -= 10;
  text(42, y, 11, 'Receipt status', true);
  text(205, y, 11, 'Payment received', true, '0.07 0.27 0.20');

  y -= 52;
  text(42, y, 10, 'Important tax information', true);
  y -= 18;
  const taxNote = 'This document is a payment/contribution receipt and may be retained for your records. It does not by itself confirm eligibility for a New Zealand donation tax credit. Eligibility is determined by Inland Revenue and depends on the recipient organisation being an approved donee organisation and on applicable law.';
  for (const item of wrap(taxNote, 94)) {
    text(42, y, 9.2, item, false, '0.34 0.43 0.39');
    y -= 13;
  }

  y -= 12;
  for (const item of wrap(`For receipt verification or questions, email ${input.supportEmail}.`, 94)) {
    text(42, y, 9.2, item, false, '0.34 0.43 0.39');
    y -= 13;
  }
  text(42, 42, 8.5, 'Good Cause | goodcause.webfitnews.co.nz', false, '0.34 0.43 0.39');

  const content = Buffer.from(commands.join('\n'), 'latin1');
  const objects: Buffer[] = [];
  const object = (value: string | Buffer) => objects.push(Buffer.isBuffer(value) ? value : Buffer.from(value, 'latin1'));

  object('<< /Type /Catalog /Pages 2 0 R >>');
  object('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  object('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Im1 6 0 R >> >> /Contents 7 0 R >>');
  object('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  object('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  object(Buffer.concat([
    Buffer.from(`<< /Type /XObject /Subtype /Image /Width 160 /Height 160 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.length} >>\nstream\n`, 'latin1'),
    logo,
    Buffer.from('\nendstream', 'latin1'),
  ]));
  object(Buffer.concat([
    Buffer.from(`<< /Length ${content.length} >>\nstream\n`, 'latin1'),
    content,
    Buffer.from('\nendstream', 'latin1'),
  ]));

  const header = Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'binary');
  const parts: Buffer[] = [header];
  const offsets = [0];
  let position = header.length;

  objects.forEach((entry, index) => {
    offsets.push(position);
    const prefix = Buffer.from(`${index + 1} 0 obj\n`, 'latin1');
    const suffix = Buffer.from('\nendobj\n', 'latin1');
    parts.push(prefix, entry, suffix);
    position += prefix.length + entry.length + suffix.length;
  });

  const xrefPosition = position;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    xref += String(offsets[index]).padStart(10, '0') + ' 00000 n \n';
  }
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF\n`;
  parts.push(Buffer.from(xref + trailer, 'latin1'));

  return Buffer.concat(parts);
}
