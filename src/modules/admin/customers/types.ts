// No existe una tabla `customers` propia — el cliente vive denormalizado
// dentro de cada `order`. Este tipo es la agregación derivada (agrupada por
// customer_phone), no una entidad persistida.
export type DerivedCustomer = {
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
};
