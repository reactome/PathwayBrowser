package org.reactome.web.elv.client.center.content.fireworks.presenter;

import com.google.gwt.core.client.GWT;
import com.google.gwt.core.client.Scheduler;
import com.google.gwt.http.client.*;
import org.reactome.web.elv.client.center.content.fireworks.view.FireworksView;
import org.reactome.web.elv.client.common.Controller;
import org.reactome.web.elv.client.common.EventBus;
import org.reactome.web.elv.client.common.data.model.DatabaseObject;
import org.reactome.web.elv.client.common.data.model.Event;
import org.reactome.web.elv.client.common.data.model.Pathway;
import org.reactome.web.elv.client.common.data.model.Species;
import org.reactome.web.elv.client.common.events.ELVEventType;
import org.reactome.web.elv.client.common.events.EventHoverEvent;
import org.reactome.web.elv.client.common.events.EventHoverResetEvent;
import org.reactome.web.elv.client.common.handlers.EventHoverHandler;
import org.reactome.web.elv.client.common.handlers.EventHoverResetHandler;
import org.reactome.web.elv.client.common.model.Pair;
import org.reactome.web.elv.client.manager.data.DataManager;
import org.reactome.web.elv.client.manager.messages.MessageObject;
import org.reactome.web.elv.client.manager.state.AdvancedState;

import java.util.List;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public class FireworksPresenter extends Controller implements FireworksView.Presenter, EventHoverHandler, EventHoverResetHandler {
    private FireworksView view;

    private Long selected;

    private boolean visible = true;
    private AdvancedState targetState; //Used to keep the state to be loaded when the diagram becomes visible

    public FireworksPresenter(EventBus eventBus, FireworksView view) {
        super(eventBus);
        this.view = view;
        this.view.setPresenter(this);

        this.eventBus.addHandler(EventHoverEvent.TYPE, this);
        this.eventBus.addHandler(EventHoverResetEvent.TYPE, this);
    }

    @Override
    public void onEventHovered(EventHoverEvent e) {
        if(e.getSource()==this) return;
        Pathway toHighlight;
        if(e.getEvent() instanceof Pathway){
            toHighlight = (Pathway) e.getEvent();
        }else{
            toHighlight = (Pathway) e.getPath().get(e.getPath().size()-1);
        }
        this.view.highlightPathway(toHighlight);
    }

    @Override
    public void onAnalysisTabResourceSelected(String resource) {
        this.view.setAnalysisResource(resource);
    }

    @Override
    public void onDiagramFireworksRequired(Pathway pathway) {
        Scheduler.get().scheduleDeferred(new Scheduler.ScheduledCommand() {
            @Override
            public void execute() {
                visible = true;
                onStateManagerDatabaseObjectsSelected(targetState.getPath(), targetState.getPathway(), targetState.getInstance());
            }
        });
    }

    @Override
    public void onEventHoveredReset() {
        this.view.resetHighlight();
    }

    @Override
    public void onStateManagerAnalysisTokenSelected(String token) {
        this.view.setAnalysisToken(token);
    }

    @Override
    public void onStateManagerAnalysisTokenReset() {
        this.view.resetAnalysisToken();
    }

    @Override
    public void onStateManagerSpeciesSelected(Species species) {
        String speciesName = species.getDisplayName().replaceAll(" ", "_");
        loadSpeciesFireworks(speciesName);
    }

    @Override
    public void onStateManagerDatabaseObjectsSelected(List<Event> path, Pathway pathway, DatabaseObject databaseObject) {
        if(!visible){
            this.targetState = new AdvancedState();
            this.targetState.setPathway(pathway);
            this.targetState.setInstance(databaseObject);
            this.targetState.setPath(path);
            return;
        }
        this.targetState = null;
        Pathway toSelect;
        if(databaseObject instanceof Pathway){
            toSelect = (Pathway) databaseObject;
        }else{
            toSelect = (Pathway) path.get(path.size()-1);
        }
        this.selected = toSelect.getDbId();
        this.view.selectPathway(toSelect);
    }

    @Override
    public void onStateManagerInstancesInitialStateReached() {
        this.view.resetSelection();
    }

    @Override
    public void selectPathway(Long dbId) {
        if(dbId.equals(selected)) return;
        Pair<Long, ELVEventType> tuple = new Pair<Long, ELVEventType>(dbId, ELVEventType.FIREWORKS_PATHWAY_SELECTED);
        this.eventBus.fireELVEvent(ELVEventType.DATABASE_OBJECT_REQUIRED, tuple);
    }

    @Override
    public void resetPathwaySelection() {
        this.selected = null;
        this.eventBus.fireELVEvent(ELVEventType.FIREWORKS_PATHWAY_SELECTION_RESET);
    }

    @Override
    public void highlightPathway(Long dbId) {
        final FireworksPresenter _this = this;
        try {
            DataManager.getDataManager().databaseObjectDetailedViewRequired(dbId, new DataManager.DataManagerObjectRetrievedHandler() {
                @Override
                public void onDatabaseObjectRetrieved(DatabaseObject databaseObject) {
                    eventBus.fireEventFromSource(new EventHoverEvent((Pathway) databaseObject), _this);
                }

                @Override
                public void onError(MessageObject messageObject) {
                    eventBus.fireELVEvent(ELVEventType.INTERNAL_MESSAGE, messageObject);
                }
            });
        } catch (Exception e) {
            //VERY UNLIKELY TO HAPPEN HERE :)
            if(!GWT.isScript()) e.printStackTrace();
        }
    }

    @Override
    public void resetAnalysis() {
        eventBus.fireELVEvent(ELVEventType.FIREWORKS_ANALYSIS_RESET);
    }

    @Override
    public void resetPathwayHighlighting() {
        eventBus.fireEventFromSource(new EventHoverResetEvent(), this);
    }

    @Override
    public void showPathwayDiagram(Long dbId) {
        this.visible = false;
        Pair<Long, ELVEventType> tuple = new Pair<Long, ELVEventType>(dbId, ELVEventType.FIREWORKS_PATHWAY_OPENED);
        this.eventBus.fireELVEvent(ELVEventType.DATABASE_OBJECT_REQUIRED, tuple);
    }


    public void loadSpeciesFireworks(String species){
        String url = "/download/current/fireworks/" + species + ".json";
        RequestBuilder requestBuilder = new RequestBuilder(RequestBuilder.GET, url);
        requestBuilder.setHeader("Accept", "application/json");
        try {
            requestBuilder.sendRequest(null, new RequestCallback() {
                @Override
                public void onResponseReceived(Request request, Response response) {
                    try{
                        String json = response.getText();
                        view.loadSpeciesFireworks(json);
                    }catch (Exception ex){
                        //ModelFactoryException, NullPointerException, IllegalArgumentException, JSONException
//                        MessageObject msgObj = new MessageObject("The received object for the required detailed view" +
//                                "\n'DbId=" + dbId + "' is empty or faulty and could not be parsed.\n" +
//                                "ERROR: " + ex.getMessage(), getClass(), MessageType.INTERNAL_ERROR);
                        if(!GWT.isScript()) ex.printStackTrace();
                    }
                }
                @Override
                public void onError(Request request, Throwable exception) {
                    /*replaced: eventBus.fireELVEvent(ELVEventType.DATA_MANAGER_LOAD_ERROR, exception.getMessage());*/
//                    MessageObject msgObj = new MessageObject("The detailed view request for 'DbId=" + dbId + "'\n" +
//                            "received an error instead of a valid response.\n" +
//                            "ERROR: " + exception.getMessage(), getClass(), MessageType.INTERNAL_ERROR);
                    if(!GWT.isScript()) exception.printStackTrace();
                }
            });
        }catch (RequestException ex) {
//            MessageObject msgObj = new MessageObject("The requested detailed view for 'DbId=" + dbId
//                    + "' could not be received.\n" +
//                    "ERROR: " + ex.getMessage(), getClass(), MessageType.INTERNAL_ERROR);
            if(!GWT.isScript()) ex.printStackTrace();
        }
    }
}