// ─────────────────────────────────────────────────────────────────────────────
// components/admin/InvoiceGenerator.jsx — Professional invoice creator
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Plus, Trash2, Download, Save, RotateCcw, FileText } from "lucide-react";

const PRESET_ITEMS = [
  { label: "Full Buyout (40 guests)", price: 2500 },
  { label: "Semi-Private (24 guests)", price: 1500 },
  { label: "Prix Fixe Menu — per person", price: 75 },
  { label: "Cocktail Package — per person", price: 45 },
  { label: "Wine Package — per person", price: 55 },
  { label: "Dessert Add-On — per person", price: 15 },
  { label: "AV / Sound Setup", price: 200 },
  { label: "Floral Arrangements", price: 350 },
  { label: "Event Coordination Fee", price: 500 },
];

const InvoiceGenerator = () => {
  const [invoice, setInvoice] = useState({
    number: `SF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    clientName: "", clientEmail: "", clientPhone: "", clientAddress: "",
    eventDate: "", eventType: "Private Event", guestCount: "",
    notes: "Payment due within 14 days of invoice date.\n25% non-refundable deposit required to confirm booking.",
    items: [{ description: "", qty: 1, price: 0 }],
    taxRate: 8, deposit: 0,
  });

  const [savedInvoices, setSavedInvoices] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sf_invoices") || "[]"); } catch { return []; }
  });

  const [showPresets, setShowPresets] = useState(false);

  const update = (f, v) => setInvoice(p => ({ ...p, [f]: v }));
  const updateItem = (i, f, v) => {
    const items = [...invoice.items];
    items[i] = { ...items[i], [f]: v };
    update("items", items);
  };
  const addItem = (desc = "", price = 0) => update("items", [...invoice.items, { description: desc, qty: 1, price }]);
  const removeItem = (i) => update("items", invoice.items.filter((_, idx) => idx !== i));

  const subtotal = invoice.items.reduce((s, it) => s + (it.qty * it.price), 0);
  const tax = subtotal * (invoice.taxRate / 100);
  const total = subtotal + tax;
  const balanceDue = total - (invoice.deposit || 0);

  const saveInvoice = () => {
    const saved = [...savedInvoices, { ...invoice, total, balanceDue, createdAt: new Date().toISOString() }];
    setSavedInvoices(saved);
    localStorage.setItem("sf_invoices", JSON.stringify(saved));
  };

  const deleteInvoice = (idx) => {
    const saved = savedInvoices.filter((_, i) => i !== idx);
    setSavedInvoices(saved);
    localStorage.setItem("sf_invoices", JSON.stringify(saved));
  };

  const newInvoice = () => {
    setInvoice({
      number: `SF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      date: new Date().toISOString().split("T")[0], dueDate: "",
      clientName: "", clientEmail: "", clientPhone: "", clientAddress: "",
      eventDate: "", eventType: "Private Event", guestCount: "",
      notes: "Payment due within 14 days of invoice date.\n25% non-refundable deposit required to confirm booking.",
      items: [{ description: "", qty: 1, price: 0 }], taxRate: 8, deposit: 0,
    });
  };

  const printInvoice = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Invoice ${invoice.number}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Georgia,serif;color:#1B2B4B;padding:48px;max-width:780px;margin:0 auto}
.top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;padding-bottom:24px;border-bottom:3px solid #E8748A}
.brand{font-size:32px;font-weight:bold;letter-spacing:1px}.brand span{color:#E8748A}
.brand-sub{font-size:11px;color:#999;letter-spacing:3px;text-transform:uppercase;margin-top:4px}
.inv-meta{text-align:right}.inv-meta h2{font-size:28px;letter-spacing:6px;text-transform:uppercase;color:#1B2B4B;margin-bottom:8px}
.inv-meta p{font-size:12px;color:#888;margin-bottom:2px}
.parties{display:flex;justify-content:space-between;margin-bottom:28px}
.party{font-size:13px;line-height:1.7}.party strong{display:block;font-size:10px;text-transform:uppercase;letter-spacing:3px;color:#E8748A;margin-bottom:6px}
.event-bar{background:#f8f5ee;padding:12px 16px;border-radius:6px;margin-bottom:24px;font-size:12px;color:#666;display:flex;gap:24px}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
th{background:#1B2B4B;color:#fff;padding:12px 14px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:2px}
th:last-child{text-align:right}
td{padding:12px 14px;border-bottom:1px solid #f0ede6;font-size:13px}
td:last-child{text-align:right;font-weight:bold}
.totals{margin-left:auto;width:280px;margin-bottom:24px}
.totals .row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#666}
.totals .row.total{border-top:2px solid #1B2B4B;padding-top:12px;margin-top:8px;font-size:20px;color:#E8748A;font-weight:bold}
.notes{padding:16px 20px;background:#f8f5ee;border-radius:6px;font-size:12px;color:#888;line-height:1.6;white-space:pre-wrap;margin-bottom:32px}
.footer{text-align:center;font-size:10px;color:#bbb;letter-spacing:2px;text-transform:uppercase;border-top:1px solid #f0ede6;padding-top:20px}
@media print{body{padding:24px}}
</style></head><body>
<div class="top">
  <div><div class="brand"><span>sf</span> Standard Fare</div><div class="brand-sub">Creative American Dining</div></div>
  <div class="inv-meta"><h2>Invoice</h2><p>#${invoice.number}</p><p>Issued: ${invoice.date}</p>${invoice.dueDate ? `<p>Due: ${invoice.dueDate}</p>` : ""}</div>
</div>
<div class="parties">
  <div class="party"><strong>From</strong>Standard Fare<br>21 Phila St<br>Saratoga Springs, NY 12866<br>(518) 450-0876<br>hello@standardfaresaratoga.com</div>
  <div class="party" style="text-align:right"><strong>Bill To</strong>${invoice.clientName || "—"}<br>${invoice.clientEmail}<br>${invoice.clientPhone}<br>${invoice.clientAddress}</div>
</div>
${invoice.eventType || invoice.eventDate || invoice.guestCount ? `<div class="event-bar"><span><strong>Event:</strong> ${invoice.eventType}</span>${invoice.eventDate ? `<span><strong>Date:</strong> ${invoice.eventDate}</span>` : ""}${invoice.guestCount ? `<span><strong>Guests:</strong> ${invoice.guestCount}</span>` : ""}</div>` : ""}
<table><thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th style="text-align:right">Amount</th></tr></thead><tbody>
${invoice.items.filter(it => it.description).map(it => `<tr><td>${it.description}</td><td>${it.qty}</td><td>$${Number(it.price).toFixed(2)}</td><td>$${(it.qty * it.price).toFixed(2)}</td></tr>`).join("")}
</tbody></table>
<div class="totals">
  <div class="row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
  <div class="row"><span>Tax (${invoice.taxRate}%)</span><span>$${tax.toFixed(2)}</span></div>
  ${invoice.deposit > 0 ? `<div class="row"><span>Deposit Received</span><span>-$${Number(invoice.deposit).toFixed(2)}</span></div>` : ""}
  <div class="row total"><span>Balance Due</span><span>$${balanceDue.toFixed(2)}</span></div>
</div>
${invoice.notes ? `<div class="notes">${invoice.notes}</div>` : ""}
<div class="footer">Standard Fare · 21 Phila St · Saratoga Springs, NY 12866 · standardfaresaratoga.com</div>
</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  // Label for quick field
  const L = ({ children }) => <label className="font-mono text-[9px] tracking-editorial uppercase text-navy/35 block mb-1">{children}</label>;

  return (
    <div>
      {/* Header with new/save actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="font-body text-sm text-navy/50 leading-relaxed">
            Create professional invoices for private events, catering, and custom orders.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={newInvoice} className="flex items-center gap-1.5 font-body text-xs text-navy/40 px-3 py-2 rounded-xl border border-navy/10 hover:border-navy/30 transition-all">
            <RotateCcw size={12} /> New
          </button>
          <button onClick={saveInvoice} className="flex items-center gap-1.5 font-body text-xs text-navy bg-white px-3 py-2 rounded-xl border border-navy/10 hover:border-flamingo/30 hover:text-flamingo transition-all shadow-sm">
            <Save size={12} /> Save Draft
          </button>
          <button onClick={printInvoice} className="flex items-center gap-1.5 bg-flamingo text-white font-body text-xs px-4 py-2 rounded-xl hover:bg-flamingo-dark transition-colors shadow-sm">
            <Download size={12} /> Print / PDF
          </button>
        </div>
      </div>

      {/* Invoice number + dates */}
      <div className="bg-navy/[0.02] rounded-2xl p-5 mb-5 border border-navy/[0.04]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><L>Invoice #</L><input value={invoice.number} onChange={e => update("number", e.target.value)} className="form-input py-2 text-sm font-mono" /></div>
          <div><L>Issue Date</L><input type="date" value={invoice.date} onChange={e => update("date", e.target.value)} className="form-input py-2 text-sm" /></div>
          <div><L>Due Date</L><input type="date" value={invoice.dueDate} onChange={e => update("dueDate", e.target.value)} className="form-input py-2 text-sm" /></div>
        </div>
      </div>

      {/* Client + event info side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-2xl p-5 border border-navy/[0.06] shadow-sm">
          <p className="font-mono text-[10px] tracking-editorial uppercase text-flamingo/50 mb-3">Bill To</p>
          <div className="space-y-2">
            <input value={invoice.clientName} onChange={e => update("clientName", e.target.value)} placeholder="Client name" className="form-input py-2 text-sm w-full" />
            <input value={invoice.clientEmail} onChange={e => update("clientEmail", e.target.value)} placeholder="Email" type="email" className="form-input py-2 text-sm w-full" />
            <div className="grid grid-cols-2 gap-2">
              <input value={invoice.clientPhone} onChange={e => update("clientPhone", e.target.value)} placeholder="Phone" className="form-input py-2 text-sm" />
              <input value={invoice.clientAddress} onChange={e => update("clientAddress", e.target.value)} placeholder="Address" className="form-input py-2 text-sm" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-navy/[0.06] shadow-sm">
          <p className="font-mono text-[10px] tracking-editorial uppercase text-flamingo/50 mb-3">Event Details</p>
          <div className="space-y-2">
            <select value={invoice.eventType} onChange={e => update("eventType", e.target.value)} className="form-input py-2 text-sm w-full">
              <option>Private Event</option><option>Full Buyout</option><option>Semi-Private</option>
              <option>Catering</option><option>Corporate</option><option>Wedding</option><option>Birthday</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={invoice.eventDate} onChange={e => update("eventDate", e.target.value)} className="form-input py-2 text-sm" placeholder="Event date" />
              <input value={invoice.guestCount} onChange={e => update("guestCount", e.target.value)} placeholder="Guest count" className="form-input py-2 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-2xl p-5 border border-navy/[0.06] shadow-sm mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] tracking-editorial uppercase text-flamingo/50">Line Items</p>
          <button onClick={() => setShowPresets(!showPresets)}
            className="font-mono text-[9px] text-navy/30 hover:text-flamingo transition-colors">
            {showPresets ? "Hide presets" : "Quick add"}
          </button>
        </div>

        {/* Presets */}
        {showPresets && (
          <div className="flex flex-wrap gap-1.5 mb-4 p-3 bg-cream-warm rounded-xl admin-collapse-enter">
            {PRESET_ITEMS.map((p, i) => (
              <button key={i} onClick={() => { addItem(p.label, p.price); setShowPresets(false); }}
                className="font-body text-[10px] text-navy/50 hover:text-flamingo bg-white px-2.5 py-1.5 rounded-lg border border-navy/[0.06] hover:border-flamingo/30 transition-all">
                {p.label} · ${p.price}
              </button>
            ))}
          </div>
        )}

        {/* Item rows */}
        <div className="space-y-2">
          {invoice.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)}
                placeholder="Description" className="form-input py-2 text-sm flex-1" />
              <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, "qty", parseInt(e.target.value) || 1)}
                className="form-input py-2 text-sm w-16 text-center" />
              <div className="relative w-24">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy/25 text-sm">$</span>
                <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateItem(i, "price", parseFloat(e.target.value) || 0)}
                  className="form-input py-2 text-sm pl-6" />
              </div>
              <span className="font-mono text-xs text-navy/35 w-20 text-right tabular-nums">${(item.qty * item.price).toFixed(2)}</span>
              {invoice.items.length > 1 && (
                <button onClick={() => removeItem(i)} className="text-navy/15 hover:text-red-500 p-1 transition-colors"><Trash2 size={13} /></button>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => addItem()} className="flex items-center gap-1.5 font-body text-xs text-flamingo hover:text-flamingo-dark mt-3 transition-colors">
          <Plus size={12} /> Add Line Item
        </button>
      </div>

      {/* Totals card */}
      <div className="bg-white rounded-2xl p-5 border border-navy/[0.06] shadow-sm mb-5">
        <div className="max-w-xs ml-auto space-y-2">
          <div className="flex justify-between text-sm text-navy/50">
            <span>Subtotal</span><span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-navy/50">
            <div className="flex items-center gap-1.5">
              <span>Tax</span>
              <input type="number" min="0" max="20" step="0.1" value={invoice.taxRate}
                onChange={e => update("taxRate", parseFloat(e.target.value) || 0)}
                className="w-12 p-1 rounded border border-navy/10 font-mono text-[10px] text-center" />%
            </div>
            <span className="font-mono tabular-nums">${tax.toFixed(2)}</span>
          </div>
          {invoice.deposit > 0 && (
            <div className="flex justify-between text-sm text-navy/50">
              <span>Deposit</span><span className="font-mono tabular-nums text-green-600">-${Number(invoice.deposit).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center gap-2 text-sm text-navy/50">
            <div className="flex items-center gap-1.5">
              <span>Deposit received</span>
              <div className="relative w-24">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-navy/25 text-xs">$</span>
                <input type="number" min="0" step="0.01" value={invoice.deposit}
                  onChange={e => update("deposit", parseFloat(e.target.value) || 0)}
                  className="w-full p-1 pl-5 rounded border border-navy/10 font-mono text-[10px]" />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-navy/10">
            <span className="font-display text-navy text-lg">Balance Due</span>
            <span className="font-display text-flamingo text-2xl tabular-nums">${balanceDue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-5">
        <L>Notes & Payment Terms</L>
        <textarea value={invoice.notes} onChange={e => update("notes", e.target.value)}
          rows={3} className="form-input py-2.5 text-sm w-full" placeholder="Payment terms, special instructions..." />
      </div>

      {/* Saved invoices */}
      {savedInvoices.length > 0 && (
        <div className="border-t border-navy/[0.06] pt-5 mt-6">
          <p className="font-mono text-[10px] tracking-editorial uppercase text-navy/25 mb-3 flex items-center gap-1.5">
            <FileText size={11} /> Saved Invoices ({savedInvoices.length})
          </p>
          <div className="space-y-1.5">
            {savedInvoices.slice().reverse().map((inv, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-navy/[0.06] hover:shadow-sm transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-navy font-bold">{inv.number}</span>
                    <span className="font-body text-sm text-navy/60 truncate">{inv.clientName || "No client"}</span>
                  </div>
                  <p className="font-mono text-[9px] text-navy/25">{inv.eventType} · ${Number(inv.balanceDue || inv.total || 0).toFixed(2)} · {new Date(inv.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0 ml-3">
                  <button onClick={() => setInvoice(inv)}
                    className="font-mono text-[9px] text-flamingo/60 hover:text-flamingo px-2.5 py-1 rounded-lg hover:bg-flamingo/5 transition-all">Edit</button>
                  <button onClick={() => deleteInvoice(savedInvoices.length - 1 - i)}
                    className="font-mono text-[9px] text-navy/20 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-all">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceGenerator;
