import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Table } from 'mdast';

type ParsedDirective = {
  directive: string;
  line: number;
  headers: string[];
  rows: Record<string, string>[];
};

export const parse = (markdown: string): ParsedDirective[] => {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown) as Root;

  const results: ParsedDirective[] = [];

  visit(tree, (node, index, parent) => {
    if (node.type === 'paragraph') {
      const text = (node as Paragraph).children[0];

      if (text?.type === 'text' && text.value.startsWith('@')) {
        const directive = text.value.trim();

        if (parent && index !== undefined) {
          const nextNode = parent.children[index + 1];

          if (nextNode?.type === 'table') {
            const table = nextNode as Table;

            const headers = table.children[0].children.map(cell => {
              const t = cell.children[0];
              return t.type === 'text' ? t.value : '';
            });

            const rows = table.children.slice(1).map(row => {
              const cells = row.children.map(cell => {
                const t = cell.children[0];
                return t.type === 'text' ? t.value : '';
              });

              return headers.reduce((acc, header, i) => ({
                ...acc,
                [header]: cells[i] || ''
              }), {} as Record<string, string>);
            });

            results.push({
              directive,
              line: table.position?.start.line || 0,
              headers,
              rows
            });
          }
        }
      }
    }
  });

  return results;
};
