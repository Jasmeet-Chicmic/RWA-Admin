"use client";
import React, { useEffect, useRef } from "react";

// Define the props for the CheckClickOutside component
interface CheckClickOutsideProps {
  onClick: () => void; // Callback function for outside click
  children: React.ReactNode; // Child components or elements
  className?: string;
}

/**
 * Hook that checks clicks outside of the passed ref
 */
function useOutsideClickFunc(
  ref: React.RefObject<HTMLDivElement | null>,
  onClick: () => void,
) {
  useEffect(() => {
    /**
     * Handles click events outside of the wrapped element
     */
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        event.stopPropagation();
        onClick();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClick, ref]);
}

/**
 * Component that checks if you click outside of it
 */
export default function CheckClickOutside(
  props: Readonly<CheckClickOutsideProps>,
) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useOutsideClickFunc(wrapperRef, props.onClick);

  return (
    <div className={props.className} ref={wrapperRef}>
      {props.children}
    </div>
  );
}
