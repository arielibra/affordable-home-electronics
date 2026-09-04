import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getCart, mutateCart } from "../../lib/api/store.functions";
import { ensureCartId } from "../../lib/cart-id";

export type Line = { slug: string; name: string; image: string; brand: string; price_cents: number; qty: number };

type CartValue = {
  lines: Line[];
  count: number;
  subtotal: number;
  ready: boolean;
  cartId: string;
  add: (slug: string, qty?: number) => Promise<void>;
  setQty: (slug: string, qty: number) => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [cartId, setCartId] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = ensureCartId();
    setCartId(id);
    if (!id) {
      setReady(true);
      return;
    }
    let live = true;
    getCart({ data: { cartId: id } })
      .then((r) => {
        if (live) setLines(r.lines);
      })
      .catch(() => undefined)
      .finally(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!cartId) return;
    const r = await getCart({ data: { cartId } });
    setLines(r.lines);
  }, [cartId]);

  const add = useCallback(
    async (slug: string, qty = 1) => {
      const id = cartId || ensureCartId();
      if (!id) return;
      if (!cartId) setCartId(id);
      const r = await mutateCart({ data: { cartId: id, slug, qty, mode: "add" } });
      setLines(r.lines);
    },
    [cartId],
  );

  const setQty = useCallback(
    async (slug: string, qty: number) => {
      const id = cartId || ensureCartId();
      if (!id) return;
      const r = await mutateCart({ data: { cartId: id, slug, qty, mode: "set" } });
      setLines(r.lines);
    },
    [cartId],
  );

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.price_cents * l.qty, 0),
      ready,
      cartId,
      add,
      setQty,
      refresh,
    }),
    [lines, ready, cartId, add, setQty, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
}
