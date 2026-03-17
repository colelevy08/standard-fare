// ─────────────────────────────────────────────────────────────────────────────
// pages/GiftCardsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Gift card purchase page. Users pick an amount (preset or custom), enter
// recipient info, and submit. Order is sent to /api/gift-card-purchase which
// forwards to Toast for fulfillment once credentials are configured.
// Also includes the balance checker at the bottom.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Gift, Send, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import GiftCardChecker from "../components/sections/GiftCardChecker";

const PRESET_AMOUNTS = [25, 50, 75, 100, 150, 200];

const GiftCardsPage = () => {
  const [amount, setAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    senderName: "",
    senderEmail: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const selectedAmount = isCustom ? parseFloat(customAmount) || 0 : amount;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const selectPreset = (val) => {
    setAmount(val);
    setIsCustom(false);
    setCustomAmount("");
  };

  const selectCustom = () => {
    setIsCustom(true);
    setAmount(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAmount || selectedAmount < 5) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/gift-card-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedAmount, ...form }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, message: "Something went wrong. Please try again or call us." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────
  if (result?.success) {
    return (
      <PageLayout>
        <div className="bg-navy pt-32 pb-24 text-center">
          <CheckCircle size={48} className="text-flamingo mx-auto mb-6" />
          <h1 className="font-display text-cream text-3xl md:text-4xl mb-4">Gift Card Sent!</h1>
          <p className="font-body text-cream opacity-60 text-sm max-w-md mx-auto mb-3">
            {result.message}
          </p>
          <p className="font-body text-cream opacity-40 text-xs max-w-sm mx-auto mb-8">
            A ${selectedAmount} gift card has been sent to {form.recipientEmail}.
            They'll receive an email with their card details shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => { setResult(null); setForm({ recipientName: "", recipientEmail: "", senderName: "", senderEmail: "", message: "" }); setAmount(null); setIsCustom(false); }}
              className="btn-ghost text-sm">Send Another</button>
            <Link to="/" className="btn-primary text-sm">Back to Home</Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Give the Gift of Great Dining</p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Gift Cards</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6 mb-6" />
        <p className="font-body text-cream opacity-50 text-sm max-w-lg mx-auto">
          Send an eGift card to someone special. Redeemable for dining, drinks, bottles, and more at Standard Fare.
        </p>
      </div>

      <div className="section-padding bg-cream">
        <div className="section-container max-w-3xl">
          <form onSubmit={handleSubmit}>

            {/* ── Step 1: Amount ─────────────────────────────── */}
            <div className="mb-10">
              <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-4">Choose an Amount</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-3">
                {PRESET_AMOUNTS.map((val) => (
                  <button key={val} type="button" onClick={() => selectPreset(val)}
                    className={`rounded-lg py-4 font-display text-lg transition-all
                      ${!isCustom && amount === val
                        ? "bg-navy text-cream shadow-lg scale-105"
                        : "bg-white text-navy border border-navy border-opacity-10 hover:border-flamingo"
                      }`}>
                    ${val}
                  </button>
                ))}
              </div>
              <button type="button" onClick={selectCustom}
                className={`w-full rounded-lg py-3 text-sm font-mono tracking-editorial uppercase transition-all
                  ${isCustom
                    ? "bg-navy text-cream"
                    : "bg-white text-navy border border-navy border-opacity-10 hover:border-flamingo"
                  }`}>
                Custom Amount
              </button>
              {isCustom && (
                <div className="mt-3 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-navy text-lg">$</span>
                  <input type="number" min="5" max="500" step="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount (min $5)"
                    className="form-input text-lg pl-8"
                    required={isCustom}
                    autoFocus />
                </div>
              )}
            </div>

            {/* ── Step 2: Recipient ──────────────────────────── */}
            <div className="mb-10">
              <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-4">Recipient Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1.5">Recipient Name</label>
                  <input type="text" name="recipientName" required value={form.recipientName}
                    onChange={handleChange} className="form-input" placeholder="Their name" />
                </div>
                <div>
                  <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1.5">Recipient Email</label>
                  <input type="email" name="recipientEmail" required value={form.recipientEmail}
                    onChange={handleChange} className="form-input" placeholder="their@email.com" />
                </div>
              </div>
            </div>

            {/* ── Step 3: Sender ─────────────────────────────── */}
            <div className="mb-10">
              <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-4">Your Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1.5">Your Name</label>
                  <input type="text" name="senderName" required value={form.senderName}
                    onChange={handleChange} className="form-input" placeholder="Your name" />
                </div>
                <div>
                  <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1.5">Your Email</label>
                  <input type="email" name="senderEmail" required value={form.senderEmail}
                    onChange={handleChange} className="form-input" placeholder="your@email.com" />
                </div>
              </div>
              <div className="mt-4">
                <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1.5">Personal Message (optional)</label>
                <textarea name="message" value={form.message}
                  onChange={handleChange} rows={3}
                  className="form-input resize-none"
                  placeholder="Add a personal note to the recipient..." />
              </div>
            </div>

            {/* ── Summary + Submit ───────────────────────────── */}
            <div className="bg-navy rounded-xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-1">eGift Card</p>
                  <p className="font-display text-cream text-2xl">
                    {selectedAmount > 0 ? `$${selectedAmount}` : "Select an amount"}
                  </p>
                </div>
                <Gift size={32} className="text-flamingo opacity-40" />
              </div>

              {form.recipientName && (
                <p className="font-body text-cream opacity-50 text-sm mb-4">
                  To: {form.recipientName} ({form.recipientEmail})
                  {form.senderName && <><br />From: {form.senderName}</>}
                </p>
              )}

              {result && !result.success && (
                <p className="font-body text-flamingo text-sm mb-4">{result.message}</p>
              )}

              <button type="submit"
                disabled={submitting || !selectedAmount || selectedAmount < 5}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40">
                <Send size={14} />
                {submitting ? "Processing..." : `Purchase $${selectedAmount || 0} Gift Card`}
              </button>

              <p className="font-body text-cream opacity-30 text-xs text-center mt-3">
                Powered by Toast. The recipient will receive their eGift card via email.
              </p>
            </div>
          </form>

          {/* ── Balance Checker ──────────────────────────────── */}
          <div className="mt-16">
            <GiftCardChecker />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default GiftCardsPage;
