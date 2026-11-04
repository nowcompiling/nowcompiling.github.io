// 역할: 빌드 결과가 요구사항 완료 조건을 지키는지 점검. 호출: npm run check(로컬·Actions 배포 전).
// 사용: node scripts/check-dist.mjs <dist 폴더> [--fixtures]
//   --fixtures: tests/fixtures/posts 로 만든 점검 빌드 — 초안·내림·빈 종류까지 확인
//   없으면: 실제 빌드 — 모든 글에 공통 규칙만 확인
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const [dir = 'dist', flag] = process.argv.slice(2);
const read = (p) => readFileSync(join(dir, p), 'utf8');
const has = (p) => existsSync(join(dir, p));
const MAIL = 'mailto:nowcompiling.dev@gmail.com';
const CASE_ORDER = ['누구의 어떤 업무', '전', '무엇을 만들었나', '후', '비용과 기간'];
const h2s = (html) => [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());

// 3.1 첫 화면 (S01, S06)
const home = read('index.html');
for (const t of ['HENRY', 'Camping Developer', 'AI Automation Maker', '돌아갈 때까지 만듭니다', 'href="/story/"', '가계부족', MAIL, 'href="/posts/"'])
  assert.ok(home.includes(t), `첫 화면에 ${t} 없음`);
assert.ok((home.match(/class="posts"[\s\S]*?<\/ul>/)?.[0].match(/<li>/g) ?? []).length <= 3, '첫 화면 최신 글이 3편 초과');

// 3.1 전체 읽기 (S04): 6개 절 + 연락
const story = read('story/index.html');
assert.deepEqual(h2s(story), ['만들어 온 것', '작은 문제가 보이기 시작했다', '왜 지금, 왜 nowcompiling', '돌아갈 때까지', '캠핑하는 개발자', '약속']);
assert.ok(story.includes(MAIL), '나의 스토리 끝 연락 없음');

// 3.3a 찾는 글 없음 (S05)
assert.ok(read('404.html').includes('찾는 글이 없습니다.') && read('404.html').includes('href="/posts/"'), '404 문구·링크 없음');

// 3.2 종류별 목록 3장 (S02)
for (const k of ['case', 'tried', 'howto']) assert.ok(has(`posts/kind/${k}/index.html`), `종류 ${k} 목록 없음`);

// 3.3 모든 글: 끝 연락, 사례 글은 5단 제목 순서 + 본문 안 캡처
const slugs = has('posts') ? readdirSync(join(dir, 'posts'), { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'kind').map((d) => d.name) : [];
for (const s of slugs) {
  const html = read(`posts/${s}/index.html`);
  assert.ok(html.includes(MAIL), `${s}: 글 끝 연락 없음`);
  if (html.includes('class="kind">사례')) {
    assert.deepEqual(h2s(html).filter((h) => CASE_ORDER.includes(h)), CASE_ORDER, `${s}: 사례 글 순서가 다름`);
    const body = html.split('<h2')[3] ?? ''; // 세 번째 제목(무엇을 만들었나) 절
    assert.ok(/<img /.test(body.split('</h2>')[1]?.split('<h2')[0] ?? body), `${s}: "무엇을 만들었나" 절에 캡처 없음`);
  }
}

if (flag === '--fixtures') {
  // 3.5 초안·3.6 내림은 어디에도 없다
  const everything = [home, read('posts/index.html'), ...['case', 'tried', 'howto'].map((k) => read(`posts/kind/${k}/index.html`))].join('');
  for (const secret of ['SECRET-DRAFT', 'SECRET-UNPUB']) assert.ok(!everything.includes(secret), `${secret} 노출`);
  assert.ok(!has('posts/draft-hidden/index.html') && !has('posts/unpublished-hidden/index.html'), '초안·내린 글 페이지가 만들어짐');
  // 3.2 최신순, 3.2a 빈 종류
  const list = read('posts/index.html');
  assert.ok(list.indexOf('점검용 해봤더니 글') < list.indexOf('점검용 사례 글'), '최신순 아님');
  assert.ok(read('posts/kind/howto/index.html').includes('아직 이 종류의 글이 없습니다.'), '빈 종류 안내 없음');
  assert.ok(!read('posts/kind/case/index.html').includes('점검용 해봤더니 글'), '종류 거르기 실패');
  assert.ok(slugs.includes('case-published'), '사례 글 페이지 없음');
}

console.log(`check-dist(${dir}${flag ? ' ' + flag : ''}): 통과`);
