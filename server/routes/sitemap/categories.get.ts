import { defineSitemapEventHandler } from '#imports';
import { serverSupabaseClient } from '#supabase/server';


type GenderRow = { id: number; code: string };
type CategoryRow = { id: number; slug: string; gender_id: number };

export default defineSitemapEventHandler(async (event) => {
  const db = await serverSupabaseClient(event);

  const [gendersRes, categoriesRes] = await Promise.all([
    db.from('genders').select('id, code'),
    db.from('categories').select('id, slug, gender_id')
      .order('slug', { ascending: true }),
  ]);

  if (gendersRes.error) {
    throw createError({ statusCode: 500, statusMessage: gendersRes.error.message });
  }

  if (categoriesRes.error) {
    throw createError({ statusCode: 500, statusMessage: categoriesRes.error.message });
  }

  const genders = (gendersRes.data || []) as GenderRow[];
  const categories = (categoriesRes.data || []) as CategoryRow[];

  if (!genders.length || !categories.length) {
    return [];
  }

  const genderCodeById = new Map<number, string>(genders.map(g => [g.id, g.code]));

  const locales: string[] = ['', 'en'];
  const CHANGEFREQ = 'weekly';
  const PRIORITY = 0.6;

  const urls: { loc: string; changefreq: typeof CHANGEFREQ; priority: typeof PRIORITY }[] = [];

  for (const category of categories) {
    const genderCode = genderCodeById.get(category.gender_id);

    if (!genderCode) continue;

    for (const locale of locales) {
      const prefix = locale ? `/${locale}` : '';

      urls.push({
        loc: `${prefix}/${genderCode}/${category.slug}`,
        changefreq: CHANGEFREQ,
        priority: PRIORITY,
      });
    }
  }

  return urls;
});
