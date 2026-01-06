export function createRouter({ renderScreen, setStep }) {
  return { go(step){ setStep(step); renderScreen(); } };
}
