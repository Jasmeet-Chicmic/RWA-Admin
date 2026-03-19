import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchInputProps) => {
  return (
    <div className={`relative rounded-[8px] ${className}`}>
      <Search
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textprimary dark:text-secondary"
        size={18}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10 px-4 py-3 w-full dark:border-white/50 border border-b border-bordergray200ordercolor1 placeholder:text-[#8F9BBA] bg-bgwhite dark:bg-darkbgprimary rounded-[10px] focus:outline-none transition-all duration-200 text-bgblack dark:text-white"
      />
    </div>
  );
};

export default SearchInput;
