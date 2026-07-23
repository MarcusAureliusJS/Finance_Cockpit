import React, { useState, useEffect, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Shield, Home, Car, Repeat, ShoppingCart, MoreHorizontal,
  Wallet, Baby, HeartHandshake, Coins, Landmark,
  LayoutGrid, Receipt, TrendingUp, Settings, Download, Upload,
  Heart, Stethoscope, Users, Banknote,
} from "lucide-react";

/* ---------- Airbnb Design Tokens (aus DESIGN-airbnb.md) ---------- */
const C = {
  canvas: "#ffffff",
  soft: "#f7f7f7",
  strong: "#f2f2f2",
  ink: "#222222",
  body: "#3f3f3f",
  muted: "#6a6a6a",
  mutedSoft: "#929292",
  hairline: "#dddddd",
  hairlineSoft: "#ebebeb",
  borderStrong: "#c1c1c1",
  rausch: "#ff385c",
  rauschActive: "#e00b41",
  rauschDisabled: "#ffd1da",
  luxe: "#460479",
  plus: "#92174d",
  error: "#c13515",
  positive: "#1f7a4d",
};

const FONT = "'Airbnb Cereal VF', Circular, Inter, -apple-system, system-ui, Roboto, 'Helvetica Neue', sans-serif";
const SHADOW = "rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.1) 0 4px 8px 0";

const EXPENSE_CATS = [
  { id: "versicherung", label: "Versicherung", color: C.luxe },
  { id: "wohnen", label: "Wohnen", color: C.plus },
  { id: "mobilitaet", label: "Mobilität", color: C.rausch },
  { id: "abos", label: "Abos & Verträge", color: C.muted },
  { id: "leben", label: "Lebenshaltung", color: C.mutedSoft },
  { id: "spende", label: "Spende", color: "#8a5a2b" },
  { id: "gesundheit", label: "Gesundheit", color: "#4a7d6d" },
  { id: "familie", label: "Kinder & Familie", color: "#d68f6f" },
  { id: "sonstiges", label: "Sonstiges", color: C.borderStrong },
];

const INCOME_TYPES = [
  { id: "gehalt", label: "Gehalt" },
  { id: "kindergeld", label: "Kindergeld" },
  { id: "elterngeld", label: "Elterngeld" },
  { id: "sonstiges", label: "Sonstiges" },
];

const INVEST_TYPES = [
  { id: "aktie", label: "Aktie" },
  { id: "etf", label: "ETF" },
  { id: "krypto", label: "Krypto" },
  { id: "immobilie", label: "Immobilie" },
  { id: "cash", label: "Cash" },
];

/* Typen mit festem Wert statt Stückzahl × Kurs */
const VALUE_TYPES = ["immobilie", "cash"];

const CAT_ICONS = {
  versicherung: Shield,
  wohnen: Home,
  mobilitaet: Car,
  abos: Repeat,
  leben: ShoppingCart,
  spende: Heart,
  gesundheit: Stethoscope,
  familie: Users,
  sonstiges: MoreHorizontal,
};

const INCOME_ICONS = {
  gehalt: Wallet,
  kindergeld: Baby,
  elterngeld: HeartHandshake,
  sonstiges: Coins,
};

/* Bekannte Ticker: sofortige Namens-/Typ-Erkennung ohne Netz */
const KNOWN_ASSETS = {
  AAPL: { name: "Apple", type: "aktie" }, MSFT: { name: "Microsoft", type: "aktie" },
  GOOGL: { name: "Alphabet", type: "aktie" }, GOOG: { name: "Alphabet", type: "aktie" },
  AMZN: { name: "Amazon", type: "aktie" }, TSLA: { name: "Tesla", type: "aktie" },
  NVDA: { name: "NVIDIA", type: "aktie" }, META: { name: "Meta Platforms", type: "aktie" },
  NFLX: { name: "Netflix", type: "aktie" }, AMD: { name: "AMD", type: "aktie" },
  SAP: { name: "SAP", type: "aktie" }, SIE: { name: "Siemens", type: "aktie" },
  ALV: { name: "Allianz", type: "aktie" }, BMW: { name: "BMW", type: "aktie" },
  MBG: { name: "Mercedes-Benz Group", type: "aktie" }, VOW3: { name: "Volkswagen", type: "aktie" },
  ADS: { name: "Adidas", type: "aktie" }, DTE: { name: "Deutsche Telekom", type: "aktie" },
  NESN: { name: "Nestlé", type: "aktie" }, NOVN: { name: "Novartis", type: "aktie" },
  ROG: { name: "Roche", type: "aktie" }, UBSG: { name: "UBS", type: "aktie" },
  IWDA: { name: "iShares Core MSCI World", type: "etf" },
  EUNL: { name: "iShares Core MSCI World", type: "etf" },
  VWCE: { name: "Vanguard FTSE All-World", type: "etf" },
  VUSA: { name: "Vanguard S&P 500", type: "etf" },
  SPY: { name: "SPDR S&P 500", type: "etf" }, QQQ: { name: "Invesco QQQ (Nasdaq 100)", type: "etf" },
  BTC: { name: "Bitcoin", type: "krypto" }, ETH: { name: "Ethereum", type: "krypto" },
  SOL: { name: "Solana", type: "krypto" }, XRP: { name: "XRP", type: "krypto" },
  ADA: { name: "Cardano", type: "krypto" }, DOGE: { name: "Dogecoin", type: "krypto" },
};

/* CoinGecko-IDs für gängige Kryptos (spart einen Such-Request) */
const CRYPTO_IDS = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", XRP: "ripple",
  ADA: "cardano", DOGE: "dogecoin", DOT: "polkadot", LTC: "litecoin",
  LINK: "chainlink", AVAX: "avalanche-2", MATIC: "matic-network",
  BNB: "binancecoin", TRX: "tron", XLM: "stellar",
};

/* Ticker → Domain für die Logo-Fallback-Kette */
const TICKER_DOMAINS = {
  AAPL: "apple.com", MSFT: "microsoft.com", GOOGL: "google.com", GOOG: "google.com",
  AMZN: "amazon.com", TSLA: "tesla.com", NVDA: "nvidia.com", META: "meta.com",
  NFLX: "netflix.com", AMD: "amd.com", INTC: "intel.com", IBM: "ibm.com",
  ORCL: "oracle.com", ADBE: "adobe.com", CRM: "salesforce.com", PYPL: "paypal.com",
  V: "visa.com", MA: "mastercard.com", DIS: "disney.com", KO: "coca-cola.com",
  MCD: "mcdonalds.com", UBER: "uber.com", ABNB: "airbnb.com", SHOP: "shopify.com",
  SAP: "sap.com", SIE: "siemens.com", ALV: "allianz.de", BMW: "bmw.com",
  MBG: "mercedes-benz.com", VOW3: "volkswagen.de", ADS: "adidas.de",
  DTE: "telekom.com", BAS: "basf.com", AIR: "airbus.com",
  NESN: "nestle.com", NOVN: "novartis.com", ROG: "roche.com",
  UBSG: "ubs.com", ABBN: "abb.com",
};

const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------- Währung (EUR / USD / CHF) ---------- */
const CURRENCIES = ["EUR", "USD", "CHF"];
let CUR = "EUR"; // wird beim Rendern aus den Einstellungen gesetzt
const curSym = () => (CUR === "EUR" ? "€" : CUR === "USD" ? "$" : "CHF");
const eur = (v) =>
  new Intl.NumberFormat(CUR === "CHF" ? "de-CH" : "de-DE", {
    style: "currency",
    currency: CUR,
    maximumFractionDigits: Math.abs(v) < 10 && v !== 0 ? 2 : 0,
  }).format(v || 0);
const eurFull = (v) =>
  new Intl.NumberFormat(CUR === "CHF" ? "de-CH" : "de-DE", { style: "currency", currency: CUR }).format(v || 0);

/* USD → Zielwährung, mit Fallback-Quelle (frankfurter.app ist unzuverlässig geworden) */
async function fetchUsdRate(target) {
  if (target === "USD") return 1;
  try {
    const j = await fetch(`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${target}`).then((r) => r.json());
    if (j && j.rates && j.rates[target]) return j.rates[target];
  } catch { /* Fallback unten */ }
  try {
    const j = await fetch("https://open.er-api.com/v6/latest/USD").then((r) => r.json());
    if (j && j.rates && j.rates[target]) return j.rates[target];
  } catch { /* beide down */ }
  return 0;
}

const monthly = (item) =>
  item.interval === "jaehrlich" ? (Number(item.amount) || 0) / 12 : Number(item.amount) || 0;

const EMPTY = { incomes: [], expenses: [], credits: [], investments: [] };
const DATA_KEY = "finanz_state_v1";
const SETTINGS_KEY = "finanz_settings_v1";

const DEMO = {
  incomes: [
    { id: uid(), name: "Gehalt", type: "gehalt", amount: 4800 },
    { id: uid(), name: "Kindergeld", type: "kindergeld", amount: 255 },
    { id: uid(), name: "Elterngeld Partnerin", type: "elterngeld", amount: 1100 },
  ],
  expenses: [
    { id: uid(), name: "Miete", category: "wohnen", amount: 1250, interval: "monatlich" },
    { id: uid(), name: "Haftpflicht", category: "versicherung", amount: 89, interval: "jaehrlich" },
    { id: uid(), name: "KFZ-Versicherung", category: "versicherung", amount: 620, interval: "jaehrlich" },
    { id: uid(), name: "BU-Versicherung", category: "versicherung", amount: 78, interval: "monatlich" },
    { id: uid(), name: "Strom & Gas", category: "wohnen", amount: 180, interval: "monatlich" },
    { id: uid(), name: "Tanken Pendeln", category: "mobilitaet", amount: 320, interval: "monatlich" },
    { id: uid(), name: "Streaming & Handy", category: "abos", amount: 55, interval: "monatlich" },
    { id: uid(), name: "Lebensmittel", category: "leben", amount: 650, interval: "monatlich" },
  ],
  credits: [
    { id: uid(), name: "Autokredit", rate: 285, balance: 9400, interest: 4.9 },
  ],
  investments: [
    { id: uid(), name: "iShares Core MSCI World", symbol: "IWDA", type: "etf", qty: 42, buyPrice: 78.5, price: 92.1 },
    { id: uid(), name: "Bitcoin", symbol: "BTC", type: "krypto", qty: 0.11, buyPrice: 38000, price: 58000 },
    { id: uid(), name: "Apple", symbol: "AAPL", type: "aktie", qty: 10, buyPrice: 155, price: 190 },
  ],
};

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

/* ---------- Kleine UI-Bausteine ---------- */
const Card = ({ children, style }) => (
  <div className="fc-card" style={style}>{children}</div>
);

const SectionTitle = ({ children, right }) => (
  <div className="fc-sectiontitle">
    <span>{children}</span>
    {right}
  </div>
);

const Empty = ({ text, action }) => (
  <Card style={{ textAlign: "center", padding: "28px 16px" }}>
    <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.43, marginBottom: action ? 14 : 0 }}>{text}</div>
    {action}
  </Card>
);

const Btn = ({ children, onClick, kind = "primary", small, disabled, style }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`fc-btn ${kind} ${small ? "small" : ""}`}
    style={style}
  >
    {children}
  </button>
);

const Field = ({ label, children }) => (
  <label className="fc-field">
    <span>{label}</span>
    {children}
  </label>
);

const YearTag = () => <span className="fc-tag">Jährlich</span>;

const Lead = ({ icon: Ic }) => (
  <span className="fc-lead"><Ic size={18} strokeWidth={1.75} /></span>
);

/* ---------- Asset-Logo mit Fallback-Kette ---------- */
function logoCandidates(inv) {
  const sym = (inv.symbol || "").trim().toUpperCase();
  const list = [];
  if (inv.logoUrl) list.push(inv.logoUrl);
  if (!sym) return list;
  if (inv.type === "krypto") {
    list.push(`https://assets.parqet.com/logos/crypto/${encodeURIComponent(sym)}?format=png`);
    list.push(`https://assets.coincap.io/assets/icons/${sym.toLowerCase()}@2x.png`);
  } else {
    list.push(`https://assets.parqet.com/logos/symbol/${encodeURIComponent(sym)}?format=png`);
    const domain = TICKER_DOMAINS[sym];
    if (domain) {
      list.push(`https://logo.clearbit.com/${domain}`);
      list.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
    }
  }
  return list;
}

function AssetLogo({ inv }) {
  const candidates = useMemo(() => logoCandidates(inv), [inv.symbol, inv.type, inv.logoUrl]);
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [inv.symbol, inv.type, inv.logoUrl]);
  const sym = (inv.symbol || "").trim();
  if (!candidates.length || idx >= candidates.length) {
    return <span className="fc-lead fc-monogram">{(sym || inv.name || "?").slice(0, 2).toUpperCase()}</span>;
  }
  return <img className="fc-logo" src={candidates[idx]} alt="" loading="lazy" onError={() => setIdx((i) => i + 1)} />;
}

/* ---------- Modal (Bottom Sheet) ---------- */
function Sheet({ title, onClose, children }) {
  return (
    <div className="fc-overlay" onClick={onClose}>
      <div className="fc-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="fc-sheet-head">
          <span>{title}</span>
          <button className="fc-x" onClick={onClose} aria-label="Schliessen">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Formulare ---------- */
function IncomeForm({ initial, onSave }) {
  const [f, setF] = useState(initial || { name: "", type: "gehalt", amount: "" });
  return (
    <div className="fc-form">
      <Field label="Bezeichnung">
        <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="z. B. Gehalt" />
      </Field>
      <Field label="Art">
        <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          {INCOME_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </Field>
      <Field label={`Betrag pro Monat (${curSym()})`}>
        <input type="number" inputMode="decimal" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="0" />
      </Field>
      <Btn disabled={!f.name || !f.amount} onClick={() => onSave({ ...f, amount: Number(f.amount) })}>Speichern</Btn>
    </div>
  );
}

function ExpenseForm({ initial, onSave }) {
  const [f, setF] = useState(initial || { name: "", category: "versicherung", amount: "", interval: "monatlich" });
  return (
    <div className="fc-form">
      <Field label="Bezeichnung">
        <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="z. B. Haftpflicht" />
      </Field>
      <Field label="Kategorie">
        <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          {EXPENSE_CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </Field>
      <div className="fc-row2">
        <Field label={`Betrag (${curSym()})`}>
          <input type="number" inputMode="decimal" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="0" />
        </Field>
        <Field label="Intervall">
          <select value={f.interval} onChange={(e) => setF({ ...f, interval: e.target.value })}>
            <option value="monatlich">monatlich</option>
            <option value="jaehrlich">jährlich</option>
          </select>
        </Field>
      </div>
      <Btn disabled={!f.name || !f.amount} onClick={() => onSave({ ...f, amount: Number(f.amount) })}>Speichern</Btn>
    </div>
  );
}

function CreditForm({ initial, onSave }) {
  const [f, setF] = useState(initial || { name: "", rate: "", balance: "", interest: "", paymentDay: "" });
  const handleSave = () => {
    const paymentDay = Math.min(31, Math.max(0, Math.round(Number(f.paymentDay) || 0)));
    /* Restschuld gilt ab heute: Buchungen zählen erst ab der nächsten fälligen Abbuchung */
    const now = new Date();
    const idx = now.getFullYear() * 12 + now.getMonth();
    const lastAppliedIdx = paymentDay ? (now.getDate() >= paymentDay ? idx : idx - 1) : undefined;
    onSave({
      ...f,
      rate: Number(f.rate),
      balance: Number(f.balance) || 0,
      interest: Number(f.interest) || 0,
      paymentDay,
      lastAppliedIdx,
    });
  };
  return (
    <div className="fc-form">
      <Field label="Bezeichnung">
        <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="z. B. Immobilienkredit" />
      </Field>
      <div className="fc-row2">
        <Field label={`Monatsrate (${curSym()})`}>
          <input type="number" inputMode="decimal" value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value })} placeholder="0" />
        </Field>
        <Field label={`Restschuld heute (${curSym()})`}>
          <input type="number" inputMode="decimal" value={f.balance} onChange={(e) => setF({ ...f, balance: e.target.value })} placeholder="0" />
        </Field>
      </div>
      <div className="fc-row2">
        <Field label="Zinssatz (% p. a., optional)">
          <input type="number" inputMode="decimal" value={f.interest} onChange={(e) => setF({ ...f, interest: e.target.value })} placeholder="z. B. 3,2" />
        </Field>
        <Field label="Abbuchungstag (1–31, optional)">
          <input type="number" inputMode="numeric" value={f.paymentDay || ""} onChange={(e) => setF({ ...f, paymentDay: e.target.value })} placeholder="z. B. 1" />
        </Field>
      </div>
      <div style={{ margin: "-6px 0 14px", fontSize: 13, lineHeight: 1.35, color: C.muted }}>
        Mit Abbuchungstag reduziert die App die Restschuld automatisch jeden Monat um die Tilgung (Rate minus Zinsanteil, falls Zinssatz angegeben).
      </div>
      <Btn disabled={!f.name || !f.rate} onClick={handleSave}>Speichern</Btn>
    </div>
  );
}

function InvestForm({ initial, onSave, finnhubKey }) {
  const [f, setF] = useState(initial || { name: "", symbol: "", type: "etf", qty: "", buyPrice: "", price: "", logoUrl: "" });
  const [looking, setLooking] = useState(false);
  const [lookupMsg, setLookupMsg] = useState("");

  async function lookup() {
    const sym = (f.symbol || "").trim().toUpperCase();
    if (!sym || f.name) return;
    const known = KNOWN_ASSETS[sym];
    if (known) {
      setF((p) => ({ ...p, name: known.name, type: known.type }));
      return;
    }
    setLooking(true);
    setLookupMsg("");
    let found = null;
    /* 1) CoinGecko-Suche (deckt Krypto ab, kein Key nötig) */
    try {
      const r = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(sym)}`);
      const j = await r.json();
      const coin = (j.coins || []).find((x) => (x.symbol || "").toUpperCase() === sym);
      if (coin) found = { name: coin.name, type: "krypto" };
    } catch { /* weiter mit Finnhub */ }
    /* 2) Finnhub-Suche (Aktien/ETFs, Key nötig) */
    if (!found && finnhubKey) {
      try {
        const r = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(sym)}&token=${finnhubKey}`);
        const j = await r.json();
        const hit = (j.result || []).find((x) => (x.symbol || "").toUpperCase() === sym) || (j.result || [])[0];
        if (hit && hit.description) {
          const pretty = hit.description
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase());
          found = { name: pretty, type: hit.type === "ETP" ? "etf" : "aktie" };
        }
      } catch { /* Fallback unten */ }
    }
    if (found) {
      setF((p) => ({
        ...p,
        name: p.name || found.name,
        type: INVEST_TYPES.some((t) => t.id === found.type) ? found.type : p.type,
      }));
    } else {
      setLookupMsg(finnhubKey
        ? "Ticker nicht erkannt – Name bitte manuell eintragen."
        : "Ticker nicht erkannt. Tipp: Mit Finnhub-Key (Einstellungen) werden auch Aktien/ETFs erkannt.");
    }
    setLooking(false);
  }

  const sym = (f.symbol || "").trim().toUpperCase();
  const isValueType = VALUE_TYPES.includes(f.type);

  return (
    <div className="fc-form">
      <Field label="Typ">
        <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          {INVEST_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </Field>

      {isValueType ? (
        <>
          <Field label="Bezeichnung">
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={f.type === "immobilie" ? "z. B. Eigenheim" : "z. B. Tagesgeld"} />
          </Field>
          <Field label={f.type === "immobilie" ? `Aktueller Wert (${curSym()})` : `Betrag (${curSym()})`}>
            <input type="number" inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="0" />
          </Field>
          {f.type === "immobilie" && (
            <Field label={`Kaufpreis (${curSym()}, optional – für Gewinn/Verlust)`}>
              <input type="number" inputMode="decimal" value={f.buyPrice} onChange={(e) => setF({ ...f, buyPrice: e.target.value })} placeholder="0" />
            </Field>
          )}
          <Btn
            disabled={!f.name || !f.price}
            onClick={() => onSave({ ...f, symbol: "", qty: 1, price: Number(f.price) || 0, buyPrice: Number(f.buyPrice) || Number(f.price) || 0 })}
          >Speichern</Btn>
        </>
      ) : (
        <>
          <Field label="Symbol / Ticker – Name wird automatisch ermittelt">
            <input
              value={f.symbol}
              onChange={(e) => setF({ ...f, symbol: e.target.value.toUpperCase(), name: "" })}
              onBlur={lookup}
              placeholder="z. B. AAPL, IWDA, BTC"
              autoFocus={!initial}
            />
          </Field>
          <Field label="Name">
            <input
              value={looking ? "" : f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
              placeholder={looking ? "Wird ermittelt …" : "Wird automatisch ausgefüllt"}
              disabled={looking}
            />
          </Field>
          {lookupMsg && <div style={{ margin: "-6px 0 12px", fontSize: 13, color: C.error }}>{lookupMsg}</div>}
          <div className="fc-row2">
            <Field label="Anzahl / Stück">
              <input type="number" inputMode="decimal" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} placeholder="0" />
            </Field>
            <Field label={`Kaufkurs (${curSym()})`}>
              <input type="number" inputMode="decimal" value={f.buyPrice} onChange={(e) => setF({ ...f, buyPrice: e.target.value })} placeholder="0" />
            </Field>
          </div>
          <Field label={`Aktueller Kurs (${curSym()}) – wird per Kurs-Update automatisch gepflegt`}>
            <input type="number" inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="0" />
          </Field>
          <Field label="Logo-URL (optional, falls kein Logo gefunden wird)">
            <input value={f.logoUrl || ""} onChange={(e) => setF({ ...f, logoUrl: e.target.value })} placeholder="https://…" />
          </Field>
          <Btn
            disabled={!sym || !f.qty || looking}
            onClick={() => onSave({ ...f, name: f.name || sym, symbol: sym, qty: Number(f.qty), buyPrice: Number(f.buyPrice) || 0, price: Number(f.price) || Number(f.buyPrice) || 0 })}
          >Speichern</Btn>
        </>
      )}
    </div>
  );
}

/* ---------- Cashflow-Leiste ---------- */
function CashflowBar({ catTotals, creditRate, free }) {
  const segs = [
    ...catTotals.filter((c) => c.value > 0).map((c) => ({ label: c.label, value: c.value, color: c.color })),
    ...(creditRate > 0 ? [{ label: "Kredite", value: creditRate, color: C.ink }] : []),
    ...(free > 0 ? [{ label: "Frei", value: free, color: C.positive }] : []),
  ];
  const total = segs.reduce((s, x) => s + x.value, 0);
  if (total <= 0) return null;
  return (
    <div>
      <div className="fc-flowbar">
        {segs.map((s, i) => (
          <div key={i} title={`${s.label}: ${eur(s.value)}`} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
        ))}
      </div>
      <div className="fc-flowlegend">
        {segs.map((s, i) => (
          <span key={i}><i style={{ background: s.color }} />{s.label} {eur(s.value)}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Haupt-App ---------- */
export default function App() {
  const [data, setData] = useState(() => loadLS(DATA_KEY, EMPTY));
  const [settings, setSettings] = useState(() => loadLS(SETTINGS_KEY, { finnhubKey: "", currency: "EUR" }));
  CUR = CURRENCIES.includes(settings.currency) ? settings.currency : "EUR";
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState(null);
  const [priceStatus, setPriceStatus] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const importRef = useRef(null);

  /* Speichern (debounced) */
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch { /* Speicher voll */ }
    }, 400);
    return () => clearTimeout(t);
  }, [data]);

  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings]);

  /* Auto-Tilgung: bei jedem App-Start verpasste Kredit-Abbuchungen anwenden */
  useEffect(() => {
    setData((d) => {
      let changed = false;
      const credits = d.credits.map((c) => {
        if (!c.paymentDay || !(Number(c.rate) > 0) || !(Number(c.balance) > 0)) return c;
        const now = new Date();
        const curIdx = now.getFullYear() * 12 + now.getMonth() - (now.getDate() < c.paymentDay ? 1 : 0);
        if (typeof c.lastAppliedIdx !== "number") {
          changed = true;
          return { ...c, lastAppliedIdx: curIdx };
        }
        if (c.lastAppliedIdx >= curIdx) return c;
        let bal = Number(c.balance);
        let last = c.lastAppliedIdx;
        while (last < curIdx && bal > 0) {
          const interest = c.interest ? (bal * (Number(c.interest) / 100)) / 12 : 0;
          const tilgung = Math.max(0, Number(c.rate) - interest);
          bal = Math.max(0, bal - tilgung);
          last++;
        }
        changed = true;
        return { ...c, balance: Math.round(bal * 100) / 100, lastAppliedIdx: curIdx };
      });
      return changed ? { ...d, credits } : d;
    });
  }, []);

  /* Abgeleitete Zahlen */
  const incomeTotal = useMemo(() => data.incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0), [data.incomes]);
  const expenseTotal = useMemo(() => data.expenses.reduce((s, e) => s + monthly(e), 0), [data.expenses]);
  const creditRate = useMemo(() => data.credits.reduce((s, c) => s + (Number(c.rate) || 0), 0), [data.credits]);
  const creditBalance = useMemo(() => data.credits.reduce((s, c) => s + (Number(c.balance) || 0), 0), [data.credits]);
  const free = incomeTotal - expenseTotal - creditRate;

  const catTotals = useMemo(() =>
    EXPENSE_CATS.map((c) => ({
      ...c,
      value: data.expenses.filter((e) => e.category === c.id).reduce((s, e) => s + monthly(e), 0),
    })).filter((c) => c.value > 0),
  [data.expenses]);

  const portfolioValue = useMemo(() => data.investments.reduce((s, i) => s + i.qty * (i.price || 0), 0), [data.investments]);
  const portfolioCost = useMemo(() => data.investments.reduce((s, i) => s + i.qty * (i.buyPrice || 0), 0), [data.investments]);
  const gain = portfolioValue - portfolioCost;
  const netWorth = portfolioValue - creditBalance;
  const lastPriceUpdate = useMemo(() => {
    const ts = data.investments.map((i) => i.priceUpdated || 0);
    return ts.length ? Math.max(...ts) : 0;
  }, [data.investments]);

  /* CRUD */
  const save = (key, item) => {
    setData((d) => {
      const list = d[key];
      const exists = item.id && list.some((x) => x.id === item.id);
      return { ...d, [key]: exists ? list.map((x) => (x.id === item.id ? item : x)) : [...list, { ...item, id: uid() }] };
    });
    setSheet(null);
  };
  const remove = (key, id) => {
    if (pendingDelete !== id) {
      setPendingDelete(id);
      setTimeout(() => setPendingDelete((p) => (p === id ? null : p)), 3500);
      return;
    }
    setData((d) => ({ ...d, [key]: d[key].filter((x) => x.id !== id) }));
    setPendingDelete(null);
  };

  /* ---------- Live-Kurse: CoinGecko (Krypto) + Finnhub (Aktien/ETF) ---------- */
  async function refreshPrices() {
    const priceable = data.investments.filter((i) => !VALUE_TYPES.includes(i.type));
    if (!priceable.length) return;
    setPriceStatus("Kurse werden geladen …");
    const notes = [];
    const failed = [];
    const updated = {};   // symbol → price
    const resolved = {};  // symbol → coinId (für künftige Updates cachen)
    const cur = CURRENCIES.includes(settings.currency) ? settings.currency : "EUR";
    const curLow = cur.toLowerCase();
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    /* Krypto → CoinGecko (kostenlos, ohne Key, direkt in der gewählten Währung) */
    const cryptos = priceable.filter((i) => i.type === "krypto");
    if (cryptos.length) {
      const symToId = {};
      for (const c of cryptos) {
        const s = (c.symbol || "").toUpperCase();
        let id = c.coinId || CRYPTO_IDS[s];
        if (!id) {
          try {
            const r = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(s)}`);
            if (r.status === 429) { notes.push("CoinGecko-Limit erreicht – in 1 Min. erneut versuchen"); break; }
            const j = await r.json();
            id = ((j.coins || []).find((x) => (x.symbol || "").toUpperCase() === s) || {}).id;
            await sleep(400); /* Rate-Limit schonen */
          } catch { /* unten als failed markiert */ }
        }
        if (id) { symToId[s] = id; resolved[s] = id; }
        else failed.push(s);
      }
      const ids = Object.values(symToId);
      if (ids.length) {
        try {
          const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=${curLow}`);
          if (r.status === 429) {
            notes.push("CoinGecko-Limit erreicht – in 1 Min. erneut versuchen");
          } else {
            const j = await r.json();
            for (const [s, id] of Object.entries(symToId)) {
              const p = j[id] && j[id][curLow];
              if (p) updated[s] = p;
              else failed.push(s);
            }
          }
        } catch {
          notes.push("CoinGecko nicht erreichbar");
        }
      }
    }

    /* Aktien/ETF → Finnhub (USD) + Umrechnung in die gewählte Währung */
    const stocks = priceable.filter((i) => i.type === "aktie" || i.type === "etf");
    if (stocks.length) {
      if (!settings.finnhubKey) {
        notes.push("Für Aktien/ETF: Finnhub-Key in den Einstellungen hinterlegen");
      } else {
        const usdEur = await fetchUsdRate(cur);
        if (!usdEur) {
          notes.push("Wechselkurs nicht erreichbar – Aktien übersprungen");
        } else {
          let keyInvalid = false;
          for (const s of stocks) {
            const sym = (s.symbol || "").toUpperCase();
            try {
              const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${settings.finnhubKey}`);
              if (res.status === 401 || res.status === 403) { keyInvalid = true; break; }
              if (res.status === 429) { notes.push("Finnhub-Limit erreicht – in 1 Min. erneut versuchen"); break; }
              const q = await res.json();
              if (q && q.c) updated[sym] = q.c * usdEur;
              else failed.push(`${sym} (nicht im Free-Tier)`);
              await sleep(250);
            } catch { failed.push(sym); }
          }
          if (keyInvalid) notes.push("Finnhub-Key ungültig – bitte in den Einstellungen prüfen");
        }
      }
    }

    if (Object.keys(updated).length || Object.keys(resolved).length) {
      const now = Date.now();
      setData((d) => ({
        ...d,
        investments: d.investments.map((i) => {
          const sym = (i.symbol || "").toUpperCase();
          const p = updated[sym];
          const coinId = resolved[sym] || i.coinId;
          if (p) return { ...i, price: Number(p.toFixed(p < 1 ? 4 : 2)), priceUpdated: now, coinId };
          return coinId !== i.coinId ? { ...i, coinId } : i;
        }),
      }));
    }
    const n = Object.keys(updated).length;
    const parts = [];
    if (n) parts.push(`${n} von ${priceable.length} Kursen aktualisiert`);
    if (failed.length) parts.push(`Fehlgeschlagen: ${[...new Set(failed)].join(", ")}`);
    parts.push(...notes);
    setPriceStatus(parts.join(" · ") || "Keine Kurse gefunden");
    setTimeout(() => setPriceStatus(""), 12000);
  }

  /* Beim App-Start einmal automatisch aktualisieren */
  const didAutoRefresh = useRef(false);
  useEffect(() => {
    if (didAutoRefresh.current) return;
    didAutoRefresh.current = true;
    if (data.investments.some((i) => !VALUE_TYPES.includes(i.type))) {
      const t = setTimeout(() => refreshPrices(), 800);
      return () => clearTimeout(t);
    }
  }, []);

  /* ---------- Backup: Export / Import ---------- */
  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `finanz-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        setData({ ...EMPTY, ...parsed });
        setSheet(null);
      } catch {
        setPriceStatus("Import fehlgeschlagen – Datei ist kein gültiges Backup");
        setTimeout(() => setPriceStatus(""), 6000);
      }
    };
    reader.readAsText(file);
  }

  const monthLabel = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });

  const ListItem = ({ lead, title, sub, value, valueColor, tag, armed, onEdit, onDelete }) => (
    <div className="fc-item">
      {lead}
      <div className="fc-item-main" onClick={onEdit}>
        <div className="fc-item-title">{title}{tag}</div>
        <div className="fc-item-sub">{sub}</div>
      </div>
      <div className="fc-item-right">
        <div className="fc-item-value" style={{ color: valueColor || C.ink }}>{value}</div>
        <button className={`fc-del ${armed ? "armed" : ""}`} onClick={onDelete} aria-label="Löschen">{armed ? "Löschen" : "–"}</button>
      </div>
    </div>
  );

  const isEmpty = !data.incomes.length && !data.expenses.length && !data.credits.length && !data.investments.length;

  return (
    <div className="fc-root">
      <style>{`
        .fc-root{min-height:100vh;background:${C.canvas};color:${C.ink};font-family:${FONT};padding:0 0 92px;max-width:520px;margin:0 auto;}
        .fc-root *{box-sizing:border-box;font-family:inherit;}
        .fc-header{padding:24px 18px 4px;display:flex;justify-content:space-between;align-items:flex-start;}
        .fc-header .eyebrow{font-size:14px;font-weight:500;line-height:1.29;color:${C.muted};}
        .fc-header h1{margin:2px 0 0;font-size:22px;font-weight:500;line-height:1.18;letter-spacing:-0.44px;color:${C.ink};}
        .fc-gear{width:40px;height:40px;border-radius:9999px;border:none;background:${C.strong};color:${C.ink};display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;margin-top:6px;}
        .fc-hero{padding:20px 18px 8px;text-align:center;}
        .fc-hero .num{font-size:64px;font-weight:700;line-height:1.1;letter-spacing:-1px;font-variant-numeric:tabular-nums;}
        .fc-hero .lbl{font-size:14px;font-weight:500;color:${C.muted};margin-top:4px;}
        .fc-hero .laurel{color:${C.borderStrong};font-size:22px;vertical-align:18px;padding:0 10px;}
        .fc-card{background:${C.canvas};border:1px solid ${C.hairline};border-radius:14px;padding:16px;margin:0 16px 16px;box-shadow:${SHADOW};}
        .fc-sectiontitle{display:flex;justify-content:space-between;align-items:baseline;margin:24px 18px 10px;font-size:20px;font-weight:600;line-height:1.2;letter-spacing:-0.18px;color:${C.ink};}
        .fc-sectiontitle .fc-sum{font-size:14px;font-weight:500;color:${C.muted};font-variant-numeric:tabular-nums;}
        .fc-kpis{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 16px 4px;}
        .fc-kpi{background:${C.soft};border-radius:14px;padding:14px 16px;}
        .fc-kpi .l{font-size:13px;line-height:1.23;color:${C.muted};}
        .fc-kpi .v{font-size:21px;font-weight:700;line-height:1.3;margin-top:2px;font-variant-numeric:tabular-nums;color:${C.ink};}
        .fc-flowbar{display:flex;height:20px;border-radius:9999px;overflow:hidden;gap:2px;}
        .fc-flowbar div{min-width:4px;}
        .fc-flowlegend{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:12px;font-size:13px;line-height:1.23;color:${C.muted};}
        .fc-flowlegend i{display:inline-block;width:8px;height:8px;border-radius:9999px;margin-right:6px;}
        .fc-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid ${C.hairlineSoft};}
        .fc-lead{width:40px;height:40px;border-radius:9999px;background:${C.strong};color:${C.ink};display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .fc-monogram{font-size:13px;font-weight:700;letter-spacing:.02em;}
        .fc-logo{width:40px;height:40px;border-radius:9999px;object-fit:contain;background:${C.canvas};border:1px solid ${C.hairlineSoft};flex-shrink:0;}
        .fc-item:last-child{border-bottom:none;padding-bottom:2px;}
        .fc-item:first-child{padding-top:2px;}
        .fc-item-main{flex:1;cursor:pointer;min-width:0;}
        .fc-item-title{font-size:16px;font-weight:600;line-height:1.25;color:${C.ink};}
        .fc-item-sub{font-size:14px;line-height:1.43;color:${C.muted};margin-top:1px;}
        .fc-item-right{display:flex;align-items:center;gap:12px;}
        .fc-item-value{font-size:16px;font-weight:600;line-height:1.25;font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right;}
        .fc-del{width:32px;height:32px;border-radius:9999px;border:none;background:${C.strong};color:${C.ink};font-size:16px;line-height:1;cursor:pointer;flex-shrink:0;}
        .fc-del.armed{width:auto;padding:0 14px;background:${C.error};color:#ffffff;font-size:13px;font-weight:600;}
        .fc-tag{display:inline-block;margin-left:8px;padding:2px 6px;border-radius:9999px;border:1px solid ${C.hairline};font-size:8px;font-weight:700;letter-spacing:.32px;text-transform:uppercase;color:${C.ink};vertical-align:2px;}
        .fc-btn{border:none;border-radius:8px;padding:12px 16px;min-height:48px;font-size:16px;font-weight:500;line-height:1.25;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;text-align:center;}
        .fc-btn.primary{background:${C.rausch};color:#ffffff;}
        .fc-btn.primary:active{background:${C.rauschActive};}
        .fc-btn.primary:disabled{background:${C.rauschDisabled};color:#ffffff;cursor:not-allowed;}
        .fc-btn.ghost{background:${C.canvas};border:1px solid ${C.ink};color:${C.ink};}
        .fc-btn.ghost:disabled{border-color:${C.borderStrong};color:${C.mutedSoft};cursor:not-allowed;}
        .fc-btn.small{width:auto;min-height:0;padding:10px 20px;font-size:14px;border-radius:9999px;}
        .fc-btn:focus-visible,.fc-del:focus-visible,.fc-x:focus-visible,.fc-tab:focus-visible,.fc-gear:focus-visible{outline:2px solid ${C.ink};outline-offset:2px;}
        .fc-field{display:block;margin-bottom:14px;}
        .fc-field span{display:block;font-size:14px;font-weight:500;line-height:1.29;color:${C.muted};margin-bottom:6px;}
        .fc-field input,.fc-field select{width:100%;background:${C.canvas};border:1px solid ${C.hairline};border-radius:8px;padding:14px 12px;height:56px;color:${C.ink};font-size:16px;line-height:1.5;appearance:none;}
        .fc-field input:focus,.fc-field select:focus{outline:none;border-color:${C.ink};box-shadow:inset 0 0 0 1px ${C.ink};}
        .fc-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .fc-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center;z-index:50;}
        .fc-sheet{background:${C.canvas};border-radius:20px 20px 0 0;width:100%;max-width:520px;padding:20px 18px 28px;max-height:88vh;overflow-y:auto;}
        .fc-sheet-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;font-size:20px;font-weight:600;letter-spacing:-0.18px;color:${C.ink};}
        .fc-x{background:${C.strong};border:none;border-radius:9999px;width:32px;height:32px;color:${C.ink};font-size:14px;cursor:pointer;}
        .fc-tabs{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:center;background:${C.canvas};border-top:1px solid ${C.hairline};z-index:40;padding-bottom:env(safe-area-inset-bottom);}
        .fc-tabs-inner{display:flex;width:100%;max-width:520px;}
        .fc-tab{flex:1;background:transparent;border:none;color:${C.muted};font-size:11px;font-weight:600;padding:10px 2px 12px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;}
        .fc-tab .ic{font-size:18px;line-height:1;}
        .fc-tab .u{width:24px;height:2px;border-radius:1px;background:transparent;margin-top:2px;}
        .fc-tab.active{color:${C.ink};}
        .fc-tab.active .u{background:${C.ink};}
        .fc-status{margin:0 18px 12px;font-size:14px;color:${C.body};}
        .fc-gain{font-size:13px;font-weight:500;font-variant-numeric:tabular-nums;}
        .fc-hint{margin:12px 18px 0;font-size:13px;line-height:1.4;color:${C.muted};}
        @media (prefers-reduced-motion: no-preference){
          .fc-sheet{animation:fcUp .22s ease-out;}
          @keyframes fcUp{from{transform:translateY(24px);opacity:.6}to{transform:translateY(0);opacity:1}}
        }
      `}</style>

      {/* Kopf */}
      <div className="fc-header">
        <div>
          <div className="eyebrow">{monthLabel}</div>
          <h1>
            {tab === "home" && "Finanz-Cockpit"}
            {tab === "income" && "Einnahmen"}
            {tab === "expenses" && "Fixkosten"}
            {tab === "credits" && "Kredite"}
            {tab === "invest" && "Investments"}
          </h1>
        </div>
        <button className="fc-gear" onClick={() => setSheet({ type: "settings" })} aria-label="Einstellungen">
          <Settings size={18} strokeWidth={1.75} />
        </button>
      </div>

      {/* ---------- Übersicht ---------- */}
      {tab === "home" && (
        <>
          {isEmpty && (
            <div style={{ marginTop: 12 }}>
              <Empty
                text="Noch keine Daten erfasst. Lege in den Tabs unten los – oder starte mit Beispieldaten, um dir alles anzusehen."
                action={<Btn small onClick={() => setData(DEMO)}>Beispieldaten laden</Btn>}
              />
            </div>
          )}

          {incomeTotal > 0 && (
            <div className="fc-hero">
              <div className="num" style={{ color: free >= 0 ? C.ink : C.error }}>
                {eur(free)}
              </div>
              <div className="lbl">Frei verfügbar pro Monat</div>
            </div>
          )}

          <div className="fc-kpis">
            <div className="fc-kpi"><div className="l">Einnahmen</div><div className="v">{eur(incomeTotal)}</div></div>
            <div className="fc-kpi"><div className="l">Fixkosten</div><div className="v">{eur(expenseTotal)}</div></div>
            <div className="fc-kpi"><div className="l">Kreditraten</div><div className="v">{eur(creditRate)}</div></div>
            <div className="fc-kpi"><div className="l">Portfoliowert</div><div className="v">{eur(portfolioValue)}</div></div>
          </div>

          {incomeTotal > 0 && (
            <>
              <SectionTitle>Wohin dein Geld fliesst</SectionTitle>
              <Card>
                <CashflowBar catTotals={catTotals} creditRate={creditRate} free={free} />
              </Card>
            </>
          )}

          {catTotals.length > 0 && (
            <>
              <SectionTitle>Ausgaben nach Kategorie</SectionTitle>
              <Card>
                <div style={{ width: "100%", height: 210 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={catTotals} dataKey="value" nameKey="label" innerRadius={52} outerRadius={80} paddingAngle={3} stroke="none">
                        {catTotals.map((c) => <Cell key={c.id} fill={c.color} />)}
                      </Pie>
                      <Tooltip
                        formatter={(v, n) => [eurFull(v), n]}
                        contentStyle={{ background: C.canvas, border: `1px solid ${C.hairline}`, borderRadius: 8, color: C.ink, fontSize: 14, boxShadow: SHADOW }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </>
          )}

          {(data.investments.length > 0 || creditBalance > 0) && (
            <>
              <SectionTitle>Vermögen</SectionTitle>
              <Card>
                <div className="fc-item">
                  <div className="fc-item-main"><div className="fc-item-title">Gesamtvermögen</div><div className="fc-item-sub">{data.investments.length} Position(en)</div></div>
                  <div className="fc-item-value">{eur(portfolioValue)}</div>
                </div>
                <div className="fc-item">
                  <div className="fc-item-main"><div className="fc-item-title">Restschulden</div></div>
                  <div className="fc-item-value" style={{ color: C.error }}>−{eur(creditBalance)}</div>
                </div>
                <div className="fc-item">
                  <div className="fc-item-main"><div className="fc-item-title" style={{ fontWeight: 700 }}>Nettovermögen</div></div>
                  <div className="fc-item-value" style={{ fontWeight: 700 }}>{eur(netWorth)}</div>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {/* ---------- Einnahmen ---------- */}
      {tab === "income" && (
        <>
          <div className="fc-kpis" style={{ gridTemplateColumns: "1fr" }}>
            <div className="fc-kpi"><div className="l">Summe pro Monat</div><div className="v">{eur(incomeTotal)}</div></div>
          </div>
          <div style={{ height: 12 }} />
          {data.incomes.length === 0
            ? <Empty text="Erfasse Gehalt, Kindergeld, Elterngeld und weitere Zuschüsse." />
            : <Card>{data.incomes.map((i) => (
                <ListItem key={i.id}
                  lead={<Lead icon={INCOME_ICONS[i.type] || Coins} />}
                  armed={pendingDelete === i.id}
                  title={i.name}
                  sub={INCOME_TYPES.find((t) => t.id === i.type)?.label}
                  value={eur(i.amount)}
                  onEdit={() => setSheet({ type: "income", item: i })}
                  onDelete={() => remove("incomes", i.id)}
                />
              ))}</Card>}
          <div style={{ margin: "0 16px" }}><Btn onClick={() => setSheet({ type: "income" })}>Einnahme hinzufügen</Btn></div>
        </>
      )}

      {/* ---------- Ausgaben ---------- */}
      {tab === "expenses" && (
        <>
          <div className="fc-kpis">
            <div className="fc-kpi"><div className="l">Fixkosten / Monat</div><div className="v">{eur(expenseTotal)}</div></div>
            <div className="fc-kpi"><div className="l">davon Versicherungen</div><div className="v">{eur(catTotals.find((c) => c.id === "versicherung")?.value || 0)}</div></div>
          </div>
          {EXPENSE_CATS.map((cat) => {
            const items = data.expenses.filter((e) => e.category === cat.id);
            if (!items.length) return null;
            return (
              <React.Fragment key={cat.id}>
                <SectionTitle right={<span className="fc-sum">{eur(items.reduce((s, e) => s + monthly(e), 0))} / Monat</span>}>{cat.label}</SectionTitle>
                <Card>
                  {items.map((e) => (
                    <ListItem key={e.id}
                      lead={<Lead icon={CAT_ICONS[e.category] || MoreHorizontal} />}
                      armed={pendingDelete === e.id}
                      title={e.name}
                      tag={e.interval === "jaehrlich" ? <YearTag /> : null}
                      sub={e.interval === "jaehrlich" ? `${eurFull(e.amount)} / Jahr` : "monatlich"}
                      value={eur(monthly(e))}
                      onEdit={() => setSheet({ type: "expense", item: e })}
                      onDelete={() => remove("expenses", e.id)}
                    />
                  ))}
                </Card>
              </React.Fragment>
            );
          })}
          {data.expenses.length === 0 && <div style={{ marginTop: 12 }}><Empty text="Erfasse Versicherungen, Miete, Abos und andere Fixkosten – monatlich oder jährlich." /></div>}
          <div style={{ margin: "0 16px" }}><Btn onClick={() => setSheet({ type: "expense" })}>Ausgabe hinzufügen</Btn></div>
        </>
      )}

      {/* ---------- Kredite ---------- */}
      {tab === "credits" && (
        <>
          <div className="fc-kpis">
            <div className="fc-kpi"><div className="l">Raten / Monat</div><div className="v">{eur(creditRate)}</div></div>
            <div className="fc-kpi"><div className="l">Restschuld gesamt</div><div className="v">{eur(creditBalance)}</div></div>
          </div>
          <div style={{ height: 12 }} />
          {data.credits.length === 0
            ? <Empty text="Erfasse laufende Kredite mit Monatsrate und Restschuld." />
            : <Card>{data.credits.map((c) => (
                <ListItem key={c.id}
                  lead={<Lead icon={Landmark} />}
                  armed={pendingDelete === c.id}
                  title={c.name}
                  sub={`Restschuld ${eur(c.balance)}${c.interest ? ` · ${String(c.interest).replace(".", ",")} % p. a.` : ""}${c.paymentDay ? ` · Abbuchung am ${c.paymentDay}.` : ""}`}
                  value={`${eur(c.rate)}/M.`}
                  onEdit={() => setSheet({ type: "credit", item: c })}
                  onDelete={() => remove("credits", c.id)}
                />
              ))}</Card>}
          <div style={{ margin: "0 16px" }}><Btn onClick={() => setSheet({ type: "credit" })}>Kredit hinzufügen</Btn></div>
        </>
      )}

      {/* ---------- Investments ---------- */}
      {tab === "invest" && (
        <>
          <div className="fc-kpis">
            <div className="fc-kpi"><div className="l">Portfoliowert</div><div className="v">{eur(portfolioValue)}</div></div>
            <div className="fc-kpi"><div className="l">Gewinn / Verlust</div><div className="v" style={{ color: gain >= 0 ? C.positive : C.error }}>{gain >= 0 ? "+" : ""}{eur(gain)}</div></div>
          </div>
          <div style={{ height: 12 }} />
          {priceStatus && <div className="fc-status">{priceStatus}</div>}
          {data.investments.length === 0
            ? <Empty text="Erfasse Aktien, ETFs und Krypto – der Ticker reicht, Name und Logo kommen automatisch. Auch Immobilien und Cash lassen sich als Position anlegen." />
            : <Card>{data.investments.map((i) => {
                const val = i.qty * (i.price || 0);
                const g = val - i.qty * (i.buyPrice || 0);
                const isValue = VALUE_TYPES.includes(i.type);
                const showPct = i.type !== "cash" && i.buyPrice > 0 && i.buyPrice !== i.price;
                const pct = showPct ? ((i.price - i.buyPrice) / i.buyPrice) * 100 : 0;
                const typeLabel = INVEST_TYPES.find((t) => t.id === i.type)?.label || "";
                const sub = isValue
                  ? typeLabel
                  : `${String(i.qty).replace(".", ",")} Stück · Kurs ${eurFull(i.price || 0)}${i.priceUpdated ? "" : " · noch kein Live-Kurs"}`;
                return (
                  <ListItem key={i.id}
                    lead={isValue
                      ? <Lead icon={i.type === "immobilie" ? Home : Banknote} />
                      : <AssetLogo inv={i} />}
                    armed={pendingDelete === i.id}
                    title={i.name}
                    sub={sub}
                    value={
                      <span>
                        {eur(val)}<br />
                        <span className="fc-gain" style={{ color: showPct ? (g >= 0 ? C.positive : C.error) : C.mutedSoft }}>
                          {showPct ? `${g >= 0 ? "+" : ""}${pct.toFixed(1).replace(".", ",")} %` : "–"}
                        </span>
                      </span>
                    }
                    onEdit={() => setSheet({ type: "invest", item: i })}
                    onDelete={() => remove("investments", i.id)}
                  />
                );
              })}</Card>}
          <div style={{ margin: "0 16px", display: "flex", gap: 12 }}>
            <Btn onClick={() => setSheet({ type: "invest" })}>+ Position</Btn>
            <Btn kind="ghost" disabled={!data.investments.length || priceStatus.startsWith("Kurse werden")} onClick={refreshPrices}>Kurse aktualisieren</Btn>
          </div>
          <div className="fc-hint">
            Krypto-Kurse kommen live von CoinGecko (ohne Key). Aktien/ETF-Kurse kommen von Finnhub in USD und werden zum Tageskurs in deine Währung umgerechnet – dafür in den Einstellungen einen kostenlosen Finnhub-Key hinterlegen. US-Ticker sind im Free-Tier am zuverlässigsten.
            {lastPriceUpdate > 0 && <> · Stand: {new Date(lastPriceUpdate).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</>}
          </div>
        </>
      )}

      {/* ---------- Sheets ---------- */}
      {sheet?.type === "income" && (
        <Sheet title={sheet.item ? "Einnahme bearbeiten" : "Neue Einnahme"} onClose={() => setSheet(null)}>
          <IncomeForm initial={sheet.item} onSave={(f) => save("incomes", f)} />
        </Sheet>
      )}
      {sheet?.type === "expense" && (
        <Sheet title={sheet.item ? "Ausgabe bearbeiten" : "Neue Ausgabe"} onClose={() => setSheet(null)}>
          <ExpenseForm initial={sheet.item} onSave={(f) => save("expenses", f)} />
        </Sheet>
      )}
      {sheet?.type === "credit" && (
        <Sheet title={sheet.item ? "Kredit bearbeiten" : "Neuer Kredit"} onClose={() => setSheet(null)}>
          <CreditForm initial={sheet.item} onSave={(f) => save("credits", f)} />
        </Sheet>
      )}
      {sheet?.type === "invest" && (
        <Sheet title={sheet.item ? "Position bearbeiten" : "Neue Position"} onClose={() => setSheet(null)}>
          <InvestForm initial={sheet.item} onSave={(f) => save("investments", f)} finnhubKey={settings.finnhubKey} />
        </Sheet>
      )}
      {sheet?.type === "settings" && (
        <Sheet title="Einstellungen" onClose={() => setSheet(null)}>
          <Field label="Währung (Anzeige & Berechnung)">
            <div style={{ display: "flex", gap: 8 }}>
              {CURRENCIES.map((c) => (
                <Btn
                  key={c}
                  kind={(CURRENCIES.includes(settings.currency) ? settings.currency : "EUR") === c ? "primary" : "ghost"}
                  onClick={() => setSettings({ ...settings, currency: c })}
                  style={{ flex: 1 }}
                >
                  {c}
                </Btn>
              ))}
            </div>
          </Field>
          <div style={{ fontSize: 12.5, lineHeight: 1.4, color: C.muted, margin: "-6px 0 14px" }}>
            Bestehende Beträge werden nicht umgerechnet – sie gelten in der gewählten Währung.
            Live-Kurse (Aktien &amp; Krypto) werden automatisch in die gewählte Währung umgerechnet.
          </div>
          <Field label="Finnhub API-Key (für Aktien/ETF-Kurse, kostenlos auf finnhub.io)">
            <input
              value={settings.finnhubKey}
              onChange={(e) => setSettings({ ...settings, finnhubKey: e.target.value.trim() })}
              placeholder="z. B. c1a2b3…"
            />
          </Field>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <Btn kind="ghost" onClick={exportData} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Download size={16} strokeWidth={1.75} /> Backup exportieren
            </Btn>
            <Btn kind="ghost" onClick={() => importRef.current && importRef.current.click()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Upload size={16} strokeWidth={1.75} /> Backup importieren
            </Btn>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={(e) => e.target.files && e.target.files[0] && importData(e.target.files[0])}
            />
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.45, color: C.muted }}>
            Deine Daten liegen ausschliesslich lokal auf diesem Gerät (Browser-Speicher) und verlassen es nie – kein Server, kein Konto.
            Um sie auf ein anderes Gerät zu bringen, exportiere hier ein Backup und importiere es dort.
          </div>
        </Sheet>
      )}

      {/* ---------- Tab-Bar ---------- */}
      <nav className="fc-tabs">
        <div className="fc-tabs-inner">
          {[
            { id: "home", label: "Übersicht", ic: LayoutGrid },
            { id: "income", label: "Einnahmen", ic: Wallet },
            { id: "expenses", label: "Fixkosten", ic: Receipt },
            { id: "credits", label: "Kredite", ic: Landmark },
            { id: "invest", label: "Invest", ic: TrendingUp },
          ].map((t) => (
            <button key={t.id} className={`fc-tab ${tab === t.id ? "active" : ""}`} onClick={() => { setTab(t.id); setSheet(null); }}>
              <span className="ic" aria-hidden><t.ic size={20} strokeWidth={1.75} /></span>
              {t.label}
              <span className="u" aria-hidden />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
