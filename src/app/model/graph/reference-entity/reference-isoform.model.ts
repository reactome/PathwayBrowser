import {ReferenceGeneProduct} from "./reference-gene-product.model";

export interface ReferenceIsoform extends ReferenceGeneProduct {
  isoformParent: ReferenceGeneProduct
  variantIdentifier: string
}
