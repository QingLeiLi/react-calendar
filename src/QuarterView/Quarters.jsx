import React from 'react';
import PropTypes from 'prop-types';
import { getYear } from '@wojtekmaj/date-utils';

import TileGroup from '../TileGroup';
import Quarter from './Quarter';

import { tileGroupProps } from '../shared/propTypes';

export default function Quarters(props) {
  const { activeStartDate } = props;
  const start = 0;
  const end = 3;
  const year = getYear(activeStartDate);

  return (
    <TileGroup
      count={2}
      {...props}
      className="react-calendar__year-quarter-view__quarters"
      dateTransform={(quarterIndex) => {
        const date = new Date();
        date.setFullYear(year, quarterIndex * 3, 1);
        date.setHours(0, 0, 0, 0);
        return date;
      }}
      dateType="yearQuarter"
      end={end}
      start={start}
      tile={Quarter}
    />
  );
}

Quarters.propTypes = {
  ...tileGroupProps,
  locale: PropTypes.string,
};
