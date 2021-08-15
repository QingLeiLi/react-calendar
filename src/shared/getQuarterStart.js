import {
  getMonthStart,
} from '@wojtekmaj/date-utils';

export default function getQuarterStart(date) {
  const cloneDate = new Date(date);
  const month = cloneDate.getMonth();
  const quarter = parseInt(month / 3, 10);
  cloneDate.setMonth(quarter * 3);
  return getMonthStart(cloneDate);
}
