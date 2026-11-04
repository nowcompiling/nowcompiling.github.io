// 역할: Astro 빌드 설정(사이트 주소). 호출: astro build / astro dev.
import { defineConfig } from 'astro/config';

// ponytail: 도메인 연결(U9) 전까지 GitHub Pages 기본 주소, 연결 뒤 www.nowcompiling.dev 로 바꾼다
export default defineConfig({
  site: 'https://nowcompiling.github.io',
});
