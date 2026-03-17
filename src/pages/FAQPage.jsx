// ─────────────────────────────────────────────────────────────────────────────
// pages/FAQPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Accordion-style FAQ page with category filter tabs.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";

const CATEGORIES = ["All", "Dining", "Reservations", "Policies", "Events"];

// ── Single FAQ Item ─────────────────────────────────────────────────────────
const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border-b border-navy border-opacity-10 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 py-5 text-left group"
    >
      <h3 className="font-display text-navy text-base md:text-lg leading-snug group-hover:text-flamingo transition-colors">
        {question}
      </h3>
      <ChevronDown
        size={18}
        className={`flex-shrink-0 text-flamingo transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-96 pb-5" : "max-h-0"
      }`}
    >
      <p className="font-body text-navy opacity-70 text-sm leading-relaxed pr-8">
        {answer}
      </p>
    </div>
  </div>
);

// ── FAQ Page ────────────────────────────────────────────────────────────────
const FAQPage = () => {
  const { siteData } = useSite();
  const [activeCategory, setActiveCategory] = useState("All");
  const [openId, setOpenId] = useState(null);

  const filtered = useMemo(
    () => {
      const faqItems = siteData.faq || [];
      return activeCategory === "All"
        ? faqItems
        : faqItems.filter((item) => item.category === activeCategory);
    },
    [siteData.faq, activeCategory]
  );

  const handleToggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <PageLayout>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          Common Questions
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">FAQ</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6" />
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="section-padding bg-cream">
        <div className="section-container max-w-3xl">

          {/* ── Category Filter Pills ───────────────────────── */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenId(null); }}
                className={`font-mono text-xs tracking-editorial uppercase px-5 py-2 rounded-full border transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-navy text-cream border-navy"
                    : "bg-transparent text-navy border-navy border-opacity-20 hover:border-flamingo hover:text-flamingo"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── FAQ Items ───────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-navy border-opacity-10 px-6 md:px-8">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <FAQItem
                  key={item.id}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openId === item.id}
                  onToggle={() => handleToggle(item.id)}
                />
              ))
            ) : (
              <p className="font-body text-navy opacity-50 text-sm py-8 text-center">
                No questions in this category yet.
              </p>
            )}
          </div>

        </div>
      </div>
    </PageLayout>
  );
};

export default FAQPage;
