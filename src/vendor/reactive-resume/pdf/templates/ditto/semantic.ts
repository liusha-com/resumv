import type { TemplateSemanticManifest } from "../../semantic/template-manifest";
import { baseManifest, itemHeaderRowPart } from "../../semantic/shared-parts";

export const dittoSemanticManifest = baseManifest("ditto", [
	itemHeaderRowPart,
	{
		name: "header-band",
		key: "header-band",
		owner: { kind: "header", key: "header" },
		binding: { type: "primitive", primitive: "View", source: "existing" },
		route: {
			parent: "owner",
			at: "start",
			take: [{ kind: "picture" }, { kind: "name" }, { kind: "headline" }],
		},
	},
	{
		name: "picture-anchor",
		key: "picture-anchor",
		owner: { kind: "header", key: "header" },
		binding: { type: "primitive", primitive: "View", source: "existing" },
		route: { parent: "header-band", at: "start", take: [{ kind: "picture" }] },
	},
	{
		name: "contact-offset",
		key: "contact-offset",
		owner: { kind: "header", key: "header" },
		binding: { type: "primitive", primitive: "View", source: "existing" },
		route: { parent: "owner", at: { before: { kind: "contact-list" } } },
	},
]) satisfies TemplateSemanticManifest;
