import React from 'react';

import Quarters from './QuarterView/Quarters';

export default function YearQuarterView(props) {
  function renderQuarters() {
    return (
      <Quarters {...props} />
    );
  }

  return (
    <div className="react-calendar__year-year-quarter-view">
      {renderQuarters()}
    </div>
  );
}
