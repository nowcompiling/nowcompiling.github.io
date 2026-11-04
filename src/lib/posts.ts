// 역할: 발행 글만 최신순으로 꺼내고 글 종류 이름을 붙인다. 호출: 모든 글 관련 페이지.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Kind = Post['data']['kind'];

export const KIND_LABEL: Record<Kind, string> = { case: '사례', tried: '해봤더니', howto: '따라하기' };

// 초안·내림을 거르는 곳은 여기 하나뿐이다(S00-F01, F03)
export async function getPublished(kind?: Kind): Promise<Post[]> {
  const all = await getCollection('posts', (p) => p.data.status === 'published' && (!kind || p.data.kind === kind));
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
