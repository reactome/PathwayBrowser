package org.reactome.web.pwp.client.details.common.widgets.panels;

import com.google.gwt.dom.client.Style;
import com.google.gwt.event.logical.shared.OpenEvent;
import com.google.gwt.event.logical.shared.OpenHandler;
import com.google.gwt.user.client.ui.DisclosurePanel;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.VerticalPanel;
import com.google.gwt.user.client.ui.Widget;
import org.reactome.web.pwp.client.common.model.classes.*;
import org.reactome.web.pwp.client.common.model.handlers.DatabaseObjectLoadedHandler;
import org.reactome.web.pwp.client.details.common.widgets.disclosure.DisclosurePanelFactory;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public class AbstractModifiedResiduePanel extends DetailsPanel implements OpenHandler<DisclosurePanel> {
    private AbstractModifiedResidue modifiedResidue;
    private DisclosurePanel disclosurePanel;

    public AbstractModifiedResiduePanel(AbstractModifiedResidue modifiedResidue) {
        this(null, modifiedResidue);
    }
    public AbstractModifiedResiduePanel(DetailsPanel parentPanel, AbstractModifiedResidue modifiedResidue) {
        super(parentPanel);
        this.modifiedResidue = modifiedResidue;
        initialize();
    }

    private void initialize(){
        this.disclosurePanel = DisclosurePanelFactory.getAdvancedDisclosurePanel(this.modifiedResidue.getDisplayName());
        this.disclosurePanel.addOpenHandler(this);
        initWidget(this.disclosurePanel);
    }

    @Override
    public DatabaseObject getDatabaseObject() {
        return modifiedResidue;
    }

    @Override
    public void onOpen(OpenEvent<DisclosurePanel> event) {
        if(!isLoaded())
            this.modifiedResidue.load(new DatabaseObjectLoadedHandler() {
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
        this.modifiedResidue = (AbstractModifiedResidue) data;
        VerticalPanel vp = new VerticalPanel();
        vp.setWidth("99%");

        // ############################################### IMPORTANT ###############################################
        // # This implementation will produce several queries to the RESTFul service but is the easiest way to     #
        // # provide an easy to extend implementation of the AbstractModifiedResidue summary panels for the future #
        // #########################################################################################################

        //All the panels that contain a subclass of AbstractModifiedResidue DOES NOT HAVE to contain a disclosure panel
        //as a first instance because they will be part o a "major" content
        //The "if" statements are used because this.modified residue can be more than one of those at the same time

        //NOTE: The commented ones are because at the moment of implementation, no data extra data for them is provided
        //      by the RESTFul service. When new data is added, there is only needed to create the panel and add it to
        //      the VerticalPanel

        //if(this.modifiedResidue instanceof GeneticallyModifiedResidue){}
        //if(this.modifiedResidue instanceof ReplacedResidue){}
        if(this.modifiedResidue instanceof FragmentModification){
            vp.add(new FragmentModificationPanel(this, (FragmentModification) this.modifiedResidue));
        }
        //if(this.modifiedResidue instanceof FragmentDeletionModification){}
        if(this.modifiedResidue instanceof FragmentInsertionModification){
            vp.add(new FragmentInsertionModificationPanel(this, (FragmentInsertionModification) this.modifiedResidue));
        }
        if(this.modifiedResidue instanceof TranslationalModification){
            vp.add(new TranslationalModificationPanel(this, (TranslationalModification) this.modifiedResidue));
        }
        if(this.modifiedResidue instanceof CrosslinkedResidue){
            vp.add(new CrosslinkedResiduePanel(this, (CrosslinkedResidue) this.modifiedResidue));
        }
        if(this.modifiedResidue instanceof InterChainCrosslinkedResidue){

        }
        //if(this.modifiedResidue instanceof IntraChainCrosslinkedResidue){}
        //if(this.modifiedResidue instanceof ModifiedResidue){}
        if(this.modifiedResidue instanceof GroupModifiedResidue){

        }

        //All the AbstractModifiedResidue contain the Reference Sequence
        vp.add(getReferenceSequencePanel(this.modifiedResidue.getReferenceSequence()));

        this.disclosurePanel.setContent(vp);
    }

    private Widget getReferenceSequencePanel(ReferenceSequence referenceSequence){
        VerticalPanel vp = new VerticalPanel();
        vp.getElement().getStyle().setMarginBottom(10, Style.Unit.PX);
        vp.addStyleName("elv-Details-OverviewDisclosure-content");
        vp.setWidth("98%");

        vp.add(new Label("Reference Entity:"));
        Widget pPanel = new ReferenceEntityPanel(this, referenceSequence);
        pPanel.getElement().getStyle().setMarginLeft(15, Style.Unit.PX);
        vp.add(pPanel);

        return vp;
    }
}
