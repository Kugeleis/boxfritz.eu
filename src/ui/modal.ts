// src/ui/modal.ts
import { productData } from '../state';

export function openProductModal(product: any): void {
  const modal = document.getElementById('product-modal') as HTMLDialogElement;
  const content = document.getElementById('product-modal-content');

  if (!modal || !content) return;

  // Use a modern grid for the modal content
  content.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-base-200 aspect-square rounded-xl flex items-center justify-center text-base-content/20 font-bold text-4xl">
        IMAGE
      </div>
      <div class="space-y-4">
        <div>
          <h2 class="text-3xl font-bold text-primary">${product.name}</h2>
          <p class="text-2xl font-bold text-secondary mt-1">$${product.price.toLocaleString()}</p>
        </div>

        <div class="divider">Specs</div>

        <div class="grid grid-cols-2 gap-4">
          <div class="stats stats-vertical bg-base-200 p-2">
            <div class="stat p-2">
              <div class="stat-title text-xs">Color</div>
              <div class="stat-value text-lg">${product.color}</div>
            </div>
          </div>
          <div class="stats stats-vertical bg-base-200 p-2">
            <div class="stat p-2">
              <div class="stat-title text-xs">Material</div>
              <div class="stat-value text-lg">${product.material}</div>
            </div>
          </div>
          <div class="stats stats-vertical bg-base-200 p-2">
            <div class="stat p-2">
              <div class="stat-title text-xs">Weight</div>
              <div class="stat-value text-lg">${product.weight} kg</div>
            </div>
          </div>
        </div>

        <div class="pt-6">
          <button class="btn btn-primary w-full">Add to Cart</button>
        </div>
      </div>
    </div>
  `;

  modal.showModal();
}

export function hideProductModal(): void {
  const modal = document.getElementById('product-modal') as HTMLDialogElement;
  if (modal) {
    modal.close();
  }
}
