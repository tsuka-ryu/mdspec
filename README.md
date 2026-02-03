> ⚠️ **WIP (Work In Progress)**  
> このプロジェクトは現在開発途中です。仕様やAPIは予告なく変更される可能性があります。

# markdown-spec-core

Markdownファイル内の `@ディレクティブ` とテーブルをパースして構造化データに変換するパーサー。

## 特徴

- Markdown内の `@` で始まるディレクティブを検出
- 直後のテーブルを構造化データとして抽出
- TypeScript完全対応
- 依存関係最小限

## インストール

```bash
npm install
```

## 使い方

```typescript
import { parse } from './parser.js';

const markdown = `
@Button
| 項目ID | 項目名 | イベント名 |
|--------|--------|-----------|
| BTN001 | 登録 | onClick_save |
| BTN002 | 削除 | onClick_delete |
`;

const result = parse(markdown);
console.log(result);
```

### 出力

```json
[
  {
    "directive": "@Button",
    "line": 3,
    "headers": ["項目ID", "項目名", "イベント名"],
    "rows": [
      {
        "項目ID": "BTN001",
        "項目名": "登録",
        "イベント名": "onClick_save"
      },
      {
        "項目ID": "BTN002",
        "項目名": "削除",
        "イベント名": "onClick_delete"
      }
    ]
  }
]
```

## API

### `parse(markdown: string): ParsedDirective[]`

Markdown文字列をパースし、ディレクティブとテーブルの配列を返します。

#### 戻り値の型

```typescript
type ParsedDirective = {
  directive: string;        // ディレクティブ名（例: "@Button"）
  line: number;            // テーブルの開始行番号
  headers: string[];       // テーブルのヘッダー
  rows: Record<string, string>[]; // 各行のデータ
};
```

## テスト実行

```bash
npx tsx test.ts
```

## ライセンス

MIT
