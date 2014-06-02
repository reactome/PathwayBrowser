package org.reactome.web.elv.client.details.model.widgets;

import com.google.gwt.dom.client.Style;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.DisclosurePanel;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.VerticalPanel;
import com.google.gwt.user.client.ui.Widget;
import org.reactome.web.elv.client.common.data.model.DatabaseObject;
import org.reactome.web.elv.client.common.data.model.Event;
import org.reactome.web.elv.client.common.data.model.Species;
import org.reactome.web.elv.client.common.data.model.Summation;
import org.reactome.web.elv.client.common.widgets.disclosure.DisclosureHeader;
import org.reactome.web.elv.client.common.widgets.disclosure.DisclosurePanelFactory;
import org.reactome.web.elv.client.details.events.InstanceSelectedListener;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public class EventPanel extends DetailsPanel implements ClickHandler {
    private Event event;
    private DisclosurePanel disclosurePanel;

    public EventPanel(Event event) {
        this(null, event);
    }

    public EventPanel(DetailsPanel parentPanel, Event event) {
        super(parentPanel);
        this.event = event;
        initialize();
        //Data required of "this.event" will provide the panel with a complete information of the loaded event
        //and that is needed because the species names have to be placed after the name in the "title" of the
        //disclosure panel    "Event displayname [species1, species2, ...]       [X]  [+]"
        dataRequired(this.event);
    }

    private void initialize(){
        //At the beginning only the displayName is placed into the disclosure panel, later on the species will be added
        this.disclosurePanel = DisclosurePanelFactory.getAdvancedDisclosurePanel(this.event.getDisplayName(), this);
        initWidget(this.disclosurePanel);
    }

    @Override
    public DatabaseObject getDatabaseObject() {
        return this.event;
    }

    @Override
    public void setReceivedData(DatabaseObject data) {
        this.event = (Event) data;
        //The species "tag" is created and later on added to the disclosure title
        StringBuilder sb = new StringBuilder(" [");
        for (Species species : this.event.getSpecies()) {
            sb.append(species.getDisplayName());
            sb.append(", ");
        }
        sb.delete(sb.length()-2, sb.length());
        sb.append("]");

        DisclosureHeader header = (DisclosureHeader) this.disclosurePanel.getHeader();
        header.setDisplayName(this.event.getDisplayName() + sb.toString());

        setContent();
    }

    private void setContent(){
        VerticalPanel vp = new VerticalPanel();
        vp.setWidth("99%");
        vp.addStyleName("elv-Details-OverviewDisclosure-content");

        if(!this.event.getSummation().isEmpty()){
            vp.add(new Label("Summation:"));
            for (Summation summation : this.event.getSummation()) {
                Widget aux = new SummationPanel(this, summation);
                aux.setWidth("98%");
                aux.getElement().getStyle().setMarginLeft(15, Style.Unit.PX);
                vp.add(aux);
            }
        }
        this.disclosurePanel.setContent(vp);
    }

    @Override
    public void onClick(ClickEvent event) {
        event.stopPropagation();
        InstanceSelectedListener.getInstanceSelectedListener().eventSelected(null, null, this.event);
    }
}
