import { parseColorString, rgbaStringToHex } from "@reactive-resume/utils/color";

/** Returns the primary color as an `rgba()` string at the given opacity, falling back to a hex color. */
export const getPrimaryTint = (primaryColor: string, opacity: number): string => {
	const primary = parseColorString(primaryColor);

	if (!primary) return rgbaStringToHex(primaryColor);

	const alpha = Math.max(0, Math.min(1, primary.a * opacity));

	return `rgba(${primary.r}, ${primary.g}, ${primary.b}, ${alpha})`;
};
