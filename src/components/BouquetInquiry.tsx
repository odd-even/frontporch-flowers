"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const CUSTOM_DATE_ID = "custom" as const;
const SAME_DAY_CUTOFF_HOUR = 10;
type PickupDateId = string;

type DayOption = {
  id: string;
  weekday: string;
  day: string;
  month: string;
  fullLabel: string;
  available: boolean;
  isToday: boolean;
  hoursLeft?: number;
};

function startOfLocalDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(12, 0, 0, 0);
  return next;
}

function formatDateId(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getSameDayCutoff(now = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setHours(SAME_DAY_CUTOFF_HOUR, 0, 0, 0);
  return cutoff;
}

function getHoursUntilSameDayCutoff(now = new Date()): number {
  const ms = getSameDayCutoff(now).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60)));
}

function isSameDayStillAvailable(now = new Date()): boolean {
  return now.getTime() < getSameDayCutoff(now).getTime();
}

function formatHoursLeft(hours: number): string {
  if (hours <= 0) return "0 hrs left";
  if (hours === 1) return "1 hr left";
  return `${hours} hrs left`;
}

function getUpcomingDays(count = 7, now = new Date()): DayOption[] {
  const today = startOfLocalDay(now);
  const sameDayAvailable = isSameDayStillAvailable(now);
  const hoursLeft = sameDayAvailable ? getHoursUntilSameDayCutoff(now) : undefined;

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const isToday = index === 0;

    return {
      id: formatDateId(date),
      weekday: date.toLocaleDateString("en-CA", { weekday: "short" }),
      day: String(date.getDate()),
      month: date.toLocaleDateString("en-CA", { month: "short" }),
      fullLabel: date.toLocaleDateString("en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      available: isToday ? sameDayAvailable : true,
      isToday,
      hoursLeft: isToday ? hoursLeft : undefined,
    };
  });
}

function getDefaultPickupDate(dayOptions: DayOption[]): PickupDateId {
  return dayOptions.find((day) => day.available)?.id ?? dayOptions[1]?.id ?? dayOptions[0]?.id ?? "";
}

function formatPickupLabel(
  pickupDate: PickupDateId,
  customDateNote: string,
  dayOptions: DayOption[]
): string {
  if (pickupDate === CUSTOM_DATE_ID) {
    const detail = customDateNote.trim();
    return detail
      ? `Custom date (to discuss): ${detail}`
      : "Custom date — happy to discuss timing with Rhoda";
  }

  const day = dayOptions.find((option) => option.id === pickupDate);
  return day?.fullLabel ?? pickupDate;
}

const COLOR_OPTIONS = [
  { id: "soft", label: "Soft", hint: "gentle, quiet seasonal tones" },
  { id: "bright", label: "Bright", hint: "bold colour, lively mix" },
  { id: "surprise", label: "Surprise me", hint: "Rhoda picks from what's blooming" },
] as const;

export const PRESENTATION_OPTIONS = [
  {
    id: "sleeve",
    label: "In a sleeve",
    shortLabel: "Sleeve",
    hint: "wrapped for carrying",
    imageSrc: "/photos/boquets/sleeve-arrangement.png",
  },
  {
    id: "vase",
    label: "In a vase",
    shortLabel: "Vase",
    hint: "ready to place",
    imageSrc: "/photos/boquets/vase-arrangement.png",
  },
  {
    id: "mason-jar",
    label: "In a mason jar",
    shortLabel: "Mason jar",
    hint: "casual & charming",
    imageSrc: "/photos/boquets/mason-jar-arrangement.png",
  },
  {
    id: "bucket",
    label: "In a bucket",
    shortLabel: "Bucket",
    hint: "garden-gather style",
    imageSrc: "/photos/boquets/bucket-arrangement.png",
  },
  {
    id: "custom",
    label: "Custom",
    shortLabel: "Custom",
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
export type PresentationId = (typeof PRESENTATION_OPTIONS)[number]["id"];
type QuantityId = (typeof QUANTITY_OPTIONS)[number]["id"];

type BouquetPreferences = {
  color: ColorId;
  presentation: PresentationId;
  quantity: QuantityId;
};

const DEFAULT_PREFERENCES: BouquetPreferences = {
  color: "soft",
  presentation: "sleeve",
  quantity: "1",
};

const BOUQUET_DEFAULTS: Record<string, BouquetPreferences> = {
  "for-your-event": {
    color: "surprise",
    presentation: "custom",
    quantity: "1",
  },
  "front-porch-classic": {
    color: "bright",
    presentation: "sleeve",
    quantity: "1",
  },
  "garden-posy": {
    color: "soft",
    presentation: "sleeve",
    quantity: "1",
  },
  "porch-swing": {
    color: "soft",
    presentation: "vase",
    quantity: "1",
  },
  "anniversary-bouquet": {
    color: "soft",
    presentation: "vase",
    quantity: "1",
  },
  "late-summer-glow": {
    color: "bright",
    presentation: "vase",
    quantity: "1",
  },
  "meadow-jar": {
    color: "soft",
    presentation: "mason-jar",
    quantity: "1",
  },
};

function getBouquetPreferences(bouquetId?: string): BouquetPreferences {
  if (bouquetId && BOUQUET_DEFAULTS[bouquetId]) {
    return BOUQUET_DEFAULTS[bouquetId];
  }
  return DEFAULT_PREFERENCES;
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
  presentation: PresentationId,
  quantity: QuantityId,
  pickupDate: PickupDateId,
  customDateNote: string,
  note: string,
  options?: { finishFirst?: boolean; dayOptions?: DayOption[] }
) {
  const colorLabel = COLOR_OPTIONS.find((o) => o.id === color)?.label ?? color;
  const presentationLabel =
    PRESENTATION_OPTIONS.find((o) => o.id === presentation)?.label ?? presentation;
  const quantityLabel = QUANTITY_OPTIONS.find((o) => o.id === quantity)?.label ?? quantity;
  const pickupLabel = formatPickupLabel(
    pickupDate,
    customDateNote,
    options?.dayOptions ?? getUpcomingDays()
  );

  const intro = options?.finishFirst
    ? `Hi Rhoda! I'd like a bouquet finished ${presentationLabel.toLowerCase()}.`
    : `Hi Rhoda! I'd love something similar to the "${bouquetTitle}" bouquet.`;

  const lines = [
    intro,
    "",
    `Quantity: ${quantityLabel}`,
    `Color scheme: ${colorLabel}`,
    `Presentation: ${presentationLabel}`,
    `Pickup / ready by: ${pickupLabel}`,
  ];

  if (note.trim()) {
    lines.push("", `A few more details: ${note.trim()}`);
  }

  lines.push("", "Thanks!");
  return lines.join("\n");
}

function PickupDatePicker({
  value,
  onChange,
  customDateNote,
  onCustomDateNoteChange,
  dayOptions,
}: {
  value: PickupDateId;
  onChange: (id: PickupDateId) => void;
  customDateNote: string;
  onCustomDateNoteChange: (value: string) => void;
  dayOptions: DayOption[];
}) {
  const isCustom = value === CUSTOM_DATE_ID;

  return (
    <fieldset>
      <legend className="text-sm font-medium text-charcoal mb-3">Pickup / ready by</legend>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {dayOptions.map((day) => {
          const isSelected = value === day.id;
          const showHoursLeft = day.isToday && day.available && day.hoursLeft != null;

          return (
            <label
              key={day.id}
              className={`rounded-xl border px-1.5 py-2.5 text-center transition-colors ${
                !day.available
                  ? "cursor-not-allowed border-sage/10 bg-cream/50 opacity-35"
                  : day.isToday
                    ? isSelected
                      ? "cursor-pointer border-sage bg-sage/10 opacity-70"
                      : "cursor-pointer border-sage/20 bg-cream opacity-55 hover:opacity-80 hover:border-sage/40"
                    : isSelected
                      ? "cursor-pointer border-sage bg-sage/10"
                      : "cursor-pointer border-sage/20 hover:border-sage/40 bg-cream"
              }`}
            >
              <input
                type="radio"
                name="pickup-date"
                value={day.id}
                checked={isSelected}
                disabled={!day.available}
                onChange={() => {
                  if (day.available) onChange(day.id);
                }}
                className="sr-only"
              />
              <span className="block text-[10px] uppercase tracking-wide text-warm-brown/70">
                {day.weekday}
              </span>
              <span className="block text-base font-medium text-charcoal leading-tight mt-0.5">
                {day.day}
              </span>
              <span className="block text-[10px] text-warm-brown/60 mt-0.5">
                {showHoursLeft ? formatHoursLeft(day.hoursLeft!) : day.month}
              </span>
            </label>
          );
        })}
      </div>

      <label
        className={`mt-2 flex cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
          isCustom
            ? "border-sage bg-sage/10"
            : "border-sage/20 hover:border-sage/40 bg-cream"
        }`}
      >
        <input
          type="radio"
          name="pickup-date"
          value={CUSTOM_DATE_ID}
          checked={isCustom}
          onChange={() => onChange(CUSTOM_DATE_ID)}
          className="sr-only"
        />
        <span>
          <span className="block text-sm font-medium text-charcoal">Custom date</span>
          <span className="block text-xs text-warm-brown/70 mt-0.5">
            Outside this week — happy to discuss with Rhoda
          </span>
        </span>
      </label>

      {isCustom && (
        <div className="mt-3">
          <label
            htmlFor="custom-pickup-date"
            className="block text-sm font-medium text-charcoal mb-2"
          >
            Preferred date or timing
          </label>
          <textarea
            id="custom-pickup-date"
            value={customDateNote}
            onChange={(event) => onCustomDateNoteChange(event.target.value)}
            rows={2}
            placeholder="e.g. Saturday Aug 15 for a wedding, or anytime next month…"
            className="w-full rounded-xl border border-sage/20 bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-warm-brown/40 focus:outline-none focus:border-sage/50 resize-none"
          />
        </div>
      )}
    </fieldset>
  );
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

function PresentationChooser({
  value,
  onChange,
}: {
  value: PresentationId;
  onChange: (id: PresentationId) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-charcoal mb-3">Arrangement</legend>
      <div className="grid grid-cols-5 gap-2">
        {PRESENTATION_OPTIONS.map((option) => {
          const isSelected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`group text-center transition-opacity ${
                isSelected ? "opacity-100" : "opacity-35 hover:opacity-70"
              }`}
              aria-label={option.label}
              aria-pressed={isSelected}
            >
              <span
                className={`relative block w-full aspect-[3/4] overflow-hidden rounded-lg border bg-cream ${
                  isSelected
                    ? "border-sage ring-1 ring-sage/40"
                    : "border-sage/15 group-hover:border-sage/40"
                }`}
              >
                <Image
                  src={option.imageSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </span>
              <span
                className={`mt-1.5 block text-[10px] sm:text-xs leading-tight ${
                  isSelected ? "font-medium text-charcoal" : "text-warm-brown/70"
                }`}
              >
                {option.shortLabel}
              </span>
            </button>
          );
        })}
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
  quantity,
  setQuantity,
  color,
  setColor,
  pickupDate,
  setPickupDate,
  customDateNote,
  setCustomDateNote,
  dayOptions,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  note,
  setNote,
  submitted,
  submitting,
  submitError,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  presentation: PresentationId;
  setPresentation?: (id: PresentationId) => void;
  quantity: QuantityId;
  setQuantity: (id: QuantityId) => void;
  color: ColorId;
  setColor: (id: ColorId) => void;
  pickupDate: PickupDateId;
  setPickupDate: (id: PickupDateId) => void;
  customDateNote: string;
  setCustomDateNote: (value: string) => void;
  dayOptions: DayOption[];
  customerName: string;
  setCustomerName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  submitted: boolean;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (event: React.FormEvent) => void;
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
              <p className="font-display text-2xl text-charcoal mb-3">Request sent</p>
              <p className="text-warm-brown/80 text-sm leading-relaxed mb-6">
                Thanks! Your bouquet request is on its way to Rhoda. She&apos;ll follow up by email
                soon.
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
              <p className="text-warm-brown/80 text-sm mb-6">{description}</p>

              <form onSubmit={onSubmit} className="space-y-6">
                {setPresentation && (
                  <PresentationChooser value={presentation} onChange={setPresentation} />
                )}

                <OptionGroup
                  legend="How many bouquets?"
                  name="quantity"
                  options={QUANTITY_OPTIONS}
                  value={quantity}
                  onChange={setQuantity}
                />

                <PickupDatePicker
                  value={pickupDate}
                  onChange={setPickupDate}
                  customDateNote={customDateNote}
                  onCustomDateNoteChange={setCustomDateNote}
                  dayOptions={dayOptions}
                />

                <OptionGroup
                  legend="Color"
                  name="color"
                  options={COLOR_OPTIONS}
                  value={color}
                  onChange={setColor}
                />

                <div className="space-y-3">
                  <p className="text-sm font-medium text-charcoal">Your contact details</p>
                  <div>
                    <label htmlFor="customer-name" className="sr-only">
                      Name
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Name (optional)"
                      autoComplete="name"
                      className="w-full rounded-xl border border-sage/20 bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-warm-brown/40 focus:outline-none focus:border-sage/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="customer-email"
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                      placeholder="Email"
                      autoComplete="email"
                      className="w-full rounded-xl border border-sage/20 bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-warm-brown/40 focus:outline-none focus:border-sage/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-phone" className="sr-only">
                      Phone
                    </label>
                    <input
                      id="customer-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="Phone (optional)"
                      autoComplete="tel"
                      className="w-full rounded-xl border border-sage/20 bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-warm-brown/40 focus:outline-none focus:border-sage/50"
                    />
                  </div>
                </div>

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
                    placeholder="Occasion, Soft or Bright preference, anything to avoid..."
                    className="w-full rounded-xl border border-sage/20 bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-warm-brown/40 focus:outline-none focus:border-sage/50 resize-none"
                  />
                </div>

                {submitError && (
                  <p className="text-sm text-terracotta" role="alert">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-8 py-3.5 bg-terracotta text-cream rounded-full font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Send bouquet request"}
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
}: BouquetInquiryProps) {
  const defaults = getBouquetPreferences(bouquetId);
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState<ColorId>(defaults.color);
  const [presentation, setPresentation] = useState<PresentationId>(defaults.presentation);
  const [quantity, setQuantity] = useState<QuantityId>(defaults.quantity);
  const [pickupDate, setPickupDate] = useState<PickupDateId>("");
  const [customDateNote, setCustomDateNote] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dayOptions = useMemo(() => getUpcomingDays(), [open]);

  function applyDefaults() {
    const preferences = getBouquetPreferences(bouquetId);
    const days = getUpcomingDays();
    setColor(preferences.color);
    setPresentation(preferences.presentation);
    setQuantity(preferences.quantity);
    setPickupDate(getDefaultPickupDate(days));
    setCustomDateNote("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setNote("");
    setSubmitted(false);
    setSubmitting(false);
    setSubmitError(null);
  }

  function handleOpen() {
    applyDefaults();
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    applyDefaults();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    const message = buildMessage(
      bouquetTitle,
      color,
      presentation,
      quantity,
      pickupDate,
      customDateNote,
      note,
      { dayOptions }
    );
    const subject = `Bouquet request: ${bouquetTitle}`;

    try {
      const response = await fetch("/api/bouquet-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setSubmitError(data.error || "Could not send the request. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Could not send the request. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
        description="Pick a few preferences and send your request straight to Rhoda."
        presentation={presentation}
        setPresentation={setPresentation}
        quantity={quantity}
        setQuantity={setQuantity}
        color={color}
        setColor={setColor}
        pickupDate={pickupDate}
        setPickupDate={setPickupDate}
        customDateNote={customDateNote}
        setCustomDateNote={setCustomDateNote}
        dayOptions={dayOptions}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerEmail={customerEmail}
        setCustomerEmail={setCustomerEmail}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        note={note}
        setNote={setNote}
        submitted={submitted}
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleSubmit}
      />
    </>
  );
}

/** Home-page finish cards: sleeve, vase, mason jar, bucket, custom. */
export function FinishRequestPicker({ contactEmail }: { contactEmail?: string }) {
  void contactEmail;
  const [open, setOpen] = useState(false);
  const [presentation, setPresentation] = useState<PresentationId>("sleeve");
  const [color, setColor] = useState<ColorId>(DEFAULT_PREFERENCES.color);
  const [quantity, setQuantity] = useState<QuantityId>(DEFAULT_PREFERENCES.quantity);
  const [pickupDate, setPickupDate] = useState<PickupDateId>("");
  const [customDateNote, setCustomDateNote] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dayOptions = useMemo(() => getUpcomingDays(), [open]);

  function resetForm(nextPresentation: PresentationId = presentation) {
    const days = getUpcomingDays();
    setPresentation(nextPresentation);
    setColor(DEFAULT_PREFERENCES.color);
    setQuantity(DEFAULT_PREFERENCES.quantity);
    setPickupDate(getDefaultPickupDate(days));
    setCustomDateNote("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setNote("");
    setSubmitted(false);
    setSubmitting(false);
    setSubmitError(null);
  }

  function handlePick(id: PresentationId) {
    resetForm(id);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    resetForm();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    const presentationLabel =
      PRESENTATION_OPTIONS.find((o) => o.id === presentation)?.label ?? presentation;
    const message = buildMessage(
      presentationLabel,
      color,
      presentation,
      quantity,
      pickupDate,
      customDateNote,
      note,
      { finishFirst: true, dayOptions }
    );
    const subject = `Bouquet request: ${presentationLabel}`;

    try {
      const response = await fetch("/api/bouquet-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setSubmitError(data.error || "Could not send the request. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Could not send the request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const presentationLabel =
    PRESENTATION_OPTIONS.find((o) => o.id === presentation)?.label ?? "Bouquet";

  return (
    <div>
      <div className="mb-8">
        <p className="text-sage text-sm uppercase tracking-[0.2em] mb-2">Request a bouquet</p>
        <h3 className="font-display text-2xl md:text-3xl text-charcoal mb-2">
          Choose an arrangement option.
        </h3>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {PRESENTATION_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handlePick(option.id)}
            className="group text-left rounded-2xl border border-sage/15 bg-white overflow-hidden hover:border-sage/40 transition-colors"
          >
            <span className="relative block aspect-[3/4] overflow-hidden rounded-b-2xl bg-cream-dark">
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
        description="Choose colour and timing — then send your request to Rhoda."
        presentation={presentation}
        setPresentation={setPresentation}
        quantity={quantity}
        setQuantity={setQuantity}
        color={color}
        setColor={setColor}
        pickupDate={pickupDate}
        setPickupDate={setPickupDate}
        customDateNote={customDateNote}
        setCustomDateNote={setCustomDateNote}
        dayOptions={dayOptions}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerEmail={customerEmail}
        setCustomerEmail={setCustomerEmail}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        note={note}
        setNote={setNote}
        submitted={submitted}
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
