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

// 全ディレクティブで共通のグローバルヘッダー
const GLOBAL_HEADERS = ['項目ID', '項目名'];

// 各ディレクティブ固有のヘッダー
const DIRECTIVE_SPECIFIC_HEADERS: Record<string, string[]> = {
  '@Button': ['イベント名'],
  '@TextBox': ['桁数'],
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
              return t && t.type === 'text' ? t.value : '';
            });

            // ヘッダーの検証
            const specificHeaders = DIRECTIVE_SPECIFIC_HEADERS[directive];
            if (specificHeaders !== undefined) {
              // このディレクティブで許可されるヘッダー = グローバル + 固有
              const allowedHeaders = [...GLOBAL_HEADERS, ...specificHeaders];

              // 必須ヘッダーの不足をチェック
              const missingHeaders = allowedHeaders.filter(
                required => !headers.includes(required)
              );
              if (missingHeaders.length > 0) {
                console.error(
                  `[警告] ${directive} のテーブルに必須ヘッダーが不足しています: ${missingHeaders.join(', ')} (行: ${table.position?.start.line || 0})`
                );
              }

              // 許可されていないヘッダーをチェック
              const invalidHeaders = headers.filter(
                header => header !== '' && !allowedHeaders.includes(header)
              );
              if (invalidHeaders.length > 0) {
                console.error(
                  `[警告] ${directive} のテーブルに許可されていないヘッダーが含まれています: ${invalidHeaders.join(', ')} (行: ${table.position?.start.line || 0})`
                );
              }
            }

            const rows = table.children.slice(1).map(row => {
              const cells = row.children.map(cell => {
                const t = cell.children[0];
                return t && t.type === 'text' ? t.value : '';
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
