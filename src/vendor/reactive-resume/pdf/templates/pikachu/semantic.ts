import type { TemplateSemanticManifest } from "../../semantic/template-manifest";
import { baseManifest, itemHeaderRowPart } from "../../semantic/shared-parts";

export const pikachuSemanticManifest = baseManifest("pikachu", [
	itemHeaderRowPart,
	{
		name: "header-divider",
		key: "header-divider",
		owner: { kind: "header", key: "header" },
		binding: { type: "primitive", primitive: "View", source: "existing" },
		route: { parent: "owner", at: "start", take: [{ kind: "name" }, { kind: "headline" }] },
	},
]) satisfies TemplateSemanticManifest;
