/**
 * @file テーブル抽出ユーティリティ
 * Markdown ASTからテーブルデータを抽出する汎用的な関数を提供します。
 * ディレクティブの検出、テーブルの取得、ヘッダーと行データの抽出などを行います。
 */

import type { Node, Parent, Paragraph, Table, TableCell } from 'mdast';
import { Option as O, pipe } from 'effect';

// テーブルセルからテキストを抽出
export const extractCellText = (cell: TableCell): string =>
  pipe(
    O.fromNullable(cell.children[0]),
    O.filter((node): node is { type: 'text'; value: string } => node.type === 'text'),
    O.map(node => node.value),
    O.getOrElse(() => '')
  );

// テーブルからヘッダーを抽出
export const extractHeaders = (table: Table): string[] =>
  table.children[0].children.map(extractCellText);

// テーブルから行データを抽出
export const extractRows = (table: Table, headers: string[]): Record<string, string>[] =>
  table.children.slice(1).map(row => {
    const cells = row.children.map(extractCellText);
    return headers.reduce((acc, header, i) => ({
      ...acc,
      [header]: cells[i] || ''
    }), {} as Record<string, string>);
  });

// ノードからディレクティブテキストを取得
export const getDirectiveText = (node: Node): O.Option<string> =>
  pipe(
    O.liftPredicate((n: Node) => n.type === 'paragraph')(node),
    O.flatMap(n => O.fromNullable((n as Paragraph).children[0])),
    O.filter((text): text is { type: 'text'; value: string } =>
      text.type === 'text' && text.value.startsWith('@')
    ),
    O.map(text => text.value.trim())
  );

// 親ノードから次のテーブルを取得
export const getNextTable = (
  parent: Parent | null | undefined,
  index: number | null | undefined
): O.Option<Table> =>
  pipe(
    O.all({
      parent: O.fromNullable(parent),
      index: O.fromNullable(index),
    }),
    O.flatMap(({ parent, index }) => O.fromNullable(parent.children[index + 1])),
    O.filter((n): n is Table => n.type === 'table')
  );

// ディレクティブとテーブルのペアを取得
export const getDirectiveAndTable = (
  node: Node,
  parent: Parent | null | undefined,
  index: number | null | undefined
): O.Option<{ directive: string; table: Table }> =>
  pipe(
    getDirectiveText(node),
    O.flatMap(directive =>
      pipe(
        getNextTable(parent, index),
        O.map(table => ({ directive, table }))
      )
    )
  );
