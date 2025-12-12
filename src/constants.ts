export const GRADES = [
    '유치부 5세',
    '유치부 6세',
    '유치부 7세',
    '초등 1학년',
    '초등 2학년',
    '초등 3학년',
    '초등 4학년',
    '초등 5학년',
    '초등 6학년',
    '중등 1학년',
    '중등 2학년',
    '중등 3학년',
    '고등 1학년',
    '고등 2학년',
    '고등 3학년',
] as const;

export type Grade = typeof GRADES[number];
