// ============= Full file contents =============

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag, X, Plus, Minus, Pencil, Trash2, Store, LayoutGrid } from "lucide-react";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShopEasy — Everyday goods, simply" },
      { name: "description", content: "Shop curated everyday goods and manage inventory with ShopEasy." },
      { property: "og:title", content: "ShopEasy — Everyday goods, simply" },
      { property: "og:description", content: "Shop curated everyday goods and manage inventory with ShopEasy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Product = { id: number; name: string; category: string; price: number; stock: number; image: string };
const u = (id: string) => `https://images.unsplash.com/${id}?w=600&q=70&auto=format&fit=crop`;
const SEED: Product[] = [
  { id: 1, name: "Stoneware Mug", category: "Home", price: 499, stock: 24, image: u("photo-1514228742587-6b1558fcca3d") },
  { id: 2, name: "Leather Wallet", category: "Accessories", price: 1499, stock: 3, image: u("photo-1627123424574-724758594e93") },
  { id: 3, name: "Wireless Headphones", category: "Electronics", price: 3499, stock: 12, image: u("photo-1505740420928-5e560c06d30e") },
  { id: 4, name: "Potted Pothos", category: "Home", price: 349, stock: 8, image: u("photo-1485955900006-10f4d324d411") },
  { id: 5, name: "Canvas Tote", category: "Accessories", price: 799, stock: 4, image: u("photo-1544816155-12df9643f363") },
  { id: 6, name: "Analog Watch", category: "Accessories", price: 2999, stock: 6, image: u("photo-1524592094714-0f0654e20314") },
  { id: 7, name: "Scented Candle", category: "Home", price: 649, stock: 30, image: u("photo-1602874801007-bd458bb1b8b6") },
  { id: 8, name: "Bluetooth Speaker", category: "Electronics", price: 1999, stock: 0, image: u("photo-1608043152269-423dbba4e7e1") },
];

function useStored<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const s = localStorage.getItem(key);
    if (s) setV(JSON.parse(s));
    setReady(true);
  }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(v)); }, [key, v, ready]);
  return [v, setV] as const;
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });
const money = (n: number) => inr.format(n);
const status = (s: number) => (s === 0 ? "Out of stock" : s < 5 ? "Low stock" : "In stock");
const stockLine = (s: number) => (s === 0 ? "Sold out" : s < 5 ? `Only ${s} left` : `${s} in stock`);

function App() {
  const [products, setProducts] = useStored<Product[]>("se-products-v2", SEED);
  const [cart, setCart] = useStored<Record<number, number>>("se-cart", {});
  const [tab, setTab] = useState<"shop" | "admin">("shop");
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const items = products.filter((p) => cart[p.id]).map((p) => ({ p, q: cart[p.id] ?? 0 }));
  const total = items.reduce((a, { p, q }) => a + p.price * q, 0);

  const setQty = (id: number, q: number) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const next = Math.max(0, Math.min(q, p.stock));
    setCart((c) => { const n = { ...c }; if (next) n[id] = next; else delete n[id]; return n; });
  };
  const checkout = () => {
    setProducts((ps) => ps.map((p) => (cart[p.id] ? { ...p, stock: p.stock - (cart[p.id] ?? 0) } : p)));
    setCart({});
    setMsg("Order placed! Thanks for shopping.");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
          <span className="font-display text-2xl tracking-tight">ShopEasy</span>
          <nav className="flex items-center gap-1 rounded-full bg-muted p-1 text-sm">
            {(["shop", "admin"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-2 rounded-full px-5 py-2 transition ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {t === "shop" ? <Store size={15} /> : <LayoutGrid size={15} />}{t === "shop" ? "Shop" : "Admin"}
              </button>
            ))}
          </nav>
          <button onClick={() => setOpen(true)} className="relative rounded-full p-2.5 transition hover:bg-muted" aria-label="Open cart">
            <ShoppingBag size={22} />
            {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">{count}</span>}
          </button>
        </div>
      </header>

      {msg && <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-7 py-3 text-sm text-background">{msg}</div>}

      {tab === "shop" ? (
        <main>
          <section className="relative">
            <img src={hero} alt="Curated everyday goods" width={1600} height={912} className="h-[78vh] min-h-[520px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/25 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
                <div className="max-w-xl text-background">
                  <p className="text-xs uppercase tracking-[0.32em] opacity-80">New season</p>
                  <h1 className="mt-7 font-display text-5xl leading-[1.06] md:text-7xl">Everyday goods, made simple.</h1>
                  <p className="mt-7 max-w-md text-lg leading-relaxed opacity-85">A small collection with room to look around. Take your time.</p>
                  <a href="#products" className="mt-11 inline-block rounded-full bg-background px-8 py-4 text-sm font-medium text-foreground transition hover:bg-secondary">Shop the collection</a>
                </div>
              </div>
            </div>
          </section>

          <section id="products" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-28 md:px-10 md:py-36">
            <div className="max-w-lg">
              <h2 className="font-display text-4xl leading-tight">All products</h2>
              <p className="mt-4 text-muted-foreground">Eight things we like, and nothing we don't.</p>
            </div>
            <div className="mt-20 grid grid-cols-1 gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const inCart = cart[p.id] ?? 0;
                const left = p.stock - inCart;
                return (
                  <article key={p.id} className="group">
                    <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-muted">
                      <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
                    </div>
                    <div className="mt-7">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{p.category}</p>
                      <div className="mt-3 flex items-baseline justify-between gap-4">
                        <h3 className="font-display text-2xl leading-snug">{p.name}</h3>
                        <span className="shrink-0 text-lg font-medium">{money(p.price)}</span>
                      </div>
                      <p className={`mt-2 text-sm ${p.stock === 0 ? "text-destructive" : p.stock < 5 ? "text-warning-foreground" : "text-muted-foreground"}`}>
                        {stockLine(p.stock)}
                      </p>
                      <button disabled={left <= 0} onClick={() => { setQty(p.id, inCart + 1); setOpen(true); }}
                        className="mt-6 w-full rounded-full border border-primary/35 py-3.5 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:hover:bg-muted">
                        {p.stock === 0 ? "Sold out" : left <= 0 ? "Max in cart" : "Add to cart"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      ) : (
        <Admin products={products} setProducts={setProducts} />
      )}

      <footer className="border-t border-border/70 py-20 text-center">
        <p className="font-display text-xl">ShopEasy</p>
        <p className="mt-3 text-sm text-muted-foreground">Made with care. No rush.</p>
      </footer>

      {open && <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm" onClick={() => setOpen(false)} />}
      <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-border/70 px-8 py-7">
          <h2 className="font-display text-2xl">Your cart</h2>
          <button onClick={() => setOpen(false)} aria-label="Close cart" className="rounded-full p-2 transition hover:bg-muted"><X /></button>
        </div>
        <div className="flex-1 space-y-8 overflow-y-auto px-8 py-8">
          {items.length === 0 && <p className="text-muted-foreground">Your cart is empty.</p>}
          {items.map(({ p, q }) => (
            <div key={p.id} className="flex gap-5">
              <img src={p.image} alt={p.name} className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
              <div className="flex-1">
                <div className="flex justify-between gap-3 text-sm font-medium"><span>{p.name}</span><span>{money(p.price * q)}</span></div>
                <div className="mt-4 flex items-center gap-3">
                  <button className="rounded-full border p-1.5 transition hover:bg-muted" onClick={() => setQty(p.id, q - 1)}><Minus size={14} /></button>
                  <span className="w-6 text-center text-sm">{q}</span>
                  <button className="rounded-full border p-1.5 transition hover:bg-muted disabled:opacity-40" disabled={q >= p.stock} onClick={() => setQty(p.id, q + 1)}><Plus size={14} /></button>
                  <button className="ml-auto text-xs text-muted-foreground underline underline-offset-4" onClick={() => setQty(p.id, 0)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border/70 px-8 py-8">
          <div className="mb-6 flex justify-between text-lg font-semibold"><span>Total</span><span>{money(total)}</span></div>
          <button disabled={!items.length} onClick={() => { checkout(); setOpen(false); }}
            className="w-full rounded-full bg-primary py-4 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40">Checkout</button>
        </div>
      </aside>
    </div>
  );
}

function StatusBadge({ stock }: { stock: number }) {
  const cls = stock === 0 ? "bg-destructive/10 text-destructive" : stock < 5 ? "bg-warning/15 text-warning-foreground" : "bg-success/15 text-success";
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${cls}`}>{status(stock)}{stock > 0 && ` · ${stock} left`}</span>;
}

const empty = { name: "", category: "", price: "", stock: "", image: "" };

function Admin({ products, setProducts }: { products: Product[]; setProducts: (f: (p: Product[]) => Product[]) => void }) {
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [show, setShow] = useState(false);

  const start = (p?: Product) => {
    setEditing(p?.id ?? null);
    setForm(p ? { name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), image: p.image } : empty);
    setShow(true);
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: form.name.trim(), category: form.category.trim() || "General", price: Math.max(0, Number(form.price)), stock: Math.max(0, Math.floor(Number(form.stock))), image: form.image.trim() || u("photo-1523275335684-37898b6baf30") };
    if (!data.name) return;
    setProducts((ps) => editing ? ps.map((p) => (p.id === editing ? { ...p, ...data } : p)) : [...ps, { id: Math.max(0, ...ps.map((p) => p.id)) + 1, ...data }]);
    setShow(false);
  };
  const input = "w-full rounded-xl border bg-background px-4 py-3 text-sm";

  return (
    <main className="mx-auto max-w-6xl px-6 py-28 md:px-10 md:py-32">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-5xl">Inventory</h1>
          <p className="mt-4 text-sm text-muted-foreground">{products.length} products · {products.filter((p) => p.stock < 5).length} low on stock</p>
        </div>
        <button onClick={() => start()} className="flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"><Plus size={16} />Add product</button>
      </div>

      {show && (
        <form onSubmit={save} className="mb-12 grid gap-4 rounded-3xl border bg-card p-8 md:grid-cols-6">
          <input className={`${input} md:col-span-2`} placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={input} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className={input} type="number" step="0.01" min="0" placeholder="Price in ₹" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className={input} type="number" min="0" placeholder="Stock" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <input className={input} placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <div className="flex gap-3 md:col-span-6">
            <button className="rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground transition hover:opacity-90">{editing ? "Save changes" : "Add product"}</button>
            <button type="button" onClick={() => setShow(false)} className="rounded-full border px-7 py-3 text-sm transition hover:bg-muted">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-3xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <tr>{["ID", "Name", "Category", "Price", "Stock", "Status", ""].map((h) => <th key={h} className="px-6 py-5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={`border-t ${p.stock < 5 ? "bg-warning/10" : ""}`}>
                <td className="px-6 py-5 text-muted-foreground">#{p.id}</td>
                <td className="px-6 py-5 font-medium">{p.name}</td>
                <td className="px-6 py-5">{p.category}</td>
                <td className="px-6 py-5">{money(p.price)}</td>
                <td className={`px-6 py-5 ${p.stock < 5 ? "font-semibold text-destructive" : ""}`}>{p.stock}</td>
                <td className="px-6 py-5"><StatusBadge stock={p.stock} /></td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-1">
                    <button aria-label="Edit" onClick={() => start(p)} className="rounded-xl p-2.5 transition hover:bg-muted"><Pencil size={15} /></button>
                    <button aria-label="Delete" onClick={() => confirm(`Delete ${p.name}?`) && setProducts((ps) => ps.filter((x) => x.id !== p.id))} className="rounded-xl p-2.5 text-destructive transition hover:bg-destructive/10"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
