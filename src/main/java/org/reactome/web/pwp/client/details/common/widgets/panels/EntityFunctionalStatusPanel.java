package org.reactome.web.pwp.client.details.common.widgets.panels;

import com.google.gwt.dom.client.Style;
import com.google.gwt.event.logical.shared.OpenEvent;
import com.google.gwt.event.logical.shared.OpenHandler;
import com.google.gwt.user.client.ui.DisclosurePanel;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.VerticalPanel;
import org.reactome.web.pwp.client.common.model.classes.DatabaseObject;
import org.reactome.web.pwp.client.common.model.classes.EntityFunctionalStatus;
import org.reactome.web.pwp.client.common.model.classes.FunctionalStatus;
import org.reactome.web.pwp.client.common.model.handlers.DatabaseObjectLoadedHandler;
import org.reactome.web.pwp.client.details.common.widgets.disclosure.DisclosurePanelFactory;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public class EntityFunctionalStatusPanel extends DetailsPanel implements OpenHandler<DisclosurePanel> {
    private EntityFunctionalStatus entityFunctionalStatus;
    private DisclosurePanel disclosurePanel;

    public EntityFunctionalStatusPanel(EntityFunctionalStatus entityFunctionalStatus) {
        this(null, entityFunctionalStatus);
    }

    public EntityFunctionalStatusPanel(DetailsPanel parentPanel, EntityFunctionalStatus entityFunctionalStatus) {
        super(parentPanel);
        this.entityFunctionalStatus = entityFunctionalStatus;
        initialize();
    }

    private void initialize(){
        String name = this.entityFunctionalStatus.getDisplayName().replaceAll("_", " ");
        this.disclosurePanel = DisclosurePanelFactory.getAdvancedDisclosurePanel(name);
        this.disclosurePanel.addOpenHandler(this);
        initWidget(this.disclosurePanel);
    }

    @Override
    public DatabaseObject getDatabaseObject() {
        return this.entityFunctionalStatus;
    }

    @Override
    public void onOpen(OpenEvent<DisclosurePanel> event) {
        if(!isLoaded())
            this.entityFunctionalStatus.load(new DatabaseObjectLoadedHandler() {
                @Override
                public void onDatabaseObjectLoaded(DatabaseObject databaseObject) {
                    setReceivedData(databaseObject);
                }

                @Override
                public void onDatabaseObjectError(Throwable trThrowable) {
                    disclosurePanel.setContent(getErrorMessage());
                }
            });
    }

    public void setReceivedData(DatabaseObject data) {
        this.entityFunctionalStatus = (EntityFunctionalStatus) data;

        VerticalPanel vp = new VerticalPanel();
        vp.addStyleName("elv-Details-OverviewDisclosure-Advanced");
        vp.setWidth("99%");

        if(this.entityFunctionalStatus.getDiseaseEntity()!=null){
            vp.add(new Label("Disease entity:"));
            PhysicalEntityPanel aux = new PhysicalEntityPanel(this, this.entityFunctionalStatus.getDiseaseEntity());
            aux.setWidth("98%");
            aux.getElement().getStyle().setMarginLeft(15, Style.Unit.PX);
            vp.add(aux);
        }

        if(!this.entityFunctionalStatus.getFunctionalStatus().isEmpty()){
            vp.add(new Label("Functional Status:"));
            for (FunctionalStatus functionalStatus : this.entityFunctionalStatus.getFunctionalStatus()) {
                FunctionalStatusPanel aux = new FunctionalStatusPanel(this, functionalStatus);
                aux.setWidth("98%");
                aux.getElement().getStyle().setMarginLeft(15, Style.Unit.PX);
                vp.add(aux);
            }
        }

        this.disclosurePanel.setContent(vp);
        setLoaded(true);
    }
}
