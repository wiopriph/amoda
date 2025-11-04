import { serverSupabaseServiceRole } from '#supabase/server'
import { assertAdmin } from '~~/server/utils/assertAdmin'

export default defineEventHandler(async (event) => {
    await assertAdmin(event)
    const client = await serverSupabaseServiceRole(event)
    const body = await readBody(event)

    if (!body.id) throw createError({ statusCode: 400, statusMessage: 'Variant ID required' })

    const { error } = await client.from('product_variants').delete().eq('id', body.id)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })

    return { deleted: true }
})
