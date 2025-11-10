<script setup lang="ts">
import type { PropType } from 'vue';


export interface Category {
  id: number
  name: string
  slug: string
  active: boolean
  parent_id?: number | null
  children?: Category[]
}

const props = defineProps({
  items: {
    type: Array as PropType<Category[]>,
    required: true,
  },
});

const emit = defineEmits(['edit', 'add', 'remove']);
const { t } = useI18n();
</script>

<i18n lang="json">
{
  "en": {
    "categoryTree": {
      "inactive": "inactive",
      "edit": "Edit {name}",
      "addSub": "Add subcategory to {name}",
      "remove": "Delete {name}"
    }
  },
  "pt": {
    "categoryTree": {
      "inactive": "inativa",
      "edit": "Editar {name}",
      "addSub": "Adicionar subcategoria a {name}",
      "remove": "Eliminar {name}"
    }
  }
}
</i18n>

<template>
  <ul>
    <li
      v-for="item in props.items"
      :key="item.id"
      class="pl-4 border-l border-gray-200"
    >
      <div class="flex items-center justify-between py-1.5 hover:bg-gray-50 rounded-md transition-colors">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-800">
            {{ item.name }}
          </span>

          <span class="text-xs text-gray-500">
            (#{{ item.id }} / {{ item.slug }})
          </span>

          <UBadge
            v-if="!item.active"
            color="error"
            variant="subtle"
          >
            {{ t('categoryTree.inactive') }}
          </UBadge>
        </div>

        <div class="flex gap-1.5">
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-pen-line"
            :aria-label="t('categoryTree.edit', { name: item.name })"
            @click="emit('edit', item)"
          />

          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-plus"
            color="primary"
            :aria-label="t('categoryTree.addSub', { name: item.name })"
            @click="emit('add', item)"
          />

          <UButton
            size="xs"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            :aria-label="t('categoryTree.remove', { name: item.name })"
            @click="emit('remove', item)"
          />
        </div>
      </div>

      <CategoryTree
        v-if="item.children?.length"
        :items="item.children"
        @edit="emit('edit', $event)"
        @add="emit('add', $event)"
        @remove="emit('remove', $event)"
      />
    </li>
  </ul>
</template>
