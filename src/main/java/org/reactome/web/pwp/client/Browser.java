package org.reactome.web.pwp.client;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.core.client.JavaScriptException;
import com.google.gwt.core.client.Scheduler;
import com.google.gwt.user.client.DOM;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.ui.RootLayoutPanel;
import org.reactome.web.pwp.client.common.utils.Console;
import org.reactome.web.pwp.client.manager.state.token.Token;
import org.reactome.web.pwp.client.manager.title.event.TitleChangedEvent;


/**
 * Entry point classes define <code>onModuleLoad()</code>.
 */
public class Browser implements EntryPoint {

    public static final String VERSION = "3.4.1";
    public static final Boolean BETA = false;

    public static boolean VERBOSE = true;

    /**
     * This is the entry point method.
     */
    public void onModuleLoad() {
        initConfig();
        Scheduler.get().scheduleDeferred(() -> {
            AppController appViewer = new AppController();
            appViewer.go(RootLayoutPanel.get());
            removeLoadingMessage();
        });
    }

    private void initConfig(){
        String hostName = Window.Location.getHostName();
        Browser.VERBOSE = (hostName.equals("localhost") || hostName.equals("127.0.0.1"));
        TitleChangedEvent.REPORT = false;
        Token.DEFAULT_SPECIES_ID = 48887L; //Homo sapiens
        Token.DELIMITER = "&";
    }

    private void removeLoadingMessage(){
        try {
            if(DOM.getElementById("appLoadMessage")!=null) {
                DOM.getElementById("appLoadMessage").removeFromParent();
            }
        }catch (JavaScriptException exception){
            Console.error(exception.getMessage(), this);
        }
    }
}
