import { serverSupabaseClient } from '#supabase/server';


type CategoryRow = {
  id: number
  name: string
  slug: string
  parent_id: number | null
};

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);

  const { data: categoryRows, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (!categoryRows?.length) {
    return [];
  }

  const childrenByParent = new Map<number | 'root', CategoryRow[]>();

  for (const category of categoryRows as CategoryRow[]) {
    const key = (category.parent_id ?? 'root') as number | 'root';

    if (!childrenByParent.has(key)) {
      childrenByParent.set(key, []);
    }

    childrenByParent.get(key)!.push(category);
  }

  const buildTree = (parentKey: number | 'root' = 'root') =>
    (childrenByParent.get(parentKey) || []).map((node) => ({
      id: node.id,
      name: node.name,
      slug: node.slug,
      parent_id: node.parent_id,
      children: buildTree(node.id),
    }));

  return buildTree('root');
});
