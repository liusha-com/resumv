import type { TemplateSemanticManifest } from "../../semantic/template-manifest";
import { baseManifest, itemHeaderRowPart } from "../../semantic/shared-parts";

export const azurillSemanticManifest = baseManifest("azurill", [
	itemHeaderRowPart,
	{
		name: "timeline-line",
		key: "timeline-line",
		owner: { kind: "section-items", key: "section-items", placement: "main", columns: 1 },
		binding: { type: "primitive", primitive: "View", source: "existing" },
		route: { parent: "owner", at: "start" },
	},
	{
		name: "timeline-marker",
		key: "timeline-marker",
		owner: { kind: "item", key: "item", placement: "main", columns: 1 },
		binding: { type: "primitive", primitive: "View", source: "existing" },
		route: { parent: "owner", at: "start" },
	},
	{
		name: "timeline-dot",
		key: "timeline-dot",
		owner: { kind: "item", key: "item", placement: "main", columns: 1 },
		binding: { type: "primitive", primitive: "View", source: "existing" },
		route: { parent: "timeline-marker", at: "start" },
	},
	{
		name: "timeline-content",
		key: "timeline-content",
		owner: { kind: "item", key: "item", placement: "main", columns: 1 },
		binding: { type: "primitive", primitive: "View", source: "existing" },
		route: { parent: "owner", at: "end", take: "all" },
	},
]) satisfies TemplateSemanticManifest;
