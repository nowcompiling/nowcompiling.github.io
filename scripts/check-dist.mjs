// 역할: 빌드 결과(dist)가 요구사항 완료 조건을 지키는지 점검. 호출: npm run check, Actions 배포 전.
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const has = (p) => existsSync(new URL(`../dist/${p}`, import.meta.url));

// U1 배포 경로
assert.ok(has('index.html'), 'dist/index.html 없음');
assert.match(read('index.html'), /HENRY/);

console.log('check-dist: 통과');
