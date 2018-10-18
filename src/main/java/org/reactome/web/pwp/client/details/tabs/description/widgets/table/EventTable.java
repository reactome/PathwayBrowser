package org.reactome.web.pwp.client.details.tabs.description.widgets.table;

import com.google.gwt.user.client.ui.Widget;
import org.reactome.web.pwp.client.details.tabs.description.widgets.table.factory.PropertyType;
import org.reactome.web.pwp.client.details.tabs.description.widgets.table.factory.TableRowFactory;
import org.reactome.web.pwp.model.classes.Event;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public class EventTable extends OverviewTable {
    private Event event;

    public EventTable(Event event) {
        this.event = event;
    }

    @Override
    protected Widget getTableRow(PropertyType propertyType) {
        String title = propertyType.getTitle();
        switch (propertyType){
            case STABLE_IDENTIFIER:
                return TableRowFactory.getStableIdentifierRow(title, this.event.getStableIdentifier());
            case SUMMATION:
                return TableRowFactory.getSummationRow(title, this.event.getSummation());
            case DISEASE:
                return TableRowFactory.getExternalOntologyRow(title, this.event.getDisease());
            case PRECEDING_EVENTS:
                return TableRowFactory.getEventRow(title, this.event.getPrecedingEvent());
            case FOLLOWING_EVENTS:
                return TableRowFactory.getEventRow(title, this.event.getFollowingEvent());
            case GO_BIOLOGICAL_PROCESS:
                return TableRowFactory.getGOBiologicalProcessRow(title, this.event.getGoBiologicalProcess());
            case INFERRED_FROM:
                return TableRowFactory.getEventRow(title, this.event.getInferredFrom());
            case INFERRED_TO:
                if(!this.event.isInferred() && !this.event.getOrthologousEvent().isEmpty()){
                    return TableRowFactory.getOrthologousEventRow(title, this.event.getOrthologousEvent());
                }
                return null;
            case CELLULAR_COMPARTMENT:
                return TableRowFactory.getGOCellularComponentRow(title, this.event.getCompartment());
            case CROSS_REFERENCES:
                return TableRowFactory.getDatabaseIdentifierRow(title, this.event.getCrossReference());
            case REFERENCES:
                return TableRowFactory.getLiteratureReferencesRow(title, this.event.getLiteratureReference());
            case AUTHORED:
                return TableRowFactory.getInstanceEditRow(title, this.event.getAuthored());
            case REVIEWED:
                return TableRowFactory.getInstanceEditRow(title, this.event.getReviewed());
            case REVISED:
                return TableRowFactory.getInstanceEditRow(title, this.event.getRevised());
            default:
                return null;
        }
    }
}
