import {Component, computed, effect, ElementRef, input, viewChild} from '@angular/core';
import {DatabaseIdentifier} from "../../../../model/graph/database-identifier.model";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOptgroup, MatOption, MatSelect} from "@angular/material/select";
import {toSignal} from "@angular/core/rxjs-interop";
import {extract, Style} from "reactome-cytoscape-style";
import {DarkService} from "../../../../services/dark.service";
import {ReferenceEntity} from "../../../../model/graph/reference-entity/reference-entity.model";


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
    ReactiveFormsModule,
    MatOption
  ],
  styleUrl: './structure-viewer.component.scss'
})
export class StructureViewerComponent {


  readonly obj = input.required<ReferenceEntity>();
  readonly xRefs = input.required<DatabaseIdentifier[]>();

  viewer = viewChild.required<ElementRef<HTMLElement>>('viewer');
  reactomeStyle: Style = new Style(document.body);
  structureControl = new FormControl('');


  alphaFoldEntryId = computed(() => {
    const id = this.obj().identifier;
    return `AF-${id}-F1`;
  });

  // selected value from form control
  _selected = toSignal(this.structureControl.valueChanges);
  selected = computed(() => {
    return this._selected();
  });


  label = computed(() => {
    return this.selected()?.startsWith("AF-") ? Source.ALPHA_FOLD : Source.PDB;
  })

  structureData = computed(() => {

    const afId = this.alphaFoldEntryId();

    const pdbIdentifiers = this.xRefs()
      .filter((ref: DatabaseIdentifier) => ref.databaseName === Source.PDB)
      .map(ref => ref.identifier)
      .sort((a, b) => {
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
      })

    const result = [
      {source: Source.ALPHA_FOLD, identifiers: [afId]},
    ]
    if (pdbIdentifiers.length > 0) {
      result.push({source: Source.PDB, identifiers: pdbIdentifiers})
    }
    return result;

  });


  bgColor = computed(() => {
    this.dark.isDark(); // Compute on dark update
    return extract(this.reactomeStyle.properties.global.surface);
  })

  constructor(private dark: DarkService) {

    effect(() => {
      // set up default value
      const id = this.alphaFoldEntryId();
      this.structureControl.setValue(id);
    });

    effect(() => {

      const selected = this.selected() || this.alphaFoldEntryId();

      // A PDB widget =>  https://github.com/molstar/pdbe-molstar/wiki/1.-PDBe-Molstar-as-JS-plugin
      const viewerInstance = new PDBeMolstarPlugin();

      const options = {
        bgColor: this.bgColor(),
        hideControls: true
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

      if (this.viewer().nativeElement) {
        const finalOptions = selected.startsWith('AF-') ? alphaFoldOptions : pdbOptions;
        viewerInstance.render(this.viewer().nativeElement, finalOptions);
      }
    });
  }

}
