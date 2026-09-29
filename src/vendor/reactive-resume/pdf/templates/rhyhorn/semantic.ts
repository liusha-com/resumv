import type { TemplateSemanticManifest } from "../../semantic/template-manifest";
import { baseManifest, itemHeaderRowPart } from "../../semantic/shared-parts";

export const rhyhornSemanticManifest = baseManifest(
	"rhyhorn",
	[
		itemHeaderRowPart,
		{
			name: "contact-item-content",
			key: "contact-item-content",
			owner: { kind: "contact-item", key: "contact-item" },
			binding: {
				type: "primitive",
				primitive: { ownerRole: "structured-link", present: "Link", absent: "View" },
				source: "existing",
			},
			route: { parent: "owner", at: "start", take: "all" },
		},
		{
			name: "contact-item-last",
			key: "contact-item-last",
			owner: { kind: "contact-item", key: "contact-item", position: "last" },
			binding: { type: "alias", canonicalKind: "contact-item", token: "contact-item-last" },
		},
	],
	[{ kind: "contact-item", binding: { type: "primitive", primitive: "View", source: "existing" } }],
) satisfies TemplateSemanticManifest;
