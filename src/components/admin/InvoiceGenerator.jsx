// ─────────────────────────────────────────────────────────────────────────────
// components/admin/InvoiceGenerator.jsx — Professional invoice creator
// ─────────────────────────────────────────────────────────────────────────────
// Generate print-ready invoices for private events, catering, and custom orders.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef } from "react";
import { Plus, Trash2, Download, Save } from "lucide-react";

const InvoiceGenerator = () => {
  const [invoice, setInvoice] = useState({
    number: `SF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    eventDate: "",
    eventType: "Private Event",
    notes: "",
    items: [{ description: "", qty: 1, price: 0 }],
    taxRate: 8,
    deposit: 0,
  });
  const [savedInvoices, setSavedInvoices] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sf_invoices") || "[]"); } catch { return []; }
  });
  const printRef = useRef(null);

  const update = (field, value) => setInvoice(prev => ({ ...prev, [field]: value }));
  const updateItem = (i, field, value) => {
    const items = [...invoice.items];
    items[i] = { ...items[i], [field]: value };
    setInvoice(prev => ({ ...prev, items }));
  };
  const addItem = () => setInvoice(prev => ({ ...prev, items: [...prev.items, { description: "", qty: 1, price: 0 }] }));
  const removeItem = (i) => setInvoice(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }));

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const tax = subtotal * (invoice.taxRate / 100);
  const total = subtotal + tax;
  const balanceDue = total - (invoice.deposit || 0);

  const saveInvoice = () => {
    const saved = [...savedInvoices, { ...invoice, total, createdAt: new Date().toISOString() }];
    setSavedInvoices(saved);
    localStorage.setItem("sf_invoices", JSON.stringify(saved));
  };

  const loadInvoice = (inv) => {
    setInvoice(inv);
  };

  const printInvoice = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Invoice ${invoice.number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; color: #1B2B4B; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #E8748A; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; letter-spacing: 2px; }
        .logo span { color: #E8748A; }
        .meta { text-align: right; font-size: 12px; color: #666; }
        .meta h2 { font-size: 24px; color: #1B2B4B; margin-bottom: 8px; letter-spacing: 4px; text-transform: uppercase; }
        .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .party { font-size: 13px; line-height: 1.6; }
        .party strong { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #E8748A; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #1B2B4B; color: white; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
        .totals { text-align: right; margin-top: 20px; }
        .totals p { font-size: 13px; margin-bottom: 4px; }
        .totals .total { font-size: 22px; font-weight: bold; color: #E8748A; margin-top: 8px; }
        .notes { margin-top: 30px; padding: 16px; background: #f8f5ee; border-radius: 4px; font-size: 12px; color: #666; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header">
        <div class="logo"><span>sf</span> Standard Fare</div>
        <div class="meta">
          <h2>Invoice</h2>
          <p>#${invoice.number}</p>
          <p>Date: ${invoice.date}</p>
          ${invoice.dueDate ? `<p>Due: ${invoice.dueDate}</p>` : ""}
        </div>
      </div>
      <div class="parties">
        <div class="party">
          <strong>From</strong>
          Standard Fare<br>
          21 Phila St<br>
          Saratoga Springs, NY 12866<br>
          (518) 450-0876<br>
          hello@standardfaresaratoga.com
        </div>
        <div class="party" style="text-align:right">
          <strong>Bill To</strong>
          ${invoice.clientName || "—"}<br>
          ${invoice.clientEmail || ""}<br>
          ${invoice.clientPhone || ""}<br>
          ${invoice.clientAddress || ""}
        </div>
      </div>
      ${invoice.eventDate || invoice.eventType ? `<p style="margin-bottom:20px;font-size:13px;color:#666;">Event: ${invoice.eventType} ${invoice.eventDate ? "— " + invoice.eventDate : ""}</p>` : ""}
      <table>
        <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>
          ${invoice.items.map(item => `<tr><td>${item.description}</td><td>${item.qty}</td><td>$${Number(item.price).toFixed(2)}</td><td>$${(item.qty * item.price).toFixed(2)}</td></tr>`).join("")}
        </tbody>
      </table>
      <div class="totals">
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
        <p>Tax (${invoice.taxRate}%): $${tax.toFixed(2)}</p>
        ${invoice.deposit > 0 ? `<p>Deposit Received: -$${Number(invoice.deposit).toFixed(2)}</p>` : ""}
        <p class="total">Balance Due: $${balanceDue.toFixed(2)}</p>
      </div>
      ${invoice.notes ? `<div class="notes"><strong>Notes:</strong> ${invoice.notes}</div>` : ""}
      <div class="footer">
        Standard Fare · Creative American Dining · 21 Phila St · Saratoga Springs, NY 12866
      </div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div>
      <p className="font-body text-sm text-navy/50 mb-5 leading-relaxed">
        Create professional invoices for private events, catering, and custom orders. Print or save as PDF.
      </p>

      {/* Invoice form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-mono text-[10px] tracking-editorial uppercase text-navy/40 block mb-1">Invoice #</label>
            <input value={invoice.number} onChange={e => update("number", e.target.value)} className="form-input py-2 text-sm" />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-editorial uppercase text-navy/40 block mb-1">Date</label>
            <input type="date" value={invoice.date} onChange={e => update("date", e.target.value)} className="form-input py-2 text-sm" />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-editorial uppercase text-navy/40 block mb-1">Due Date</label>
            <input type="date" value={invoice.dueDate} onChange={e => update("dueDate", e.target.value)} className="form-input py-2 text-sm" />
          </div>
        </div>

        <div className="p-4 bg-cream-warm rounded-2xl">
          <p className="font-mono text-[10px] tracking-editorial uppercase text-navy/30 mb-3">Client</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={invoice.clientName} onChange={e => update("clientName", e.target.value)} placeholder="Client Name" className="form-input py-2 text-sm" />
            <input value={invoice.clientEmail} onChange={e => update("clientEmail", e.target.value)} placeholder="Email" type="email" className="form-input py-2 text-sm" />
            <input value={invoice.clientPhone} onChange={e => update("clientPhone", e.target.value)} placeholder="Phone" className="form-input py-2 text-sm" />
            <input value={invoice.clientAddress} onChange={e => update("clientAddress", e.target.value)} placeholder="Address" className="form-input py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] tracking-editorial uppercase text-navy/40 block mb-1">Event Type</label>
            <select value={invoice.eventType} onChange={e => update("eventType", e.target.value)} className="form-input py-2 text-sm">
              <option>Private Event</option>
              <option>Full Buyout</option>
              <option>Semi-Private</option>
              <option>Catering</option>
              <option>Corporate</option>
              <option>Wedding</option>
            </select>
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-editorial uppercase text-navy/40 block mb-1">Event Date</label>
            <input type="date" value={invoice.eventDate} onChange={e => update("eventDate", e.target.value)} className="form-input py-2 text-sm" />
          </div>
        </div>

        {/* Line items */}
        <div>
          <p className="font-mono text-[10px] tracking-editorial uppercase text-navy/30 mb-3">Line Items</p>
          {invoice.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)}
                placeholder="Description" className="form-input py-2 text-sm flex-1" />
              <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, "qty", parseInt(e.target.value) || 1)}
                className="form-input py-2 text-sm w-16 text-center" />
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-navy/30 text-sm">$</span>
                <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateItem(i, "price", parseFloat(e.target.value) || 0)}
                  className="form-input py-2 text-sm w-24 pl-5" />
              </div>
              <span className="font-mono text-xs text-navy/40 w-20 text-right">${(item.qty * item.price).toFixed(2)}</span>
              {invoice.items.length > 1 && (
                <button onClick={() => removeItem(i)} className="text-navy/20 hover:text-red-500 p-1"><Trash2 size={13} /></button>
              )}
            </div>
          ))}
          <button onClick={addItem} className="flex items-center gap-1.5 font-body text-xs text-flamingo hover:text-flamingo-dark mt-2">
            <Plus size={12} /> Add Line Item
          </button>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-2xl border border-navy/[0.06] p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-body text-sm text-navy/50">Subtotal</span>
            <span className="font-mono text-sm text-navy">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-body text-sm text-navy/50">Tax</span>
              <input type="number" min="0" max="20" step="0.1" value={invoice.taxRate}
                onChange={e => update("taxRate", parseFloat(e.target.value) || 0)}
                className="w-14 p-1 rounded border border-navy/10 font-mono text-xs text-center" />
              <span className="font-body text-xs text-navy/30">%</span>
            </div>
            <span className="font-mono text-sm text-navy">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="font-body text-sm text-navy/50">Deposit Received</span>
              <div className="relative">
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-navy/30 text-xs">$</span>
                <input type="number" min="0" step="0.01" value={invoice.deposit}
                  onChange={e => update("deposit", parseFloat(e.target.value) || 0)}
                  className="w-24 p-1 pl-4 rounded border border-navy/10 font-mono text-xs" />
              </div>
            </div>
            <span className="font-mono text-sm text-navy">-${Number(invoice.deposit || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-navy/10">
            <span className="font-display text-navy text-lg">Balance Due</span>
            <span className="font-display text-flamingo text-2xl">${balanceDue.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <textarea value={invoice.notes} onChange={e => update("notes", e.target.value)}
          placeholder="Notes (payment terms, special instructions...)" rows={2} className="form-input py-2 text-sm w-full" />

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={printInvoice}
            className="flex items-center gap-2 bg-flamingo text-white font-body text-sm px-5 py-2.5 rounded-xl hover:bg-flamingo-dark transition-colors">
            <Download size={14} /> Print / Save PDF
          </button>
          <button onClick={saveInvoice}
            className="flex items-center gap-2 font-body text-sm text-navy/50 px-4 py-2.5 rounded-xl border border-navy/10 hover:border-navy/30 transition-all">
            <Save size={14} /> Save Draft
          </button>
        </div>
      </div>

      {/* Saved invoices */}
      {savedInvoices.length > 0 && (
        <div className="mt-6 pt-6 border-t border-navy/[0.06]">
          <p className="font-mono text-[10px] tracking-editorial uppercase text-navy/30 mb-3">Saved Invoices ({savedInvoices.length})</p>
          <div className="space-y-1.5">
            {savedInvoices.slice().reverse().map((inv, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-navy/[0.06] hover:shadow-sm transition-shadow">
                <div>
                  <p className="font-body text-sm text-navy font-semibold">{inv.number} — {inv.clientName || "No client"}</p>
                  <p className="font-mono text-[9px] text-navy/25">${Number(inv.total || 0).toFixed(2)} · {inv.eventType} · {new Date(inv.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => loadInvoice(inv)} className="font-mono text-[10px] text-flamingo/60 hover:text-flamingo px-2 py-1 rounded-lg hover:bg-flamingo/5 transition-all">Load</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden print ref */}
      <div ref={printRef} className="hidden" />
    </div>
  );
};

export default InvoiceGenerator;
