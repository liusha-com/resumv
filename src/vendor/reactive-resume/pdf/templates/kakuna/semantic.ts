import type { TemplateSemanticManifest } from "../../semantic/template-manifest";
import { baseManifest, itemHeaderRowPart } from "../../semantic/shared-parts";

export const kakunaSemanticManifest = baseManifest("kakuna", [itemHeaderRowPart]) satisfies TemplateSemanticManifest;
