import type { TemplateSemanticManifest } from "../../semantic/template-manifest";
import { baseManifest, itemHeaderRowPart } from "../../semantic/shared-parts";

export const onyxSemanticManifest = baseManifest("onyx", [itemHeaderRowPart]) satisfies TemplateSemanticManifest;
