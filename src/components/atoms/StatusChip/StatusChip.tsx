"use client";

type StatusChipProps = {
  label: string;
  className?: string;
};

const StatusChip = ({ label, className = "" }: StatusChipProps) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
};

export default StatusChip;
