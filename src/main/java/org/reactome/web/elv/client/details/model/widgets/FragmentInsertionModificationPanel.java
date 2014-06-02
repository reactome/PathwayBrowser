package org.reactome.web.elv.client.details.model.widgets;

import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Label;
import org.reactome.web.elv.client.common.data.model.DatabaseObject;
import org.reactome.web.elv.client.common.data.model.FragmentInsertionModification;
import org.reactome.web.elv.client.common.widgets.disclosure.DisclosurePanelFactory;


/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public class FragmentInsertionModificationPanel extends DetailsPanel {
    private FragmentInsertionModification fragmentInsertionModification;
    private HorizontalPanel contentPanel;

    @SuppressWarnings("UnusedDeclaration")
    public FragmentInsertionModificationPanel(FragmentInsertionModification fragmentInsertionModification) {
        this(null, fragmentInsertionModification);
    }

    public FragmentInsertionModificationPanel(DetailsPanel parentPanel, FragmentInsertionModification fragmentInsertionModification) {
        super(parentPanel);
        this.fragmentInsertionModification = fragmentInsertionModification;
        initialize();
    }

    private void initialize(){
        this.contentPanel = new HorizontalPanel();
        this.contentPanel.add(DisclosurePanelFactory.getLoadingMessage());
        this.contentPanel.setWidth("99%");
        initWidget(this.contentPanel);
        dataRequired(this.fragmentInsertionModification);
    }

    @Override
    public void setReceivedData(DatabaseObject data) {
        this.fragmentInsertionModification = (FragmentInsertionModification) data;

        FlexTable flexTable = new FlexTable();
        flexTable.addStyleName("elv-Details-OverviewDisclosure-content");
        flexTable.setWidth("98%");
        flexTable.getColumnFormatter().setWidth(0, "75px");
        flexTable.setCellPadding(0);
        flexTable.setCellSpacing(0);

        flexTable.setWidget(0, 0, new Label("Name"));
        flexTable.setWidget(0, 1, new Label(this.fragmentInsertionModification.getDisplayName()));

        flexTable.setWidget(1, 0, new Label("Coordinate"));
        flexTable.setWidget(1, 1, new Label(this.fragmentInsertionModification.getCoordinate().toString()));

        this.contentPanel.clear();
        this.contentPanel.add(flexTable);

        setLoaded(true);
    }

    @Override
    public DatabaseObject getDatabaseObject() {
        return this.fragmentInsertionModification;
    }
}
