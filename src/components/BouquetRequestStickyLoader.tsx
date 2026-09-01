import { BouquetRequestSticky } from "@/components/BouquetRequestSticky";
import { isSquareConfigured } from "@/lib/square";
import { BUTTON_RHODA_PHOTO_SRC } from "@/lib/photos.shared";

export function BouquetRequestStickyLoader() {
  return (
    <BouquetRequestSticky
      rhodaSrc={BUTTON_RHODA_PHOTO_SRC}
      squareReady={isSquareConfigured()}
    />
  );
}
