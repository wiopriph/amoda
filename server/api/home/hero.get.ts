import { serverSupabaseServiceRole } from '#supabase/server';


type HomeHeroVariantRow = {
  id: string
  name: string | null
  title: string | null
  subtitle: string | null
  social_proof: string | null
  bullets: string[] | null
  cta_primary: string | null
  whatsapp_label: string | null
  tiktok_title: string | null
  tiktok_subtitle: string | null
  is_tiktok_live: boolean | null
  image_url: string | null
};

export type HomeHeroResponse = {
  id: string
  name: string | null
  title: string | null
  subtitle: string | null
  socialProof: string | null
  bullets: string[]
  ctaPrimary: string | null
  whatsappLabel: string | null
  tiktokTitle: string | null
  tiktokSubtitle: string | null
  isTiktokLive: boolean
  imageUrl: string | null
};

export default defineEventHandler(async (event): Promise<HomeHeroResponse | null> => {
  const supabase = await serverSupabaseServiceRole(event);

  const { data, error } = await supabase
    .from('home_hero_variants')
    .select(`
      id,
      name,
      title,
      subtitle,
      social_proof,
      bullets,
      cta_primary,
      whatsapp_label,
      tiktok_title,
      tiktok_subtitle,
      is_tiktok_live,
      image_url
    `)
    .eq('is_active', true)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<HomeHeroVariantRow>();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    title: data.title,
    subtitle: data.subtitle,
    socialProof: data.social_proof,
    bullets: data.bullets ?? [],
    ctaPrimary: data.cta_primary,
    whatsappLabel: data.whatsapp_label,
    tiktokTitle: data.tiktok_title,
    tiktokSubtitle: data.tiktok_subtitle,
    isTiktokLive: data.is_tiktok_live ?? false,
    imageUrl: data.image_url,
  };
});
