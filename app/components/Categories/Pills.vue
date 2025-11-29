<script setup lang="ts">
const props = defineProps<{
  list: Array<{ id: number; name: string; slug: string; image: string }>
}>();

const localeRoute = useLocaleRoute();
</script>

<template>
  <section>
    <div
      class="
        flex flex-wrap justify-center
        gap-3
      "
    >
      <NuxtLink
        v-for="item in props.list"
        :key="item.id"
        :to="localeRoute({ name: 'category-slug', params: { slug: item.slug } })"
      >
        <UCard
          class="
            w-[100px] h-[100px]
            sm:w-[120px] sm:h-[120px]
            rounded-xl border border-gray-100 shadow-sm
            hover:shadow-md transition-all
            flex flex-col items-center justify-start
          "
          :ui="{ body: 'p-2 sm:p-3 flex flex-col items-center w-full h-full' }"
        >
          <!-- Круглая картинка -->
          <div
            class="
              w-12 h-12
              sm:w-14 sm:h-14
              rounded-full overflow-hidden bg-white
              flex items-center justify-center
              shrink-0
            "
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-12 h-12 sm:w-14 sm:h-14 object-cover"
            >
          </div>

          <!-- Текст фиксированной высоты -->
          <p
            class="
              text-[11px] sm:text-xs
              text-gray-900 text-center
              mt-1 sm:mt-2
              leading-tight
              line-clamp-2
              h-[28px] sm:h-[32px]
              flex items-center justify-center
              px-1
            "
          >
            {{ item.name }}
          </p>
        </UCard>
      </NuxtLink>
    </div>
  </section>
</template>
