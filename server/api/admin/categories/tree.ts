import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


interface CategoryRow {
  id: number
  name: string
  slug: string
  active: boolean
  parent_id: number | null
}

interface Category extends CategoryRow {
  children: Category[]
}

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);

  const { data, error } = await client
    .from('categories')
    .select('id, name, slug, active, parent_id')
    .order('id', { ascending: true });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (!data) {
    return [];
  }

  const map = new Map<number, Category>();
  const roots: Category[] = [];

  for (const c of data as CategoryRow[]) {
    map.set(c.id, { ...c, children: [] });
  }

  for (const c of data as CategoryRow[]) {
    const node = map.get(c.id)!;

    if (c.parent_id) {
      const parent = map.get(c.parent_id);

      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
});
