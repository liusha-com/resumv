import type { TemplateSemanticManifest } from "../../semantic/template-manifest";
import { baseManifest, itemHeaderRowPart } from "../../semantic/shared-parts";

export const chikoritaSemanticManifest = baseManifest("chikorita", [
	itemHeaderRowPart,
	{
		name: "contact-row-primary",
		key: "contact-row-primary",
		owner: { kind: "contact-list", key: "contact-list" },
		binding: { type: "primitive", primitive: "View", source: "existing" },
		route: {
			parent: "owner",
			at: "start",
			take: [
				{ kind: "contact-item", name: "email" },
				{ kind: "contact-item", name: "phone" },
				{ kind: "contact-item", name: "location" },
			],
		},
	},
	{
		name: "contact-row-secondary",
		key: "contact-row-secondary",
		owner: { kind: "contact-list", key: "contact-list" },
		binding: { type: "primitive", primitive: "View", source: "existing" },
		route: {
			parent: "owner",
			at: "end",
			take: [
				{ kind: "contact-item", name: "website" },
				{ kind: "contact-item", name: "custom" },
			],
		},
	},
]) satisfies TemplateSemanticManifest;
