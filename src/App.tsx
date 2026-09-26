import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Command,
  Download,
  FileClock,
  Layers3,
  LayoutDashboard,
  MapPin,
  Menu,
  Moon,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  Sun,
  Trash2,
  Upload,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import { AppStore, useApp } from "./stores/AppStore";
import type { Product, StockOperation } from "./types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("en-US");
const shortDate = (x: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(x));
const ago = (x: string) => {
  const d = Math.max(
    0,
    Math.floor((Date.now() - new Date(x).getTime()) / 3600000),
  );
  return d < 1
    ? "Just now"
    : d < 24
      ? `${d}h ago`
      : `${Math.floor(d / 24)}d ago`;
};
const statusClass = (s: string) =>
  `badge ${s.toLowerCase().replaceAll(" ", "-")}`;
const navGroups: { label: string; items: [string, LucideIcon, string][] }[] = [
  {
    label: "Workspace",
    items: [
      ["/", LayoutDashboard, "Overview"],
      ["/products", Boxes, "Products"],
      ["/categories", Layers3, "Categories"],
      ["/stock", MapPin, "Stock by location"],
    ],
  },
  {
    label: "Operations",
    items: [
      ["/receipts", ArrowDownToLine, "Receipts"],
      ["/deliveries", ArrowUpFromLine, "Deliveries"],
      ["/transfers", ArrowLeftRight, "Internal transfers"],
      ["/adjustments", SlidersHorizontal, "Adjustments"],
    ],
  },
  {
    label: "History",
    items: [
      ["/ledger", ClipboardList, "Stock ledger"],
      ["/moves", FileClock, "Move history"],
    ],
  },
  {
    label: "Manage",
    items: [
      ["/warehouses", Warehouse, "Warehouses"],
      ["/locations", MapPin, "Locations"],
      ["/analytics", BarChart3, "Analytics"],
      ["/notifications", Bell, "Notifications"],
      ["/settings", Settings, "Settings"],
    ],
  },
];

function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <h2>{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
function Confirm({
  title,
  body,
  onConfirm,
  onClose,
}: {
  title: string;
  body: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="modal-body">
        <p>{body}</p>
      </div>
      <footer className="modal-actions">
        <button className="button ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          className="button danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Confirm
        </button>
      </footer>
    </Modal>
  );
}
function Auth() {
  const { authenticated, setAuthenticated } = useApp();
  const nav = useNavigate();
  const location = useLocation();
  const initialMode = location.pathname.includes("signup")
    ? "signup"
    : location.pathname.includes("forgot")
      ? "forgot"
      : location.pathname.includes("reset")
        ? "reset"
        : "login";
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(
    initialMode,
  );
  const [error, setError] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (mode === "login" && fd.get("email") !== "admin@stocksense.demo") {
      setError("Use the demo account shown below.");
      return;
    }
    setAuthenticated(true);
    nav("/");
  };
  if (authenticated) return <Navigate to="/" replace />;
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span>S</span>StockSense
      </div>
      <section className="auth-card">
        <p className="eyebrow">Inventory operations</p>
        <h1>
          {mode === "login"
            ? "Welcome back"
            : mode === "signup"
              ? "Create your account"
              : mode === "forgot"
                ? "Recover access"
                : "Choose a new password"}
        </h1>
        <p className="subtle">
          {mode === "login"
            ? "Sign in to manage inventory across your operation."
            : "Demo mode keeps everything safely on this device."}
        </p>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>
              Full name
              <input name="name" required placeholder="Alex Morgan" />
            </label>
          )}
          {mode !== "reset" && (
            <label>
              Email
              <input
                name="email"
                type="email"
                required
                defaultValue={mode === "login" ? "admin@stocksense.demo" : ""}
              />
            </label>
          )}
          {mode !== "forgot" && (
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                defaultValue={mode === "login" ? "demo123" : ""}
              />
            </label>
          )}
          {error && <p className="form-error">{error}</p>}
          <button className="button primary wide-button" type="submit">
            {mode === "login"
              ? "Sign in"
              : mode === "signup"
                ? "Create account"
                : mode === "forgot"
                  ? "Send reset link"
                  : "Reset password"}
          </button>
        </form>
        {mode === "login" && (
          <>
            <button
              className="button secondary wide-button"
              onClick={() => {
                setAuthenticated(true);
                nav("/");
              }}
            >
              Continue as Demo User
            </button>
            <div className="demo-creds">
              <b>Demo account</b>
              <span>admin@stocksense.demo</span>
              <span>Password: demo123</span>
            </div>
          </>
        )}
        <div className="auth-links">
          {mode !== "login" ? (
            <button onClick={() => setMode("login")}>Back to sign in</button>
          ) : (
            <>
              <button onClick={() => setMode("signup")}>Create account</button>
              <button onClick={() => setMode("forgot")}>
                Forgot password?
              </button>
            </>
          )}
        </div>
      </section>
      <p className="auth-note">
        Demo mode · No API keys required · Data persists locally
      </p>
    </div>
  );
}

function Shell() {
  const { data, setAuthenticated, toast, clearToast } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [palette, setPalette] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("stocksense-theme") || "light",
  );
  const nav = useNavigate();
  const unread = data.notifications.filter((n) => !n.read).length;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("stocksense-theme", theme);
  }, [theme]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);
  return (
    <div className={`app ${collapsed ? "collapsed" : ""}`}>
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">S</span>
          <span className="brand-name">StockSense</span>
          <button
            className="close-mobile"
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <nav>
          {navGroups.map((g) => (
            <div className="nav-group" key={g.label}>
              <p>{g.label}</p>
              {g.items.map(([href, Icon, label]) => (
                <NavLink
                  to={href}
                  end={href === "/"}
                  key={href}
                  onClick={() => setMobile(false)}
                >
                  <Icon />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/profile" className="profile">
            <span className="avatar">AM</span>
            <span>
              <b>Alex Morgan</b>
              <small>Administrator</small>
            </span>
          </NavLink>
          <button
            className="collapse"
            onClick={() => setCollapsed((x) => !x)}
            aria-label="Toggle sidebar"
          >
            <ChevronLeft />
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          className="mobile-shade"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <main className="main">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <button className="global-search" onClick={() => setPalette(true)}>
            <Search />
            <span>Search products, orders, SKUs…</span>
            <kbd>
              <Command />K
            </kbd>
          </button>
          <button
            className="icon-button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
          <button
            className="icon-button notification-button"
            onClick={() => nav("/notifications")}
            aria-label={`${unread} unread notifications`}
          >
            <Bell />
            {unread > 0 && <i>{unread}</i>}
          </button>
          <button className="avatar" onClick={() => nav("/profile")}>
            AM
          </button>
          <button
            className="logout-link"
            onClick={() => setAuthenticated(false)}
            title="Log out"
          >
            Log out
          </button>
        </header>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/stock" element={<StockByLocation />} />
          <Route path="/receipts" element={<Operations type="Receipt" />} />
          <Route path="/deliveries" element={<Operations type="Delivery" />} />
          <Route path="/transfers" element={<Operations type="Transfer" />} />
          <Route
            path="/adjustments"
            element={<Operations type="Adjustment" />}
          />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/moves" element={<MoveHistory />} />
          <Route path="/warehouses" element={<WarehousesPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {palette && <CommandPalette onClose={() => setPalette(false)} />}{" "}
      {toast && (
        <button className="toast" onClick={clearToast}>
          <Check /> {toast}
        </button>
      )}
    </div>
  );
}
function PageHead({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="page-heading">
      <div>
        <p className="eyebrow">StockSense</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{actions}</div>
    </section>
  );
}
function Empty({
  title = "Nothing here yet",
  text = "Create a record to get started.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty">
      <Package />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function CommandPalette({ onClose }: { onClose: () => void }) {
  const { data } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    return [
      ...data.products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s),
        )
        .map((p) => ({
          label: p.name,
          meta: p.sku,
          href: `/products/${p.id}`,
          type: "Product",
        })),
      ...data.operations
        .filter(
          (o) =>
            o.number.toLowerCase().includes(s) ||
            o.party.toLowerCase().includes(s),
        )
        .map((o) => ({
          label: o.number,
          meta: o.party,
          href: `/${o.type.toLowerCase()}s`,
          type: o.type,
        })),
    ].slice(0, 10);
  }, [q, data]);
  return (
    <Modal title="Search StockSense" onClose={onClose}>
      <div className="command-input">
        <Search />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products, SKUs, and documents"
        />
      </div>
      <div className="command-results">
        {!q && (
          <p className="command-hint">
            Start typing to search across the workspace.
          </p>
        )}
        {q && results.length === 0 && (
          <Empty
            title="No results"
            text="Try a product name, SKU, or document number."
          />
        )}
        {results.map((r) => (
          <button
            key={`${r.type}-${r.label}`}
            onClick={() => {
              nav(r.href);
              onClose();
            }}
          >
            <span className="result-icon">
              <Package />
            </span>
            <span>
              <b>{r.label}</b>
              <small>
                {r.type} · {r.meta}
              </small>
            </span>
            <ChevronRight />
          </button>
        ))}
      </div>
    </Modal>
  );
}

function Overview() {
  const { data } = useApp();
  const nav = useNavigate();
  const totals = useMemo(() => {
    const units = data.inventory.reduce((s, i) => s + i.quantity, 0);
    const value = data.inventory.reduce(
      (s, i) =>
        s +
        i.quantity *
          (data.products.find((p) => p.id === i.productId)?.cost || 0),
      0,
    );
    const low = data.products.filter((p) => {
      const qty = data.inventory
        .filter((i) => i.productId === p.id)
        .reduce((s, i) => s + i.quantity - i.reserved, 0);
      return qty > 0 && qty <= p.reorderLevel;
    }).length;
    const out = data.products.filter(
      (p) =>
        !data.inventory.some((i) => i.productId === p.id && i.quantity > 0),
    ).length;
    return { units, value, low, out };
  }, [data]);
  const movement = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const day = new Date(Date.now() - (6 - i) * 86400000);
        const same = (x: string) =>
          new Date(x).toDateString() === day.toDateString();
        return {
          day: day.toLocaleDateString("en-US", { weekday: "short" }),
          incoming: data.ledger
            .filter((m) => same(m.date))
            .reduce((s, m) => s + m.quantityIn, 0),
          outgoing: data.ledger
            .filter((m) => same(m.date))
            .reduce((s, m) => s + m.quantityOut, 0),
        };
      }),
    [data],
  );
  return (
    <div className="page">
      <PageHead
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, Alex`}
        description="Here’s what’s moving across your operation today."
        actions={
          <button className="button primary" onClick={() => nav("/receipts")}>
            <PackageCheck /> New receipt
          </button>
        }
      />
      <section className="kpis">
        {([
          [
            "Total products",
            data.products.length,
            "Across 6 categories",
            Boxes,
          ],
          [
            "Units in stock",
            number.format(totals.units),
            "Live available stock",
            Package,
          ],
          [
            "Inventory value",
            money.format(totals.value),
            "+8.2% this month",
            Activity,
          ],
          [
            "Needs attention",
            totals.low + totals.out,
            `${totals.low} low · ${totals.out} out`,
            AlertTriangle,
          ],
        ] as [string, string | number, string, LucideIcon][]).map(([a, b, c, Icon]) => (
          <article className="kpi" key={String(a)}>
            <span className="kpi-icon">
              <Icon />
            </span>
            <p>{a}</p>
            <strong>{b}</strong>
            <small>{c}</small>
          </article>
        ))}
      </section>
      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h2>Inventory movement</h2>
              <p>Incoming and outgoing units over 7 days</p>
            </div>
            <button
              className="button ghost small"
              onClick={() => nav("/analytics")}
            >
              View analytics
            </button>
          </div>
          <div className="legend">
            <span>
              <i />
              Incoming
            </span>
            <span>
              <i className="slate" />
              Outgoing
            </span>
          </div>
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={movement}>
              <defs>
                <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#159a80" stopOpacity=".25" />
                  <stop offset="1" stopColor="#159a80" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="incoming"
                stroke="#159a80"
                fill="url(#green)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="outgoing"
                stroke="#667b76"
                fill="transparent"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </article>
        <article className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent activity</h2>
              <p>Latest completed operations</p>
            </div>
            <button className="text-button" onClick={() => nav("/moves")}>
              View all
            </button>
          </div>
          <div className="activity-list">
            {data.ledger.slice(0, 6).map((m) => {
              const p = data.products.find((x) => x.id === m.productId);
              return (
                <button
                  className="activity-row"
                  key={m.id}
                  onClick={() => nav("/ledger")}
                >
                  <span className={`activity-icon ${m.type.toLowerCase()}`}>
                    <ArrowLeftRight />
                  </span>
                  <span>
                    <b>
                      {m.reference} · {m.type}
                    </b>
                    <small>
                      {p?.name} ·{" "}
                      {m.quantityIn ? `+${m.quantityIn}` : `−${m.quantityOut}`}
                    </small>
                  </span>
                  <time>{ago(m.date)}</time>
                </button>
              );
            })}
          </div>
        </article>
      </section>
      <section className="panel attention">
        <div className="panel-head">
          <div>
            <h2>Stock requiring attention</h2>
            <p>Items at or below their reorder threshold</p>
          </div>
          <button
            className="text-button"
            onClick={() => nav("/products?filter=low")}
          >
            Review products
          </button>
        </div>
        <div className="attention-grid">
          {data.products
            .map((p) => ({
              p,
              qty: data.inventory
                .filter((i) => i.productId === p.id)
                .reduce((s, i) => s + i.quantity - i.reserved, 0),
            }))
            .filter((x) => x.qty <= x.p.reorderLevel)
            .slice(0, 4)
            .map(({ p, qty }) => (
              <button key={p.id} onClick={() => nav(`/products/${p.id}`)}>
                <span className="stock-ring">{qty}</span>
                <span>
                  <b>{p.name}</b>
                  <small>
                    {p.sku} · Reorder at {p.reorderLevel}
                  </small>
                </span>
                <span
                  className={statusClass(
                    qty === 0 ? "Out of Stock" : "Low Stock",
                  )}
                >
                  {qty === 0 ? "Out of stock" : "Low stock"}
                </span>
              </button>
            ))}
        </div>
      </section>
    </div>
  );
}

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  categoryId: z.string().min(1),
  unit: z.string().min(1),
  cost: z.number().min(0),
  price: z.number().min(0).optional(),
  initialStock: z.number().int().min(0),
  reorderLevel: z.number().int().min(0),
  warehouseId: z.string().min(1),
  locationId: z.string().min(1),
  description: z.string().optional(),
});
type ProductForm = z.infer<typeof productSchema>;
function ProductDialog({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const { data, addProduct, updateProduct } = useApp();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          ...product,
          initialStock: 0,
          warehouseId: data.warehouses[0].id,
          locationId: data.locations[0].id,
        }
      : {
          unit: "unit",
          cost: 0,
          initialStock: 0,
          reorderLevel: 10,
          warehouseId: data.warehouses[0].id,
          locationId: data.locations[0].id,
          categoryId: data.categories[0].id,
        },
  });
  const wh = watch("warehouseId");
  const submit = (v: ProductForm) => {
    if (product)
      updateProduct({
        ...product,
        name: v.name,
        sku: v.sku,
        categoryId: v.categoryId,
        unit: v.unit,
        cost: v.cost,
        price: v.price,
        reorderLevel: v.reorderLevel,
        description: v.description,
      });
    else addProduct(v);
    onClose();
  };
  return (
    <Modal
      title={product ? "Edit product" : "Add product"}
      onClose={onClose}
      wide
    >
      <form onSubmit={handleSubmit(submit)}>
        <div className="modal-body form-grid">
          <label>
            Product name
            <input {...register("name")} placeholder="e.g. Steel Rod" />
            <em>{errors.name?.message}</em>
          </label>
          <label>
            SKU
            <input {...register("sku")} placeholder="SS-1042" />
            <em>{errors.sku?.message}</em>
          </label>
          <label>
            Category
            <select {...register("categoryId")}>
              {data.categories.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Unit of measure
            <select {...register("unit")}>
              <option>unit</option>
              <option>kg</option>
              <option>meter</option>
              <option>box</option>
              <option>pair</option>
              <option>sheet</option>
            </select>
          </label>
          <label>
            Cost price
            <input
              type="number"
              step=".01"
              {...register("cost", { valueAsNumber: true })}
            />
          </label>
          <label>
            Selling price
            <input
              type="number"
              step=".01"
              {...register("price", { valueAsNumber: true })}
            />
          </label>
          <label>
            Reorder level
            <input
              type="number"
              {...register("reorderLevel", { valueAsNumber: true })}
            />
          </label>
          {!product && (
            <>
              <label>
                Initial stock
                <input
                  type="number"
                  {...register("initialStock", { valueAsNumber: true })}
                />
              </label>
              <label>
                Warehouse
                <select {...register("warehouseId")}>
                  {data.warehouses
                    .filter((w) => w.status === "Active")
                    .map((w) => (
                      <option value={w.id} key={w.id}>
                        {w.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Location
                <select {...register("locationId")}>
                  {data.locations
                    .filter((l) => l.warehouseId === wh)
                    .map((l) => (
                      <option value={l.id} key={l.id}>
                        {l.name}
                      </option>
                    ))}
                </select>
              </label>
            </>
          )}
          <label className="full">
            Description
            <textarea {...register("description")} rows={3} />
          </label>
        </div>
        <footer className="modal-actions">
          <button type="button" className="button ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            {product ? "Save changes" : "Create product"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}

function Products() {
  const { data, deleteProduct } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState("all");
  const [sort, setSort] = useState<"name" | "sku" | "quantity">("name");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<Product | true | null>(null);
  const [remove, setRemove] = useState<Product | null>(null);
  const rows = useMemo(
    () =>
      data.products
        .map((p) => {
          const inv = data.inventory.filter((i) => i.productId === p.id);
          const qty = inv.reduce((s, i) => s + i.quantity, 0);
          const reserved = inv.reduce((s, i) => s + i.reserved, 0);
          return { p, qty, reserved, available: qty - reserved };
        })
        .filter((x) =>
          (
            x.p.name +
            x.p.sku +
            data.categories.find((c) => c.id === x.p.categoryId)?.name
          )
            .toLowerCase()
            .includes(q.toLowerCase()),
        )
        .filter((x) => category === "all" || x.p.categoryId === category)
        .filter(
          (x) =>
            stock === "all" ||
            (stock === "out"
              ? x.qty === 0
              : stock === "low"
                ? x.qty > 0 && x.available <= x.p.reorderLevel
                : x.available > x.p.reorderLevel),
        )
        .sort((a, b) =>
          sort === "quantity"
            ? a.qty - b.qty
            : String(a.p[sort]).localeCompare(String(b.p[sort])),
        ),
    [data, q, category, stock, sort],
  );
  const per = 10,
    pages = Math.max(1, Math.ceil(rows.length / per));
  useEffect(() => setPage(1), [q, category, stock]);
  const exportCsv = () =>
    download(
      "stocksense-products.csv",
      [
        "Product,SKU,Category,On Hand,Reserved,Available,Value",
        ...rows.map((x) =>
          [
            x.p.name,
            x.p.sku,
            data.categories.find((c) => c.id === x.p.categoryId)?.name,
            x.qty,
            x.reserved,
            x.available,
            (x.qty * x.p.cost).toFixed(2),
          ].join(","),
        ),
      ].join("\n"),
      "text/csv",
    );
  return (
    <div className="page">
      <PageHead
        title="Products"
        description={`${data.products.length} catalog items across your operation.`}
        actions={
          <>
            <button className="button ghost" onClick={exportCsv}>
              <Download /> Export CSV
            </button>
            <button className="button primary" onClick={() => setDialog(true)}>
              <Plus /> Add product
            </button>
          </>
        }
      />
      <div className="toolbar">
        <div className="input-with-icon">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search product, SKU, category…"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {data.categories.map((c) => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={stock} onChange={(e) => setStock(e.target.value)}>
          <option value="all">All stock statuses</option>
          <option value="in">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
        >
          <option value="name">Sort: Name</option>
          <option value="sku">Sort: SKU</option>
          <option value="quantity">Sort: Quantity</option>
        </select>
        {(q || category !== "all" || stock !== "all") && (
          <button
            className="button ghost"
            onClick={() => {
              setQ("");
              setCategory("all");
              setStock("all");
            }}
          >
            <X /> Clear
          </button>
        )}
      </div>
      <section className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>On hand</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Reorder level</th>
                <th>Status</th>
                <th>Value</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows
                .slice((page - 1) * per, page * per)
                .map(({ p, qty, reserved, available }) => (
                  <tr key={p.id}>
                    <td>
                      <button
                        className="product-cell"
                        onClick={() => nav(`/products/${p.id}`)}
                      >
                        <span>{p.name.slice(0, 2).toUpperCase()}</span>
                        <b>{p.name}</b>
                      </button>
                    </td>
                    <td>
                      <code>{p.sku}</code>
                    </td>
                    <td>
                      {data.categories.find((c) => c.id === p.categoryId)?.name}
                    </td>
                    <td>{qty}</td>
                    <td>{reserved}</td>
                    <td>
                      <b>{available}</b>
                    </td>
                    <td>{p.reorderLevel}</td>
                    <td>
                      <span
                        className={statusClass(
                          qty === 0
                            ? "Out of Stock"
                            : available <= p.reorderLevel
                              ? "Low Stock"
                              : "In Stock",
                        )}
                      >
                        {qty === 0
                          ? "Out of stock"
                          : available <= p.reorderLevel
                            ? "Low stock"
                            : "In stock"}
                      </span>
                    </td>
                    <td>{money.format(qty * p.cost)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          onClick={() => setDialog(p)}
                          aria-label={`Edit ${p.name}`}
                        >
                          <SlidersHorizontal />
                        </button>
                        <button
                          onClick={() => setRemove(p)}
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <Empty
            title="No matching products"
            text="Clear the filters or add a new product."
          />
        ) : (
          <div className="pagination">
            <span>
              Showing {(page - 1) * per + 1}–{Math.min(page * per, rows.length)}{" "}
              of {rows.length}
            </span>
            <div>
              <button
                disabled={page === 1}
                onClick={() => setPage((x) => x - 1)}
              >
                <ChevronLeft />
              </button>
              <b>
                {page} / {pages}
              </b>
              <button
                disabled={page === pages}
                onClick={() => setPage((x) => x + 1)}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}
      </section>
      {dialog && (
        <ProductDialog
          product={dialog === true ? undefined : dialog}
          onClose={() => setDialog(null)}
        />
      )}{" "}
      {remove && (
        <Confirm
          title="Delete product?"
          body={`${remove.name} and its inventory records will be removed. Ledger history remains available.`}
          onClose={() => setRemove(null)}
          onConfirm={() => deleteProduct(remove.id)}
        />
      )}
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const { data } = useApp();
  const nav = useNavigate();
  const [edit, setEdit] = useState(false);
  const p = data.products.find((x) => x.id === id);
  if (!p) return <NotFound />;
  const inv = data.inventory.filter((i) => i.productId === p.id);
  const ledger = data.ledger.filter((m) => m.productId === p.id);
  const qty = inv.reduce((s, i) => s + i.quantity, 0);
  return (
    <div className="page">
      <button className="back-link" onClick={() => nav("/products")}>
        <ChevronLeft /> Products
      </button>
      <PageHead
        title={p.name}
        description={`${p.sku} · ${data.categories.find((c) => c.id === p.categoryId)?.name}`}
        actions={
          <button className="button primary" onClick={() => setEdit(true)}>
            Edit product
          </button>
        }
      />
      <section className="detail-grid">
        <article className="panel product-summary">
          <div className="product-hero">
            <span>{p.name.slice(0, 2).toUpperCase()}</span>
            <div>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>Unit cost</dt>
              <dd>{money.format(p.cost)}</dd>
            </div>
            <div>
              <dt>Selling price</dt>
              <dd>{money.format(p.price || 0)}</dd>
            </div>
            <div>
              <dt>Reorder level</dt>
              <dd>
                {p.reorderLevel} {p.unit}
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{shortDate(p.createdAt)}</dd>
            </div>
          </dl>
        </article>
        <article className="panel stock-total">
          <p>Total on hand</p>
          <strong>{number.format(qty)}</strong>
          <span>{p.unit}</span>
          <div className="stock-meter">
            <i
              style={{
                width: `${Math.min(100, (qty / (p.reorderLevel * 3)) * 100)}%`,
              }}
            />
          </div>
          <small>
            {qty <= p.reorderLevel
              ? "Reorder recommended"
              : "Healthy stock level"}
          </small>
        </article>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Stock by location</h2>
            <p>Live quantities across warehouses</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Warehouse</th>
                <th>Location</th>
                <th>On hand</th>
                <th>Reserved</th>
                <th>Available</th>
              </tr>
            </thead>
            <tbody>
              {inv.map((i) => (
                <tr key={i.id}>
                  <td>
                    {data.warehouses.find((w) => w.id === i.warehouseId)?.name}
                  </td>
                  <td>
                    {data.locations.find((l) => l.id === i.locationId)?.name}
                  </td>
                  <td>{i.quantity}</td>
                  <td>{i.reserved}</td>
                  <td>
                    <b>{i.quantity - i.reserved}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Movement history</h2>
            <p>Receipts, deliveries, transfers, and corrections</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={[...ledger]
              .reverse()
              .slice(-12)
              .map((m, i) => ({ name: i + 1, balance: m.balanceAfter }))}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#159a80"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
      {edit && <ProductDialog product={p} onClose={() => setEdit(false)} />}
    </div>
  );
}

function OperationDialog({
  type,
  onClose,
}: {
  type: StockOperation["type"];
  onClose: () => void;
}) {
  const { data, addOperation } = useApp();
  const [warehouse, setWarehouse] = useState(data.warehouses[0].id);
  const [location, setLocation] = useState(
    data.locations.find((l) => l.warehouseId === data.warehouses[0].id)!.id,
  );
  const [destWh, setDestWh] = useState(data.warehouses[1].id);
  const [product, setProduct] = useState(data.products[0].id);
  const [qty, setQty] = useState(1);
  const [physical, setPhysical] = useState(0);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const count = data.operations.filter((o) => o.type === type).length + 1;
    addOperation({
      id: crypto.randomUUID(),
      number: `${type === "Receipt" ? "REC" : type === "Delivery" ? "DEL" : type === "Transfer" ? "TRF" : "ADJ"}-${String(count).padStart(4, "0")}`,
      type,
      party: form.party?.value || "Internal",
      warehouseId: warehouse,
      locationId: location,
      destinationWarehouseId: type === "Transfer" ? destWh : undefined,
      destinationLocationId:
        type === "Transfer"
          ? data.locations.find((l) => l.warehouseId === destWh)?.id
          : undefined,
      date: new Date().toISOString(),
      status: "Draft",
      reference: form.reference?.value,
      notes: form.notes?.value,
      reason: type === "Adjustment" ? form.reason?.value : undefined,
      lines: [
        {
          id: crypto.randomUUID(),
          productId: product,
          quantity: qty,
          processed: type === "Adjustment" ? physical : 0,
        },
      ],
      createdAt: new Date().toISOString(),
    });
    onClose();
  };
  const recorded = data.inventory
    .filter(
      (i) =>
        i.productId === product &&
        i.warehouseId === warehouse &&
        i.locationId === location,
    )
    .reduce((s, i) => s + i.quantity, 0);
  return (
    <Modal title={`New ${type.toLowerCase()}`} onClose={onClose} wide>
      <form onSubmit={submit}>
        <div className="modal-body form-grid">
          {type !== "Transfer" && type !== "Adjustment" && (
            <label>
              {type === "Receipt" ? "Supplier" : "Customer"}
              <input
                name="party"
                required
                placeholder={
                  type === "Receipt" ? "Atlas Steel" : "Northstar Retail"
                }
              />
            </label>
          )}
          <label>
            {type === "Receipt"
              ? "Destination"
              : type === "Delivery"
                ? "Source"
                : "Warehouse"}
            <select
              value={warehouse}
              onChange={(e) => {
                setWarehouse(e.target.value);
                setLocation(
                  data.locations.find((l) => l.warehouseId === e.target.value)!
                    .id,
                );
              }}
            >
              {data.warehouses
                .filter((w) => w.status === "Active")
                .map((w) => (
                  <option value={w.id} key={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Location
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {data.locations
                .filter((l) => l.warehouseId === warehouse)
                .map((l) => (
                  <option value={l.id} key={l.id}>
                    {l.name}
                  </option>
                ))}
            </select>
          </label>
          {type === "Transfer" && (
            <label>
              Destination warehouse
              <select
                value={destWh}
                onChange={(e) => setDestWh(e.target.value)}
              >
                {data.warehouses
                  .filter((w) => w.id !== warehouse && w.status === "Active")
                  .map((w) => (
                    <option value={w.id} key={w.id}>
                      {w.name}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <label>
            Reference
            <input name="reference" placeholder="Optional reference" />
          </label>
          <div className="form-section full">
            <h3>Line item</h3>
            <div className="line-grid">
              <label>
                Product
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                >
                  {data.products.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name} · {p.sku}
                    </option>
                  ))}
                </select>
              </label>
              {type === "Adjustment" ? (
                <>
                  <label>
                    Recorded quantity
                    <input value={recorded} disabled />
                  </label>
                  <label>
                    Counted quantity
                    <input
                      type="number"
                      min="0"
                      value={physical}
                      onChange={(e) => setPhysical(+e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Difference
                    <input value={physical - recorded} disabled />
                  </label>
                </>
              ) : (
                <label>
                  Quantity
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(+e.target.value)}
                    required
                  />
                </label>
              )}
            </div>
          </div>
          {type === "Adjustment" && (
            <label>
              Reason
              <select name="reason">
                <option>Physical Count</option>
                <option>Damage</option>
                <option>Loss</option>
                <option>Found Stock</option>
                <option>Data Correction</option>
                <option>Other</option>
              </select>
            </label>
          )}
          <label className="full">
            Notes
            <textarea name="notes" rows={3} />
          </label>
        </div>
        <footer className="modal-actions">
          <button type="button" className="button ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            Create draft
          </button>
        </footer>
      </form>
    </Modal>
  );
}

function Operations({ type }: { type: StockOperation["type"] }) {
  const { data, updateOperationStatus, validate } = useApp();
  const [newOpen, setNewOpen] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<StockOperation | null>(null);
  const rows = data.operations
    .filter((o) => o.type === type)
    .filter((o) => (o.number + o.party).toLowerCase().includes(q.toLowerCase()))
    .filter((o) => status === "all" || o.status === status);
  const tryValidate = (o: StockOperation) => {
    try {
      validate(o.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to validate");
    }
  };
  return (
    <div className="page">
      <PageHead
        title={type === "Delivery" ? "Delivery orders" : `${type}s`}
        description={`Create, prepare, and validate ${type.toLowerCase()} operations.`}
        actions={
          <button className="button primary" onClick={() => setNewOpen(true)}>
            <Plus /> New {type.toLowerCase()}
          </button>
        }
      />
      {error && (
        <div className="error-banner">
          <AlertTriangle />
          {error}
          <button onClick={() => setError("")}>
            <X />
          </button>
        </div>
      )}
      <div className="toolbar">
        <div className="input-with-icon">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${type.toLowerCase()} number or party…`}
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {["Draft", "Waiting", "Ready", "Done", "Cancelled"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {(q || status !== "all") && (
          <button
            className="button ghost"
            onClick={() => {
              setQ("");
              setStatus("all");
            }}
          >
            <X /> Clear
          </button>
        )}
      </div>
      <section className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{type} #</th>
                <th>
                  {type === "Receipt"
                    ? "Supplier"
                    : type === "Delivery"
                      ? "Customer"
                      : "Route"}
                </th>
                <th>Warehouse</th>
                <th>Products</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td>
                    <b>{o.number}</b>
                    <small className="cell-sub">
                      {o.reference || "No reference"}
                    </small>
                  </td>
                  <td>
                    {type === "Transfer"
                      ? `${data.warehouses.find((w) => w.id === o.warehouseId)?.code} → ${data.warehouses.find((w) => w.id === o.destinationWarehouseId)?.code}`
                      : type === "Adjustment"
                        ? o.reason
                        : o.party}
                  </td>
                  <td>
                    {data.warehouses.find((w) => w.id === o.warehouseId)?.name}
                  </td>
                  <td>{o.lines.length}</td>
                  <td>
                    {o.lines.reduce(
                      (s, l) =>
                        s + (type === "Adjustment" ? l.processed : l.quantity),
                      0,
                    )}
                  </td>
                  <td>
                    <span className={statusClass(o.status)}>{o.status}</span>
                  </td>
                  <td>{shortDate(o.date)}</td>
                  <td>
                    <div className="operation-actions">
                      {o.status === "Draft" && (
                        <button
                          className="button ghost small"
                          onClick={() => updateOperationStatus(o.id, "Waiting")}
                        >
                          Submit
                        </button>
                      )}
                      {o.status === "Waiting" && (
                        <button
                          className="button ghost small"
                          onClick={() => updateOperationStatus(o.id, "Ready")}
                        >
                          Mark ready
                        </button>
                      )}
                      {o.status === "Ready" && (
                        <button
                          className="button primary small"
                          onClick={() => setConfirm(o)}
                        >
                          Validate
                        </button>
                      )}
                      {o.status !== "Done" && o.status !== "Cancelled" && (
                        <button
                          className="icon-button"
                          onClick={() =>
                            updateOperationStatus(o.id, "Cancelled")
                          }
                          aria-label={`Cancel ${o.number}`}
                        >
                          <X />
                        </button>
                      )}
                      {o.status === "Done" && (
                        <span className="completed">
                          <Check /> Completed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <Empty
            title={`No ${type.toLowerCase()}s found`}
            text="Change the filters or create a new operation."
          />
        )}
      </section>
      {newOpen && (
        <OperationDialog type={type} onClose={() => setNewOpen(false)} />
      )}{" "}
      {confirm && (
        <Confirm
          title={`Validate ${confirm.number}?`}
          body={`This will permanently update inventory and add entries to the stock ledger. ${type === "Transfer" ? "Total company stock will remain unchanged." : ""}`}
          onClose={() => setConfirm(null)}
          onConfirm={() => tryValidate(confirm)}
        />
      )}
    </div>
  );
}

function Ledger() {
  const { data } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const rows = data.ledger
    .filter((m) => {
      const p = data.products.find((x) => x.id === m.productId);
      return (m.reference + (p?.name || "") + (p?.sku || ""))
        .toLowerCase()
        .includes(q.toLowerCase());
    })
    .filter((m) => type === "all" || m.type === type);
  const exportCsv = () =>
    download(
      "stocksense-ledger.csv",
      [
        "Date,Reference,Type,Product,SKU,From,To,Quantity In,Quantity Out,Balance After",
        ...rows.map((m) => {
          const p = data.products.find((x) => x.id === m.productId);
          return [
            m.date,
            m.reference,
            m.type,
            p?.name,
            p?.sku,
            m.fromWarehouseId || "",
            m.toWarehouseId || "",
            m.quantityIn,
            m.quantityOut,
            m.balanceAfter,
          ].join(",");
        }),
      ].join("\n"),
      "text/csv",
    );
  return (
    <div className="page">
      <PageHead
        title="Stock ledger"
        description="An immutable history of every inventory movement."
        actions={
          <button className="button ghost" onClick={exportCsv}>
            <Download /> Export CSV
          </button>
        }
      />
      <div className="toolbar">
        <div className="input-with-icon">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reference, product, or SKU…"
          />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All movement types</option>
          {[
            "Receipt",
            "Delivery",
            "Transfer",
            "Adjustment",
            "Initial Stock",
          ].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <section className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date / time</th>
                <th>Reference</th>
                <th>Type</th>
                <th>Product</th>
                <th>From</th>
                <th>To</th>
                <th>In</th>
                <th>Out</th>
                <th>Balance</th>
                <th>Performed by</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const p = data.products.find((x) => x.id === m.productId);
                return (
                  <tr key={m.id}>
                    <td>
                      {shortDate(m.date)}
                      <small className="cell-sub">
                        {new Date(m.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => nav(`/${m.type.toLowerCase()}s`)}
                      >
                        {m.reference}
                      </button>
                    </td>
                    <td>
                      <span className={statusClass(m.type)}>{m.type}</span>
                    </td>
                    <td>
                      <b>{p?.name}</b>
                      <small className="cell-sub">{p?.sku}</small>
                    </td>
                    <td>{place(data, m.fromWarehouseId, m.fromLocationId)}</td>
                    <td>{place(data, m.toWarehouseId, m.toLocationId)}</td>
                    <td className="qty-in">
                      {m.quantityIn ? `+${m.quantityIn}` : "—"}
                    </td>
                    <td className="qty-out">
                      {m.quantityOut ? `−${m.quantityOut}` : "—"}
                    </td>
                    <td>
                      <b>{m.balanceAfter}</b>
                    </td>
                    <td>Alex Morgan</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
function place(
  data: ReturnType<typeof useApp>["data"],
  w?: string,
  l?: string,
) {
  if (!w) return "—";
  return (
    <>
      {data.warehouses.find((x) => x.id === w)?.name}
      <small className="cell-sub">
        {data.locations.find((x) => x.id === l)?.name}
      </small>
    </>
  );
}
function MoveHistory() {
  const { data } = useApp();
  const [q, setQ] = useState("");
  const rows = data.ledger.filter((m) => {
    const p = data.products.find((x) => x.id === m.productId);
    return ((p?.name || "") + m.reference)
      .toLowerCase()
      .includes(q.toLowerCase());
  });
  return (
    <div className="page">
      <PageHead
        title="Move history"
        description="A simplified timeline of stock movement."
      />
      <div className="toolbar">
        <div className="input-with-icon">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search moves…"
          />
        </div>
      </div>
      <section className="panel timeline">
        {rows.slice(0, 30).map((m) => (
          <article key={m.id}>
            <span className={`activity-icon ${m.type.toLowerCase()}`}>
              <ArrowLeftRight />
            </span>
            <div>
              <h3>{data.products.find((p) => p.id === m.productId)?.name}</h3>
              <p>
                {placeText(data, m.fromWarehouseId, m.fromLocationId)} →{" "}
                {placeText(data, m.toWarehouseId, m.toLocationId)}
              </p>
              <small>
                {m.reference} · Alex Morgan · {ago(m.date)}
              </small>
            </div>
            <b>{m.quantityIn ? `+${m.quantityIn}` : `−${m.quantityOut}`}</b>
          </article>
        ))}
      </section>
    </div>
  );
}
const placeText = (
  data: ReturnType<typeof useApp>["data"],
  w?: string,
  l?: string,
) =>
  w
    ? `${data.warehouses.find((x) => x.id === w)?.code}/${data.locations.find((x) => x.id === l)?.name || "—"}`
    : "External";

function Categories() {
  const { data, upsertCategory } = useApp();
  const [name, setName] = useState("");
  const stats = data.categories.map((c) => {
    const ps = data.products.filter((p) => p.categoryId === c.id);
    const inv = data.inventory.filter((i) =>
      ps.some((p) => p.id === i.productId),
    );
    return {
      c,
      count: ps.length,
      qty: inv.reduce((s, i) => s + i.quantity, 0),
      value: inv.reduce(
        (s, i) =>
          s +
          i.quantity *
            (data.products.find((p) => p.id === i.productId)?.cost || 0),
        0,
      ),
    };
  });
  return (
    <div className="page">
      <PageHead
        title="Categories"
        description="Organize the catalog and understand value by group."
      />
      <form
        className="inline-create"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            upsertCategory({ id: crypto.randomUUID(), name: name.trim() });
            setName("");
          }
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          required
        />
        <button className="button primary">
          <Plus /> Add category
        </button>
      </form>
      <section className="card-grid">
        {stats.map(({ c, count, qty, value }) => (
          <article className="panel category-card" key={c.id}>
            <span className="category-icon">
              <Layers3 />
            </span>
            <h2>{c.name}</h2>
            <dl>
              <div>
                <dt>Products</dt>
                <dd>{count}</dd>
              </div>
              <div>
                <dt>Units</dt>
                <dd>{number.format(qty)}</dd>
              </div>
              <div>
                <dt>Value</dt>
                <dd>{money.format(value)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
function StockByLocation() {
  const { data } = useApp();
  const [warehouse, setWarehouse] = useState("all");
  const rows = data.inventory.filter(
    (i) => warehouse === "all" || i.warehouseId === warehouse,
  );
  return (
    <div className="page">
      <PageHead
        title="Stock by location"
        description="See exactly where every unit is stored."
      />
      <div className="toolbar">
        <select
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
        >
          <option value="all">All warehouses</option>
          {data.warehouses.map((w) => (
            <option value={w.id} key={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <section className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Warehouse</th>
                <th>Location</th>
                <th>On hand</th>
                <th>Reserved</th>
                <th>Available</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => {
                const p = data.products.find((x) => x.id === i.productId);
                return (
                  <tr key={i.id}>
                    <td>
                      <b>{p?.name}</b>
                    </td>
                    <td>
                      <code>{p?.sku}</code>
                    </td>
                    <td>
                      {
                        data.warehouses.find((w) => w.id === i.warehouseId)
                          ?.name
                      }
                    </td>
                    <td>
                      {data.locations.find((l) => l.id === i.locationId)?.name}
                    </td>
                    <td>{i.quantity}</td>
                    <td>{i.reserved}</td>
                    <td>
                      <b>{i.quantity - i.reserved}</b>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function WarehousesPage() {
  const { data, upsertWarehouse, archiveWarehouse } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<
    (typeof data.warehouses)[number] | undefined
  >();
  return (
    <div className="page">
      <PageHead
        title="Warehouses"
        description="Manage your inventory network and operational sites."
        actions={
          <button
            className="button primary"
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
          >
            <Plus /> Add warehouse
          </button>
        }
      />
      <section className="warehouse-grid">
        {data.warehouses.map((w) => {
          const units = data.inventory
            .filter((i) => i.warehouseId === w.id)
            .reduce((s, i) => s + i.quantity, 0);
          return (
            <article className="panel warehouse-card" key={w.id}>
              <div className="warehouse-top">
                <span>
                  <Building2 />
                </span>
                <span className={statusClass(w.status)}>{w.status}</span>
              </div>
              <h2>{w.name}</h2>
              <p>{w.address}</p>
              <dl>
                <div>
                  <dt>Code</dt>
                  <dd>{w.code}</dd>
                </div>
                <div>
                  <dt>Manager</dt>
                  <dd>{w.manager}</dd>
                </div>
                <div>
                  <dt>Locations</dt>
                  <dd>
                    {
                      data.locations.filter((l) => l.warehouseId === w.id)
                        .length
                    }
                  </dd>
                </div>
                <div>
                  <dt>Units</dt>
                  <dd>{number.format(units)}</dd>
                </div>
              </dl>
              <footer>
                <button
                  className="button ghost small"
                  onClick={() => {
                    setEditing(w);
                    setOpen(true);
                  }}
                >
                  Edit
                </button>
                {w.status === "Active" && (
                  <button
                    className="text-button danger-text"
                    onClick={() => archiveWarehouse(w.id)}
                  >
                    Archive
                  </button>
                )}
              </footer>
            </article>
          );
        })}
      </section>
      {open && (
        <WarehouseDialog
          value={editing}
          onClose={() => setOpen(false)}
          save={upsertWarehouse}
        />
      )}
    </div>
  );
}
function WarehouseDialog({
  value,
  onClose,
  save,
}: {
  value?: ReturnType<typeof useApp>["data"]["warehouses"][number];
  onClose: () => void;
  save: ReturnType<typeof useApp>["upsertWarehouse"];
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    save({
      id: value?.id || crypto.randomUUID(),
      name: String(f.get("name")),
      code: String(f.get("code")).toUpperCase(),
      address: String(f.get("address")),
      manager: String(f.get("manager")),
      status: value?.status || "Active",
    });
    onClose();
  };
  return (
    <Modal title={value ? "Edit warehouse" : "Add warehouse"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="modal-body form-grid one">
          <label>
            Warehouse name
            <input name="name" defaultValue={value?.name} required />
          </label>
          <label>
            Code
            <input name="code" defaultValue={value?.code} required />
          </label>
          <label>
            Address
            <input name="address" defaultValue={value?.address} required />
          </label>
          <label>
            Manager
            <input name="manager" defaultValue={value?.manager} required />
          </label>
        </div>
        <footer className="modal-actions">
          <button type="button" className="button ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary">Save warehouse</button>
        </footer>
      </form>
    </Modal>
  );
}
function LocationsPage() {
  const { data, upsertLocation } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div className="page">
      <PageHead
        title="Locations"
        description="Racks, zones, receiving bays, and production stores."
        actions={
          <button className="button primary" onClick={() => setOpen(true)}>
            <Plus /> Add location
          </button>
        }
      />
      <section className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Code</th>
                <th>Warehouse</th>
                <th>Products stored</th>
                <th>Units stored</th>
                <th>Capacity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.locations.map((l) => {
                const inv = data.inventory.filter((i) => i.locationId === l.id);
                return (
                  <tr key={l.id}>
                    <td>
                      <b>{l.name}</b>
                    </td>
                    <td>
                      <code>{l.code}</code>
                    </td>
                    <td>
                      {
                        data.warehouses.find((w) => w.id === l.warehouseId)
                          ?.name
                      }
                    </td>
                    <td>{new Set(inv.map((i) => i.productId)).size}</td>
                    <td>{inv.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td>{l.capacity || "—"}</td>
                    <td>
                      <span className={statusClass(l.status)}>{l.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {open && (
        <Modal title="Add location" onClose={() => setOpen(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              upsertLocation({
                id: crypto.randomUUID(),
                name: String(f.get("name")),
                code: String(f.get("code")).toUpperCase(),
                warehouseId: String(f.get("warehouse")),
                capacity: Number(f.get("capacity")),
                status: "Active",
              });
              setOpen(false);
            }}
          >
            <div className="modal-body form-grid one">
              <label>
                Name
                <input name="name" required />
              </label>
              <label>
                Code
                <input name="code" required />
              </label>
              <label>
                Warehouse
                <select name="warehouse">
                  {data.warehouses.map((w) => (
                    <option value={w.id} key={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Capacity
                <input name="capacity" type="number" min="0" />
              </label>
            </div>
            <footer className="modal-actions">
              <button
                type="button"
                className="button ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button className="button primary">Add location</button>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Analytics() {
  const { data } = useApp();
  const [days, setDays] = useState(30);
  const cutoff = Date.now() - days * 86400000;
  const ledger = data.ledger.filter(
    (m) => new Date(m.date).getTime() >= cutoff,
  );
  const byCategory = data.categories.map((c) => ({
    name: c.name,
    value: data.inventory
      .filter(
        (i) =>
          data.products.find((p) => p.id === i.productId)?.categoryId === c.id,
      )
      .reduce(
        (s, i) =>
          s +
          i.quantity *
            (data.products.find((p) => p.id === i.productId)?.cost || 0),
        0,
      ),
  }));
  const byWarehouse = data.warehouses.map((w) => ({
    name: w.code,
    value: data.inventory
      .filter((i) => i.warehouseId === w.id)
      .reduce(
        (s, i) =>
          s +
          i.quantity *
            (data.products.find((p) => p.id === i.productId)?.cost || 0),
        0,
      ),
  }));
  const movers = data.products
    .map((p) => ({
      name: p.name,
      value: ledger
        .filter((m) => m.productId === p.id)
        .reduce((s, m) => s + m.quantityIn + m.quantityOut, 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
  const colors = [
    "#0f9d7a",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#ef5da8",
    "#06b6d4",
    "#64748b",
  ];
  return (
    <div className="page">
      <PageHead
        title="Analytics"
        description="Decision-ready insight calculated from live stock transactions."
        actions={
          <div className="segmented">
            {[7, 30, 90, 365].map((d) => (
              <button
                className={days === d ? "active" : ""}
                onClick={() => setDays(d)}
                key={d}
              >
                {d === 365 ? "1 year" : `${d} days`}
              </button>
            ))}
          </div>
        }
      />
      <section className="analytics-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <h2>Stock value by category</h2>
              <p>Cost basis of current inventory</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={2}
              >
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => money.format(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {byCategory.map((x, i) => (
              <span key={x.name}>
                <i style={{ background: colors[i % colors.length] }} />
                {x.name}
              </span>
            ))}
          </div>
        </article>
        <article className="panel">
          <div className="panel-head">
            <div>
              <h2>Value by warehouse</h2>
              <p>Inventory value by operating site</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={330}>
            <BarChart data={byWarehouse}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v) => money.format(Number(v))} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {byWarehouse.map((warehouse, i) => (
                  <Cell
                    key={warehouse.name}
                    fill={colors[i % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="panel span-two">
          <div className="panel-head">
            <div>
              <h2>Most moved products</h2>
              <p>Combined incoming and outgoing units</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={movers} layout="vertical">
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 5, 5, 0]}>
                {movers.map((product, i) => (
                  <Cell
                    key={product.name}
                    fill={colors[i % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
    </div>
  );
}
function Notifications() {
  const { data, markNotification } = useApp();
  return (
    <div className="page">
      <PageHead
        title="Notifications"
        description="Operational alerts and inventory updates."
        actions={
          <button className="button ghost" onClick={() => markNotification()}>
            Mark all read
          </button>
        }
      />
      <section className="panel notifications-list">
        {data.notifications.map((n) => (
          <button
            key={n.id}
            className={!n.read ? "unread" : ""}
            onClick={() => markNotification(n.id)}
          >
            <span className={`note-icon ${n.kind}`}>
              {n.kind === "success" ? <Check /> : <AlertTriangle />}
            </span>
            <span>
              <b>{n.title}</b>
              <p>{n.message}</p>
              <small>{ago(n.createdAt)}</small>
            </span>
            {!n.read && <i />}
          </button>
        ))}
      </section>
    </div>
  );
}
function SettingsPage() {
  const { reset, exportData, importData } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("stocksense-theme") || "light",
  );
  const [message, setMessage] = useState("");
  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file)
      file
        .text()
        .then(importData)
        .catch(() =>
          setMessage("The selected file is not valid StockSense data."),
        );
  };
  return (
    <div className="page">
      <PageHead
        title="Settings"
        description="Configure appearance, notifications, and demo data."
      />
      {message && (
        <div className="error-banner">
          <AlertTriangle />
          {message}
        </div>
      )}
      <section className="settings-layout">
        <nav className="settings-nav">
          <a href="#general">General</a>
          <a href="#appearance">Appearance</a>
          <a href="#notifications-settings">Notifications</a>
          <a href="#data">Data</a>
        </nav>
        <div className="settings-content">
          <section className="panel" id="general">
            <h2>General</h2>
            <p>Workspace defaults for StockSense demo mode.</p>
            <div className="settings-row">
              <span>
                <b>Company name</b>
                <small>Shown in exports and reports</small>
              </span>
              <input defaultValue="StockSense Demo Company" />
            </div>
            <div className="settings-row">
              <span>
                <b>Default currency</b>
                <small>Used for inventory valuation</small>
              </span>
              <select defaultValue="INR">
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>
          </section>
          <section className="panel" id="appearance">
            <h2>Appearance</h2>
            <p>Choose how StockSense looks on this device.</p>
            <div className="theme-options">
              {[
                ["light", Sun],
                ["dark", Moon],
                ["system", CircleUserRound],
              ].map(([x, Icon]) => (
                <button
                  className={theme === x ? "active" : ""}
                  key={String(x)}
                  onClick={() => {
                    setTheme(String(x));
                    const v =
                      x === "system"
                        ? matchMedia("(prefers-color-scheme: dark)").matches
                          ? "dark"
                          : "light"
                        : String(x);
                    localStorage.setItem("stocksense-theme", v);
                    document.documentElement.dataset.theme = v;
                  }}
                >
                  <Icon />
                  {String(x)[0].toUpperCase() + String(x).slice(1)}
                </button>
              ))}
            </div>
          </section>
          <section className="panel" id="notifications-settings">
            <h2>Notifications</h2>
            <p>Choose the events that need your attention.</p>
            {[
              "Low stock alerts",
              "Out-of-stock alerts",
              "Pending operations",
              "Completed operations",
            ].map((x, i) => (
              <label className="switch-row" key={x}>
                <span>
                  <b>{x}</b>
                  <small>Show this event in the notification center</small>
                </span>
                <input type="checkbox" defaultChecked={i < 3} />
              </label>
            ))}
          </section>
          <section className="panel" id="data">
            <h2>Demo data</h2>
            <p>Export a backup, restore data, or reset the sample workspace.</p>
            <div className="data-actions">
              <button
                className="button ghost"
                onClick={() =>
                  download(
                    "stocksense-demo-data.json",
                    exportData(),
                    "application/json",
                  )
                }
              >
                <Download /> Export demo data
              </button>
              <label className="button ghost">
                <Upload /> Import demo data
                <input
                  type="file"
                  accept="application/json"
                  onChange={upload}
                  hidden
                />
              </label>
              <button
                className="button danger"
                onClick={() => setConfirm(true)}
              >
                <RefreshCw /> Reset demo data
              </button>
            </div>
          </section>
        </div>
      </section>
      {confirm && (
        <Confirm
          title="Reset all demo data?"
          body="This replaces your current local data with the original StockSense sample dataset. Export a backup first if you want to keep your changes."
          onClose={() => setConfirm(false)}
          onConfirm={reset}
        />
      )}
    </div>
  );
}
function Profile() {
  const { data } = useApp();
  const [saved, setSaved] = useState(false);
  const user = data.users[0];
  return (
    <div className="page">
      <PageHead
        title="Profile"
        description="Your account and workspace preferences."
      />
      {saved && (
        <div className="success-banner">
          <Check /> Profile preferences saved locally.
        </div>
      )}
      <section className="profile-layout">
        <article className="panel profile-card">
          <span className="big-avatar">AM</span>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <span className={statusClass(user.role)}>{user.role}</span>
        </article>
        <article className="panel profile-form">
          <h2>Personal information</h2>
          <div className="form-grid">
            <label>
              Full name
              <input defaultValue={user.name} />
            </label>
            <label>
              Email
              <input defaultValue={user.email} disabled />
            </label>
            <label>
              Role
              <input defaultValue={user.role} disabled />
            </label>
            <label>
              Home warehouse
              <select defaultValue={user.warehouseId}>
                {data.warehouses.map((w) => (
                  <option value={w.id} key={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <footer>
            <button className="button primary" onClick={() => setSaved(true)}>
              Save preferences
            </button>
          </footer>
        </article>
      </section>
    </div>
  );
}
function NotFound() {
  const nav = useNavigate();
  return (
    <div className="page">
      <div className="empty full-page">
        <Package />
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>
        <button className="button primary" onClick={() => nav("/")}>
          Back to overview
        </button>
      </div>
    </div>
  );
}
function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
function AppRoutes() {
  const { authenticated } = useApp();
  const location = useLocation();
  if (
    !authenticated &&
    !["/login", "/signup", "/forgot-password", "/reset-password"].includes(
      location.pathname,
    )
  )
    return <Navigate to="/login" replace />;
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
      <Route path="/forgot-password" element={<Auth />} />
      <Route path="/reset-password" element={<Auth />} />
      <Route
        path="/*"
        element={authenticated ? <Shell /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
export default function App() {
  return (
    <AppStore>
      <AppRoutes />
    </AppStore>
  );
}
