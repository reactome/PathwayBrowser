package org.reactome.web.elv.client.details.tabs.analysis.view.widgets.notfound;

import com.google.gwt.dom.client.Style;
import com.google.gwt.user.client.ui.DockLayoutPanel;
import com.google.gwt.user.client.ui.FlowPanel;
import org.reactome.web.elv.client.details.tabs.analysis.presenter.providers.NotFoundAsyncDataProvider;
import org.reactome.web.elv.client.details.tabs.analysis.view.widgets.common.CustomPager;
import org.reactome.web.elv.client.details.tabs.analysis.view.widgets.notfound.NotFoundTable;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public class NotFoundPanel extends DockLayoutPanel {
    private String token;
    private Integer notFound;
    private boolean forceLoad;

    private NotFoundTable table;
    private CustomPager pager;
    private NotFoundAsyncDataProvider dataProvider;

    public NotFoundPanel() {
        super(Style.Unit.EM);

        this.pager = new CustomPager(); // Create paging controls.
        this.pager.getElement().getStyle().setDisplay(Style.Display.INLINE_BLOCK);
        this.pager.setPageSize(NotFoundTable.PAGE_SIZE);
    }

    public void showNotFound(){
        if(!forceLoad) return; //Will only force to reload the data when the analysis details has been changed
        this.forceLoad = false;

        this.table = new NotFoundTable();
        this.table.setRowCount(this.notFound);

        this.pager.setDisplay(this.table);

        this.dataProvider = new NotFoundAsyncDataProvider(this.table, this.pager, this.token);

        this.clear();
        FlowPanel pagerPanel = new FlowPanel();
        pagerPanel.setWidth("100%");
        pagerPanel.getElement().getStyle().setTextAlign(Style.TextAlign.CENTER);
        pagerPanel.add(pager);
        this.addSouth(pagerPanel, 2);

        this.add(this.table);
    }

    public void setAnalysisDetails(String token, Integer notFound) {
        this.token = token;
        this.notFound = notFound;
        this.forceLoad = true;
    }
}
