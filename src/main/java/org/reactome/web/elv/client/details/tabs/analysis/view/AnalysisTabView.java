package org.reactome.web.elv.client.details.tabs.analysis.view;

import org.reactome.web.elv.client.common.analysis.model.AnalysisResult;
import org.reactome.web.elv.client.common.data.model.Pathway;
import org.reactome.web.elv.client.details.tabs.DetailsTabView;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public interface AnalysisTabView extends DetailsTabView<AnalysisTabView.Presenter> {

    public interface Presenter extends DetailsTabView.Presenter {
        void onResourceSelected(String resource);
        void onPathwaySelected(Long species, Long diagram, Long pathway);
    }

    void clearSelection();
    void refreshTitle(Integer foundPathways);
    void scrollToSelected();
    void selectPathway(Pathway pathway);
    void showResult(AnalysisResult analysisResult, String resource);
}
