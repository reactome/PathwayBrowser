import {Component, input, output, signal} from '@angular/core';
import {AnalysisResult} from "reactome-gsa-form/lib/model/analysis-result.model";
import {AnalysisService} from "../../../services/analysis.service";
import {UrlStateService} from "../../../services/url-state.service";
import {GsaFormModule} from "reactome-gsa-form";

@Component({
  selector: 'cr-quantitative-analysis',
  imports: [
    GsaFormModule
  ],
  templateUrl: './quantitative-analysis.component.html',
  styleUrl: './quantitative-analysis.component.scss'
})
export class QuantitativeAnalysisComponent {

  close = output<{ status: 'finished' | 'premature' }>()
  status = input.required<'open'| 'closed'>()

  constructor(private state: UrlStateService, public analysis: AnalysisService) {

  }

  gsaId = signal<string>('')

  gsaFinished(token: string | undefined) {
    if (!token) return
    this.state.analysis.set(token)
    this.close.emit({status: 'finished'});
  }

  seeResultAction = (result: AnalysisResult) =>   {
    const link = result.reactome_links.find(link => link.token);
    if (!link) return;
    this.state.analysis.set(link.token)
    this.close.emit({status: 'finished'});
  }

}
