// 역할: 글 머리말 규칙(글 종류·상태·사례 글 캡처). 호출: astro build 의 콘텐츠 로딩.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const KINDS = ['case', 'tried', 'howto'] as const;
export const STATUSES = ['draft', 'published', 'unpublished'] as const;

const posts = defineCollection({
  // 점검 빌드는 ASTRO_POSTS 로 tests/fixtures/posts 를 읽는다
  loader: glob({ pattern: '**/*.md', base: process.env.ASTRO_POSTS ?? './src/content/posts' }),
  schema: z
    .object({
      title: z.string().min(1),
      kind: z.enum(KINDS),
      status: z.enum(STATUSES).default('draft'),
      date: z.coerce.date(),
      summary: z.string().min(1),
      captures: z.array(z.string().url()).default([]),
    })
    .refine((p) => p.kind !== 'case' || p.captures.length > 0, {
      message: '사례 글(case)은 captures 에 캡처 링크가 1개 이상 있어야 발행된다',
      path: ['captures'],
    }),
});

export const collections = { posts };
