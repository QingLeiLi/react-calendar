import React from 'react';
import PropTypes from 'prop-types';

export default function WeekNumber({
  date,
  onClickWeekNumber,
  weekNumber,
  minWeekNumber,
  maxWeekNumber,
}) {
  // @todo 在跨年的时候可能有问题
  const isDisabled = weekNumber < minWeekNumber || weekNumber > maxWeekNumber;
  const props = {
    className: `react-calendar__tile ${isDisabled ? 'react-calendar__tile-disabled' : ''}`,
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
