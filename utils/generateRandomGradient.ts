import colorPairs from "@/utils/colorPairs";

const generateRandomGradient = (seed: string) => {
  const hash = Array.from(seed).reduce(
    (acc, char, index) => acc + char.charCodeAt(0) * (index + 1),
    0,
  );

  const index = hash % colorPairs.length;
  const [color1, color2] = colorPairs[index];

  // Use the hash to determine the gradient type
  const isRadial = hash % 2 === 0;
  const gradientType = isRadial ? "radial-gradient" : "linear-gradient";
  const angle = hash % 360;

  // Construct the gradient string based on the type
  return isRadial
    ? `${gradientType}(circle, ${color1}, ${color2})`
    : `${gradientType}(${angle}deg, ${color1}, ${color2})`;
};

export default generateRandomGradient;
