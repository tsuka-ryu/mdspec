/**
 * @file Markdownパーサー
 * Markdownドキュメントからディレクティブ（@Button、@TextBoxなど）と
 * それに紐づくテーブルを抽出し、構造化されたデータに変換します。
 * ヘッダーの検証も同時に行い、問題があれば警告を出力します。
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import type { Root, Table } from 'mdast';
import { Option as O, pipe } from 'effect';

import type { ParsedDirective } from './types.js';
import {
  extractHeaders,
  extractRows,
  getDirectiveAndTable
} from './table-extractor.js';
import { validateHeaders } from './directive-validator.js';

// ディレクティブとテーブルのペアを処理
const processDirectiveTable = (
  directive: string,
  table: Table
): ParsedDirective => {
  const headers = extractHeaders(table);
  const line = table.position?.start.line || 0;

  // ヘッダーの検証
  validateHeaders(directive, headers, line);

  // 行データの抽出
  const rows = extractRows(table, headers);

  return { directive, line, headers, rows };
};

export const parse = (markdown: string): ParsedDirective[] => {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown) as Root;

  const results: ParsedDirective[] = [];

  visit(tree, (node, index, parent) => {
    const result: O.Option<ParsedDirective> = pipe(
      getDirectiveAndTable(node, parent, index),
      O.map(({ directive, table }) => processDirectiveTable(directive, table))
    );

    if (O.isSome(result)) {
      results.push(result.value);
    }
  });

  return results;
};
