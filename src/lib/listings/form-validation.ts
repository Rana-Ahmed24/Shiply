export function isListingFormComplete(form: HTMLFormElement): boolean {
  if (!form.checkValidity()) return false;

  const originCity = (
    form.elements.namedItem("originCity") as HTMLInputElement | null
  )?.value.trim();
  const arrivalDate = (
    form.elements.namedItem("arrivalDate") as HTMLInputElement | null
  )?.value;
  const weight = (
    form.elements.namedItem("availableWeightKg") as HTMLInputElement | null
  )?.value;

  if (!originCity || originCity.length < 2) return false;
  if (!arrivalDate) return false;
  if (!weight || Number(weight) <= 0) return false;

  const categories = form.querySelectorAll<HTMLInputElement>(
    'input[name="categories"]:checked'
  );
  if (categories.length === 0) return false;

  const departureDate = (
    form.elements.namedItem("departureDate") as HTMLInputElement | null
  )?.value;
  if (
    departureDate &&
    arrivalDate &&
    new Date(arrivalDate) < new Date(departureDate)
  ) {
    return false;
  }

  return true;
}
