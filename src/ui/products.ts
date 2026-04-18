import { productData } from '../state';
import { openProductModal } from './modal';
import type { TemplateMapping } from '../types';

export function renderProductCards(products: any[], templateMapping: TemplateMapping[]): void {
  const container = document.getElementById('product-list-container');
  const template = document.getElementById('product-card-template') as HTMLTemplateElement;
  const productCountContainer = document.getElementById('product-count-container');

  if (!container || !template) return;

  container.innerHTML = '';
  products.forEach(product => {
    const clone = template.content.cloneNode(true) as HTMLElement;

    // Use dynamic mapping from templateConfig
    templateMapping.forEach(mapping => {
      const el = clone.querySelector(`[data-template-field="${mapping.field}"]`);
      if (el) {
        let val = product[mapping.property];
        if (mapping.format && typeof mapping.format === 'function') {
          val = mapping.format(val);
        }

        if (mapping.field === 'price') {
          el.textContent = `$${val.toLocaleString()}`;
        } else {
          el.textContent = val;
        }
      }
    });

    const card = clone.querySelector('.card');
    if (card) {
      card.addEventListener('click', () => openProductModal(product));
      // Make cursor pointer to indicate clickability
      (card as HTMLElement).style.cursor = 'pointer';
    }

    container.appendChild(clone);
  });

  if (productCountContainer) {
    productCountContainer.textContent = `${products.length} of ${productData.length} products`;
  }
}
