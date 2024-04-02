import colorPairs from "@/utils/colorPairs";

const generateRandomGradient = (seed: string) => {
  // Ensure the seed is a string
  const validSeed = typeof seed === "string" ? seed : "";

  // Modified hash function to incorporate the position of each character
  const hash = Array.from(validSeed).reduce(
    (acc, char, index) => acc + char.charCodeAt(0) * (index + 1),
    0,
  );

  const index = hash % colorPairs.length;
  const [color1, color2] = colorPairs[index];

  // Use the hash to generate percentages for the gradient's center position
  const xPercent = hash % 100;
  const yPercent = (hash / 100) % 100;

  return `radial-gradient(circle at ${xPercent}% ${yPercent}%, ${color1}, ${color2})`;
};

export default generateRandomGradient;
