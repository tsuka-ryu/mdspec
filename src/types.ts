/**
 * @file 型定義
 * パーサーで使用する型を定義します。
 */

export type ParsedDirective = {
  directive: string;
  line: number;
  headers: string[];
  rows: Record<string, string>[];
};
