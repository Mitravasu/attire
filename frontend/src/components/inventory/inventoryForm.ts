import { ChangeEvent } from "react";
import { InventoryItem, InventoryStatus, InventoryType } from "types/inventory";

export type InventoryFormState = {
  title: string;
  tags: string;
  color: string;
  type: InventoryType;
  status: InventoryStatus;
  frontImageUrl: string;
  backImageUrl: string;
};

export type InventoryFormErrors = Partial<
  Record<keyof InventoryFormState | "submit", string>
>;

export const maxImageFileSize = 5 * 1024 * 1024;

export const initialInventoryFormState: InventoryFormState = {
  title: "",
  tags: "",
  color: "",
  type: "top",
  status: "clean",
  frontImageUrl: "",
  backImageUrl: "",
};

export function inventoryItemToFormState(
  item: InventoryItem,
): InventoryFormState {
  return {
    title: item.title,
    tags: item.tags.join(", "),
    color: item.color,
    type: item.type,
    status: item.status,
    frontImageUrl: item.frontImageUrl,
    backImageUrl: item.backImageUrl ?? "",
  };
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File | null, required: boolean) {
  if (!file) {
    return required ? "Image is required." : null;
  }

  if (!file.type.startsWith("image/")) {
    return "File must be an image.";
  }

  if (file.size > maxImageFileSize) {
    return "Image must be 5 MB or smaller.";
  }

  return null;
}

export function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function validateInventoryForm(formState: InventoryFormState) {
  const errors: InventoryFormErrors = {};

  if (!formState.title.trim()) {
    errors.title = "Title is required.";
  }

  if (!parseTags(formState.tags).length) {
    errors.tags = "At least one tag is required.";
  }

  if (!formState.color.trim()) {
    errors.color = "Color is required.";
  }

  if (!formState.frontImageUrl) {
    errors.frontImageUrl = "Front image is required.";
  }

  return errors;
}

export async function updateImageFieldFromInput(
  event: ChangeEvent<HTMLInputElement>,
  field: "frontImageUrl" | "backImageUrl",
  setErrors: (
    updater: (current: InventoryFormErrors) => InventoryFormErrors,
  ) => void,
  setFormState: (
    updater: (current: InventoryFormState) => InventoryFormState,
  ) => void,
) {
  const file = event.target.files?.[0] ?? null;
  const error = validateImageFile(file, field === "frontImageUrl");

  if (error) {
    setErrors((current) => ({
      ...current,
      [field]: error,
    }));
    return;
  }

  if (!file) {
    setFormState((current) => ({
      ...current,
      [field]: "",
    }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
    return;
  }

  const dataUrl = await fileToDataUrl(file);
  setFormState((current) => ({
    ...current,
    [field]: dataUrl,
  }));
  setErrors((current) => ({
    ...current,
    [field]: undefined,
  }));
}
