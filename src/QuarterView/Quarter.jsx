import React from 'react';
import PropTypes from 'prop-types';
import { getMonthStart, getMonthEnd } from '@wojtekmaj/date-utils';

import Tile from '../Tile';

import {
  formatMonth as defaultFormatMonth,
  formatMonthYear as defaultFormatMonthYear,
} from '../shared/dateFormatter';
import { tileProps } from '../shared/propTypes';

const className = 'react-calendar__year-quarter-view__months__month';

export default function Quarter({
  classes,
  formatMonth = defaultFormatMonth,
  formatMonthYear = defaultFormatMonthYear,
  index,
  ...otherProps
}) {
  const { date, locale } = otherProps;

  return (
    <Tile
      {...otherProps}
      classes={[].concat(classes, className)}
      formatAbbr={formatMonthYear}
      maxDateTransform={getMonthEnd}
      minDateTransform={getMonthStart}
      view="yearQuarter"
    >
      {/* {formatMonth(locale, date)} */}
      第
      {index + 1}
      季度
    </Tile>
  );
}

Quarter.propTypes = {
  ...tileProps,
  formatMonth: PropTypes.func,
  formatMonthYear: PropTypes.func,
  index: PropTypes.number,
};
