Ext.define('app.lib.model.PolymorphicReader', {
	override: 'Ext.data.reader.Reader',

	extractData : function(root) {
		var me = this,
			records = [],
			Model   = me.model,
			length  = root.length,
			convertedValues, node, record, i;

		if (!root.length && Ext.isObject(root)) {
			root = [root];
			length = 1;
		}

		for (i = 0; i < length; i++) {
			node = root[i];
			if (!node.isModel) {

				/* OVERRIDE */
				if (me.types) {
					var needToDecorate = me.model.prototype.isNode,
						typeCode = node[me.typeProperty || 'nodeType'],
						type = me.types[typeCode];
					me.model = Ext.ClassManager.get(type); //the model reference is used in other functions
					if (needToDecorate) {
						me.model.prototype.isNode = false;
						Ext.data.NodeInterface.decorate(me.model);
					}
					Model = me.model;
					me.buildExtractors(true); //need to rebuild the field extractors
				}
				/* END OVERRIDE */

				// Create a record with an empty data object.
				// Populate that data object by extracting and converting field values from raw data
				record = new Model(undefined, me.getId(node), node, convertedValues = {});

				// If the server did not include an id in the response data, the Model constructor will mark the record as phantom.
				// We  need to set phantom to false here because records created from a server response using a reader by definition are not phantom records.
				record.phantom = false;

				// Use generated function to extract all fields at once
				me.convertRecordData(convertedValues, node, record);

				records.push(record);

				if (me.implicitIncludes) {
					me.readAssociated(record, node);
				}
			} else {
				// If we're given a model instance in the data, just push it on
				// without doing any conversion
				records.push(node);
			}
		}

		return records;
	}
});