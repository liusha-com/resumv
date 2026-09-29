import type { TemplateSemanticManifest } from "../../semantic/template-manifest";
import { baseManifest, itemHeaderRowPart } from "../../semantic/shared-parts";

export const laprasSemanticManifest = baseManifest("lapras", [itemHeaderRowPart]) satisfies TemplateSemanticManifest;
