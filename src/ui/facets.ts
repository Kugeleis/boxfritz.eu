// src/ui/facets.ts
import { currentFilters } from '../state';
import type { CategoricalFilter } from '../types';

export function renderFacets(buckets: any[], propId: string): void {
  const container = document.getElementById(`facet-container-${propId}`);
  if (!container) return;

  let html = '';
  buckets.forEach(facetValue => {
    // Only render the facet if it has a count greater than 0
    if (facetValue.doc_count > 0) {
      const isChecked = currentFilters[propId] && (currentFilters[propId] as CategoricalFilter).includes(facetValue.key);
      html += `
        <li class="px-4 py-1">
          <label class="label cursor-pointer flex justify-start gap-3 p-0">
            <input type="checkbox"
                   value="${facetValue.key}"
                   class="checkbox checkbox-primary checkbox-sm"
                   ${isChecked ? 'checked' : ''}>
            <span class="label-text flex-1">${facetValue.key}</span>
            <span class="badge badge-sm badge-ghost opacity-70">${facetValue.doc_count}</span>
          </label>
        </li>
      `;
    }
  });
  container.innerHTML = html;
}
