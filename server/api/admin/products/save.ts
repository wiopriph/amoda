import { serverSupabaseServiceRole } from '#supabase/server'
import { assertAdmin } from '~~/server/utils/assertAdmin'

export default defineEventHandler(async (event) => {
  await assertAdmin(event)
  const client = await serverSupabaseServiceRole(event)
  const body = await readBody(event)

  if (!body.title) throw createError({ statusCode: 400, statusMessage: 'Title required' })

  const slug = body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const payload = {
    title: body.title,
    slug,
    brand_id: body.brand_id || null,
    primary_category_id: body.primary_category_id || null,
    description: body.description || null,
    active: body.active ?? true,
  }

  const { data, error } = body.id
    ? await client.from('products').update(payload).eq('id', body.id).select().single()
    : await client.from('products').insert(payload).select().single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
