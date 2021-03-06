package org.reactome.web.pwp.client.common.model.classes;

import com.google.gwt.json.client.JSONObject;
import com.google.gwt.resources.client.ImageResource;
import org.reactome.web.pwp.client.common.model.factory.DatabaseObjectFactory;
import org.reactome.web.pwp.client.common.model.factory.DatabaseObjectUtils;
import org.reactome.web.pwp.client.common.model.factory.SchemaClass;
import org.reactome.web.pwp.client.common.model.images.DatabaseObjectImages;

import java.util.LinkedList;
import java.util.List;

/**
 * @author Antonio Fabregat <fabregat@ebi.ac.uk>
 */
@SuppressWarnings("UnusedDeclaration")
public class ReferenceRNASequence extends ReferenceSequence {
    private List<ReferenceDNASequence> referenceGene;

    public ReferenceRNASequence() {
        super(SchemaClass.REFERENCE_RNA_SEQUENCE);
    }

    @Override
    public void load(JSONObject jsonObject) {
        super.load(jsonObject);

        this.referenceGene = new LinkedList<>();
        for (JSONObject object : DatabaseObjectUtils.getObjectList(jsonObject, "referenceGene")) {
            this.referenceGene.add((ReferenceDNASequence) DatabaseObjectFactory.create(object));
        }
    }

    public List<ReferenceDNASequence> getReferenceGene() {
        return referenceGene;
    }

    @Override
    public ImageResource getImageResource() {
        return DatabaseObjectImages.INSTANCE.rnaSequence();
    }
}
