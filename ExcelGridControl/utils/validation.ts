export const isValidDropdownValue = (value: string, options: string[]): boolean => {
  return options.includes(value) || value === "";
};

export const filterOptions = (options: string[], input: string): string[] => {
  if (!input.trim()) return options;
  return options.filter(option =>
    option.toLowerCase().includes(input.toLowerCase())
  );
};