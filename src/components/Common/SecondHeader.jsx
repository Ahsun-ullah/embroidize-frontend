import React from 'react';
import CategorySelect from './CategorySelect';

const SecondHeader = () => {
  return (
    <div className="bg-black h-10 flex justify-center">
      <div>
        <CategorySelect />
      </div>
    </div>
  );
};

export default SecondHeader;
