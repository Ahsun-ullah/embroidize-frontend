import { useState } from 'react';
import CreatableSelect from 'react-select/creatable';

const createOption = (label) => ({
  label,
  value: label,
});

export const CreatableTagsInput = ({ value = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const selectValue = value.map((tag) => createOption(tag));

  const handleKeyDown = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        const newTag = inputValue.trim();
        if (newTag) {
          onChange([...value, newTag]);
          setInputValue('');
        }
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  const handleChange = (newValue) => {
    const tags = newValue ? newValue.map((option) => option.value) : [];
    onChange(tags);
  };

  return (
    <CreatableSelect
      components={{
        DropdownIndicator: null,
      }}
      inputValue={inputValue}
      isClearable={true}
      isMulti
      menuIsOpen={false}
      onChange={handleChange}
      onInputChange={setInputValue}
      onKeyDown={handleKeyDown}
      placeholder='Type something and press enter...'
      value={selectValue}
    />
  );
};
