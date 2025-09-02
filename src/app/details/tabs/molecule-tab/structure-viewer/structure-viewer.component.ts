import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  linkedSignal,
  signal,
  viewChild
} from '@angular/core';
import {DatabaseIdentifier} from "../../../../model/graph/database-identifier.model";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOptgroup, MatOption, MatSelect} from "@angular/material/select";
import {rxResource} from "@angular/core/rxjs-interop";
import {extract, Style} from "reactome-cytoscape-style";
import {DarkService} from "../../../../services/dark.service";
import {ReferenceEntity} from "../../../../model/graph/reference-entity/reference-entity.model";
import {catchError, EMPTY, map, Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {SafePipe} from "../../../../pipes/safe.pipe";
import {SelectableObject} from "../../../../services/event.service";
import {MoleculeType} from "../molecule-tab.component";

export interface StructureEntry {
  pdb_id: string;
  chain_id: string;
  experimental_method: string;
  tax_id: number;
  coverage: number;
  resolution: number;
  start: number;
  end: number;
  unp_start: number;
  unp_end: number;
}

interface BestStructure {
  [key: string]: StructureEntry[];
}

export enum Source {
  ALPHA_FOLD = "AlphaFold",
  PDB = "PDB"
}

// Global variable avoid typescript errors
declare const PDBeMolstarPlugin: any;

@Component({
  selector: 'cr-structure-viewer',
  templateUrl: './structure-viewer.component.html',
  imports: [
    MatLabel,
    MatFormField,
    MatSelect,
    MatOptgroup,
    MatOption,
    SafePipe
  ],
  styleUrl: './structure-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class StructureViewerComponent {

  readonly obj = input.required<ReferenceEntity | SelectableObject>();
  readonly xRefs = input.required<DatabaseIdentifier[]>();
  readonly moleculeType = input.required<string | null>();
  viewer = viewChild<ElementRef<HTMLElement>>('viewer');
  isProtein = computed(() => this.moleculeType() === MoleculeType.PROTEIN);
  isChemical = computed(() => this.moleculeType() === MoleculeType.CHEMICAL);
  chebiIdentifier = signal<string | undefined>(undefined);


  reactomeStyle: Style = new Style(document.body);

  alphaFoldEntryId = linkedSignal(() => {
    if (this.isProtein()) {
      const id = this.obj().identifier;
      return `AF-${id}-F1`;
    }
    return null;
  });

  selected = linkedSignal(() => this.alphaFoldEntryId())

  sourceLabel = computed(() => {
    return this.selected()?.startsWith("AF-") ? Source.ALPHA_FOLD : Source.PDB;
  })

  /** protein structure data from AlphaFold and PDB */
  proteinStructureData = computed(() => {

    if (!this.isProtein()) return null;

    const result = []

    const afId = this.alphaFoldEntryId();
    if (afId) result.push({source: Source.ALPHA_FOLD, identifiers: [afId]})

    const pdbIdentifiers = this.getPDBIdentifiers(this.xRefs());
    if (pdbIdentifiers.length > 0) result.push({source: Source.PDB, identifiers: pdbIdentifiers})

    return result;
  });


  chebiStructureId = rxResource({
    request: this.chebiIdentifier,
    loader: (params) => this.getChebiStructureId(params.request).pipe(
      catchError(err => EMPTY)
    )
  });

  chebiStructureSVGData = rxResource({
    request: this.chebiStructureId.value,
    loader: ({request}) => {
      const id = request;
      if (!id) return EMPTY;
      return this.http.get(`https://www.ebi.ac.uk/chebi/backend/api/public/structure/${id}`, {responseType: 'text'}).pipe(
        catchError(err => EMPTY)
      )
    }
  })

  bestPdbStructure = rxResource({
    request: () => this.obj().identifier,
    loader: ({request}) => {
      if (!this.isProtein()) return EMPTY;
      const id = request;
      return this.http.get<BestStructure>(`https://www.ebi.ac.uk/pdbe/api/mappings/best_structures/${id}/`).pipe(
        map(response => {
          const value = response[id];
          const ids = new Set(value.map(item => item.pdb_id.toUpperCase()));
          return Array.from(ids)
        }),
        catchError(err => EMPTY)
      )
    }
  })

  hasAnyStructure = computed(() => this.chebiStructureSVGData.hasValue() || !!this.proteinStructureData()?.length)

  bgColor = computed(() => {
    this.dark.isDark(); // Compute on dark update
    return extract(this.reactomeStyle.properties.global.surface);
  })

  constructor(private dark: DarkService, private http: HttpClient) {
    effect(() => {
      const [isProtein, isChemical] = [this.isProtein(), this.isChemical()]
      if (isProtein) {
        this.getProteinStructure();
      } else if (isChemical) {
        this.chebiIdentifier.set(this.obj().identifier);
      }
    });
  }


  getChebiStructureId(entryId: string | undefined): Observable<string | undefined> {
    if (!entryId) return of(undefined);
    const url = `https://www.ebi.ac.uk/chebi/backend/api/public/compound/${entryId}`
    return this.http.get<any>(url).pipe(
      map(res => res.default_structure.id)
    );
  }


  getProteinStructure() {

    const viewerRef = this.viewer(); // signal value
    if (!viewerRef?.nativeElement) return;

    const selected = this.selected() || this.alphaFoldEntryId();
    if (!selected) return;

    // A PDB widget =>  https://github.com/molstar/pdbe-molstar/wiki/1.-PDBe-Molstar-as-JS-plugin
    const viewerInstance = new PDBeMolstarPlugin();
    const options = {
      bgColor: this.bgColor(),
      hideControls: true,
      landscape: true,
    };

    const pdbOptions = {
      moleculeId: selected.toLowerCase(),
      ...options
    };

    const alphaFoldOptions = {
      customData: {
        url: `https://alphafold.ebi.ac.uk/files/${selected}-model_v1.cif`,
        format: 'cif',
      },
      alphafoldView: true,
      ...options,
    }

    // If only alfaFold data is available, check if the structure is available
    if (this.alphaFoldEntryId()) {
      fetch(`https://alphafold.ebi.ac.uk/files/${this.alphaFoldEntryId()}-model_v1.cif`, {method: 'HEAD'})
        .then(e => !e.ok && this.alphaFoldEntryId.set(null));
    }

    const finalOptions = selected.startsWith('AF-') ? alphaFoldOptions : pdbOptions;
    viewerInstance.render(viewerRef.nativeElement, finalOptions)
  }

  getPDBIdentifiers(xRefs: DatabaseIdentifier[]) {
    const bestStructure = new Map(this.bestPdbStructure.value()?.map((id, index) => [id, index]));

    return xRefs
      .filter((ref: DatabaseIdentifier) => ref.databaseName === Source.PDB)
      .map(ref => ref.identifier)
      .sort((a, b) => {

        if (bestStructure) {
          const aIndex = bestStructure.has(a) ? bestStructure.get(a)! : Number.MAX_SAFE_INTEGER;
          const bIndex = bestStructure.has(b) ? bestStructure.get(b)! : Number.MAX_SAFE_INTEGER;

          if (aIndex !== bIndex) {
            return aIndex - bIndex;
          }
        }
        // fallback method when no best structure available
        return this.sortByAlphabeticalOrder(a, b);
      })
  }

  sortByAlphabeticalOrder(a: string, b: string) {
    //starts with digit
    const aDigit = /^\d/.test(a);
    const bDigit = /^\d/.test(b);

    if (aDigit && bDigit) {
      return a.localeCompare(b);
    } else if (aDigit) {
      return -1;// a comes before b
    } else if (bDigit) {
      return 1;// b comes before a
    } else {
      return a.localeCompare(b);// For non-digit,sort normally
    }
  }

}
