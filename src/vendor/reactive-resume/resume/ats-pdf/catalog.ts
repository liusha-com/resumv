import type { PdfCategory } from "./types";

/**
 * The whole scoring table, as one auditable object.
 *
 * - `blocker` rules put a hard ceiling on the overall score. A file with no text
 *   layer cannot score 82 no matter how tidy the rest of it is.
 * - `warning` rules deduct from their category once, however many times they fire.
 * - `tip` rules never touch any score. They are human-preference advice, and are
 *   reported as an unscored checklist.
 */
type PdfRuleReference =
	| { severity: "blocker"; category: PdfCategory; cap: number }
	| { severity: "warning"; category: PdfCategory; deduction: 5 | 10 | 15 }
	| { severity: "tip"; category: PdfCategory };

export const PDF_ATS_RULE_CATALOG_V1 = {
	// -------------------------------------------------------------------------
	// Parseability — can software recover the words at all?
	// -------------------------------------------------------------------------
	NO_TEXT_LAYER: {
		severity: "blocker",
		category: "parseability",
		cap: 10,
	},
	IMAGE_ONLY_DOCUMENT: {
		severity: "blocker",
		category: "parseability",
		cap: 10,
	},
	GARBLED_TEXT: {
		severity: "blocker",
		category: "parseability",
		cap: 25,
	},
	TYPE3_FONT: {
		severity: "blocker",
		category: "parseability",
		cap: 25,
	},
	INVALID_EMBEDDED_FONT: {
		severity: "blocker",
		category: "parseability",
		cap: 25,
	},
	FILE_TOO_LARGE: {
		severity: "blocker",
		category: "parseability",
		cap: 40,
	},
	ENCRYPTED_PDF: {
		severity: "blocker",
		category: "parseability",
		cap: 40,
	},
	XFA_FORM: {
		severity: "blocker",
		category: "parseability",
		cap: 40,
	},
	PDF_PORTFOLIO: {
		severity: "warning",
		category: "parseability",
		deduction: 15,
	},
	REPLACEMENT_CHARACTERS: {
		severity: "warning",
		category: "parseability",
		deduction: 15,
	},
	PRIVATE_USE_CHARACTERS: {
		severity: "warning",
		category: "parseability",
		deduction: 15,
	},
	LIGATURE_CHARACTERS: {
		severity: "warning",
		category: "parseability",
		deduction: 10,
	},
	NON_EMBEDDED_FONTS: {
		severity: "warning",
		category: "parseability",
		deduction: 5,
	},
	INVISIBLE_TEXT: {
		severity: "warning",
		category: "parseability",
		deduction: 15,
	},
	WHITE_TEXT: {
		severity: "warning",
		category: "parseability",
		deduction: 15,
	},
	LOW_TEXT_DENSITY: {
		severity: "warning",
		category: "parseability",
		deduction: 10,
	},
	HIGH_IMAGE_COVERAGE: {
		severity: "warning",
		category: "parseability",
		deduction: 10,
	},
	LOST_WORD_SPACING: {
		severity: "warning",
		category: "parseability",
		deduction: 10,
	},
	SPLIT_CHARACTER_SPACING: {
		severity: "warning",
		category: "parseability",
		deduction: 10,
	},
	VERTICAL_TEXT: {
		severity: "warning",
		category: "parseability",
		deduction: 10,
	},
	ROTATED_PAGES: {
		severity: "warning",
		category: "parseability",
		deduction: 5,
	},
	ACROFORM_FIELDS: {
		severity: "warning",
		category: "parseability",
		deduction: 10,
	},
	NON_STANDARD_PAGE_SIZE: {
		severity: "warning",
		category: "parseability",
		deduction: 5,
	},
	UNTAGGED_PDF: {
		severity: "tip",
		category: "parseability",
	},
	MISSING_DOCUMENT_LANGUAGE: {
		severity: "tip",
		category: "parseability",
	},
	LARGE_FILE_SIZE: {
		severity: "tip",
		category: "parseability",
	},
	TRUNCATED_ANALYSIS: {
		severity: "tip",
		category: "parseability",
	},

	// -------------------------------------------------------------------------
	// Layout — does the geometry preserve reading order?
	// -------------------------------------------------------------------------
	MULTI_COLUMN_LAYOUT: {
		severity: "blocker",
		category: "layout",
		cap: 55,
	},
	READING_ORDER_INVERSION: {
		severity: "blocker",
		category: "layout",
		cap: 55,
	},
	READING_ORDER_RISK: {
		severity: "warning",
		category: "layout",
		deduction: 15,
	},
	COLUMN_GUTTER: {
		severity: "warning",
		category: "layout",
		deduction: 15,
	},
	TABLE_LIKE_LAYOUT: {
		severity: "warning",
		category: "layout",
		deduction: 10,
	},
	TEXT_IN_MARGIN_ZONE: {
		severity: "warning",
		category: "layout",
		deduction: 10,
	},
	TIGHT_LINE_SPACING: {
		severity: "warning",
		category: "layout",
		deduction: 5,
	},
	SMALL_BODY_TEXT: {
		severity: "warning",
		category: "layout",
		deduction: 10,
	},
	MANY_DISTINCT_FONTS: {
		severity: "warning",
		category: "layout",
		deduction: 5,
	},
	NARROW_PAGE_MARGINS: {
		severity: "warning",
		category: "layout",
		deduction: 5,
	},
	TEXT_OUTSIDE_PAGE: {
		severity: "warning",
		category: "layout",
		deduction: 10,
	},
	NON_STANDARD_BULLET_GLYPHS: {
		severity: "warning",
		category: "layout",
		deduction: 5,
	},
	REPEATED_HEADER_FOOTER: {
		severity: "tip",
		category: "layout",
	},
	DENSE_PAGE: {
		severity: "tip",
		category: "layout",
	},

	// -------------------------------------------------------------------------
	// Sections — is the resume segmented the way a parser expects?
	// -------------------------------------------------------------------------
	NO_EXPERIENCE_SECTION: {
		severity: "blocker",
		category: "sections",
		cap: 60,
	},
	NO_RECOGNIZED_HEADINGS: {
		severity: "warning",
		category: "sections",
		deduction: 15,
	},
	FEW_SECTION_HEADINGS: {
		severity: "warning",
		category: "sections",
		deduction: 10,
	},
	NO_EDUCATION_SECTION: {
		severity: "warning",
		category: "sections",
		deduction: 10,
	},
	NO_SKILLS_SECTION: {
		severity: "warning",
		category: "sections",
		deduction: 10,
	},
	HEADINGS_NOT_DISTINGUISHED: {
		severity: "warning",
		category: "sections",
		deduction: 10,
	},
	VERY_SHORT_DOCUMENT: {
		severity: "warning",
		category: "sections",
		deduction: 15,
	},
	NO_BULLET_POINTS: {
		severity: "warning",
		category: "sections",
		deduction: 5,
	},
	NO_ROLE_LINES: {
		severity: "warning",
		category: "sections",
		deduction: 10,
	},
	NO_SUMMARY_SECTION: {
		severity: "tip",
		category: "sections",
	},

	// -------------------------------------------------------------------------
	// Contact — will the system be able to reach you?
	// -------------------------------------------------------------------------
	NO_EMAIL: {
		severity: "blocker",
		category: "contact",
		cap: 50,
	},
	NO_PHONE: {
		severity: "warning",
		category: "contact",
		deduction: 15,
	},
	NO_NAME_LINE: {
		severity: "warning",
		category: "contact",
		deduction: 15,
	},
	CONTACT_NOT_ON_FIRST_PAGE: {
		severity: "warning",
		category: "contact",
		deduction: 10,
	},
	EMAIL_SPLIT_ACROSS_ITEMS: {
		severity: "warning",
		category: "contact",
		deduction: 15,
	},
	LINK_TEXT_URL_MISMATCH: {
		severity: "warning",
		category: "contact",
		deduction: 10,
	},
	MULTIPLE_EMAILS: {
		severity: "tip",
		category: "contact",
	},
	NO_PROFESSIONAL_LINK: {
		severity: "tip",
		category: "contact",
	},
	BARE_URL_WITHOUT_PROTOCOL: {
		severity: "tip",
		category: "contact",
	},
	PHONE_FORMAT_UNUSUAL: {
		severity: "tip",
		category: "contact",
	},

	// -------------------------------------------------------------------------
	// Dates — can your timeline be reconstructed?
	// -------------------------------------------------------------------------
	NO_DATES_FOUND: {
		severity: "blocker",
		category: "dates",
		cap: 60,
	},
	FEW_DATES: {
		severity: "warning",
		category: "dates",
		deduction: 15,
	},
	UNPARSEABLE_DATE_RANGE: {
		severity: "warning",
		category: "dates",
		deduction: 15,
	},
	REVERSED_DATE_RANGE: {
		severity: "warning",
		category: "dates",
		deduction: 15,
	},
	FUTURE_DATED_ENTRY: {
		severity: "warning",
		category: "dates",
		deduction: 10,
	},
	MIXED_DATE_FORMATS: {
		severity: "warning",
		category: "dates",
		deduction: 5,
	},
	NO_CURRENT_ROLE_MARKER: {
		severity: "tip",
		category: "dates",
	},
	AMBIGUOUS_NUMERIC_DATE: {
		severity: "tip",
		category: "dates",
	},

	// -------------------------------------------------------------------------
	// Content — unscored advice. These never move any number in this report.
	// -------------------------------------------------------------------------
	NO_QUANTIFIED_IMPACT: {
		severity: "tip",
		category: "content",
	},
	WEAK_ACTION_VERBS: {
		severity: "tip",
		category: "content",
	},
	FIRST_PERSON_PRONOUNS: {
		severity: "tip",
		category: "content",
	},
	LONG_BULLETS: {
		severity: "tip",
		category: "content",
	},
	HIGH_PAGE_COUNT: {
		severity: "tip",
		category: "content",
	},
	EMPLOYMENT_GAP: {
		severity: "tip",
		category: "content",
	},
	ALL_CAPS_RUNS: {
		severity: "tip",
		category: "content",
	},
	REPEATED_PHRASES: {
		severity: "tip",
		category: "content",
	},
} as const satisfies Readonly<Record<string, PdfRuleReference>>;

export type PdfRuleCode = keyof typeof PDF_ATS_RULE_CATALOG_V1;

export const PDF_ATS_RULE_CODES = Object.keys(PDF_ATS_RULE_CATALOG_V1) as readonly PdfRuleCode[];

export const pdfRuleSeverity = (code: PdfRuleCode) => PDF_ATS_RULE_CATALOG_V1[code].severity;

export const pdfRuleCategory = (code: PdfRuleCode): PdfCategory => PDF_ATS_RULE_CATALOG_V1[code].category;

/** The ceiling a fired blocker puts on the overall score, or null for non-blockers. */
export function pdfRuleCap(code: PdfRuleCode): number | null {
	const rule = PDF_ATS_RULE_CATALOG_V1[code];
	return rule.severity === "blocker" ? rule.cap : null;
}

/** What a fired warning costs its category, or 0 for anything else. */
export function pdfRuleDeduction(code: PdfRuleCode): number {
	const rule = PDF_ATS_RULE_CATALOG_V1[code];
	return rule.severity === "warning" ? rule.deduction : 0;
}
