import { useState } from 'react';
import CreatableSelect from 'react-select/creatable';

const createOption = (label) => ({
  label,
  value: label,
});

export const CreatableTagsInput = ({ value = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const selectValue = value.map((tag) => createOption(tag));

  const addTags = (text) => {
    const newTags = text
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !value.includes(t));

    if (newTags.length) {
      onChange([...value, ...newTags]);
    }
  };

  const handleKeyDown = (event) => {
    if (!inputValue) return;

    switch (event.key) {
      case 'Enter':
      case 'Tab':
        event.preventDefault();
        addTags(inputValue);
        setInputValue('');
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
      components={{ DropdownIndicator: null }}
      inputValue={inputValue}
      isClearable={true}
      isMulti
      menuIsOpen={false}
      onChange={handleChange}
      onInputChange={setInputValue}
      onKeyDown={handleKeyDown}
      placeholder='Type or paste tags, then press Enter or Tab...'
      value={selectValue}
      className='h-12'
    />
  );
};
