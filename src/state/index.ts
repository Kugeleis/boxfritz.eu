// src/state/index.ts
import { ref, reactive } from 'vue';
import type { ItemsJs } from 'itemsjs';
import type { Product, Filters, TemplateMapping, UIGroup } from '../types';

export const itemsjsInstance = ref<ItemsJs<Product> | null>(null);
export const currentFilters = reactive<Filters>({});
export const searchQuery = ref<string>('');
export const productData = ref<Product[]>([]);
export const cardTemplateMapping = ref<TemplateMapping[]>([]);
export const uiConfig = ref<UIGroup[]>([]);
export const noProductsMessage = ref<string>("No products match your current filters.");
export const allAggregations = ref<any>(null);

// --- Update functions ---
export function setItemsjsInstance(instance: ItemsJs<Product>) {
  itemsjsInstance.value = instance;
}

export function setCurrentFilters(filters: Filters) {
  // Clear existing reactive object keys
  Object.keys(currentFilters).forEach(key => delete currentFilters[key]);
  // Assign new keys
  Object.assign(currentFilters, filters);
}

export function setSearchQuery(query: string) {
  searchQuery.value = query;
}

export function setProductData(data: Product[]) {
  productData.value = data;
}

export function setCardTemplateMapping(mapping: TemplateMapping[]) {
  cardTemplateMapping.value = mapping;
}

export function setUiConfig(config: UIGroup[]) {
  uiConfig.value = config;
}

export function setNoProductsMessage(message: string) {
  noProductsMessage.value = message;
}

export function setAllAggregations(aggregations: any) {
  allAggregations.value = aggregations;
}
