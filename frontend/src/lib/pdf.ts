function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdfContent(lines: string[]) {
  const objects: string[] = [];
  const header = "%PDF-1.4\n";
  const safeLines = lines.slice(0, 120);
  const textStream = [
    "BT",
    "/F1 12 Tf",
    "50 792 Td",
    "14 TL",
    ...safeLines.map((line, index) =>
      `${index === 0 ? "" : "T* " }(${escapePdfText(line)}) Tj`.trim(),
    ),
    "ET",
  ].join("\n");

  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
  objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj");
  objects.push(
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
  );
  objects.push("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj");
  objects.push(
    `5 0 obj << /Length ${textStream.length} >> stream\n${textStream}\nendstream endobj`,
  );

  let offset = header.length;
  const body = objects
    .map((object) => {
      const value = `${object}\n`;
      const currentOffset = offset;
      offset += value.length;
      return { currentOffset, value };
    });

  const xrefOffset = offset;
  const xrefEntries = ["0000000000 65535 f "].concat(
    body.map(({ currentOffset }) =>
      `${String(currentOffset).padStart(10, "0")} 00000 n `,
    ),
  );
  const xref = `xref\n0 ${objects.length + 1}\n${xrefEntries.join("\n")}\n`;
  const trailer = `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return `${header}${body.map(({ value }) => value).join("")}${xref}${trailer}`;
}

export function downloadSimplePdf(filename: string, lines: string[]) {
  const pdfContent = buildPdfContent(lines);
  const blob = new Blob([pdfContent], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

