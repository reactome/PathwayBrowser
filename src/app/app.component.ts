import {Component, OnInit} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {MatIconRegistry} from "@angular/material/icon";
import {IconService} from "./services/icon.service";

@Component({
  selector: 'cr-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'PathwayBrowser'

  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, private iconService: IconService) {
  }


  ngOnInit(): void {

    const speciesIcon = this.iconService.getSpeciesIcons();
    const generalIcons = this.iconService.getGeneralIcons();
    const reactomeSubjectIcons = this.iconService.getReactomeSubjectIcons();

    speciesIcon.forEach(icon => {
      this.matIconRegistry.addSvgIcon(icon.name, this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/species/${icon.route}.svg`));
    });

    generalIcons.forEach(icon => {
      this.matIconRegistry.addSvgIcon(icon.name, this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/general/${icon.route}.svg`));
    });

    Object.values(reactomeSubjectIcons).forEach((icon) => {
      this.matIconRegistry.addSvgIcon(icon.name, this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/reactome-subject/${icon.route}.svg`));
    });
  }
}
