import { parse } from './src/index.js';

const markdown = `
@Button
| 項目ID | 項目名 | イベント名 |
|--------|--------|-----------|
| BTN001 | 登録 | onClick_save |
| BTN002 | 削除 | onClick_delete |

@TextBox
| 項目ID | 項目名 | うんち |
|--------|--------|------|
| TXT001 | ユーザー名 | 50 |
`;

const result = parse(markdown);
console.log(JSON.stringify(result, null, 2));
