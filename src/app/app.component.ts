import {Component} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {MatIconRegistry} from "@angular/material/icon";

@Component({
  selector: 'cr-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'PathwayBrowser'

  leftPanelIcons = [
    {name: 'species', route: 'species-icon'},
    {name: 'overlay', route: 'overlay-icon'},
    {name: 'arrow-down', route: 'arrow-down'},
    {name: 'arrow-right', route: 'arrow-right'},
    {name: 'pathway-ehld', route: 'pathway-ehld'},
    {name: 'pathway', route: 'pathway'},
    {name: 'reaction', route: 'reaction'},
    {name: 'transition', route: 'transition'},
    {name: 'home', route: 'home'}
  ];

  species = [
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

  detailsPanelIcons = [
    {name: 'details-tab', route: 'details-tab'},
    {name: 'molecule-tab', route: 'molecule-tab'},
    {name: 'results-tab', route: 'results-tab'},
    {name: 'expression-tab', route: 'expression-tab'},
    {name: 'info-tab', route: 'info-tab'},
    {name: 'download-tab', route: 'download-tab'},
    {name: 'double-arrow-right', route: 'double-arrow-right'},
    {name: 'protein', route: 'protein'},
    {name: 'complex', route: 'complex'},
    {name: 'small-molecule', route: 'small-molecule'},
    {name: 'defined-set', route: 'defined-set'},
    {name: 'other-entity', route: 'other-entity'},
    {name: 'polymer', route: 'polymer'},
  ];

  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.loadIcons();
  }

  loadIcons(): void {
    this.leftPanelIcons.forEach(icon => {
      this.matIconRegistry.addSvgIcon(icon.name, this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/left-panel/${icon.route}.svg`));
    });

    this.species.forEach(icon => {
      this.matIconRegistry.addSvgIcon(icon.name, this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/species/${icon.route}.svg`));
    });

    this.detailsPanelIcons.forEach(icon => {
      this.matIconRegistry.addSvgIcon(icon.name, this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/details-panel/${icon.route}.svg`));
    });

  }

}
