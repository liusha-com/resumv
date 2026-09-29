import type { AtsSeverity } from "./types";

type AtsRuleReference = {
	severity: AtsSeverity;
};

export const ATS_RULE_CATALOG_V1 = {
	MISSING_NAME: {
		severity: "error",
	},
	MISSING_EMAIL: {
		severity: "error",
	},
	MALFORMED_EMAIL: {
		severity: "error",
	},
	MISSING_PHONE: {
		severity: "warning",
	},
	MISSING_LOCATION: {
		severity: "info",
	},
	MALFORMED_URL: {
		severity: "warning",
	},
	PICTURE_PRESENT: {
		severity: "info",
	},

	EMPTY_PERIOD: {
		severity: "warning",
	},
	UNPARSEABLE_PERIOD: {
		severity: "error",
	},
	UNPARSEABLE_DATE: {
		severity: "warning",
	},
	REVERSED_PERIOD: {
		severity: "error",
	},
	FUTURE_DATED_PERIOD: {
		severity: "warning",
	},

	SECTION_MISSING_FROM_LAYOUT: {
		severity: "error",
	},
	NO_VISIBLE_EXPERIENCE: {
		severity: "warning",
	},
	MISSING_EXPERIENCE_DESCRIPTION: {
		severity: "warning",
	},
	NON_STANDARD_SECTION_TITLE: {
		severity: "info",
	},

	MULTI_COLUMN_PROSE_SECTION: {
		severity: "warning",
	},
	PROSE_SECTION_IN_SIDEBAR: {
		severity: "warning",
	},

	SMALL_BODY_FONT: {
		severity: "warning",
	},
	TIGHT_LINE_HEIGHT: {
		severity: "warning",
	},
	TIGHT_PAGE_MARGINS: {
		severity: "warning",
	},
} as const satisfies Readonly<Record<string, AtsRuleReference>>;

export type AtsRuleCode = keyof typeof ATS_RULE_CATALOG_V1;

export const ATS_RULE_CODES = Object.keys(ATS_RULE_CATALOG_V1) as readonly AtsRuleCode[];

export const atsRuleSeverity = (code: AtsRuleCode): AtsSeverity => ATS_RULE_CATALOG_V1[code].severity;
