package org.reactome.web.pwp.client.common.model.classes;

import com.google.gwt.json.client.JSONObject;
import org.reactome.web.pwp.client.common.model.factory.SchemaClass;


/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
@SuppressWarnings("UnusedDeclaration")
public class Compartment extends GO_CellularComponent {

    public Compartment() {
        this(SchemaClass.COMPARTMENT);
    }

    public Compartment(SchemaClass schemaClass) {
        super(schemaClass);
    }

    @Override
    public void load(JSONObject jsonObject) {
        super.load(jsonObject);
    }
}
