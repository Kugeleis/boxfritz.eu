/// <reference types="vite/client" />
/// <reference types="vite-plugin-md-to-html/types" />

declare const __APP_VERSION__: string;

declare module 'itemsjs' {
  export type ItemsJs<T = any> = {
    search: (options?: {
      query?: string;
      per_page?: number;
      filters?: Record<string, string[]>;
    }) => {
      data: {
        items: T[];
        aggregations?: any;
      };
    };
  };

  export default function itemsjs<T = any>(data: T[], config?: any): ItemsJs<T>;
}
