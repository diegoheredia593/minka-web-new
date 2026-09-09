import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { LegalDocument } from "@/content/legal-documents";

type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

function cleanMarkdownText(text: string) {
  return text.replace(/\\([_\-[\]])/g, "$1").trim();
}

function renderInline(text: string) {
  const clean = cleanMarkdownText(text);
  const parts = clean.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cleanMarkdownText(cell));
}

function parseLegalMarkdown(markdown: string): Block[] {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", text: cleanMarkdownText(line.replace(/^##\s+/, "")) });
      index += 1;
      continue;
    }

    if (line.startsWith("|") && lines[index + 1]?.trim().startsWith("|")) {
      const headers = parseTableRow(line);
      index += 2;
      const rows: string[][] = [];

      while (lines[index]?.trim().startsWith("|")) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }

      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (line.startsWith("• ")) {
      const items: string[] = [];

      while (lines[index]?.trim().startsWith("• ")) {
        items.push(cleanMarkdownText(lines[index].trim().replace(/^•\s+/, "")));
        index += 1;
      }

      blocks.push({ type: "list", items });
      continue;
    }

    const paragraphLines = [line];
    index += 1;

    while (
      lines[index]?.trim() &&
      !lines[index].trim().startsWith("## ") &&
      !lines[index].trim().startsWith("• ") &&
      !lines[index].trim().startsWith("|")
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push({ type: "paragraph", text: cleanMarkdownText(paragraphLines.join(" ")) });
  }

  return blocks;
}

export function LegalPage({ document }: { document: LegalDocument }) {
  const blocks = parseLegalMarkdown(document.markdown);

  return (
    <div className="minka-site">
      <SiteHeader />

      <main className="legal-page">
        <div className="legal-shell">
          <p className="eyebrow">{document.eyebrow}</p>
          <h1>{document.title}</h1>
          <p className="legal-updated">Última actualización: {document.updated}</p>
          <p className="legal-summary">{document.summary}</p>
          <p className="legal-notice">{document.notice}</p>

          <div className="legal-document">
            {blocks.map((block, index) => {
              if (block.type === "heading") {
                return <h2 key={`${block.text}-${index}`}>{renderInline(block.text)}</h2>;
              }

              if (block.type === "list") {
                return (
                  <ul key={`list-${index}`}>
                    {block.items.map((item) => (
                      <li key={item}>{renderInline(item)}</li>
                    ))}
                  </ul>
                );
              }

              if (block.type === "table") {
                return (
                  <div className="legal-table-wrap" key={`table-${index}`}>
                    <table>
                      <thead>
                        <tr>
                          {block.headers.map((header) => (
                            <th key={header}>{renderInline(header)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row, rowIndex) => (
                          <tr key={`${row.join("-")}-${rowIndex}`}>
                            {row.map((cell, cellIndex) => (
                              <td key={`${cell}-${cellIndex}`}>{renderInline(cell)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              return <p key={`${block.text}-${index}`}>{renderInline(block.text)}</p>;
            })}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
