import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { defaultMaxDate, defaultMinDate, getISOWeekStart, getISOWeekEnd } from '../common';

export default function WeekNumber({
  date,
  onClickWeekNumber,
  weekNumber,
  minDate,
  maxDate,
}) {
  const isDisabled = useMemo(() => {
    try {
      if (maxDate !== defaultMaxDate) {
        const weekStart = getISOWeekStart(date);
        if (weekStart > maxDate) {
          return true;
        }
      }
      if (minDate !== defaultMinDate) {
        const weekEnd = getISOWeekEnd(date);
        if (weekEnd < minDate) {
          return true;
        }
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  }, [
    minDate,
    maxDate,
    date,
  ]);
  // @todo 在跨年的时候可能有问题
  // const isDisabled = weekNumber < minWeekNumber || weekNumber > maxWeekNumber;
  const props = {
    className: `react-calendar__tile react-calendar__month-view__weeknumber ${isDisabled ? 'react-calendar__tile-disabled' : ''}`,
    style: { flexGrow: 1 },
  };

  const children = (
    <span>
      W
      {weekNumber}
    </span>
  );

  return (
    (onClickWeekNumber && !isDisabled)
      ? (
        <button
          {...props}
          onClick={(event) => onClickWeekNumber(weekNumber, date, event)}
          type="button"
        >
          {children}
        </button>
      )
      : (
        <div {...props}>
          {children}
        </div>
      )
  );
}

WeekNumber.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  maxWeekNumber: PropTypes.number,
  minWeekNumber: PropTypes.number,
  onClickWeekNumber: PropTypes.func,
  weekNumber: PropTypes.node.isRequired,
};
