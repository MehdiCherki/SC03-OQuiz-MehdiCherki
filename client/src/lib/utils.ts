export function toReadableDate(date: Date) {
  return date.toLocaleDateString("fr-FR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});
}
