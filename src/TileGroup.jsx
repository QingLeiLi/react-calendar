import React from 'react';
import PropTypes from 'prop-types';

import Flex from './Flex';

import { getTileClasses } from './shared/utils';
import { tileGroupProps } from './shared/propTypes';

export default function TileGroup({
  className,
  // 一行显示几个
  count = 3,
  // 根据 index 循环得到日期
  dateTransform,
  dateType,
  end,
  hover,
  offset,
  start,
  step = 1,
  tile: Tile,
  value,
  valueType,
  ...tileProps
}) {
  const tiles = [];
  for (let point = start; point <= end; point += step) {
    const date = dateTransform(point);

    tiles.push(
      <Tile
        key={date.getTime()}
        // 这里的类会判断选中态和今天的高亮态
        classes={getTileClasses({
          value, valueType, date, dateType, hover,
        })}
        date={date}
        point={point}
        index={point}
        {...tileProps}
      />,
    );
  }

  return (
    <Flex
      className={className}
      count={count}
      offset={offset}
      wrap
    >
      {tiles}
    </Flex>
  );
}

TileGroup.propTypes = {
  ...tileGroupProps,
  activeStartDate: PropTypes.instanceOf(Date),
  count: PropTypes.number,
  dateTransform: PropTypes.func.isRequired,
  dateType: PropTypes.string,
  offset: PropTypes.number,
  step: PropTypes.number,
  tile: PropTypes.func.isRequired,
};
