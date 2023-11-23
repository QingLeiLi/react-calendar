const defaultMinDate = new Date();
defaultMinDate.setFullYear(1, 0, 1);
defaultMinDate.setHours(0, 0, 0, 0);
const defaultMaxDate = new Date(8.64e15);

export {
  defaultMinDate,
  defaultMaxDate,
};

export function getISOWeekStart(date) {
  const weekStartsOn = 1;
  const $date = new Date(date);
  const day = $date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

  $date.setDate($date.getDate() - diff);
  $date.setHours(0, 0, 0, 0);
  return $date;
}

export function getISOWeekEnd(date) {
  const weekStartsOn = 1;
  const $date = new Date(date);
  const day = $date.getDay();
  const diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn);

  $date.setDate($date.getDate() + diff);
  $date.setHours(23, 59, 59, 999);
  return $date;
}
