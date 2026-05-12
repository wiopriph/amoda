<script setup lang="ts">
export interface Category {
  id: number
  name: string
  slug: string
  active: boolean
  parent_id?: number | null
  children?: Category[]
}

defineProps<{
  items: Category[]
}>();

const emit = defineEmits<{
  edit: [category: Category]
  add: [category: Category]
  remove: [category: Category]
}>();

const emitEdit = (category: Category) => emit('edit', category);
const emitAdd = (category: Category) => emit('add', category);
const emitRemove = (category: Category) => emit('remove', category);
</script>

<template>
  <ul>
    <li
      v-for="category in items"
      :key="category.id"
      class="border-l border-gray-200 pl-4"
    >
      <div class="flex items-center justify-between rounded-md py-1.5 transition-colors hover:bg-gray-50">
        <div class="flex items-center gap-2">
          <span
            class="font-medium text-gray-800"
            v-text="category.name"
          />

          <span class="text-xs text-gray-500">
            (#{{ category.id }} / {{ category.slug }})
          </span>

          <UBadge
            v-if="!category.active"
            color="error"
            variant="subtle"
          >
            inativa
          </UBadge>
        </div>

        <div class="flex gap-1.5">
          <UButton
            :aria-label="`Editar ${category.name}`"
            size="xs"
            variant="ghost"
            icon="i-lucide-pen-line"
            @click="emitEdit(category)"
          />

          <UButton
            :aria-label="`Adicionar subcategoria a ${category.name}`"
            size="xs"
            variant="ghost"
            icon="i-lucide-plus"
            color="primary"
            @click="emitAdd(category)"
          />

          <UButton
            :aria-label="`Eliminar ${category.name}`"
            size="xs"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            @click="emitRemove(category)"
          />
        </div>
      </div>

      <AdminCategoryTree
        v-if="category.children?.length"
        :items="category.children"
        @edit="emitEdit"
        @add="emitAdd"
        @remove="emitRemove"
      />
    </li>
  </ul>
</template>
