import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';

import Navigation from './Calendar/Navigation';
import CenturyView from './CenturyView';
import DecadeView from './DecadeView';
import YearView from './YearView';
import MonthView from './MonthView';
import YearQuarterView from './YearQuarterView';

import {
  getBegin, getBeginNext, getEnd, getValueRange,
} from './shared/dates';
import {
  isCalendarType, isClassName, isMaxDate, isMinDate, isRef, isValue, isView,
} from './shared/propTypes';
import { between } from './shared/utils';
import { defaultMinDate, defaultMaxDate } from './common';

const baseClassName = 'react-calendar';

function toDate(value) {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
}

function getValue(value, index) {
  if (!value) {
    return null;
  }

  const rawValue = Array.isArray(value) && value.length === 2 ? value[index] : value;

  if (!rawValue) {
    return null;
  }

  const valueDate = toDate(rawValue);

  if (isNaN(valueDate.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return valueDate;
}

const getIsSingleValue = (value) => value && [].concat(value).length === 1;

export default class Calendar extends Component {

  allBaseViews = ['century', 'decade', 'year', 'month'];
  // const allValueTypes = [...allViews.slice(1), 'day'];

  get allViews() {
    const {
      maxDetail,
    } = this.props;
    if (maxDetail === 'yearQuarter') {
      const clone = [...this.allBaseViews];
      const yearIndex = clone.indexOf('year');
      clone.splice(yearIndex, 1, 'yearQuarter');
      return clone;
    }
    return this.allBaseViews;
  }

  view2ValueType = {
    century: 'decade',
    decade: 'year',
    year: 'month',
    yearQuarter: 'yearQuarter',
    month: 'day',
  }

  get allValueTypes() {
    return this.allViews.map(view => this.view2ValueType[view]);
    // return [...this.allViews.slice(1), 'day'];
  }

  /**
   * Returns value type that can be returned with currently applied settings.
   */
  getValueType(maxDetail) {
    return this.allValueTypes[this.allViews.indexOf(maxDetail)];
  }

  getDetailValue({
    value, minDate, maxDate, maxDetail,
  }, index) {
    const valuePiece = getValue(value, index);
  
    if (!valuePiece) {
      return null;
    }
  
    const valueType = this.getValueType(maxDetail);
    const detailValueFrom = [getBegin, getEnd][index](valueType, valuePiece);
  
    return between(detailValueFrom, minDate, maxDate);
  }

  getDetailValueFrom = (args) => this.getDetailValue(args, 0);

  getDetailValueTo = (args) => this.getDetailValue(args, 1);

  getDetailValueArray = (args) => {
    const { value } = args;
  
    if (Array.isArray(value)) {
      return value;
    }
  
    return [this.getDetailValueFrom, this.getDetailValueTo].map((fn) => fn(args));
  };

  /**
   * Returns views array with disallowed values cut off.
   */
  getLimitedViews(minDetail, maxDetail) {
    return this.allViews.slice(this.allViews.indexOf(minDetail), this.allViews.indexOf(maxDetail) + 1);
  }

  /**
   * Determines whether a given view is allowed with currently applied settings.
   */
  isViewAllowed(view, minDetail, maxDetail) {
    const views = this.getLimitedViews(minDetail, maxDetail);

    return views.indexOf(view) !== -1;
  }

  /**
   * Gets either provided view if allowed by minDetail and maxDetail, or gets
   * the default view if not allowed.
   */
  getView(view, minDetail, maxDetail) {
    if (this.isViewAllowed(view, minDetail, maxDetail)) {
      return view;
    }

    return maxDetail;
  }

  getActiveStartDate(props) {
    const {
      maxDate,
      maxDetail,
      minDate,
      minDetail,
      value,
      view,
    } = props;
  
    const rangeType = this.getView(view, minDetail, maxDetail);
    const valueFrom = (
      this.getDetailValueFrom({
        value, minDate, maxDate, maxDetail,
      })
      || new Date()
    );
  
    return getBegin(rangeType, valueFrom);
  }

  getInitialActiveStartDate(props) {
    const {
      activeStartDate,
      defaultActiveStartDate,
      defaultValue,
      defaultView,
      maxDetail,
      minDetail,
      value,
      view,
      ...otherProps
    } = props;
  
    const rangeType = this.getView(view, minDetail, maxDetail);
    const valueFrom = activeStartDate || defaultActiveStartDate;
  
    if (valueFrom) {
      return getBegin(rangeType, valueFrom);
    }
  
    return this.getActiveStartDate({
      maxDetail,
      minDetail,
      value: value || defaultValue,
      view: view || defaultView,
      ...otherProps,
    });
  }

  state = {
    /* eslint-disable react/destructuring-assignment */
    activeStartDate: this.props.defaultActiveStartDate,
    value: this.props.defaultValue,
    view: this.props.defaultView,
    /* eslint-enable react/destructuring-assignment */
  };

  get activeStartDate() {
    const { activeStartDate: activeStartDateProps } = this.props;
    const { activeStartDate: activeStartDateState } = this.state;

    return activeStartDateProps || activeStartDateState || this.getInitialActiveStartDate(this.props);
  }

  get value() {
    const { selectRange, value: valueProps } = this.props;
    const { value: valueState } = this.state;

    // In the middle of range selection, use value from state
    if (selectRange && getIsSingleValue(valueState)) {
      return valueState;
    }

    return valueProps !== undefined ? valueProps : valueState;
  }

  get valueType() {
    const { maxDetail } = this.props;

    return this.getValueType(maxDetail);
  }

  get view() {
    const { minDetail, maxDetail, view: viewProps } = this.props;
    const { view: viewState } = this.state;

    return this.getView(viewProps || viewState, minDetail, maxDetail);
  }

  get views() {
    const { minDetail, maxDetail } = this.props;

    return this.getLimitedViews(minDetail, maxDetail);
  }

  get hover() {
    const { selectRange } = this.props;
    const { hover } = this.state;

    return selectRange ? hover : null;
  }

  get drillDownAvailable() {
    const { view, views } = this;

    return views.indexOf(view) < views.length - 1;
  }

  get drillUpAvailable() {
    const { view, views } = this;

    return views.indexOf(view) > 0;
  }

  /**
   * Gets current value in a desired format.
   */
  getProcessedValue(value) {
    const {
      minDate, maxDate, maxDetail, returnValue,
    } = this.props;

    const processFunction = (() => {
      switch (returnValue) {
        case 'start': return this.getDetailValueFrom;
        case 'end': return this.getDetailValueTo;
        case 'range': return this.getDetailValueArray;
        default: throw new Error('Invalid returnValue.');
      }
    })();

    return processFunction({
      value, minDate, maxDate, maxDetail,
    });
  }

  setStateAndCallCallbacks = (nextState, event, callback) => {
    const {
      activeStartDate: previousActiveStartDate,
      view: previousView,
    } = this;

    const {
      allowPartialRange,
      onActiveStartDateChange,
      onChange,
      onViewChange,
      selectRange,
    } = this.props;

    const prevArgs = {
      activeStartDate: previousActiveStartDate,
      view: previousView,
    };

    this.setState(nextState, () => {
      const args = {
        activeStartDate: nextState.activeStartDate || this.activeStartDate,
        value: nextState.value || this.value,
        view: nextState.view || this.view,
      };

      function shouldUpdate(key) {
        return (
          // Key must exist, and…
          key in nextState
          && (
            // …key changed from undefined to defined or the other way around, or…
            typeof nextState[key] !== typeof prevArgs[key]
            // …value changed.
            || (
              nextState[key] instanceof Date
                ? nextState[key].getTime() !== prevArgs[key].getTime()
                : nextState[key] !== prevArgs[key]
            )
          )
        );
      }

      if (shouldUpdate('activeStartDate')) {
        if (onActiveStartDateChange) onActiveStartDateChange(args);
      }

      if (shouldUpdate('view')) {
        if (onViewChange) onViewChange(args);
      }

      if (shouldUpdate('value')) {
        if (onChange) {
          if (selectRange) {
            const isSingleValue = getIsSingleValue(nextState.value);

            if (!isSingleValue) {
              onChange(nextState.value, event);
            } else if (allowPartialRange) {
              onChange([nextState.value], event);
            }
          } else {
            onChange(nextState.value, event);
          }
        }
      }

      if (callback) callback(args);
    });
  }

  /**
   * Called when the user uses navigation buttons.
   */
  setActiveStartDate = (activeStartDate) => {
    this.setStateAndCallCallbacks({ activeStartDate });
  }

  drillDown = (nextActiveStartDate, event) => {
    if (!this.drillDownAvailable) {
      return;
    }

    this.onClickTile(nextActiveStartDate, event);

    const { view, views } = this;
    const { onDrillDown } = this.props;

    const nextView = views[views.indexOf(view) + 1];
    this.setStateAndCallCallbacks({
      activeStartDate: nextActiveStartDate,
      view: nextView,
    }, undefined, onDrillDown);
  }

  // 点击导航进行上卷
  drillUp = () => {
    if (!this.drillUpAvailable) {
      return;
    }

    const { activeStartDate, view, views } = this;
    const { onDrillUp } = this.props;

    const nextView = views[views.indexOf(view) - 1];
    // 获取下一个视图的开始时间
    const nextActiveStartDate = getBegin(nextView, activeStartDate);

    this.setStateAndCallCallbacks({
      activeStartDate: nextActiveStartDate,
      view: nextView,
    }, undefined, onDrillUp);
  }

  onChange = (value, event) => {
    const { selectRange } = this.props;

    this.onClickTile(value, event);

    let nextValue;
    if (selectRange) {
      // Range selection turned on
      const { value: previousValue, valueType } = this;
      if (!getIsSingleValue(previousValue)) {
        // Value has 0 or 2 elements - either way we're starting a new array
        // First value
        nextValue = getBegin(valueType, value);
      } else {
        // Second value
        nextValue = getValueRange(valueType, previousValue, value);
      }
    } else {
      // Range selection turned off
      nextValue = this.getProcessedValue(value);
    }

    const nextActiveStartDate = this.getActiveStartDate({
      ...this.props,
      value: nextValue,
    });

    event.persist();

    this.setStateAndCallCallbacks({
      activeStartDate: nextActiveStartDate,
      value: nextValue,
    }, event);
  }

  // 这里只是给外部一个通知
  onClickTile = (value, event) => {
    const { view } = this;
    const {
      onClickDay,
      onClickDecade,
      onClickMonth,
      onClickYear,
      onClickQuarter,
    } = this.props;

    const callback = (() => {
      switch (view) {
        case 'century':
          return onClickDecade;
        case 'decade':
          return onClickYear;
        case 'year':
          return onClickMonth;
        case 'month':
          return onClickDay;
        case 'yearQuarter':
          return onClickQuarter;
        default:
          throw new Error(`Invalid view: ${view}.`);
      }
    })();

    if (callback) callback(value, event);
  }

  onMouseOver = (value) => {
    this.setState((prevState) => {
      if (prevState.hover && (prevState.hover.getTime() === value.getTime())) {
        return null;
      }

      return { hover: value };
    });
  }

  onMouseLeave = () => {
    this.setState({ hover: null });
  }

  renderContent(next) {
    const {
      activeStartDate: currentActiveStartDate,
      onMouseOver,
      valueType,
      value,
      view,
    } = this;
    const {
      calendarType,
      locale,
      maxDate,
      minDate,
      selectRange,
      tileClassName,
      tileContent,
      tileDisabled,
    } = this.props;
    const { hover } = this;

    const activeStartDate = (
      next
        ? getBeginNext(view, currentActiveStartDate)
        : getBegin(view, currentActiveStartDate)
    );

    const onClick = this.drillDownAvailable ? this.drillDown : this.onChange;

    const commonProps = {
      activeStartDate,
      hover,
      locale,
      maxDate,
      minDate,
      onClick,
      onMouseOver: selectRange ? onMouseOver : null,
      tileClassName,
      tileContent,
      tileDisabled,
      value,
      valueType,
    };

    switch (view) {
      case 'century': {
        const { formatYear } = this.props;

        return (
          <CenturyView
            formatYear={formatYear}
            {...commonProps}
          />
        );
      }
      case 'decade': {
        const { formatYear } = this.props;

        return (
          <DecadeView
            formatYear={formatYear}
            {...commonProps}
          />
        );
      }
      case 'year': {
        const { formatMonth, formatMonthYear } = this.props;

        return (
          <YearView
            formatMonth={formatMonth}
            formatMonthYear={formatMonthYear}
            {...commonProps}
          />
        );
      }
      case 'yearQuarter': {
        return (
          <YearQuarterView
            {...commonProps}
          />
        );
      }
      case 'month': {
        const {
          formatDay,
          formatLongDate,
          formatShortWeekday,
          onClickWeekNumber,
          showDoubleView,
          showFixedNumberOfWeeks,
          showNeighboringMonth,
          showWeekNumbers,
        } = this.props;
        const { onMouseLeave } = this;

        return (
          <MonthView
            calendarType={calendarType}
            formatDay={formatDay}
            formatLongDate={formatLongDate}
            formatShortWeekday={formatShortWeekday}
            onClickWeekNumber={onClickWeekNumber}
            onMouseLeave={selectRange ? onMouseLeave : null}
            showFixedNumberOfWeeks={showFixedNumberOfWeeks || showDoubleView}
            showNeighboringMonth={showNeighboringMonth}
            showWeekNumbers={showWeekNumbers}
            {...commonProps}
          />
        );
      }
      default:
        throw new Error(`Invalid view: ${view}.`);
    }
  }

  renderNavigation() {
    const { showNavigation } = this.props;

    if (!showNavigation) {
      return null;
    }

    const { activeStartDate, view, views } = this;
    const {
      formatMonthYear,
      formatYear,
      locale,
      maxDate,
      minDate,
      navigationAriaLabel,
      navigationLabel,
      next2AriaLabel,
      next2Label,
      nextAriaLabel,
      nextLabel,
      prev2AriaLabel,
      prev2Label,
      prevAriaLabel,
      prevLabel,
      showDoubleView,
    } = this.props;

    return (
      <Navigation
        activeStartDate={activeStartDate}
        drillUp={this.drillUp}
        formatMonthYear={formatMonthYear}
        formatYear={formatYear}
        locale={locale}
        maxDate={maxDate}
        minDate={minDate}
        navigationAriaLabel={navigationAriaLabel}
        navigationLabel={navigationLabel}
        next2AriaLabel={next2AriaLabel}
        next2Label={next2Label}
        nextAriaLabel={nextAriaLabel}
        nextLabel={nextLabel}
        prev2AriaLabel={prev2AriaLabel}
        prev2Label={prev2Label}
        prevAriaLabel={prevAriaLabel}
        prevLabel={prevLabel}
        setActiveStartDate={this.setActiveStartDate}
        showDoubleView={showDoubleView}
        view={view}
        views={views}
      />
    );
  }

  render() {
    const {
      className,
      inputRef,
      selectRange,
      showDoubleView,
    } = this.props;
    const { onMouseLeave, value } = this;
    const valueArray = [].concat(value);

    return (
      <div
        className={mergeClassNames(
          baseClassName,
          selectRange && valueArray.length === 1 && `${baseClassName}--selectRange`,
          showDoubleView && `${baseClassName}--doubleView`,
          className,
        )}
        ref={inputRef}
      >
        {this.renderNavigation()}
        <div
          className={`${baseClassName}__viewContainer`}
          onBlur={selectRange ? onMouseLeave : null}
          onMouseLeave={selectRange ? onMouseLeave : null}
        >
          {this.renderContent()}
          {showDoubleView && this.renderContent(true)}
        </div>
      </div>
    );
  }
}

Calendar.defaultProps = {
  maxDate: defaultMaxDate,
  maxDetail: 'month',
  minDate: defaultMinDate,
  minDetail: 'century',
  returnValue: 'start',
  showNavigation: true,
  showNeighboringMonth: true,
};

const isActiveStartDate = PropTypes.instanceOf(Date);
const isLooseValue = PropTypes.oneOfType([
  PropTypes.string,
  isValue,
]);

Calendar.propTypes = {
  activeStartDate: isActiveStartDate,
  allowPartialRange: PropTypes.bool,
  calendarType: isCalendarType,
  className: isClassName,
  defaultActiveStartDate: isActiveStartDate,
  defaultValue: isLooseValue,
  defaultView: isView,
  formatDay: PropTypes.func,
  formatLongDate: PropTypes.func,
  formatMonth: PropTypes.func,
  formatMonthYear: PropTypes.func,
  formatShortWeekday: PropTypes.func,
  formatYear: PropTypes.func,
  inputRef: isRef,
  locale: PropTypes.string,
  maxDate: isMaxDate,
  maxDetail: PropTypes.oneOf(['century', 'decade', 'yearQuarter', 'year', 'month']),
  minDate: isMinDate,
  minDetail: PropTypes.oneOf(['century', 'decade', 'yearQuarter', 'year', 'month']),
  navigationAriaLabel: PropTypes.string,
  navigationLabel: PropTypes.func,
  next2AriaLabel: PropTypes.string,
  next2Label: PropTypes.node,
  nextAriaLabel: PropTypes.string,
  nextLabel: PropTypes.node,
  onActiveStartDateChange: PropTypes.func,
  onChange: PropTypes.func,
  onClickDay: PropTypes.func,
  onClickDecade: PropTypes.func,
  onClickMonth: PropTypes.func,
  onClickQuarter: PropTypes.func,
  onClickWeekNumber: PropTypes.func,
  onClickYear: PropTypes.func,
  onDrillDown: PropTypes.func,
  onDrillUp: PropTypes.func,
  onViewChange: PropTypes.func,
  prev2AriaLabel: PropTypes.string,
  prev2Label: PropTypes.node,
  prevAriaLabel: PropTypes.string,
  prevLabel: PropTypes.node,
  returnValue: PropTypes.oneOf(['start', 'end', 'range']),
  selectRange: PropTypes.bool,
  showDoubleView: PropTypes.bool,
  showFixedNumberOfWeeks: PropTypes.bool,
  showNavigation: PropTypes.bool,
  showNeighboringMonth: PropTypes.bool,
  showWeekNumbers: PropTypes.bool,
  tileClassName: PropTypes.oneOfType([
    PropTypes.func,
    isClassName,
  ]),
  tileContent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
  ]),
  tileDisabled: PropTypes.func,
  value: isLooseValue,
  view: isView,
};
