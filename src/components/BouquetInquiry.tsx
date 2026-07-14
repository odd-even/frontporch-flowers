"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { buildMailtoUrl, getContactEmail } from "@/lib/email";

const COLOR_OPTIONS = [
  { id: "soft", label: "Soft", hint: "gentle, quiet seasonal tones" },
  { id: "bright", label: "Bright", hint: "bold colour, lively mix" },
  { id: "surprise", label: "Surprise me", hint: "Rhoda picks from what's blooming" },
] as const;

const SIZE_OPTIONS = [
  { id: "petite", label: "Petite", hint: "desk or bedside" },
  { id: "medium", label: "Medium", hint: "everyday table size" },
  { id: "generous", label: "Generous", hint: "statement piece" },
  { id: "unsure", label: "Not sure", hint: "happy for Rhoda's suggestion" },
] as const;

export const PRESENTATION_OPTIONS = [
  {
    id: "sleeve",
    label: "In a sleeve",
    hint: "wrapped for carrying",
    imageSrc: "/photos/boquets/556484266_122105077845020895_3847170219576850714_n.jpg",
  },
  {
    id: "vase",
    label: "In a vase",
    hint: "ready to place",
    imageSrc: "/photos/boquets/702572655_122133553461020895_5304639158855184104_n.jpg",
  },
  {
    id: "mason-jar",
    label: "In a mason jar",
    hint: "casual & charming",
    imageSrc: "/photos/boquets/729276999_122136899331020895_216954514993060721_n.jpg",
  },
  {
    id: "bucket",
    label: "In a bucket",
    hint: "garden-gather style",
    imageSrc: "/photos/boquets/552223925_122103898959020895_6852126795117702538_n.jpg",
  },
  {
    id: "custom",
    label: "Custom",
    hint: "your own idea",
    imageSrc: "/photos/boquets/547207860_122098033839020895_4924931008274506536_n.jpg",
  },
] as const;

const QUANTITY_OPTIONS = [
  { id: "1", label: "1", hint: "a single bouquet" },
  { id: "2", label: "2", hint: "a pair" },
  { id: "3", label: "3", hint: "a small set" },
  { id: "4+", label: "4+", hint: "larger order" },
] as const;

type ColorId = (typeof COLOR_OPTIONS)[number]["id"];
type SizeId = (typeof SIZE_OPTIONS)[number]["id"];
export type PresentationId = (typeof PRESENTATION_OPTIONS)[number]["id"];
type QuantityId = (typeof QUANTITY_OPTIONS)[number]["id"];

type BouquetPreferences = {
  color: ColorId;
  size: SizeId;
  presentation: PresentationId;
  quantity: QuantityId;
};

const DEFAULT_PREFERENCES: BouquetPreferences = {
  color: "soft",
  size: "medium",
  presentation: "sleeve",
  quantity: "1",
};

const BOUQUET_DEFAULTS: Record<string, BouquetPreferences> = {
  "for-your-event": {
    color: "surprise",
    size: "medium",
    presentation: "custom",
    quantity: "1",
  },
  "front-porch-classic": {
    color: "bright",
    size: "medium",
    presentation: "sleeve",
    quantity: "1",
  },
  "garden-posy": {
    color: "soft",
    size: "petite",
    presentation: "sleeve",
    quantity: "1",
  },
  "porch-swing": {
    color: "soft",
    size: "medium",
    presentation: "vase",
    quantity: "1",
  },
  "anniversary-bouquet": {
    color: "soft",
    size: "medium",
    presentation: "vase",
    quantity: "1",
  },
  "late-summer-glow": {
    color: "bright",
    size: "generous",
    presentation: "vase",
    quantity: "1",
  },
  "meadow-jar": {
    color: "soft",
    size: "petite",
    presentation: "mason-jar",
    quantity: "1",
  },
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
  size: SizeId,
  presentation: PresentationId,
  quantity: QuantityId,
  note: string,
  bouquetPrice?: string,
  options?: { finishFirst?: boolean }
) {
  const colorLabel = COLOR_OPTIONS.find((o) => o.id === color)?.label ?? color;
  const presentationLabel =
    PRESENTATION_OPTIONS.find((o) => o.id === presentation)?.label ?? presentation;
  const quantityLabel = QUANTITY_OPTIONS.find((o) => o.id === quantity)?.label ?? quantity;
  const sizeOption = getSizeOptions(parseBasePrice(bouquetPrice)).find((o) => o.id === size);
  const sizeLabel = sizeOption
    ? sizeOption.price
      ? `${sizeOption.label} (${sizeOption.price})`
      : sizeOption.label
    : size;

  const intro = options?.finishFirst
    ? `Hi Rhoda! I'd like a bouquet finished ${presentationLabel.toLowerCase()}.`
    : `Hi Rhoda! I'd love something similar to the "${bouquetTitle}" bouquet.`;

  const lines = [
    intro,
    "",
    `Quantity: ${quantityLabel}`,
    `Color scheme: ${colorLabel}`,
    `Size: ${sizeLabel}`,
    `Presentation: ${presentationLabel}`,
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
  withImages = false,
}: {
  legend: string;
  name: string;
  options: readonly { id: T; label: string; hint: string; price?: string; imageSrc?: string }[];
  value: T;
  onChange: (id: T) => void;
  withImages?: boolean;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-charcoal mb-3">{legend}</legend>
      <div className="grid sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <label
            key={option.id}
            className={`cursor-pointer rounded-xl border overflow-hidden transition-colors ${
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
            {withImages && option.imageSrc && (
              <span className="relative block aspect-[4/3] bg-cream-dark">
                <Image
                  src={option.imageSrc}
                  alt={option.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 240px"
                />
              </span>
            )}
            <span className="block px-4 py-3">
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
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function InquiryModal({
  open,
  onClose,
  title,
  description,
  presentation,
  setPresentation,
  showPresentation,
  quantity,
  setQuantity,
  color,
  setColor,
  size,
  setSize,
  note,
  setNote,
  submitted,
  onSubmit,
  email,
  bouquetPrice,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  presentation: PresentationId;
  setPresentation?: (id: PresentationId) => void;
  showPresentation: boolean;
  quantity: QuantityId;
  setQuantity: (id: QuantityId) => void;
  color: ColorId;
  setColor: (id: ColorId) => void;
  size: SizeId;
  setSize: (id: SizeId) => void;
  note: string;
  setNote: (value: string) => void;
  submitted: boolean;
  onSubmit: (event: React.FormEvent) => void;
  email: string;
  bouquetPrice?: string;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const presentationLabel =
    PRESENTATION_OPTIONS.find((o) => o.id === presentation)?.label ?? presentation;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-charcoal/60"
      onClick={onClose}
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
          onClick={onClose}
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
                Your bouquet request should open in your email app. Send the message to Rhoda at{" "}
                <span className="font-medium text-charcoal">{email}</span> to finish.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 bg-sage text-cream rounded-full font-medium hover:bg-sage-dark transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-sage text-xs uppercase tracking-[0.2em] mb-2">Custom request</p>
              <h2
                id="bouquet-inquiry-title"
                className="font-display text-2xl text-charcoal mb-1 pr-8"
              >
                {title}
              </h2>
              {!showPresentation && (
                <p className="text-terracotta text-sm font-medium mb-2">{presentationLabel}</p>
              )}
              <p className="text-warm-brown/80 text-sm mb-6">{description}</p>

              <form onSubmit={onSubmit} className="space-y-6">
                <OptionGroup
                  legend="How many bouquets?"
                  name="quantity"
                  options={QUANTITY_OPTIONS}
                  value={quantity}
                  onChange={setQuantity}
                />

                <OptionGroup
                  legend="Color"
                  name="color"
                  options={COLOR_OPTIONS}
                  value={color}
                  onChange={setColor}
                />

                <OptionGroup
                  legend="Size"
                  name="size"
                  options={getSizeOptions(parseBasePrice(bouquetPrice))}
                  value={size}
                  onChange={setSize}
                />

                {showPresentation && setPresentation && (
                  <OptionGroup
                    legend="How should it be finished?"
                    name="presentation"
                    options={PRESENTATION_OPTIONS}
                    value={presentation}
                    onChange={setPresentation}
                    withImages
                  />
                )}

                <div>
                  <label
                    htmlFor="bouquet-note"
                    className="block text-sm font-medium text-charcoal mb-2"
                  >
                    Anything else?{" "}
                    <span className="font-normal text-warm-brown/60">(optional)</span>
                  </label>
                  <textarea
                    id="bouquet-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="Pickup date, occasion, Soft or Bright preference, anything to avoid..."
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
  const [size, setSize] = useState<SizeId>(defaults.size);
  const [presentation, setPresentation] = useState<PresentationId>(defaults.presentation);
  const [quantity, setQuantity] = useState<QuantityId>(defaults.quantity);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const email = getContactEmail(contactEmail);

  function applyDefaults() {
    const preferences = getBouquetPreferences(bouquetId, bouquetPrice);
    setColor(preferences.color);
    setSize(preferences.size);
    setPresentation(preferences.presentation);
    setQuantity(preferences.quantity);
    setNote("");
    setSubmitted(false);
  }

  function handleOpen() {
    applyDefaults();
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    applyDefaults();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const message = buildMessage(
      bouquetTitle,
      color,
      size,
      presentation,
      quantity,
      note,
      bouquetPrice
    );
    const subject = `Bouquet request: ${bouquetTitle}`;
    window.location.href = buildMailtoUrl(email, subject, message);
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

      <InquiryModal
        open={open}
        onClose={handleClose}
        title={`Something like ${bouquetTitle}`}
        description="Pick a few preferences and we'll open your email with the request ready to send to Rhoda."
        presentation={presentation}
        setPresentation={setPresentation}
        showPresentation
        quantity={quantity}
        setQuantity={setQuantity}
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        note={note}
        setNote={setNote}
        submitted={submitted}
        onSubmit={handleSubmit}
        email={email}
        bouquetPrice={bouquetPrice}
      />
    </>
  );
}

/** Home-page finish cards: sleeve, vase, mason jar, bucket, custom → color + size. */
export function FinishRequestPicker({ contactEmail }: { contactEmail?: string }) {
  const email = getContactEmail(contactEmail);
  const [open, setOpen] = useState(false);
  const [presentation, setPresentation] = useState<PresentationId>("sleeve");
  const [color, setColor] = useState<ColorId>(DEFAULT_PREFERENCES.color);
  const [size, setSize] = useState<SizeId>(DEFAULT_PREFERENCES.size);
  const [quantity, setQuantity] = useState<QuantityId>(DEFAULT_PREFERENCES.quantity);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function resetForm(nextPresentation: PresentationId = presentation) {
    setPresentation(nextPresentation);
    setColor(DEFAULT_PREFERENCES.color);
    setSize(DEFAULT_PREFERENCES.size);
    setQuantity(DEFAULT_PREFERENCES.quantity);
    setNote("");
    setSubmitted(false);
  }

  function handlePick(id: PresentationId) {
    resetForm(id);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    resetForm();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const presentationLabel =
      PRESENTATION_OPTIONS.find((o) => o.id === presentation)?.label ?? presentation;
    const message = buildMessage(
      presentationLabel,
      color,
      size,
      presentation,
      quantity,
      note,
      undefined,
      { finishFirst: true }
    );
    const subject = `Bouquet request: ${presentationLabel}`;
    window.location.href = buildMailtoUrl(email, subject, message);
    setSubmitted(true);
  }

  const presentationLabel =
    PRESENTATION_OPTIONS.find((o) => o.id === presentation)?.label ?? "Bouquet";

  return (
    <div className="mt-12 md:mt-16">
      <div className="mb-8">
        <p className="text-sage text-sm uppercase tracking-[0.2em] mb-2">Choose a finish</p>
        <h3 className="font-display text-2xl md:text-3xl text-charcoal mb-2">
          How would you like your bouquet?
        </h3>
        <p className="text-warm-brown/80 text-sm md:text-base max-w-2xl">
          Pick a finish, then choose colour and size. We&apos;ll open an email to Rhoda with your
          request ready to send.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {PRESENTATION_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handlePick(option.id)}
            className="group text-left rounded-2xl border border-sage/15 bg-cream overflow-hidden hover:border-sage/40 transition-colors"
          >
            <span className="relative block aspect-[4/3] bg-cream-dark">
              <Image
                src={option.imageSrc}
                alt={option.label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </span>
            <span className="block px-5 py-4">
              <span className="block font-display text-xl text-charcoal mb-1">{option.label}</span>
              <span className="block text-sm text-warm-brown/70">{option.hint}</span>
            </span>
          </button>
        ))}
      </div>

      <InquiryModal
        open={open}
        onClose={handleClose}
        title={presentationLabel}
        description="Choose colour and size — then send your request to Rhoda."
        presentation={presentation}
        showPresentation={false}
        quantity={quantity}
        setQuantity={setQuantity}
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        note={note}
        setNote={setNote}
        submitted={submitted}
        onSubmit={handleSubmit}
        email={email}
      />
    </div>
  );
}
