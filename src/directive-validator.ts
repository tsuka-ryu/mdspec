/**
 * @file ディレクティブ検証ロジック
 * ディレクティブ固有のヘッダー定義と検証を行います。
 * グローバルヘッダーとディレクティブ固有ヘッダーを組み合わせて、
 * テーブルのヘッダーが正しいかをチェックします。
 */

import { Option as O, pipe } from 'effect';

// 全ディレクティブで共通のグローバルヘッダー
const GLOBAL_HEADERS = ['項目ID', '項目名'];

// 各ディレクティブ固有のヘッダー
const DIRECTIVE_SPECIFIC_HEADERS: Record<string, string[]> = {
  '@Button': ['イベント名'],
  '@TextBox': ['桁数'],
};

// 許可されたヘッダーのリストを取得
export const getAllowedHeaders = (directive: string): O.Option<string[]> =>
  pipe(
    O.fromNullable(DIRECTIVE_SPECIFIC_HEADERS[directive]),
    O.map(specificHeaders => [...GLOBAL_HEADERS, ...specificHeaders])
  );

// ヘッダーの検証を実行
export const validateHeaders = (directive: string, headers: string[], line: number): void => {
  pipe(
    getAllowedHeaders(directive),
    O.map(allowedHeaders => {
      // 必須ヘッダーの不足をチェック
      const missingHeaders = allowedHeaders.filter(
        required => !headers.includes(required)
      );
      if (missingHeaders.length > 0) {
        console.error(
          `[警告] ${directive} のテーブルに必須ヘッダーが不足しています: ${missingHeaders.join(', ')} (行: ${line})`
        );
      }

      // 許可されていないヘッダーをチェック
      const invalidHeaders = headers.filter(
        header => header !== '' && !allowedHeaders.includes(header)
      );
      if (invalidHeaders.length > 0) {
        console.error(
          `[警告] ${directive} のテーブルに許可されていないヘッダーが含まれています: ${invalidHeaders.join(', ')} (行: ${line})`
        );
      }
    })
  );
};
