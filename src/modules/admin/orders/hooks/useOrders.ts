"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ordersService from "../services/orders";
import type { OrderFilters } from "../services/orders";
import type { Order } from "../types";
import type { OrderStatus } from "@/modules/admin/shared/types";

const ORDERS_LIST_KEY = ["admin", "orders", "list"] as const;

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: [...ORDERS_LIST_KEY, filters],
    queryFn: () => ordersService.listOrders(filters),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["admin", "orders", "detail", id],
    queryFn: () => ordersService.getOrder(id),
  });
}

export function useUpdateOrderStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatus) => ordersService.updateOrderStatus(id, status),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: ORDERS_LIST_KEY });
      const previous = queryClient.getQueriesData<Order[]>({ queryKey: ORDERS_LIST_KEY });
      queryClient.setQueriesData<Order[]>({ queryKey: ORDERS_LIST_KEY }, (old) =>
        old?.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      return { previous };
    },
    onError: (_err, _status, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "detail", id] });
    },
  });
}
