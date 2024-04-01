const generateRandomGradient = (seed) => {
  const colorPairs: string[][] = [
    ["#f6d365", "#fda085"], // Pastel yellow to pastel orange
    ["#fbc2eb", "#a6c1ee"], // Pastel pink to pastel blue
    ["#e0c3fc", "#8ec5fc"], // Pastel purple to pastel sky blue
    ["#ffecd2", "#fcb69f"], // Pastel peach to pastel orange
    ["#a1c4fd", "#c2e9fb"], // Pastel blue to pastel cyan
    ["#fed6e3", "#a8edea"], // Pastel pink to pastel aqua
    ["#ff9a9e", "#fad0c4"], // Soft red to soft peach
    ["#ffecd2", "#fcb69f"], // Soft peach to soft orange
    ["#a18cd1", "#fbc2eb"], // Soft purple to soft pink
    ["#fad0c4", "#ffd1ff"], // Soft peach to soft lavender
    ["#f6d365", "#fda085"], // Soft yellow to soft orange
    ["#84fab0", "#8fd3f4"], // Soft teal to soft blue
    ["#a6c0fe", "#f68084"], // Soft blue to soft red
    ["#fccb90", "#d57eeb"], // Soft orange to soft purple
    ["#e0c3fc", "#8ec5fc"], // Soft purple to soft blue
    ["#8ec5fc", "#e0c3fc"], // Soft blue to soft purple
    ["#4facfe", "#00f2fe"], // Bright blue to bright cyan
    ["#43e97b", "#38f9d7"], // Bright green to bright teal
    ["#fa709a", "#fee140"], // Bright pink to bright yellow
    ["#30cfd0", "#330867"], // Bright teal to deep purple
    ["#c471f5", "#fa71cd"], // Bright purple to bright pink
    ["#48c6ef", "#6f86d6"], // Bright sky blue to bright periwinkle
    ["#feada6", "#f5efef"], // Soft coral to light gray
    ["#a1c4fd", "#c2e9fb"], // Soft blue to soft cyan
    ["#d4fc79", "#96e6a1"], // Light green to soft green
    ["#84fab0", "#8fd3f4"], // Soft teal to soft blue
    ["#cfd9df", "#e2ebf0"], // Light gray to lighter gray
    ["#a6c0fe", "#f68084"], // Soft blue to soft red
    ["#fccb90", "#d57eeb"], // Soft orange to soft purple
    ["#e0c3fc", "#8ec5fc"], // Soft purple to soft blue
    ["#8ec5fc", "#e0c3fc"], // Soft blue to soft purple
    ["#4facfe", "#00f2fe"], // Bright blue to bright cyan
    ["#43e97b", "#38f9d7"], // Bright green to bright teal
    ["#fa709a", "#fee140"], // Bright pink to bright yellow
    ["#30cfd0", "#330867"], // Bright teal to deep purple
    ["#c471f5", "#fa71cd"], // Bright purple to bright pink
    ["#48c6ef", "#6f86d6"], // Bright sky blue to bright periwinkle
    ["#feada6", "#f5efef"], // Soft coral to light gray
    ["#a1c4fd", "#c2e9fb"], // Soft blue to soft cyan
    ["#d4fc79", "#96e6a1"], // Light green to soft green
    ["#84fab0", "#8fd3f4"], // Soft teal to soft blue
    ["#cfd9df", "#e2ebf0"], // Light gray to lighter gray
  ];

  // Ensure the seed is a string
  const validSeed = typeof seed === "string" ? seed : "";

  // Simple hash function to generate a pseudo-random number based on the seed
  const hash = Array.from(validSeed).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );

  const index = hash % colorPairs.length;
  const [color1, color2] = colorPairs[index];
  return `radial-gradient(circle at 50% 50%, ${color1}, ${color2})`;
};

export default generateRandomGradient;
