"use client";

import { Controller, useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from "@/modules/admin/categories/hooks/useCategories";
import { useCreateProduct, useProducts, useUpdateProduct } from "../hooks/useProducts";
import { productSchema, PRODUCT_FORM_DEFAULTS, type ProductFormValues } from "../schemas/product";
import type { Product } from "../types";
import { ProductImagesTab } from "./ProductImagesTab";

/** Input numérico opcional (puede quedar vacío = null) — RHF's
 * `valueAsNumber` convierte "vacío" en `NaN`, no en `null`, así que estos
 * campos usan `Controller` para manejar esa conversión explícitamente. */
function NullableNumberField({
  control,
  name,
  id,
}: {
  control: Control<ProductFormValues>;
  name: "price_3ml" | "price_10ml" | "price_full_bottle" | "original_price";
  id: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          id={id}
          type="number"
          step="0.01"
          value={field.value ?? ""}
          onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      )}
    />
  );
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const { data: categories } = useCategories();
  const { data: allProducts } = useProducts({ onlyActive: true });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? 0);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          category_slug: product.category_slug,
          price: product.price,
          price_3ml: product.price_3ml,
          price_10ml: product.price_10ml,
          price_full_bottle: product.price_full_bottle,
          on_sale: product.on_sale,
          original_price: product.original_price,
          badge: product.badge,
          best_seller: product.best_seller,
          active: product.active,
          description: product.description,
          addon_product_id_1: product.addon_product_id_1,
          addon_product_id_2: product.addon_product_id_2,
        }
      : PRODUCT_FORM_DEFAULTS,
  });

  const onSale = watch("on_sale");

  async function onSubmit(values: ProductFormValues) {
    try {
      if (product) {
        await updateProduct.mutateAsync(values);
        toast.success("Producto actualizado.");
      } else {
        const created = await createProduct.mutateAsync(values);
        toast.success("Producto creado. Ahora podés subirle imágenes.");
        router.push(`/admin/productos/${created.id}`);
        return;
      }
      router.push("/admin/productos");
    } catch {
      toast.error("No se pudo guardar el producto.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="precio">Precio</TabsTrigger>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="imagenes" disabled={!product}>
            Imágenes
          </TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Categoría</Label>
            <Controller
              control={control}
              name="category_slug"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elige una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      ?.filter((c) => c.slug !== "promos")
                      .map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category_slug && <p className="text-destructive text-sm">{errors.category_slug.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="badge">Badge (opcional)</Label>
            <Input id="badge" placeholder="Ej. MÁS VENDIDO" {...register("badge")} />
          </div>
        </TabsContent>

        <TabsContent value="precio" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Precio 5ml</Label>
            <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
            {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price_3ml">Precio 3ml</Label>
              <NullableNumberField control={control} name="price_3ml" id="price_3ml" />
              {errors.price_3ml && <p className="text-destructive text-sm">{errors.price_3ml.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price_10ml">Precio 10ml</Label>
              <NullableNumberField control={control} name="price_10ml" id="price_10ml" />
              {errors.price_10ml && <p className="text-destructive text-sm">{errors.price_10ml.message}</p>}
            </div>
          </div>
          <p className="text-muted-foreground -mt-2 text-xs">
            Si dejás 3ml o 10ml vacío, ese tamaño simplemente no se ofrece en la página del producto — no
            hay ningún cálculo automático.
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price_full_bottle">Precio frasco entero (opcional)</Label>
            <NullableNumberField control={control} name="price_full_bottle" id="price_full_bottle" />
            {errors.price_full_bottle && (
              <p className="text-destructive text-sm">{errors.price_full_bottle.message}</p>
            )}
            <p className="text-muted-foreground text-xs">
              Si lo dejás vacío, este producto no ofrece la opción de frasco entero en la tienda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="on_sale"
              render={({ field }) => (
                <Checkbox id="on_sale" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="on_sale">En oferta (aparece en Promociones)</Label>
          </div>

          {onSale && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="original_price">Precio anterior del decant de 5ml (tachado)</Label>
              <NullableNumberField control={control} name="original_price" id="original_price" />
              {errors.original_price && (
                <p className="text-destructive text-sm">{errors.original_price.message}</p>
              )}
              <p className="text-muted-foreground text-xs">
                Es lo que costaba este mismo decant de 5ml antes de la oferta — misma escala que el
                &quot;Precio 5ml&quot; de arriba. No pongas acá el precio del frasco completo (para eso está
                &quot;Precio frasco entero&quot; en esta misma pestaña).
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Producto recomendado 1</Label>
                  <Controller
                    control={control}
                    name="addon_product_id_1"
                    render={({ field }) => {
                      const addon2 = watch("addon_product_id_2");
                      const options = (allProducts ?? []).filter(
                        (p) => p.id !== product?.id && p.id !== addon2,
                      );
                      return (
                        <Select
                          value={field.value != null ? String(field.value) : "none"}
                          onValueChange={(v) => field.onChange(v === "none" ? null : Number(v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ninguno" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Ninguno</SelectItem>
                            {options.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Producto recomendado 2</Label>
                  <Controller
                    control={control}
                    name="addon_product_id_2"
                    render={({ field }) => {
                      const addon1 = watch("addon_product_id_1");
                      const options = (allProducts ?? []).filter(
                        (p) => p.id !== product?.id && p.id !== addon1,
                      );
                      return (
                        <Select
                          value={field.value != null ? String(field.value) : "none"}
                          onValueChange={(v) => field.onChange(v === "none" ? null : Number(v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ninguno" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Ninguno</SelectItem>
                            {options.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                </div>
              </div>
              <p className="text-muted-foreground -mt-2 text-xs">
                Aparecen en la sección &quot;Combínalo y ahorra&quot; de este producto, a su propio precio
                de 5ml.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventario" className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <Checkbox id="active" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="active">Activo (visible en la tienda)</Label>
          </div>
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="best_seller"
              render={({ field }) => (
                <Checkbox id="best_seller" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="best_seller">Más vendido (aparece en el riel del inicio)</Label>
          </div>
          <p className="text-muted-foreground text-xs">
            DEYCAZ decanta a demanda desde frascos originales — no se lleva un conteo numérico de stock,
            solo si el producto está activo en la tienda o no.
          </p>
        </TabsContent>

        <TabsContent value="imagenes" className="pt-4">
          {product ? <ProductImagesTab productId={product.id} /> : null}
        </TabsContent>

        <TabsContent value="seo" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" rows={5} {...register("description")} />
            <p className="text-muted-foreground text-xs">
              Si la dejás vacía, la página del producto muestra el texto genérico de siempre.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/productos")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
