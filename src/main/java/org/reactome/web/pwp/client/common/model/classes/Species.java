package org.reactome.web.pwp.client.common.model.classes;

import com.google.gwt.json.client.JSONObject;
import org.reactome.web.pwp.client.common.model.factory.DatabaseObjectUtils;
import org.reactome.web.pwp.client.common.model.factory.SchemaClass;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
@SuppressWarnings("UnusedDeclaration")
public class Species extends Taxon {

    private String abbreviation;

    public Species() {
        super(SchemaClass.SPECIES);
    }

    @Override
    public void load(JSONObject jsonObject) {
        super.load(jsonObject);

        if (jsonObject.containsKey("abbreviation")) {
            this.abbreviation = DatabaseObjectUtils.getStringValue(jsonObject, "abbreviation");
        }
    }

    public String getAbbreviation() {
        return abbreviation;
    }
}
