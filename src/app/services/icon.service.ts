import {Injectable} from '@angular/core';
import {map, Observable, of, switchMap} from "rxjs";
import {SearchResult} from "../model/search-results.model";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {isCellLineagePath, isEWAS, isRLE} from "./utils";
import {DatabaseObject} from "../model/graph/database-object.model";

@Injectable({
  providedIn: 'root'
})
export class IconService {

  constructor(private http: HttpClient) {
  }

  protein = {name: 'protein', tooltip: 'Protein', route: 'protein'};
  negativeRegulation = {
    name: 'negative-regulation',
    tooltip: 'Negatively regulates Reaction',
    route: 'negative-regulation'
  };
  positiveRegulation = {
    name: 'positive-regulation',
    tooltip: 'Positively regulates Reaction',
    route: 'positive-regulation'
  }

  reactomeSubjectIcons: { [key: string]: { name: string; tooltip?: string; route: string } } = {
    Pathway: {name: 'pathway', tooltip: 'Pathway', route: 'pathway'},
    BlackBoxEvent: {name: 'omitted', tooltip: 'Black Box Event', route: 'omitted'},
    EntityWithAccessionedSequence: this.protein,
    Complex: {
      name: 'complex',
      tooltip: 'Complex',
      route: 'complex'
    },
    SimpleEntity: {name: 'small-molecule', tooltip: 'Simple Entity', route: 'small-molecule'},
    DefinedSet: {name: 'defined-set', tooltip: 'Defined Set', route: 'defined-set'},
    OtherEntity: {name: 'other-entity', tooltip: 'Other Entity', route: 'other-entity'},
    Polymer: {name: 'polymer', tooltip: 'Polymer', route: 'polymer'},
    CandidateSet: {name: 'candidate-set', tooltip: 'Candidate Set', route: 'candidate-set'},
    ReferenceDNASequence: {name: 'gene', tooltip: 'Reference DNA Sequence', route: 'gene'},
    ReferenceRNASequence: {name: 'RNA', tooltip: 'Reference RNA Sequence', route: 'RNA'},
    ReferenceGeneProduct: this.protein,
    ReferenceIsoform: this.protein,
    GenomeEncodedEntity: {
      name: 'genome-encoded-entity',
      tooltip: 'Genome Encoded Entity',
      route: 'genome-encoded-entity'
    },
    ProteinDrug: {name: 'protein-drug', tooltip: 'Protein Drug', route: 'protein-drug'},
    ChemicalDrug: {
      name: 'chemical-drug',
      tooltip: 'A therapeutic agent that is a chemically synthesized substance',
      route: 'chemical-drug'
    },
    Polymerisation: {
      name: 'polymerisation',
      tooltip: 'Reactions that follow the pattern: Polymer + Unit - Polymer (there may be a catalyst involved).\n' +
        'Used to describe the mechanistic detail of a polymerisation',
      route: 'polymerisation'
    },
    Depolymerisation: {
      name: 'depolymerisation',
      tooltip: 'Reactions that follow the pattern: Polymer + Unit - Polymer (there may be a catalyst involved).\n' +
        'Used to describe the mechanistic detail of a depolymerisation',
      route: 'depolymerisation'
    },
    FailedReaction: {name: 'failed-reaction', tooltip: 'Failed Reaction', route: 'failed-reaction'},

    CellLineagePath: {
      name: 'pathway',
      tooltip: 'A collection of related Events describing development of a cell line.There events can be CellDevelopmentSteps or CellLineagePaths',
      route: 'pathway'
    },
    CatalystActivity: {name: 'catalyst-activity', tooltip: 'Catalyst activity', route: 'catalyst-activity'},
    NegativeRegulation: this.negativeRegulation,
    NegativeGeneExpressionRegulation: this.negativeRegulation,
    PositiveRegulation: this.positiveRegulation,
    PositiveGeneExpressionRegulation: this.positiveRegulation,
    Requirement: {name: 'requirement', tooltip: 'Requirement for Reaction', route: 'requirement'},

    //Reaction type
    "uncertain": {name: 'uncertain', tooltip: 'Uncertain reaction', route: 'uncertain'},
    "binding": {name: 'binding', tooltip: 'Association/Binding reaction', route: 'binding'},
    "dissociation": {name: 'dissociation', tooltip: 'Dissociation reaction', route: 'dissociation'},
    "omitted": {name: 'omitted', tooltip: 'Omitted reaction', route: 'omitted'}, //BlackBoxEvent
    "transition": {name: 'transition', tooltip: 'Transition reaction', route: 'transition'}

  };


  generalIcons = [
    {name: 'logo', route: 'logo'},

    {name: 'species', route: 'species-icon'},
    {name: 'overlay', route: 'overlay-icon'},
    {name: 'arrow-down', route: 'arrow-down'},
    {name: 'arrow-right', route: 'arrow-right'},
    {name: 'pathway-ehld', route: 'pathway-ehld'},
    {name: 'home', route: 'home'},
    {name: 'expand', route: 'expand'},
    {name: 'collapse', route: 'collapse'},
    {name: 'format-quote', route: 'format-quote'},

    {name: 'details-tab', tooltip: 'Details Tab', route: 'details-tab'},
    {name: 'molecule-tab', tooltip: 'Molecule Tab', route: 'molecule-tab'},
    {name: 'results-tab', tooltip: 'Results Tab', route: 'results-tab'},
    {name: 'expression-tab', tooltip: 'Expression Tab', route: 'expression-tab'},
    {name: 'info-tab', tooltip: 'Info Tab', route: 'info-tab'},
    {name: 'download-tab', tooltip: 'Download Tab', route: 'download-tab'},
    {name: 'double-arrow-right', tooltip: 'Double Arrow Right', route: 'double-arrow-right'},
    {name: 'reference', tooltip: 'References', route: 'reference'},
    {name: 'orcid', tooltip: 'Orcid', route: 'orcid'},
    {name: 'search', tooltip: 'Search', route: 'search'},
    {name: 'intact', tooltip: 'IntAct', route: 'intact'},
    {name: 'select', tooltip: 'Select', route: 'select'},
  ];

  // Not in used for now, leave here for future use
  connectors = [
    {name: 'dashed-I', route: 'dashed-I'},
    {name: 'dashed-L', route: 'dashed-L'},
    {name: 'dashed-T', route: 'dashed-T'},
    {name: 'mini-dashed-I', route: 'mini-dashed-I'},
    {name: 'mini-dashed-L', route: 'mini-dashed-L'},
    {name: 'mini-dashed-T', route: 'mini-dashed-T'},
    {name: 'solid-I', route: 'solid-I'},
    {name: 'solid-L', route: 'solid-L'},
    {name: 'solid-T', route: 'solid-T'},
  ]

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

  getReactomeSubjectIcons() {
    return this.reactomeSubjectIcons;
  }

  getSpeciesIcons() {
    return this.speciesIcons;
  }

  getGeneralIcons() {
    return this.generalIcons;
  }

  getConnectors() {
    return this.connectors;
  }

  loadIcon(id: string): Observable<string> {
    return this.http.get(`${environment.host}/icon/${id}.svg`, {responseType: 'text'});
  }

  fetchIcon(identifier: string): Observable<string | null> {
    return this.http.get<SearchResult>(`${environment.host}/ContentService/search/query?query=${identifier}&types=Icon`).pipe(
      map(response =>
        response.results[0].typeName === "Icon" ? response.results[0].entries[0] : null
      ),
      switchMap(entry =>
        entry ? this.loadIcon(entry.stId) : of(null)
      )
    );
  }

  getIconDetails(obj: DatabaseObject): { name: string; tooltip?: string; route?: string } {
    const defaultIcon = {name: 'pathway', tooltip: 'Unknown Event'};
    // PE
    if (isEWAS(obj)) {
      return this.reactomeSubjectIcons[obj.referenceType];
    }
    // Reaction
    if (isRLE(obj)) {
      if (obj.category) {
        return this.reactomeSubjectIcons[obj.category];
      }
    }

    // Cell
    if (isCellLineagePath(obj)) {
      return this.reactomeSubjectIcons[obj.schemaClass];
    }

    return this.reactomeSubjectIcons[obj.schemaClass] || defaultIcon;
  }


}
