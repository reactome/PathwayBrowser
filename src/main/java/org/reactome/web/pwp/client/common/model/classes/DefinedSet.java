package org.reactome.web.pwp.client.common.model.classes;

import com.google.gwt.json.client.JSONObject;
import com.google.gwt.resources.client.ImageResource;
import org.reactome.web.pwp.client.common.model.factory.SchemaClass;
import org.reactome.web.pwp.client.common.model.images.DatabaseObjectImages;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
public class DefinedSet extends EntitySet {

    public DefinedSet() {
        super(SchemaClass.DEFINED_SET);
    }

    @Override
    public void load(JSONObject jsonObject) {
        super.load(jsonObject);
    }

    @Override
    public ImageResource getImageResource() {
        return DatabaseObjectImages.INSTANCE.definedSet();
    }
}
