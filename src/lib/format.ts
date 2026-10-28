const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

// En français, le singulier s'emploie jusqu'à 2 exclu : « 0,5 jour », « 1 jour », « 2 jours ».
export const formatDays = (days: number) =>
  `${number.format(days)} jour${days >= 2 ? 's' : ''}`;

export const formatHours = (hours: number) => `${number.format(hours)} h`;
