import { serverSupabaseServiceRole } from '#supabase/server';
import { assertAdmin } from '~~/server/utils/assertAdmin';


interface Gender {
  id: number;
  name: string;
  code: string;
}

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  parent_id: number | null;
  gender_id: number | null;
  genders?: Gender | null;
}

interface Category extends Omit<CategoryRow, 'genders'> {
  gender?: Gender | null;
  children: Category[];
}

export default defineEventHandler(async (event) => {
  await assertAdmin(event);

  const client = await serverSupabaseServiceRole(event);

  const { data, error } = await client
    .from('categories')
    .select(`
      id,
      name,
      slug,
      active,
      parent_id,
      gender_id,
      genders ( id, name, code )
    `)
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
    map.set(c.id, {
      ...c,
      gender: c.genders ?? null,
      children: [],
    });
  }

  for (const c of data as CategoryRow[]) {
    const category = map.get(c.id)!;

    if (c.parent_id) {
      const parent = map.get(c.parent_id);

      if (parent) {
        parent.children.push(category);
      } else {
        roots.push(category);
      }
    } else {
      roots.push(category);
    }
  }

  return roots;
});
