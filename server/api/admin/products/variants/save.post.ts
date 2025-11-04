import { serverSupabaseServiceRole } from '#supabase/server'
import { assertAdmin } from '~~/server/utils/assertAdmin'

export default defineEventHandler(async (event) => {
    await assertAdmin(event)
    const client = await serverSupabaseServiceRole(event)
    const body = await readBody(event)

    const {
        id,
        product_id,
        color,
        price,
        active
    } = body

    if (!product_id || !price) {
        throw createError({ statusCode: 400, statusMessage: 'Product ID and price required' })
    }

    const payload = {
        product_id,
        color,
        price,
        active: active ?? true
    }

    const { data, error } = id
        ? await client.from('product_variants').update(payload).eq('id', id).select().single()
        : await client.from('product_variants').insert(payload).select().single()

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data
})
