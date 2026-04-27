<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';


const { t } = useI18n();
const localeRoute = useLocaleRoute();
const { count } = useCart();

const isCategoriesOpen = ref(false);

type NavCategory = {
  slug: string
  name: string
  image: string | null
  parent_id?: number | null
};

const { data: categories } = await useFetch<NavCategory[]>('/api/categories/list');

const topCategories = computed<NavCategory[]>(() =>
  categories.value?.filter(cat => !cat.parent_id) ?? [],
);

const hasCategories = computed(() => topCategories.value.length > 0);

const menuItems = computed<NavigationMenuItem[]>(() =>
  topCategories.value.slice(0, 6).map(cat => ({
    label: cat.name,
    to: localeRoute({ name: 'category-slug', params: { slug: cat.slug } }),
  })),
);
</script>

<i18n lang="json">
{
  "pt": {
    "header": {
      "tagline": "Experimente antes de pagar · Pague só o que gostar",
      "cart": "Reserva",
      "cartCount": "Itens reservados: {count}",
      "categories": "Categorias",
      "categoriesDesc": "Escolha o que quer experimentar",
      "close": "Fechar",
      "new": "Novidades"
    }
  },
  "en": {
    "header": {
      "tagline": "Try before you pay · Pay only for what you like",
      "cart": "Selection",
      "cartCount": "Reserved items: {count}",
      "categories": "Categories",
      "categoriesDesc": "Choose what you want to try",
      "close": "Close",
      "new": "New arrivals"
    }
  }
}
</i18n>

<template>
  <div class="sticky top-0 z-50">
    <div class="bg-primary px-4 py-1.5 text-center text-xs font-semibold text-white">
      {{ t('header.tagline') }}
    </div>

    <UHeader
      :toggle="false"
      :ui="{ container: 'lg:px-12' }"
      class="border-b border-gray-100 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/75"
    >
      <template #left>
        <div class="flex items-center gap-2">
          <USlideover
            v-if="hasCategories"
            v-model:open="isCategoriesOpen"
            side="left"
            class="md:hidden"
          >
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-heroicons-bars-3"
              aria-label="Menu"
            />

            <template #content>
              <div class="flex h-full flex-col bg-white">
                <div class="border-b border-gray-100 px-4 py-4">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <div class="text-lg font-black text-highlighted">
                        {{ t('header.categories') }}
                      </div>

                      <div class="mt-1 text-sm text-muted">
                        {{ t('header.categoriesDesc') }}
                      </div>
                    </div>

                    <UButton
                      variant="ghost"
                      color="neutral"
                      size="sm"
                      icon="i-heroicons-x-mark"
                      :aria-label="t('header.close')"
                      @click="isCategoriesOpen = false"
                    />
                  </div>
                </div>

                <div class="flex-1 overflow-y-auto px-4 py-3">
                  <div class="grid gap-2">
                    <NuxtLink
                      v-for="category in categories || []"
                      :key="category.slug"
                      :to="localeRoute({ name: 'category-slug', params: { slug: category.slug } })"
                      class="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 transition hover:border-primary/30 hover:bg-primary/5"
                      @click="isCategoriesOpen = false"
                    >
                      <div
                        class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100"
                      >
                        <img
                          v-if="category.image"
                          :src="category.image"
                          :alt="category.name"
                          class="h-full w-full object-cover transition group-hover:scale-105"
                          loading="lazy"
                        >

                        <UIcon
                          v-else
                          name="i-lucide-shirt"
                          class="size-6 text-muted"
                        />
                      </div>

                      <span class="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-highlighted">
                        {{ category.name }}
                      </span>

                      <UIcon
                        name="i-heroicons-chevron-right"
                        class="size-4 text-muted"
                      />
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </template>
          </USlideover>

          <NuxtLink
            :to="localeRoute({ name: 'index' })"
            class="font-montserrat text-[22px] font-black tracking-tight text-highlighted transition hover:opacity-70"
          >
            <svg
              class="h-6 sm:h-7 w-auto fill-current"
              width="1816"
              height="454"
              viewBox="0 0 1816 454"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M320.6 421.2V409.2L333.8 405.6C340.2 403.6 344.4 400.8 346.4 397.2C348.4 393.2 349.6 388 350 381.6V262.8C350 249.6 350 238.4 350 229.2C350 220 349.8 209.2 349.4 196.8C349.4 190 348.4 184.8 346.4 181.2C344.4 177.2 340 174.4 333.2 172.8L320.6 169.8V159L417.8 124.2L425 130.8L429.2 171C443.2 158.2 458.8 147.2 476 138C493.2 128.8 510.8 124.2 528.8 124.2C548.8 124.2 564.4 128.2 575.6 136.2C586.8 144.2 595.4 156.4 601.4 172.8C616.6 157.6 633.4 145.8 651.8 137.4C670.2 128.6 688.4 124.2 706.4 124.2C733.6 124.2 754 131 767.6 144.6C781.2 158.2 788 179.6 788 208.8V382.2C788 395 793.6 403 804.8 406.2L816.2 409.2V421.2H681.2V409.2L692 406.2C702.8 402.6 708.2 394.4 708.2 381.6V205.8C708.2 188.6 705 177 698.6 171C692.6 164.6 682.6 161.4 668.6 161.4C657.8 161.4 647.6 163.6 638 168C628.4 172.4 617.8 179.2 606.2 188.4C608.6 200.4 609.8 214.2 609.8 229.8V382.2C610.2 389 611.4 394.4 613.4 398.4C615.8 402 620.2 404.6 626.6 406.2L636.8 409.2V421.2H501.2V409.2L513.8 405.6C520.2 403.6 524.4 400.8 526.4 397.2C528.8 393.2 530 388 530 381.6V206.4C530 190 527 178.4 521 171.6C515 164.8 504.8 161.4 490.4 161.4C472 161.4 452.2 170.2 431 187.8V382.2C431 395.4 436.6 403.4 447.8 406.2L458 409.2V421.2H320.6ZM990.913 429.6C961.313 429.6 935.313 423.4 912.913 411C890.913 398.6 873.713 381 861.313 358.2C849.313 335.4 843.313 308.2 843.313 276.6C843.313 245 849.713 217.8 862.513 195C875.713 172.2 893.313 154.8 915.313 142.8C937.713 130.4 962.913 124.2 990.913 124.2C1018.91 124.2 1043.91 130.4 1065.91 142.8C1088.31 154.8 1105.91 172.2 1118.71 195C1131.91 217.4 1138.51 244.6 1138.51 276.6C1138.51 308.2 1132.31 335.6 1119.91 358.8C1107.91 381.6 1090.91 399.2 1068.91 411.6C1046.91 423.6 1020.91 429.6 990.913 429.6ZM990.913 412.8C1005.31 412.8 1016.91 409 1025.71 401.4C1034.91 393.4 1041.51 379.6 1045.51 360C1049.51 340.4 1051.51 313 1051.51 277.8C1051.51 242.2 1049.51 214.6 1045.51 195C1041.51 175 1034.91 161.2 1025.71 153.6C1016.91 145.6 1005.31 141.6 990.913 141.6C976.513 141.6 964.913 145.6 956.113 153.6C947.313 161.2 940.713 175 936.313 195C932.313 214.6 930.313 242.2 930.313 277.8C930.313 313 932.313 340.4 936.313 360C940.713 379.6 947.313 393.4 956.113 401.4C964.913 409 976.513 412.8 990.913 412.8ZM1295.04 429.6C1271.44 429.6 1250.24 424.4 1231.44 414C1212.64 403.2 1197.84 386.8 1187.04 364.8C1176.64 342.4 1171.44 314 1171.44 279.6C1171.44 245.2 1177.44 216.6 1189.44 193.8C1201.44 170.6 1217.44 153.2 1237.44 141.6C1257.44 130 1279.44 124.2 1303.44 124.2C1317.84 124.2 1331.64 126 1344.84 129.6C1358.04 132.8 1369.64 137.8 1379.64 144.6V66.6002C1379.64 58.2002 1378.24 52.2002 1375.44 48.6002C1373.04 44.6002 1367.84 41.6002 1359.84 39.6002L1347.84 37.2002V25.8002L1452.24 0.000182152L1460.04 5.40018L1457.64 90.0002V378.6C1457.64 386.2 1459.04 392.6 1461.84 397.8C1464.64 402.6 1469.64 406 1476.84 408L1483.44 409.8V421.2L1383.84 427.8L1378.44 402.6C1367.64 411 1355.24 417.6 1341.24 422.4C1327.24 427.2 1311.84 429.6 1295.04 429.6ZM1328.04 402C1345.24 402 1361.44 396.4 1376.64 385.2V162C1361.84 152.8 1345.84 148.2 1328.64 148.2C1309.04 148.2 1292.24 158.6 1278.24 179.4C1264.24 199.8 1257.24 232.8 1257.24 278.4C1257.24 324 1263.84 356 1277.04 374.4C1290.24 392.8 1307.24 402 1328.04 402ZM1591.78 429.6C1568.98 429.6 1549.58 423.2 1533.58 410.4C1517.98 397.2 1510.18 378.4 1510.18 354C1510.18 334.8 1519.38 317.2 1537.78 301.2C1556.58 284.8 1585.98 272.8 1625.98 265.2C1632.78 263.6 1640.58 262.2 1649.38 261C1658.58 259.4 1667.58 257.8 1676.38 256.2V213.6C1676.38 186.4 1672.98 167.6 1666.18 157.2C1659.38 146.8 1648.58 141.6 1633.78 141.6H1631.98C1622.78 141.6 1615.38 144.6 1609.78 150.6C1604.58 156.2 1601.18 165.6 1599.58 178.8L1597.78 186.6C1596.58 202.6 1592.38 214.4 1585.18 222C1577.98 229.2 1568.98 232.8 1558.18 232.8C1548.18 232.8 1539.78 229.8 1532.98 223.8C1526.58 217.4 1523.38 209.2 1523.38 199.2C1523.38 182.8 1528.98 169 1540.18 157.8C1551.38 146.6 1566.18 138.2 1584.58 132.6C1603.38 127 1623.58 124.2 1645.18 124.2C1680.78 124.2 1707.98 132.8 1726.78 150C1745.58 167.2 1754.98 195.2 1754.98 234V367.8C1754.98 385 1763.18 393.6 1779.58 393.6H1793.38L1799.38 400.2C1792.18 409.4 1784.18 416.4 1775.38 421.2C1766.58 426.4 1754.58 429 1739.38 429C1722.18 429 1708.38 425 1697.98 417C1687.98 408.6 1681.38 397.6 1678.18 384C1665.38 397.6 1652.78 408.6 1640.38 417C1627.98 425.4 1611.78 429.6 1591.78 429.6ZM1626.58 391.2C1634.58 391.2 1642.18 389.4 1649.38 385.8C1656.58 382.2 1665.58 376.2 1676.38 367.8V271.8C1665.98 273.4 1655.38 275.4 1644.58 277.8C1627.38 281.8 1613.38 289.2 1602.58 300C1592.18 310.8 1586.98 325.4 1586.98 343.8C1586.98 359.8 1590.58 371.8 1597.78 379.8C1605.38 387.4 1614.98 391.2 1626.58 391.2Z"
                fill="black"
              />

              <path
                d="M98.7097 452.946C77.0968 452.946 60 444.72 47.4194 428.269C35.1613 411.494 29.0323 388.591 29.0323 359.559C29.0323 336.978 32.5806 315.527 39.6774 295.204C46.7742 274.882 56.4516 256.978 68.7097 241.494C81.2903 225.688 95.6452 213.269 111.774 204.236C127.903 195.204 144.677 190.688 162.097 190.688C177.258 190.688 191.613 194.236 205.161 201.333C218.71 208.107 230.806 218.107 241.452 231.333L209.032 256.011C206.129 240.849 200.806 229.236 193.065 221.172C185.323 213.107 175.806 209.075 164.516 209.075C152.903 209.075 141.774 213.107 131.129 221.172C120.484 229.236 110.968 240.204 102.581 254.075C94.5161 267.946 88.0645 283.753 83.2258 301.494C78.3871 318.914 75.9677 337.14 75.9677 356.172C75.9677 378.753 79.6774 395.527 87.0968 406.494C94.5161 417.462 105.161 422.946 119.032 422.946C129.677 422.946 139.355 419.72 148.065 413.269C157.097 406.494 165.161 396.656 172.258 383.753V398.269C163.871 416.011 153.387 429.559 140.806 438.914C128.548 448.269 114.516 452.946 98.7097 452.946ZM185.323 322.301L212.419 225.043C222.419 221.172 232.258 216.172 241.935 210.043C251.613 203.914 260.645 196.978 269.032 189.236L279.677 203.753C274.194 208.269 269.677 212.785 266.129 217.301C262.581 221.817 259.677 226.817 257.419 232.301C255.161 237.785 252.903 244.559 250.645 252.623L230.806 322.301H185.323ZM213.871 381.817C210.323 395.365 209.677 406.172 211.935 414.236C214.194 421.978 219.839 425.849 228.871 425.849C235.968 425.849 242.742 423.107 249.194 417.623C255.645 412.14 261.613 404.075 267.097 393.43L276.774 375.527H295.161L284.516 396.333C278.387 407.623 271.774 417.623 264.677 426.333C257.581 435.043 249.677 441.817 240.968 446.656C232.581 451.494 222.903 453.914 211.935 453.914C198.387 453.914 187.742 450.527 180 443.753C172.258 436.978 167.581 427.623 165.968 415.688C164.677 403.43 166.29 389.559 170.806 374.075L185.323 322.301H230.806L213.871 381.817Z"
                fill="black"
              />
            </svg>
          </NuxtLink>
        </div>
      </template>

      <UNavigationMenu
        :items="menuItems"
        class="hidden md:flex"
        :ui="{
          list: 'gap-1',
          link: 'text-sm font-medium text-muted hover:text-primary'
        }"
      />

      <template #right>
        <div class="flex items-center gap-1 sm:gap-2">
          <UButton
            :to="localeRoute({ name: 'category-slug', params: { slug: 'mulheres' } })"
            variant="soft"
            color="primary"
            size="sm"
            class="hidden sm:inline-flex"
          >
            {{ t('header.new') }}
          </UButton>

          <UButton
            :to="localeRoute({ name: 'cart' })"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-shopping-bag"
            :aria-label="t('header.cart')"
            class="relative hover:text-primary"
          >
            <span class="hidden sm:inline">
              {{ t('header.cart') }}
            </span>

            <span
              v-if="count"
              class="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold leading-none text-white"
              :aria-label="t('header.cartCount', { count })"
            >
              {{ count }}
            </span>
          </UButton>
        </div>
      </template>
    </UHeader>
  </div>
</template>
