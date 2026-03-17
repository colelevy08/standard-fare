// ─────────────────────────────────────────────────────────────────────────────
// components/sections/GiftCardChecker.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Gift card balance checker. Calls /api/gift-card-balance when Toast API is
// configured. Until then, shows a helpful message directing to Toast's site.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { CreditCard, Search, DollarSign } from "lucide-react";

const GiftCardChecker = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { balance, lastUsed } | { error }

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!cardNumber.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/gift-card-balance?card=${encodeURIComponent(cardNumber.trim())}`);
      const data = await res.json();

      if (data.balance !== undefined) {
        setResult({ balance: data.balance, lastUsed: data.lastUsed });
      } else {
        setResult({ error: data.error || "Card not found. Please check the number and try again." });
      }
    } catch {
      setResult({ error: "Unable to check balance. Please call us at (518) 450-0876." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream-warm rounded-lg p-8 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <CreditCard size={20} className="text-flamingo" />
        <h3 className="font-display text-navy text-xl">Check Gift Card Balance</h3>
      </div>

      <form onSubmit={handleCheck} className="flex flex-col gap-3">
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => { setCardNumber(e.target.value); setResult(null); }}
          placeholder="Enter gift card number"
          className="form-input text-base"
          required
        />
        <button type="submit" disabled={loading}
          className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
          <Search size={14} />
          {loading ? "Checking..." : "Check Balance"}
        </button>
      </form>

      {result && (
        <div className="mt-4">
          {result.balance !== undefined ? (
            <div className="bg-navy rounded-lg p-5 text-center">
              <DollarSign size={24} className="text-flamingo mx-auto mb-2" />
              <p className="font-display text-cream text-3xl">${result.balance.toFixed(2)}</p>
              <p className="font-mono text-cream opacity-50 text-xs mt-1">Remaining Balance</p>
              {result.lastUsed && (
                <p className="font-body text-cream opacity-40 text-xs mt-2">
                  Last used: {new Date(result.lastUsed).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <p className="font-body text-flamingo-dark text-sm">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GiftCardChecker;
