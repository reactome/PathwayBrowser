import {Injectable} from '@angular/core';
import {map, Observable, of, switchMap, tap} from "rxjs";
import {SearchResult} from "../model/search-results.model";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {EhldService} from "./ehld.service";

@Injectable({
  providedIn: 'root'
})
export class IconService {

  constructor(private http: HttpClient, private ehldService: EhldService) {
  }


  objectIconMap: { [key: string]: { name: string; tooltip?: string; route: string } } = {
    Pathway: { name: 'pathway', tooltip: 'Pathway', route: 'pathway' },
    Reaction: { name: 'reaction', tooltip: 'Reaction', route: 'reaction' },
    BlackBoxEvent: { name: 'transition', tooltip: 'Black Box Event', route: 'transition' },
    EntityWithAccessionedSequence: { name: 'protein', tooltip: 'Protein', route: 'protein' },
    Complex: { name: 'complex', tooltip: 'Complex', route: 'complex' },
    SimpleEntity: { name: 'small-molecule', tooltip: 'Simple Entity', route: 'small-molecule' },
    DefinedSet: { name: 'defined-set', tooltip: 'Defined Set', route: 'defined-set' },
    OtherEntity: { name: 'other-entity', tooltip: 'Other Entity', route: 'other-entity' },
    Polymer: { name: 'polymer', tooltip: 'Polymer', route: 'polymer' },
    CandidateSet: { name: 'candidate-set', tooltip: 'Candidate Set', route: 'candidate-set' },
    ReferenceDNASequence: { name: 'gene', tooltip: 'Reference DNA Sequence', route: 'gene' },
    ReferenceRNASequence: { name: 'RNA', tooltip: 'Reference RNA Sequence', route: 'RNA' },
    GenomeEncodedEntity: { name: 'genome-encoded-entity', tooltip: 'Genome Encoded Entity', route: 'genome-encoded-entity'}
  };


  actionIcons = [
    {name: 'species', route: 'species-icon'},
    {name: 'overlay', route: 'overlay-icon'},
    {name: 'arrow-down', route: 'arrow-down'},
    {name: 'arrow-right', route: 'arrow-right'},
    {name: 'pathway-ehld', route: 'pathway-ehld'},
    {name: 'home', route: 'home'},

    {name: 'details-tab', tooltip: 'Details Tab', route: 'details-tab'},
    {name: 'molecule-tab', tooltip: 'Molecule Tab', route: 'molecule-tab'},
    {name: 'results-tab', tooltip: 'Results Tab', route: 'results-tab'},
    {name: 'expression-tab', tooltip: 'Expression Tab', route: 'expression-tab'},
    {name: 'info-tab', tooltip: 'Info Tab', route: 'info-tab'},
    {name: 'download-tab', tooltip: 'Download Tab', route: 'download-tab'},
    {name: 'double-arrow-right', tooltip: 'Double Arrow Right', route: 'double-arrow-right'},
  ];

  speciesIcons = [
    {name: '9913', route: 'bos-taurus'},
    {name: '6239', route: 'caenorhabditis-elegans'},
    {name: '9615', route: 'canis-familiaris'},
    {name: '7955', route: 'danio-rerio'},
    {name: '44689', route: 'dictyostelium-discoideum'},
    {name: '7227', route: 'drosophila-melanogaster'},
    {name: '9031', route: 'gallus-gallus'},
    {name: '9606', route: 'homo-sapiens'},
    {name: '10090', route: 'mus-musculus'},
    {name: '1773', route: 'mycobacterium-tuberculosis'},
    {name: '5833', route: 'plasmodium-falciparum'},
    {name: '10116', route: 'rattus-norvegicus'},
    {name: '4932', route: 'saccharomyces-cerevisiae'},
    {name: '4896', route: 'schizosaccharomyces-pombe'},
    {name: '9823', route: 'sus-scrofa'},
    {name: '8364', route: 'xenopus-tropicalis'}
  ]

  getObjectIcons() {
    return this.objectIconMap;
  }

  getSpeciesIcons(){
    return this.speciesIcons;
  }

  getActionIcons(){
    return this.actionIcons;
  }

  getIconDetails(identifier: string): Observable<string> {
    return this.http.get<SearchResult>(`${environment.host}/ContentService/search/query?query=${identifier}&types=Icon`).pipe(
      tap((res) => console.log('res ', res)),
      map(response => {
        return response.results[0].entries[0] || null;
      }),
      switchMap(entry => {
        if (entry) {
          return this.ehldService.getIcon(entry.stId)
        } else {
          return of('')
        }
      })
    )
  }

}
