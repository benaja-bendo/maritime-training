const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

// In English only exactly 1 is singular: « 1 day », « 0.5 days », « 2 days ».
export const formatDays = (days: number) =>
  `${number.format(days)} day${days === 1 ? '' : 's'}`;

export const formatHours = (hours: number) => `${number.format(hours)} h`;
