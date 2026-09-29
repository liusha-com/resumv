import type { Style } from "@react-pdf/types";

type RtlStyleHelpers = {
	rtl: boolean;
	pageDirection: "ltr" | "rtl";
	row: "row" | "row-reverse";
	text: Pick<Style, "direction" | "textAlign">;
	alignEnd: Pick<Style, "textAlign" | "minWidth" | "maxWidth" | "flexShrink">;
	sectionHeadingTextAlign: NonNullable<Style["textAlign"]>;
	headerIdentity: Pick<Style, "textAlign" | "alignItems">;
	listMarkerTextAlign: NonNullable<Style["textAlign"]>;
	gridRowStyle: Style | undefined;
	contactSeparator: (color: string, gap: number) => Style;
	contactSeparatorClear: Style;
	anchorToStart: (offset?: number | string) => Style;
};

export function createRtlStyleHelpers(rtl: boolean): RtlStyleHelpers {
	return {
		rtl,
		pageDirection: rtl ? "rtl" : "ltr",
		row: rtl ? "row-reverse" : "row",
		text: rtl ? { direction: "rtl", textAlign: "right" } : {},
		alignEnd: {
			textAlign: rtl ? "left" : "right",
			minWidth: 0,
			maxWidth: "100%",
			flexShrink: 1,
		},
		sectionHeadingTextAlign: rtl ? "right" : "left",
		headerIdentity: rtl
			? { textAlign: "right", alignItems: "flex-end" }
			: { textAlign: "left", alignItems: "flex-start" },
		listMarkerTextAlign: rtl ? "left" : "right",
		gridRowStyle: rtl ? { flexDirection: "row-reverse" } : undefined,
		contactSeparator: (color, gap) =>
			rtl
				? {
						borderLeftWidth: 1,
						borderLeftColor: color,
						paddingLeft: gap,
						marginLeft: gap,
					}
				: {
						borderRightWidth: 1,
						borderRightColor: color,
						paddingRight: gap,
						marginRight: gap,
					},
		contactSeparatorClear: rtl
			? { borderLeftWidth: 0, paddingLeft: 0, marginLeft: 0 }
			: { borderRightWidth: 0, paddingRight: 0, marginRight: 0 },
		anchorToStart: (offset = 0) => (rtl ? { right: offset } : { left: offset }),
	};
}
