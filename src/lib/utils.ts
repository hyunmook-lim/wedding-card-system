import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = days[date.getUTCDay()];

  const hourKey = date.getUTCHours();
  const ampm = hourKey >= 12 ? '오후' : '오전';
  const hour = hourKey % 12 || 12;
  const minute = date.getUTCMinutes();
  
  // Format: 2024년 5월 18일 토요일 오후 2시 00분
  return `${year}년 ${month}월 ${day}일 ${dayName} ${ampm} ${hour}시${minute > 0 ? ` ${minute}분` : ''}`;
}
