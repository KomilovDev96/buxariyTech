import 'server-only';
import { cache } from 'react';
import type { SiteBlock } from '@buhariy/contracts';
import { api } from './api';
import { getLocale } from './i18n';
const getSiteBlocks = cache(() => api<SiteBlock[]>('/site-blocks', true));
export async function getSiteBlock(key: SiteBlock['key']) {
  const [blocks, locale] = await Promise.all([getSiteBlocks(), getLocale()]);
  const localizedBlock = blocks.find((block) => block.key === key && block.locale === locale)!;
  const baseBlock = blocks.find((block) => block.key === key && block.locale === 'uz');

  return baseBlock ? { ...localizedBlock, imageUrl: baseBlock.imageUrl } : localizedBlock;
}
