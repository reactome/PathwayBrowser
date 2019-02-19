package org.reactome.web.pwp.client.common.model.handlers;

import org.reactome.web.pwp.client.common.model.classes.DatabaseObject;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public interface DatabaseObjectCreatedHandler {
    void onDatabaseObjectLoaded(DatabaseObject databaseObject);
    void onDatabaseObjectError(Throwable exception);
}
