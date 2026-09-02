"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowIcon } from "@/components/ArrowIcon";
import {
  bouquetOrderTotalCents,
  canCheckoutBouquet,
  formatCents,
} from "@/lib/bouquet-pricing";

const CUSTOM_DATE_ID = "custom" as const;
const SAME_DAY_CUTOFF_HOUR = 10;
/** Fri–Mon are not available for pickup in the weekly picker. */
const UNAVAILABLE_PICKUP_WEEKDAYS = new Set([0, 1, 5, 6]); // Sun, Mon, Fri, Sat
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

function isPickupWeekdayAvailable(date: Date): boolean {
  return !UNAVAILABLE_PICKUP_WEEKDAYS.has(date.getDay());
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
      available:
        isPickupWeekdayAvailable(date) && (isToday ? sameDayAvailable : true),
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
      : "Custom date — discuss timing with Rhoda";
  }

  const day = dayOptions.find((option) => option.id === pickupDate);
  return day?.fullLabel ?? pickupDate;
}

const COLOR_OPTIONS = [
  { id: "soft", label: "Soft", hint: "gentle, quiet tones" },
  { id: "bright", label: "Bright", hint: "bold colour, lively mix" },
  { id: "surprise", label: "Surprise me", hint: "Rhoda picks from what's blooming" },
] as const;

export const PRESENTATION_OPTIONS = [
  {
    id: "sleeve",
    label: "In a sleeve",
    shortLabel: "Sleeve",
    hint: "wrapped for carrying",
    price: "$26",
    imageSrc: "/photos/boquets/sleeve-arrangement.webp",
  },
  {
    id: "vase",
    label: "In a vase",
    shortLabel: "Vase",
    hint: "ready to place",
    price: "$46",
    imageSrc: "/photos/boquets/vase-arrangement.png",
  },
  {
    id: "mason-jar",
    label: "In a mason jar",
    shortLabel: "Mason jar",
    hint: "casual & charming",
    price: "$19",
    imageSrc: "/photos/boquets/mason-jar-arrangement.jpg",
  },
  {
    id: "gift-bag-posie",
    label: "Gift bag posie",
    shortLabel: "Gift bag",
    hint: "ready to gift",
    price: "$21",
    imageSrc: "/photos/boquets/gift-bag-posie.jpg",
  },
  {
    id: "bucket",
    label: "In a bucket",
    shortLabel: "Bucket",
    hint: "garden-gather style",
    price: "Get in touch",
    imageSrc: "/photos/boquets/bucket-img-3993.jpg",
  },
  {
    id: "custom",
    label: "Custom",
    shortLabel: "Custom",
    hint: "your own idea",
    price: "Get in touch",
    imageSrc: "/photos/boquets/custom-arrangement.jpg",
  },
] as const;

const QUANTITY_OPTIONS = [
  { id: "1", label: "1", hint: "" },
  { id: "2", label: "2", hint: "" },
  { id: "3", label: "3", hint: "" },
  { id: "4+", label: "4+", hint: "send a request" },
] as const;

type ColorId = (typeof COLOR_OPTIONS)[number]["id"];
export type PresentationId = (typeof PRESENTATION_OPTIONS)[number]["id"];
type QuantityId = (typeof QUANTITY_OPTIONS)[number]["id"];

const QUANTITY_ORDER: QuantityId[] = ["1", "2", "3", "4+"];

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
  squareReady?: boolean;
}

async function submitBouquetEmail({
  subject,
  message,
  customerName,
  customerEmail,
  customerPhone,
}: {
  subject: string;
  message: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
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
    throw new Error(data.error || "Could not send the request. Please try again.");
  }
}

async function submitBouquetPay({
  presentation,
  quantity,
  color,
  pickupDate,
  customDateNote,
  note,
  customerName,
  customerEmail,
  customerPhone,
}: {
  presentation: PresentationId;
  quantity: QuantityId;
  color: ColorId;
  pickupDate: PickupDateId;
  customDateNote: string;
  note: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
  const response = await fetch("/api/bouquets/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      presentationId: presentation,
      quantity,
      color,
      pickupDate,
      customDateNote,
      customerName,
      customerEmail,
      customerPhone,
      note,
    }),
  });
  const data = (await response.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };

  if (!response.ok || !data.url) {
    throw new Error(data.error || "Could not start checkout. Please try again.");
  }

  window.location.href = data.url;
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
  const presentationOption = PRESENTATION_OPTIONS.find((o) => o.id === presentation);
  const presentationLabel = presentationOption?.label ?? presentation;
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
    `Presentation: ${presentationLabel}${presentationOption?.price ? ` (${presentationOption.price})` : ""}`,
    `Pickup / ready by: ${pickupLabel}`,
  ];

  if (note.trim()) {
    lines.push("", `A few more details: ${note.trim()}`);
  }

  lines.push("", "Thanks!");
  return lines.join("\n");
}

function PickupDateConfirmNote({ noteKey }: { noteKey: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [noteKey]);

  if (noteKey === 0) return null;

  return (
    <p
      role="status"
      aria-live="polite"
      className={`mt-3 rounded-lg bg-terracotta-dark px-3 py-2 text-[11px] leading-snug text-cream transition-all duration-300 ease-out ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-[0.98]"
      }`}
    >
      Some dates may not be available for pickup. I will confirm via email.
    </p>
  );
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
  const [confirmNoteKey, setConfirmNoteKey] = useState(0);

  const selectDate = (id: PickupDateId) => {
    onChange(id);
    setConfirmNoteKey((key) => key + 1);
  };

  return (
    <fieldset>
      <legend className="text-sm font-medium text-charcoal mb-3">Pickup / ready by</legend>
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        {dayOptions.map((day) => {
          const isSelected = value === day.id;
          const showHoursLeft = day.isToday && day.available && day.hoursLeft != null;

          return (
            <label
              key={day.id}
              className={`rounded-xl border px-2 py-3 text-center transition-colors ${
                !day.available
                  ? "cursor-not-allowed border-sage/25 bg-cream/50 opacity-35"
                  : day.isToday
                    ? isSelected
                      ? "cursor-pointer border-sage bg-sage/10 opacity-70"
                      : "cursor-pointer border-sage/45 bg-cream opacity-55 hover:opacity-80 hover:border-sage/60"
                    : isSelected
                      ? "cursor-pointer border-sage bg-sage/10"
                      : "cursor-pointer border-sage/45 hover:border-sage/60 bg-cream"
              }`}
            >
              <input
                type="radio"
                name="pickup-date"
                value={day.id}
                checked={isSelected}
                disabled={!day.available}
                onChange={() => {
                  if (day.available) selectDate(day.id);
                }}
                className="sr-only"
              />
              <span className="block text-[11px] sm:text-[10px] uppercase tracking-wide text-warm-brown/85">
                {day.weekday}
              </span>
              <span className="block text-base font-medium text-charcoal leading-tight mt-0.5">
                {day.day}
              </span>
              <span className="block text-[11px] sm:text-[10px] text-warm-brown/78 mt-0.5">
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
            : "border-sage/45 hover:border-sage/60 bg-cream"
        }`}
      >
        <input
          type="radio"
          name="pickup-date"
          value={CUSTOM_DATE_ID}
          checked={isCustom}
          onChange={() => selectDate(CUSTOM_DATE_ID)}
          className="sr-only"
        />
        <span>
          <span className="block text-sm font-medium text-charcoal">Custom date</span>
          <span className="block text-xs text-warm-brown/85 mt-0.5">
            Outside this week — discuss with Rhoda
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
            className="w-full rounded-xl border border-sage/45 bg-cream px-4 py-3 text-base text-charcoal placeholder:text-warm-brown/55 focus:outline-none focus:border-sage/70 resize-none"
          />
        </div>
      )}

      <PickupDateConfirmNote noteKey={confirmNoteKey} />
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
  layout = "grid",
  compact = false,
}: {
  legend: string;
  name: string;
  options: readonly { id: T; label: string; hint: string; price?: string; imageSrc?: string }[];
  value: T;
  onChange: (id: T) => void;
  withImages?: boolean;
  layout?: "grid" | "stack";
  compact?: boolean;
}) {
  return (
    <fieldset>
      <legend className={`font-medium text-charcoal ${compact ? "text-xs mb-2" : "text-sm mb-3"}`}>
        {legend}
      </legend>
      <div
        className={
          layout === "stack"
            ? `flex flex-col ${compact ? "gap-1.5 max-w-[14rem]" : "gap-2"}`
            : "grid sm:grid-cols-2 gap-2"
        }
      >
        {options.map((option) => (
          <label
            key={option.id}
            className={`cursor-pointer border overflow-hidden transition-colors ${
              compact ? "rounded-lg" : "rounded-xl"
            } ${
              value === option.id
                ? "border-sage bg-sage/10"
                : "border-sage/45 hover:border-sage/60 bg-cream"
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
            {compact && layout === "stack" ? (
              <span className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="text-sm font-medium text-charcoal tabular-nums">{option.label}</span>
                <span className="text-xs text-warm-brown/85">{option.hint}</span>
              </span>
            ) : (
              <span className={`block ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
                <span className="block text-sm font-medium text-charcoal">{option.label}</span>
                <span className="block text-xs text-warm-brown/85 mt-0.5">
                  {option.hint}
                  {option.price ? (
                    <>
                      {" · "}
                      <span className="text-terracotta font-medium">{option.price}</span>
                    </>
                  ) : null}
                </span>
              </span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function QuantityStepper({
  value,
  onChange,
  legend = "How many bouquets?",
}: {
  value: QuantityId;
  onChange: (id: QuantityId) => void;
  legend?: string;
}) {
  const index = QUANTITY_ORDER.indexOf(value);
  const option = QUANTITY_OPTIONS.find((entry) => entry.id === value);
  const canDecrease = index > 0;
  const canIncrease = index < QUANTITY_ORDER.length - 1;

  const step = (delta: number) => {
    const next = QUANTITY_ORDER[index + delta];
    if (next) onChange(next);
  };

  const stepperButtonClass =
    "flex flex-1 items-center justify-center text-warm-brown/85 transition-colors hover:text-charcoal hover:bg-sage/10 disabled:opacity-30 disabled:pointer-events-none";

  return (
    <fieldset>
      <legend className="text-sm font-medium text-charcoal mb-3">{legend}</legend>
      <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-sage/45 bg-cream">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={!canDecrease}
          aria-label="Decrease quantity"
          className={`${stepperButtonClass} border-r border-sage/45 py-3`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <span
          className="flex min-w-[4rem] flex-[2] items-center justify-center px-4 py-3 text-lg font-medium tabular-nums text-charcoal"
          aria-live="polite"
          aria-atomic="true"
        >
          {option?.label ?? value}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={!canIncrease}
          aria-label="Increase quantity"
          className={`${stepperButtonClass} border-l border-sage/45 py-3`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      {option?.hint ? (
        <p className="mt-2 text-xs text-warm-brown/85">{option.hint}</p>
      ) : null}
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
  const selected =
    PRESENTATION_OPTIONS.find((option) => option.id === value) || PRESENTATION_OPTIONS[0];

  return (
    <fieldset>
      <legend className="text-sm font-medium text-charcoal mb-3">Arrangement</legend>

      <div className="overflow-hidden rounded-xl sm:rounded-button border border-sage/45 bg-cream">
        <div className="flex flex-col sm:grid sm:grid-cols-[minmax(0,17rem)_1fr] items-stretch">
          <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-full bg-cream-dark">
            <Image
              key={selected.id}
              src={selected.imageSrc}
              alt={selected.label}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 640px) 100vw, 272px"
            />
          </div>

          <div
            className="flex flex-col divide-y divide-sage/30 border-t border-sage/30 sm:border-t-0 sm:border-l"
            role="listbox"
            aria-label="Arrangement options"
          >
            {PRESENTATION_OPTIONS.map((option) => {
              const isSelected = option.id === value;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onChange(option.id)}
                  className={`flex flex-1 items-center justify-between gap-2 sm:gap-3 px-3 py-2 sm:px-3.5 sm:py-2.5 text-left transition-colors ${
                    isSelected
                      ? "bg-sage/12 text-charcoal"
                      : "text-warm-brown hover:bg-sage/5 hover:text-charcoal"
                  }`}
                >
                  <span className="min-w-0">
                    <span
                      className={`block text-sm leading-tight ${
                        isSelected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {option.shortLabel}
                    </span>
                    <span
                      className={`mt-0.5 block text-[11px] leading-tight ${
                        isSelected ? "text-warm-brown/88" : "text-warm-brown/72"
                      }`}
                    >
                      {option.hint}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-[11px] sm:text-xs tabular-nums ${
                      isSelected ? "font-medium text-terracotta" : "text-warm-brown/82"
                    }`}
                  >
                    {option.price}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
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
  submittingMode,
  submitError,
  onSubmitEmail,
  onSubmitPay,
  canPay,
  totalLabel,
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
  submittingMode: "email" | "pay" | null;
  submitError: string | null;
  onSubmitEmail: () => void;
  onSubmitPay?: () => void;
  canPay: boolean;
  totalLabel: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);

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
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-charcoal/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bouquet-inquiry-title"
    >
      <div
        className="relative w-full sm:max-w-xl max-h-[92dvh] overflow-y-auto overscroll-contain bg-cream rounded-t-3xl sm:rounded-3xl shadow-xl pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center text-warm-brown/78 hover:text-charcoal transition-colors"
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
              <p className="text-warm-brown/90 text-sm leading-relaxed mb-6">
                Thanks! Your bouquet request is on its way to Rhoda. She&apos;ll follow up by email
                soon.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn bg-sage text-cream hover:bg-sage-dark"
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
              <p className="text-warm-brown/90 text-sm mb-6">{description}</p>

              <form
                ref={formRef}
                onSubmit={(event) => {
                  event.preventDefault();
                  onSubmitEmail();
                }}
                className="space-y-6"
              >
                {setPresentation && (
                  <PresentationChooser value={presentation} onChange={setPresentation} />
                )}

                <QuantityStepper value={quantity} onChange={setQuantity} />

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
                      required
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Name"
                      autoComplete="name"
                      className="w-full rounded-xl border border-sage/45 bg-cream px-4 py-3 text-base text-charcoal placeholder:text-warm-brown/55 focus:outline-none focus:border-sage/70"
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
                      className="w-full rounded-xl border border-sage/45 bg-cream px-4 py-3 text-base text-charcoal placeholder:text-warm-brown/55 focus:outline-none focus:border-sage/70"
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
                      className="w-full rounded-xl border border-sage/45 bg-cream px-4 py-3 text-base text-charcoal placeholder:text-warm-brown/55 focus:outline-none focus:border-sage/70"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="bouquet-note"
                    className="block text-sm font-medium text-charcoal mb-2"
                  >
                    Anything else?{" "}
                    <span className="font-normal text-warm-brown/78">(optional)</span>
                  </label>
                  <textarea
                    id="bouquet-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="Occasion, anything to avoid, delivery notes..."
                    className="w-full rounded-xl border border-sage/45 bg-cream px-4 py-3 text-base text-charcoal placeholder:text-warm-brown/55 focus:outline-none focus:border-sage/70 resize-none"
                  />
                </div>

                {submitError && (
                  <p className="text-sm text-terracotta" role="alert">
                    {submitError}
                  </p>
                )}

                {canPay && totalLabel ? (
                  <div className="rounded-2xl bg-sage/10 px-4 py-3.5 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-charcoal">Total</p>
                    <p className="text-lg font-medium text-charcoal tabular-nums">{totalLabel}</p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {canPay && onSubmitPay && totalLabel ? (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        if (!formRef.current?.reportValidity()) return;
                        onSubmitPay();
                      }}
                      className="btn w-full bg-terracotta text-cream hover:bg-terracotta-dark disabled:opacity-60"
                    >
                      {submitting && submittingMode === "pay"
                        ? "Starting checkout…"
                        : `Pay ${totalLabel} now`}
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`btn w-full disabled:opacity-60 ${
                      canPay
                        ? "border border-sage/30 text-sage-dark hover:bg-sage/5"
                        : "bg-terracotta text-cream hover:bg-terracotta-dark"
                    }`}
                  >
                    {submitting && submittingMode === "email"
                      ? "Sending…"
                      : "Send bouquet request"}
                  </button>
                </div>

                {canPay ? (
                  <p className="text-center text-xs text-warm-brown/75">
                    Pay now with Square, or send a request for Rhoda to follow up by email.
                  </p>
                ) : null}
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
  squareReady = false,
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
  const [submittingMode, setSubmittingMode] = useState<"email" | "pay" | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dayOptions = useMemo(() => getUpcomingDays(), [open]);
  const canPay = squareReady && canCheckoutBouquet(presentation, quantity);
  const totalCents = bouquetOrderTotalCents(presentation, quantity);
  const totalLabel = totalCents != null ? formatCents(totalCents) : null;

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
    setSubmittingMode(null);
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

  async function handleSubmitEmail() {
    setSubmitError(null);
    setSubmitting(true);
    setSubmittingMode("email");

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
      await submitBouquetEmail({
        subject,
        message,
        customerName,
        customerEmail,
        customerPhone,
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not complete the request."
      );
    } finally {
      setSubmitting(false);
      setSubmittingMode(null);
    }
  }

  async function handleSubmitPay() {
    if (!canPay) return;

    setSubmitError(null);
    setSubmitting(true);
    setSubmittingMode("pay");

    try {
      await submitBouquetPay({
        presentation,
        quantity,
        color,
        pickupDate,
        customDateNote,
        note,
        customerName,
        customerEmail,
        customerPhone,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not complete the request."
      );
      setSubmitting(false);
      setSubmittingMode(null);
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
        <ArrowIcon />
      </button>

      <InquiryModal
        open={open}
        onClose={handleClose}
        title={`Something like ${bouquetTitle}`}
        description={
          canPay
            ? "Pick your preferences — pay now with Square, or send a request for Rhoda to follow up."
            : "Pick a few preferences and send your request straight to Rhoda."
        }
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
        submittingMode={submittingMode}
        submitError={submitError}
        onSubmitEmail={handleSubmitEmail}
        onSubmitPay={canPay ? handleSubmitPay : undefined}
        canPay={canPay}
        totalLabel={totalLabel}
      />
    </>
  );
}

function BouquetOrderSession({
  squareReady = false,
  children,
}: {
  squareReady?: boolean;
  children: (openOrder: (presentation?: PresentationId) => void) => React.ReactNode;
}) {
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
  const [submittingMode, setSubmittingMode] = useState<"email" | "pay" | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dayOptions = useMemo(() => getUpcomingDays(), [open]);
  const canPay = squareReady && canCheckoutBouquet(presentation, quantity);
  const totalCents = bouquetOrderTotalCents(presentation, quantity);
  const totalLabel = totalCents != null ? formatCents(totalCents) : null;

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
    setSubmittingMode(null);
    setSubmitError(null);
  }

  function openOrder(nextPresentation: PresentationId = DEFAULT_PREFERENCES.presentation) {
    resetForm(nextPresentation);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    resetForm();
  }

  async function handleSubmitEmail() {
    setSubmitError(null);
    setSubmitting(true);
    setSubmittingMode("email");

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
      await submitBouquetEmail({
        subject,
        message,
        customerName,
        customerEmail,
        customerPhone,
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not complete the request."
      );
    } finally {
      setSubmitting(false);
      setSubmittingMode(null);
    }
  }

  async function handleSubmitPay() {
    if (!canPay) return;

    setSubmitError(null);
    setSubmitting(true);
    setSubmittingMode("pay");

    try {
      await submitBouquetPay({
        presentation,
        quantity,
        color,
        pickupDate,
        customDateNote,
        note,
        customerName,
        customerEmail,
        customerPhone,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not complete the request."
      );
      setSubmitting(false);
      setSubmittingMode(null);
    }
  }

  const presentationLabel =
    PRESENTATION_OPTIONS.find((o) => o.id === presentation)?.label ?? "Bouquet";

  return (
    <>
      {children(openOrder)}
      <InquiryModal
        open={open}
        onClose={handleClose}
        title={presentationLabel}
        description={
          canPay
            ? "Choose colour and timing — pay now with Square, or send a request for Rhoda to follow up."
            : "Choose colour and timing — then send your request to Rhoda."
        }
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
        submittingMode={submittingMode}
        submitError={submitError}
        onSubmitEmail={handleSubmitEmail}
        onSubmitPay={canPay ? handleSubmitPay : undefined}
        canPay={canPay}
        totalLabel={totalLabel}
      />
    </>
  );
}

/** Opens the bouquet request modal — used in the site header. */
export function OrderBouquetControls({
  squareReady = false,
  children,
}: {
  squareReady?: boolean;
  children: (openOrder: () => void) => React.ReactNode;
}) {
  return (
    <BouquetOrderSession squareReady={squareReady}>
      {(openOrder) => children(() => openOrder())}
    </BouquetOrderSession>
  );
}

/** Home-page finish cards: sleeve, vase, mason jar, bucket, gift bag posie, custom. */
export function FinishRequestPicker({
  contactEmail,
  squareReady = false,
}: {
  contactEmail?: string;
  squareReady?: boolean;
}) {
  void contactEmail;

  return (
    <BouquetOrderSession squareReady={squareReady}>
      {(openOrder) => (
        <div>
          <div className="mb-8">
            <p className="text-sage text-sm uppercase tracking-[0.2em] mb-2">
              Choose an arrangement
            </p>
            <h3 className="font-display text-2xl md:text-3xl text-charcoal mb-2">
              Order a bouquet
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {PRESENTATION_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => openOrder(option.id)}
                className="group relative aspect-[3/4] overflow-hidden rounded-button text-left ring-1 ring-sage/35 hover:ring-sage/55 transition-all"
              >
                <Image
                  src={option.imageSrc}
                  alt={option.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] backdrop-blur-2xl backdrop-saturate-150"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to top, black 0%, black 25%, transparent 100%)",
                    maskImage:
                      "linear-gradient(to top, black 0%, black 25%, transparent 100%)",
                  }}
                  aria-hidden="true"
                />
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-charcoal/50 via-charcoal/15 to-transparent"
                  aria-hidden="true"
                />
                <span className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 pt-6">
                  <span className="flex items-end justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block font-display text-xl text-cream drop-shadow-sm mb-1">
                        {option.label}
                      </span>
                      <span className="block text-sm text-cream/85 drop-shadow-sm">
                        {option.hint}
                      </span>
                    </span>
                    <span className="shrink-0 text-right drop-shadow-sm">
                      <span className="block text-base font-medium text-cream tabular-nums leading-none">
                        {option.price}
                      </span>
                      {option.price !== "Get in touch" ? (
                        <span className="block text-[11px] text-cream/70 leading-tight mt-1">
                          pickup
                        </span>
                      ) : null}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </BouquetOrderSession>
  );
}
