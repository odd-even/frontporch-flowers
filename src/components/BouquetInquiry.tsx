"use client";

import { useEffect, useState } from "react";
import { buildMailtoUrl, getContactEmail } from "@/lib/email";

const COLOR_OPTIONS = [
  { id: "warm", label: "Warm & sunny", hint: "corals, yellows, golds" },
  { id: "pastel", label: "Soft pastels", hint: "blush, lavender, cream" },
  { id: "bold", label: "Bold & bright", hint: "magenta, orange, zinnia pink" },
  { id: "moody", label: "Moody & deep", hint: "burgundy, plum, rust" },
  { id: "fresh", label: "Garden fresh", hint: "greens, whites, natural" },
  { id: "surprise", label: "Surprise me", hint: "Rhoda picks the palette" },
] as const;

const STYLE_OPTIONS = [
  { id: "whimsical", label: "Wild & whimsical", hint: "loose, meadow-gathered" },
  { id: "romantic", label: "Soft & romantic", hint: "airy, delicate stems" },
  { id: "classic", label: "Classic & full", hint: "lush, rounded shape" },
] as const;

const SIZE_OPTIONS = [
  { id: "petite", label: "Petite", hint: "desk or bedside" },
  { id: "medium", label: "Medium", hint: "everyday table size" },
  { id: "generous", label: "Generous", hint: "statement piece" },
  { id: "unsure", label: "Not sure", hint: "happy for Rhoda's suggestion" },
] as const;

type ColorId = (typeof COLOR_OPTIONS)[number]["id"];
type StyleId = (typeof STYLE_OPTIONS)[number]["id"];
type SizeId = (typeof SIZE_OPTIONS)[number]["id"];

type BouquetPreferences = {
  color: ColorId;
  style: StyleId;
  size: SizeId;
};

const DEFAULT_PREFERENCES: BouquetPreferences = {
  color: "warm",
  style: "whimsical",
  size: "medium",
};

const BOUQUET_DEFAULTS: Record<string, BouquetPreferences> = {
  "front-porch-classic": { color: "warm", style: "classic", size: "medium" },
  "garden-posy": { color: "fresh", style: "romantic", size: "petite" },
  "porch-swing": { color: "pastel", style: "romantic", size: "medium" },
  "late-summer-glow": { color: "bold", style: "whimsical", size: "generous" },
  "meadow-jar": { color: "fresh", style: "whimsical", size: "petite" },
};

function getBouquetPreferences(bouquetId?: string, bouquetPrice?: string): BouquetPreferences {
  if (bouquetId && BOUQUET_DEFAULTS[bouquetId]) {
    return BOUQUET_DEFAULTS[bouquetId];
  }

  const basePrice = parseBasePrice(bouquetPrice);
  let size: SizeId = DEFAULT_PREFERENCES.size;

  if (basePrice) {
    if (basePrice <= 40) size = "petite";
    else if (basePrice >= 60) size = "generous";
  }

  return { ...DEFAULT_PREFERENCES, size };
}

function parseBasePrice(price?: string): number | null {
  if (!price) return null;
  const match = price.match(/\$([\d]+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function formatPrice(amount: number): string {
  return `$${amount}`;
}

function getSizePriceMap(basePrice: number | null): Partial<Record<SizeId, number>> {
  if (!basePrice) return {};

  return {
    petite: Math.max(basePrice - 15, 25),
    medium: basePrice,
    generous: basePrice + 15,
  };
}

function getSizeOptions(basePrice: number | null) {
  const priceMap = getSizePriceMap(basePrice);

  return SIZE_OPTIONS.map((option) => ({
    ...option,
    price: priceMap[option.id] ? formatPrice(priceMap[option.id]!) : undefined,
  }));
}

interface BouquetInquiryProps {
  bouquetId?: string;
  bouquetTitle: string;
  bouquetPrice?: string;
  contactEmail?: string;
}

function buildMessage(
  bouquetTitle: string,
  color: ColorId,
  style: StyleId,
  size: SizeId,
  note: string,
  bouquetPrice?: string
) {
  const colorLabel = COLOR_OPTIONS.find((o) => o.id === color)?.label ?? color;
  const styleLabel = STYLE_OPTIONS.find((o) => o.id === style)?.label ?? style;
  const sizeOption = getSizeOptions(parseBasePrice(bouquetPrice)).find((o) => o.id === size);
  const sizeLabel = sizeOption
    ? sizeOption.price
      ? `${sizeOption.label} (${sizeOption.price})`
      : sizeOption.label
    : size;

  const lines = [
    `Hi Rhoda! I'd love something similar to the "${bouquetTitle}" bouquet.`,
    "",
    `Color scheme: ${colorLabel}`,
    `Style: ${styleLabel}`,
    `Size: ${sizeLabel}`,
  ];

  if (note.trim()) {
    lines.push("", `A few more details: ${note.trim()}`);
  }

  lines.push("", "Thanks!");
  return lines.join("\n");
}

function OptionGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: readonly { id: T; label: string; hint: string; price?: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-charcoal mb-3">{legend}</legend>
      <div className="grid sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <label
            key={option.id}
            className={`cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
              value === option.id
                ? "border-sage bg-sage/10"
                : "border-sage/20 hover:border-sage/40 bg-cream"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="sr-only"
            />
            <span className="block text-sm font-medium text-charcoal">{option.label}</span>
            <span className="block text-xs text-warm-brown/70 mt-0.5">
              {option.hint}
              {option.price ? (
                <>
                  {" · "}
                  <span className="text-terracotta font-medium">{option.price}</span>
                </>
              ) : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function BouquetInquiry({
  bouquetId,
  bouquetTitle,
  bouquetPrice,
  contactEmail,
}: BouquetInquiryProps) {
  const defaults = getBouquetPreferences(bouquetId, bouquetPrice);
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState<ColorId>(defaults.color);
  const [style, setStyle] = useState<StyleId>(defaults.style);
  const [size, setSize] = useState<SizeId>(defaults.size);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const email = getContactEmail(contactEmail);

  function applyDefaults() {
    const preferences = getBouquetPreferences(bouquetId, bouquetPrice);
    setColor(preferences.color);
    setStyle(preferences.style);
    setSize(preferences.size);
    setNote("");
    setSubmitted(false);
  }

  function handleOpen() {
    applyDefaults();
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function resetForm() {
    applyDefaults();
  }

  function handleClose() {
    setOpen(false);
    resetForm();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const message = buildMessage(bouquetTitle, color, style, size, note, bouquetPrice);
    const subject = `Bouquet request: ${bouquetTitle}`;
    const mailtoUrl = buildMailtoUrl(email, subject, message);

    window.location.href = mailtoUrl;
    setSubmitted(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="mt-4 inline-flex items-center gap-2 text-sage-dark font-medium hover:text-sage transition-colors"
      >
        I&apos;d like something similar
        <span aria-hidden="true">&rarr;</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-charcoal/60"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bouquet-inquiry-title"
        >
          <div
            className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-cream rounded-t-3xl sm:rounded-3xl shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-warm-brown/60 hover:text-charcoal transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-4">
                  <p className="font-display text-2xl text-charcoal mb-3">Check your email</p>
                  <p className="text-warm-brown/80 text-sm leading-relaxed mb-6">
                    Your request for something similar to{" "}
                    <span className="font-medium text-charcoal">{bouquetTitle}</span> should open
                    in your email app. Send the message to Rhoda at{" "}
                    <span className="font-medium text-charcoal">{email}</span> to finish your
                    request.
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-8 py-3 bg-sage text-cream rounded-full font-medium hover:bg-sage-dark transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sage text-xs uppercase tracking-[0.2em] mb-2">
                    Custom request
                  </p>
                  <h2 id="bouquet-inquiry-title" className="font-display text-2xl text-charcoal mb-1 pr-8">
                    Something like {bouquetTitle}
                  </h2>
                  <p className="text-warm-brown/80 text-sm mb-6">
                    Pick a few preferences and we&apos;ll open your email with the request ready to
                    send to Rhoda.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <OptionGroup
                      legend="Color scheme"
                      name="color"
                      options={COLOR_OPTIONS}
                      value={color}
                      onChange={setColor}
                    />

                    <OptionGroup
                      legend="Style"
                      name="style"
                      options={STYLE_OPTIONS}
                      value={style}
                      onChange={setStyle}
                    />

                    <OptionGroup
                      legend="Size"
                      name="size"
                      options={getSizeOptions(parseBasePrice(bouquetPrice))}
                      value={size}
                      onChange={setSize}
                    />

                    <div>
                      <label
                        htmlFor="bouquet-note"
                        className="block text-sm font-medium text-charcoal mb-2"
                      >
                        Anything else? <span className="font-normal text-warm-brown/60">(optional)</span>
                      </label>
                      <textarea
                        id="bouquet-note"
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        rows={3}
                        placeholder="Pickup date, occasion, flowers to include or avoid..."
                        className="w-full rounded-xl border border-sage/20 bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-warm-brown/40 focus:outline-none focus:border-sage/50 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full px-8 py-3.5 bg-terracotta text-cream rounded-full font-medium hover:bg-terracotta-dark transition-colors"
                    >
                      Send bouquet request
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
