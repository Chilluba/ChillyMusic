import React, { useState, useRef, useEffect } from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  filterCategoryLabel: string;
  options: FilterOption[];
  initialValue?: string;
  onFilterChange: (selectedValue: string) => void;
  zIndex?: number; // Optional z-index for dropdown visibility
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  filterCategoryLabel,
  options,
  initialValue,
  onFilterChange, // This will now be a dispatching function from parent
  zIndex,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // SelectedValue is now managed by Redux, passed via currentValueFromState
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOptionDetails = options.find(opt => opt.value === currentValueFromState) || options[0];

  const handleToggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectOption = (option: FilterOption) => {
    // Redux will handle the state change via the dispatched action
    onFilterChange(option.value); // This prop should now dispatch the Redux action
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} style={{ zIndex }}>
      <button
        type="button"
        className="inline-flex justify-center items-center w-full rounded-md border border-border bg-background-tertiary px-4 py-2 text-sm font-medium text-text-secondary hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-tertiary focus:ring-accent-primary min-h-[38px]"
        onClick={handleToggleDropdown}
      >
        {filterCategoryLabel}: <span className="font-semibold text-text-primary ml-1">{selectedOptionDetails?.label || 'Any'}</span>
        <svg
          className={`-mr-1 ml-2 h-5 w-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-background-secondary ring-1 ring-border ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {options.map((option) => (
              <a
                key={option.value}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectOption(option);
                }}
                className={`block px-4 py-2 text-sm ${
                  option.value === selectedValue
                    ? 'font-medium text-accent-primary bg-background-tertiary'
                    : 'text-text-primary hover:bg-background-tertiary hover:text-accent-secondary'
                }`}
                role="menuitem"
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
