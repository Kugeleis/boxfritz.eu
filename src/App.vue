<script setup lang="ts">
import { computed, onMounted, ref, reactive, watch } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Slider from 'primevue/slider';
import ToggleSwitch from 'primevue/toggleswitch';
import Dialog from 'primevue/dialog';
import Badge from 'primevue/badge';
import itemsjs from 'itemsjs';

import {
  itemsjsInstance,
  currentFilters,
  searchQuery,
  productData,
  cardTemplateMapping,
  uiConfig,
  allAggregations,
  noProductsMessage,
  setItemsjsInstance,
  setCurrentFilters,
  setSearchQuery,
  setProductData,
  setCardTemplateMapping,
  setUiConfig,
  setNoProductsMessage,
  setAllAggregations,
} from './state';
import { cleanData } from './utils/dataCleaner';
import type { Product, CategoricalFilter, UIProperty } from './types';

const appVersion = __APP_VERSION__;
const filtersLabel = ref('Filters');
const mainTitle = ref('Product Showcase');
const isModalVisible = ref(false);
const selectedProduct = ref<Product | null>(null);

const filteredItems = computed(() => {
  if (!itemsjsInstance.value) return [];

  const categoricalFilters: Record<string, string[]> = {};
  const continuousFilters: Record<string, [number, number]> = {};

  for (const key in currentFilters) {
    const property = uiConfig.value.flatMap(g => g.properties).find(p => p.id === key);
    if (property && (property.type === 'continuous' || property.type === 'stepped-continuous-single' || property.type === 'boolean' || property.type === 'continuous-single')) {
      continuousFilters[key] = currentFilters[key] as [number, number];
    } else {
      categoricalFilters[key] = currentFilters[key] as string[];
    }
  }

  const results = itemsjsInstance.value.search({
    query: searchQuery.value,
    per_page: productData.value.length,
    filters: categoricalFilters,
  });

  let items = results.data.items;

  if (Object.keys(continuousFilters).length > 0) {
    items = items.filter((item: Record<string, unknown>) => {
      return Object.entries(continuousFilters).every(([key, range]) => {
        const value = item[key] as number;
        return value >= range[0] && value <= range[1];
      });
    });
  }

  return items;
});

const currentAggregations = computed(() => {
  if (!allAggregations.value) return {};
  return allAggregations.value;
});

function updateCategoricalFilter(propId: string, value: string, isChecked: boolean) {
  const newFilters = { ...currentFilters };
  let current = [...(newFilters[propId] as CategoricalFilter || [])];

  if (isChecked) {
    if (!current.includes(value)) current.push(value);
  } else {
    current = current.filter(v => v !== value);
  }

  if (current.length === 0) {
    delete newFilters[propId];
  } else {
    newFilters[propId] = current;
  }
  setCurrentFilters(newFilters);
}

function resetFilters() {
  setCurrentFilters({});
  setSearchQuery('');
  // Reset numeric sliders to their defaults if needed, but since they are reactive and computed from data, we just need to clear currentFilters.
}

function showProductDetails(product: Product) {
  selectedProduct.value = product;
  isModalVisible.value = true;
}

function getNumericValues(propId: string): number[] {
  return productData.value
    .map(item => {
      const val = item[propId];
      if (typeof val === 'number') return val;
      if (typeof val === 'string' && val.trim() !== '') {
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      }
      return null;
    })
    .filter((v): v is number => v !== null);
}

const sliderRanges = reactive<Record<string, { min: number, max: number }>>({});

function initSliderRange(propId: string) {
  if (sliderRanges[propId]) return sliderRanges[propId];
  const values = getNumericValues(propId);
  if (values.length === 0) return { min: 0, max: 100 };
  const min = Math.floor(Math.min(...values));
  const max = Math.ceil(Math.max(...values));
  sliderRanges[propId] = { min, max };
  return sliderRanges[propId];
}

onMounted(async () => {
  try {
    let setupResponse = await fetch(`${import.meta.env.BASE_URL}setup.local.json`);
    const isJson = (response: Response) => response.headers.get('content-type')?.includes('application/json');

    if (!setupResponse.ok || !isJson(setupResponse)) {
      setupResponse = await fetch(`${import.meta.env.BASE_URL}setup.json`);
    }

    if (!setupResponse.ok) throw new Error("Failed to load setup configuration.");

    const setupConfig = await setupResponse.json();
    const { dataset, title, theme, ui } = setupConfig;

    if (!dataset) throw new Error("`dataset` key not found in setup.json.");

    mainTitle.value = title || 'Product Showcase';
    document.title = title || 'Vite Facet Filter App';
    filtersLabel.value = ui?.filtersLabel || 'Filters';
    setNoProductsMessage(ui?.noProductsMessage || 'No products match your current filters.');

    if (theme) {
      const style = document.createElement('style');
      style.textContent = `:root { --primary-color: ${theme.primary || '#00d1b2'}; --p-primary-color: ${theme.primary || '#00d1b2'}; }`;
      document.head.appendChild(style);
    }

    const [productsResponse, templateResponse, uiConfigResponse] = await Promise.all([
      fetch(`${import.meta.env.BASE_URL}${dataset}.json`),
      fetch(`${import.meta.env.BASE_URL}${dataset}-config.json`),
      fetch(`${import.meta.env.BASE_URL}${dataset}-ui-config.json`),
    ]);

    const rawProductData = await productsResponse.json();
    setProductData(cleanData(rawProductData));
    setUiConfig(await uiConfigResponse.json());
    const rawTemplateConfig = await templateResponse.json();

    let searchFieldName = 'name';
    const nameMapping = rawTemplateConfig.find((m: any) => m.field === 'name');
    if (nameMapping) searchFieldName = nameMapping.property;

    setCardTemplateMapping(rawTemplateConfig.map((mapping: any) => {
      if (mapping.format && typeof mapping.format === 'string') {
        const match = mapping.format.match(/toFixed\((\d+)\)/);
        if (match) {
          const precision = parseInt(match[1], 10);
          return { ...mapping, format: (value: number) => value.toFixed(precision) };
        }
      }
      return mapping;
    }));

    const itemsjsConfiguration = {
      searchableFields: [searchFieldName],
      aggregations: uiConfig.value.flatMap(group => group.properties)
        .reduce((acc, p) => {
          acc[p.id] = { title: p.title, size: 100, type: 'terms' };
          return acc;
        }, {} as any),
    };
    setItemsjsInstance(itemsjs(productData.value, itemsjsConfiguration));

    const initialSearch = itemsjsInstance.value!.search({ per_page: productData.value.length });
    setAllAggregations(initialSearch.data.aggregations);

  } catch (error: any) {
    console.error("Fatal Error:", error.message);
  }
});

function getFieldValue(product: Product, mapping: any) {
  const rawValue = product[mapping.property];
  let displayValue = rawValue;
  if (mapping.format) displayValue = mapping.format(rawValue);
  return `${mapping.prefix || ''}${displayValue}${mapping.suffix || ''}`;
}

function handleContinuousChange(propId: string, val: any) {
    setCurrentFilters({ ...currentFilters, [propId]: val });
}

function handleSingleContinuousChange(property: UIProperty, val: number) {
    const direction = property.sliderOptions?.direction || 'greater';
    const newFilter = direction === 'less' ? [-Infinity, val] : [val, Infinity];
    setCurrentFilters({ ...currentFilters, [property.id]: newFilter });
}

function handleBooleanChange(propId: string, val: boolean) {
    const newFilters = { ...currentFilters };
    if (val) newFilters[propId] = [1, 1];
    else delete newFilters[propId];
    setCurrentFilters(newFilters);
}
</script>

<template>
  <div class="p-4">
    <header class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-3xl font-bold"><a :href="'/'">{{ mainTitle }}</a></h1>
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText v-model="searchQuery" placeholder="Search products..." />
        </span>
      </div>
      <div class="flex items-center gap-4">
        <a :href="'/about.html'">About</a>
        <div>
            Showing <span class="font-bold text-primary">{{ filteredItems.length }}</span>
            of <span class="font-bold">{{ productData.length }}</span> products
        </div>
      </div>
    </header>

    <div class="grid grid-cols-12 gap-4">
      <aside class="col-span-3">
        <Card>
          <template #title>{{ filtersLabel }}</template>
          <template #content>
            <Button label="Reset Filters" class="w-full mb-4" severity="secondary" @click="resetFilters" />
            <div v-for="group in uiConfig" :key="group.groupName" class="mb-6">
              <h3 class="text-sm uppercase tracking-wider text-gray-500 mb-2">{{ group.groupName }}</h3>
              <div v-for="prop in group.properties" :key="prop.id" class="mb-4">
                <div v-if="prop.type === 'categorical'">
                  <h4 class="font-semibold mb-2">{{ prop.title }}</h4>
                  <ul class="list-none p-0">
                    <li v-for="bucket in currentAggregations[prop.id]?.buckets" :key="bucket.key" class="flex items-center gap-2 mb-1">
                      <Checkbox
                        :modelValue="(currentFilters[prop.id] as string[])?.includes(bucket.key)"
                        @update:modelValue="(val) => updateCategoricalFilter(prop.id, bucket.key, !!val)"
                        :binary="true"
                        :inputId="`${prop.id}-${bucket.key}`"
                      />
                      <label :for="`${prop.id}-${bucket.key}`" class="flex justify-between w-full">
                        <span>{{ bucket.key }}</span>
                        <Badge :value="bucket.doc_count" severity="secondary" />
                      </label>
                    </li>
                  </ul>
                </div>

                <div v-else-if="prop.type === 'continuous'">
                  <h4 class="font-semibold mb-2">{{ prop.title }}</h4>
                  <div class="px-2">
                    <Slider
                      :modelValue="(currentFilters[prop.id] as [number, number]) || [initSliderRange(prop.id).min, initSliderRange(prop.id).max]"
                      @update:modelValue="(val) => handleContinuousChange(prop.id, val)"
                      range
                      :min="initSliderRange(prop.id).min"
                      :max="initSliderRange(prop.id).max"
                    />
                    <div class="flex justify-between text-xs mt-1">
                      <span>{{ (currentFilters[prop.id] as [number, number])?.[0] ?? initSliderRange(prop.id).min }}</span>
                      <span>{{ (currentFilters[prop.id] as [number, number])?.[1] ?? initSliderRange(prop.id).max }}</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="prop.type === 'continuous-single' || prop.type === 'stepped-continuous-single'">
                    <h4 class="font-semibold mb-2">{{ prop.title }}</h4>
                    <div class="px-2">
                        <Slider
                            :modelValue="prop.sliderOptions?.direction === 'less' ? ((currentFilters[prop.id] as [number, number])?.[1] ?? initSliderRange(prop.id).max) : ((currentFilters[prop.id] as [number, number])?.[0] ?? initSliderRange(prop.id).min)"
                            @update:modelValue="(val) => handleSingleContinuousChange(prop, val as number)"
                            :min="initSliderRange(prop.id).min"
                            :max="initSliderRange(prop.id).max"
                        />
                        <div class="flex justify-between text-xs mt-1">
                            <span>{{ prop.sliderOptions?.direction === 'less' ? '≤' : '≥' }} {{ prop.sliderOptions?.direction === 'less' ? ((currentFilters[prop.id] as [number, number])?.[1] ?? initSliderRange(prop.id).max) : ((currentFilters[prop.id] as [number, number])?.[0] ?? initSliderRange(prop.id).min) }}</span>
                        </div>
                    </div>
                </div>

                <div v-else-if="prop.type === 'boolean'" class="flex justify-between items-center">
                    <span>{{ prop.title }}</span>
                    <ToggleSwitch
                        :modelValue="!!currentFilters[prop.id]"
                        @update:modelValue="(val) => handleBooleanChange(prop.id, val)"
                    />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </aside>

      <main class="col-span-9">
        <div v-if="filteredItems.length === 0" class="text-center p-8">
          {{ noProductsMessage }}
        </div>
        <div class="grid grid-cols-3 gap-4">
          <Card v-for="product in filteredItems" :key="product.id" class="cursor-pointer hover:shadow-lg transition-shadow" @click="showProductDetails(product)">
            <template #title>
              <div v-for="mapping in cardTemplateMapping.filter(m => m.field === 'name')" :key="mapping.field">
                {{ getFieldValue(product, mapping) }}
              </div>
            </template>
            <template #content>
              <div v-for="mapping in cardTemplateMapping.filter(m => m.field !== 'name' && m.field !== 'price')" :key="mapping.field">
                <span class="font-bold">{{ mapping.field.charAt(0).toUpperCase() + mapping.field.slice(1) }}:</span> {{ getFieldValue(product, mapping) }}
              </div>
              <div v-for="mapping in cardTemplateMapping.filter(m => m.field === 'price')" :key="mapping.field" class="text-xl font-bold mt-4 text-primary">
                {{ getFieldValue(product, mapping) }}
              </div>
            </template>
          </Card>
        </div>
      </main>
    </div>

    <footer class="mt-8 pt-8 border-t text-center text-gray-500">
      <p>
        <strong>Facet Filter Page</strong>. Source code on <a href="https://github.com/Kugeleis/facet-filter-page" class="text-primary underline">GitHub</a>.
        Version {{ appVersion }}
      </p>
    </footer>

    <Dialog v-model:visible="isModalVisible" modal header="Product Details" :style="{ width: '50vw' }">
      <div v-if="selectedProduct" class="space-y-4">
        <div v-for="(value, key) in selectedProduct" :key="key" class="border-b pb-2">
          <span class="font-bold capitalize">{{ key.replace(/_/g, ' ') }}:</span>
          <span class="ml-2">{{ value }}</span>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style>
.text-primary {
  color: var(--primary-color);
}
</style>
