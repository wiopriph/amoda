<script setup lang="ts">
const props = defineProps<{
  category: {
    id: number | string;
    name: string;
    slug: string;
    children?: any[]
  }
}>();

const localeRoute = useLocaleRoute();

const routeTo = computed(() => localeRoute({ name: 'category-slug', params: { slug: props.category.slug } }));

const route = useRoute();
const isActive = computed(() => route.params.category === props.category.slug);

const hasChildren = computed(() => (props.category.children?.length ?? 0) > 0);
</script>

<template>
  <div>
    <NuxtLink
      :to="routeTo"
      class="group flex items-center justify-between gap-2 px-2 py-1.5 rounded-md transition outline-none
             hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary/30"
      :class="isActive
        ? 'bg-primary/5 text-primary font-semibold'
        : 'text-gray-800'"
      :aria-current="isActive ? 'page' : undefined"
    >
      <span class="truncate">{{ props.category.name }}</span>

      <UIcon
        v-if="hasChildren"
        name="i-heroicons-chevron-right-20-solid"
        class="h-4 w-4 transition-transform"
        :class="isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'"
      />
    </NuxtLink>

    <div
      v-if="hasChildren"
      class="pl-3 mt-1 space-y-1 border-l border-gray-200"
    >
      <SidebarCategory
        v-for="child in props.category.children"
        :key="child.id"
        :category="child"
      />
    </div>
  </div>
</template>
