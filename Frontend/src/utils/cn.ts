import { twMerge } from 'tailwind-merge';

type ClassValue = string | number | null | undefined | false | ClassValue[];

/** Small class-name joiner with Tailwind conflict resolution. */
export function cn(...values: ClassValue[]): string {
  const flatten = (input: ClassValue): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) return input.flatMap(flatten);
    return [String(input)];
  };
  return twMerge(values.flatMap(flatten).join(' '));
}