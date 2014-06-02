package org.reactome.web.elv.client.details.model.widgets;

import com.google.gwt.event.dom.client.ChangeEvent;
import com.google.gwt.event.dom.client.ChangeHandler;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.ListBox;
import org.reactome.web.elv.client.common.data.model.DatabaseObject;
import org.reactome.web.elv.client.common.data.model.Event;
import org.reactome.web.elv.client.common.data.model.Species;
import org.reactome.web.elv.client.details.events.InstanceSelectedListener;

import java.util.LinkedList;
import java.util.List;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public class OrthologousEventPanel extends DetailsPanel implements ChangeHandler {
    private List<Event> orthologousEvent;
    private ListBox species;
    private List<Species> speciesList;

    public OrthologousEventPanel(List<Event> orthologousEvent) {
        this(null, orthologousEvent);
    }

    public OrthologousEventPanel(DetailsPanel parentPanel, List<Event> orthologousEvent) {
        super(parentPanel);
        this.orthologousEvent = orthologousEvent;
        initialize();
    }

    private void initialize(){
        HorizontalPanel panel = new HorizontalPanel();
        panel.addStyleName("elv-Details-OverviewDisclosure-Advanced");

        this.species = new ListBox(false);
        this.species.addChangeHandler(this);
        this.species.addStyleName("elv-Details-ListBox");
        this.species.addItem("Select a species to go to...","");

        this.speciesList = new LinkedList<Species>();
        for (Event pathway : orthologousEvent) {
            for (Species species : pathway.getSpecies()) {
                this.speciesList.add(species);
                this.species.addItem(species.getDisplayName(), species.getDbId().toString());
            }
        }
        panel.add(this.species);
        initWidget(panel);
    }

    @Override
    public DatabaseObject getDatabaseObject() {
        return null; //Is never going to be used, so null works fine here :)
    }

    @Override
    public void onChange(ChangeEvent changeEvent) {
        int index = this.species.getSelectedIndex();
        if(index>0){
            String value = this.species.getValue(index);
            for (Species aux : this.speciesList) {
                if(aux.getDbId().toString().equals(value)){
                    InstanceSelectedListener.getInstanceSelectedListener().instanceSelected(aux);
                }
            }
            // Automatically set to default item (without firing an event due to the index>0 condition bellow)
            // to keep view consistency if the user goes back or select the item containing this panel again
            this.species.setSelectedIndex(0);
        }
    }
}
