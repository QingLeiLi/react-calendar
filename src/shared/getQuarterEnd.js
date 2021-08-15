import {
  getMonthEnd,
} from '@wojtekmaj/date-utils';

export default function getQuarterEnd(date) {
  const cloneDate = new Date(date);
  const month = cloneDate.getMonth();
  const nextQuarter = parseInt(month / 3, 10) + 1;
  cloneDate.setMonth(nextQuarter * 3 - 1);
  return getMonthEnd(cloneDate);
}
