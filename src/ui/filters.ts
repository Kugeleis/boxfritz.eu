// src/ui/filters.ts
import noUiSlider from 'nouislider';
import { productData, sliderInstances, switchInstances, currentFilters, setCurrentFilters } from '../state';
import { applyFilters, updateCategoricalFilters } from '../app';
import type { UIProperty } from '../types';

/**
 * Initializes a dual-thumb noUiSlider and links its events to applyFilters.
 */
export function initializeNoUiSlider(propId: string, minVal: number, maxVal: number, parentElement: HTMLElement): void {
  const sliderDiv = document.createElement('div');
  sliderDiv.id = `slider-${propId}`;
  sliderDiv.className = 'my-8 mx-2'; // Add margin for handles
  parentElement.appendChild(sliderDiv);

  const slider = noUiSlider.create(sliderDiv, {
    start: [minVal, maxVal],
    connect: true,
    range: { 'min': minVal, 'max': maxVal },
    step: propId === 'price' ? 100 : 1,
    tooltips: true,
    format: {
      to: (value: number): string => value.toFixed(propId === 'price' ? 0 : 1),
      from: (value: string): number => Number(value)
    }
  });

  slider.on('change', (values: (string | number)[]) => {
    setCurrentFilters({
      ...currentFilters,
      [propId]: [parseFloat(values[0] as string), parseFloat(values[1] as string)],
    });
    applyFilters();
  });

  sliderInstances[propId] = slider; // Store the instance
}

/**
 * Helper to extract numeric values from product data for a given property.
 */
function getNumericValues(propId: string): number[] {
  return productData
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

/**
 * Initializes a single-thumb noUiSlider for continuous or stepped values.
 */
export function initializeSingleHandleSlider(property: UIProperty, parentElement: HTMLElement): void {
  const propId = property.id;
  const sliderOptions = property.sliderOptions;
  const isStepped = property.type === 'stepped-continuous-single';

  const sliderDiv = document.createElement('div');
  sliderDiv.id = `slider-${propId}`;
  sliderDiv.className = 'my-8 mx-2';
  parentElement.appendChild(sliderDiv);

  let sliderConfig: any;

  if (isStepped) {
    const uniqueValues = [...new Set(getNumericValues(propId))];
    uniqueValues.sort((a, b) => a - b);

    if (uniqueValues.length < 2) {
      console.warn(`Not enough data points to create a stepped slider for ${propId}.`);
      return;
    }

    const rangeMapping: { [key: string]: number } = {};
    uniqueValues.forEach((value, index) => {
      if (index === 0) rangeMapping['min'] = value;
      else if (index === uniqueValues.length - 1) rangeMapping['max'] = value;
      else {
        const percentage = (index / (uniqueValues.length - 1)) * 100;
        rangeMapping[`${percentage.toFixed(2)}%`] = value;
      }
    });

    sliderConfig = {
      start: [sliderOptions?.direction === 'less' ? uniqueValues[uniqueValues.length - 1] : uniqueValues[0]],
      range: rangeMapping,
      snap: true,
      step: 1,
    };
  } else {
    const values = getNumericValues(propId);
    const minVal = Math.floor(Math.min(...values));
    const maxVal = Math.ceil(Math.max(...values));

    sliderConfig = {
      start: [sliderOptions?.direction === 'less' ? maxVal : minVal],
      range: { 'min': minVal, 'max': maxVal },
      step: 1,
    };
  }

  sliderConfig.connect = sliderOptions?.direction === 'less' ? 'lower' : 'upper';
  sliderConfig.tooltips = true;
  sliderConfig.format = {
    to: (value: number): string => value.toFixed(isStepped ? 2 : 1),
    from: (value: string): number => Number(value)
  };

  const slider = noUiSlider.create(sliderDiv, sliderConfig);

  slider.on('change', (values: (string | number)[]) => {
    const value = parseFloat(values[0] as string);
    const newFilter = sliderOptions?.direction === 'less' ? [-Infinity, value] : [value, Infinity];
    setCurrentFilters({
      ...currentFilters,
      [propId]: newFilter,
    });
    applyFilters();
  });

  sliderInstances[propId] = slider;
}

/**
 * Dynamically generates the filter UI based on config.
 */
export function generatePropertyFilter(property: UIProperty, parentElement: HTMLElement): void {
  const propId = property.id;
  const section = document.createElement('div');
  section.className = 'border-t border-base-200 pt-4 mt-4';

  const title = document.createElement('h3');
  title.className = 'px-4 text-sm font-semibold mb-2 flex justify-between items-center';
  title.textContent = property.title;

  if (property.type === "boolean") {
    const container = document.createElement('div');
    container.className = 'px-4';

    const label = document.createElement('label');
    label.className = 'label cursor-pointer p-0 py-1';

    const span = document.createElement('span');
    span.className = 'label-text';
    span.textContent = property.title;

    const checkbox = document.createElement('input');
    checkbox.id = `switch-${propId}`;
    checkbox.type = 'checkbox';
    checkbox.className = 'toggle toggle-primary toggle-sm';

    label.appendChild(span);
    label.appendChild(checkbox);
    container.appendChild(label);
    section.appendChild(container);

    switchInstances[propId] = checkbox;

    checkbox.addEventListener('change', () => {
      const newFilters = { ...currentFilters };
      if (checkbox.checked) {
        newFilters[propId] = [1, 1];
      } else {
        delete newFilters[propId];
      }
      setCurrentFilters(newFilters);
      applyFilters();
    });
  } else {
    section.appendChild(title);

    if (property.type === "categorical") {
      const facetContainer = document.createElement('ul');
      facetContainer.id = `facet-container-${propId}`;
      facetContainer.className = 'menu menu-sm p-0';
      section.appendChild(facetContainer);

      facetContainer.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.type === 'checkbox') {
          updateCategoricalFilters(propId, target.value, target.checked);
        }
      });
    } else {
      const sliderWrapper = document.createElement('div');
      sliderWrapper.className = 'px-6 py-2';

      if (property.type === "continuous") {
        const values = getNumericValues(propId);
        const minVal = Math.floor(Math.min(...values));
        const maxVal = Math.ceil(Math.max(...values));
        initializeNoUiSlider(propId, minVal, maxVal, sliderWrapper);
      } else if (property.type === "stepped-continuous-single" || property.type === "continuous-single") {
        initializeSingleHandleSlider(property, sliderWrapper);
      }
      section.appendChild(sliderWrapper);
    }
  }

  parentElement.appendChild(section);
}
