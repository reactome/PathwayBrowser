package org.reactome.web.pwp.client.details.tabs.description;

import com.google.gwt.event.shared.EventBus;
import org.reactome.web.pwp.client.common.Selection;
import org.reactome.web.pwp.client.common.events.DatabaseObjectSelectedEvent;
import org.reactome.web.pwp.client.common.events.ErrorMessageEvent;
import org.reactome.web.pwp.client.common.events.SpeciesSelectedEvent;
import org.reactome.web.pwp.client.common.events.StateChangedEvent;
import org.reactome.web.pwp.client.common.model.classes.DatabaseObject;
import org.reactome.web.pwp.client.common.model.classes.Event;
import org.reactome.web.pwp.client.common.model.classes.Pathway;
import org.reactome.web.pwp.client.common.model.classes.Species;
import org.reactome.web.pwp.client.common.model.handlers.DatabaseObjectLoadedHandler;
import org.reactome.web.pwp.client.common.model.util.Path;
import org.reactome.web.pwp.client.common.module.AbstractPresenter;
import org.reactome.web.pwp.client.manager.state.State;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public class DescriptionTabPresenter extends AbstractPresenter implements DescriptionTab.Presenter {

    private DescriptionTab.Display display;
    private DatabaseObject currentlyShown;

    public DescriptionTabPresenter(EventBus eventBus, DescriptionTab.Display display) {
        super(eventBus);
        this.display = display;
        this.display.setPresenter(this);
    }

    @Override
    public void onStateChanged(StateChangedEvent event) {
        State state = event.getState();

        //Is it me the one to show data?
        if(!state.getDetailsTab().equals(display.getDetailTabType())) return;

        //Show the data
        final DatabaseObject databaseObject = state.getTarget();
        if(databaseObject==null){
            currentlyShown = null;
            display.setInitialState();
        }else if(!databaseObject.equals(currentlyShown)) {
            databaseObject.load(new DatabaseObjectLoadedHandler() {
                @Override
                public void onDatabaseObjectLoaded(DatabaseObject databaseObject) {
                    currentlyShown = databaseObject;
                    display.showDetails(databaseObject);
                }

                @Override
                public void onDatabaseObjectError(Throwable trThrowable) {
                    currentlyShown = null;
                    eventBus.fireEventFromSource(new ErrorMessageEvent(databaseObject.getDisplayName() + " details could not be retrieved from the server."), DescriptionTabPresenter.this);
                }
            });
        }
    }

    @Override
    public void selectObject(DatabaseObject databaseObject) {
        if(databaseObject instanceof Species){
            eventBus.fireEventFromSource(new SpeciesSelectedEvent((Species) databaseObject), this);
        }else{
            Selection selection = new Selection(databaseObject);
            eventBus.fireEventFromSource(new DatabaseObjectSelectedEvent(selection), this);
        }
    }

    @Override
    public void selectEvent(Path path, Pathway pathway, Event event) {
        Selection selection = new Selection(pathway, event, path);
        eventBus.fireEventFromSource(new DatabaseObjectSelectedEvent(selection), this);
    }
}
