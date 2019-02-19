package org.reactome.web.pwp.client.details.common.widgets.panels;

import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Label;
import org.reactome.web.pwp.client.common.model.classes.DatabaseObject;
import org.reactome.web.pwp.client.common.model.classes.FragmentModification;
import org.reactome.web.pwp.client.common.model.handlers.DatabaseObjectLoadedHandler;
import org.reactome.web.pwp.client.details.common.widgets.disclosure.DisclosurePanelFactory;


/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public class FragmentModificationPanel extends DetailsPanel {
    private FragmentModification fragmentModification;
    private HorizontalPanel contentPanel;

    @SuppressWarnings("UnusedDeclaration")
    public FragmentModificationPanel(FragmentModification fragmentModification) {
        this(null, fragmentModification);
    }

    public FragmentModificationPanel(DetailsPanel parentPanel, FragmentModification fragmentModification) {
        super(parentPanel);
        this.fragmentModification = fragmentModification;
        initialize();
    }

    private void initialize(){
        this.contentPanel = new HorizontalPanel();
        this.contentPanel.add(DisclosurePanelFactory.getLoadingMessage());
        this.contentPanel.setWidth("99%");
        initWidget(this.contentPanel);
        this.fragmentModification.load(new DatabaseObjectLoadedHandler() {
            @Override
            public void onDatabaseObjectLoaded(DatabaseObject databaseObject) {
                setReceivedData(databaseObject);
            }

            @Override
            public void onDatabaseObjectError(Throwable trThrowable) {
                contentPanel.clear();
                contentPanel.add(getErrorMessage());
            }
        });
    }

    public void setReceivedData(DatabaseObject data) {
        this.fragmentModification = (FragmentModification) data;

        FlexTable flexTable = new FlexTable();
        flexTable.addStyleName("elv-Details-OverviewDisclosure-content");
        flexTable.setWidth("98%");
        flexTable.getColumnFormatter().setWidth(0, "75px");
        flexTable.setCellPadding(0);
        flexTable.setCellSpacing(0);

        flexTable.setWidget(0, 0, new Label("Start position in Reference Sequence"));
        flexTable.setWidget(0, 1, new Label(this.fragmentModification.getStartPositionInReferenceSequence().toString()));

        flexTable.setWidget(1, 0, new Label("End position in Reference Sequence"));
        flexTable.setWidget(1, 1, new Label(this.fragmentModification.getEndPositionInReferenceSequence().toString()));

        this.contentPanel.clear();
        this.contentPanel.add(flexTable);

        setLoaded(true);
    }

    @Override
    public DatabaseObject getDatabaseObject() {
        return this.fragmentModification;
    }
}
