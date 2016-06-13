/*
 * Get all the virtual machine objects. This is really just a shortcut to searching for
 * all of them using a SpecSet and then getting each object.
 */

module.exports = function(env, c) {

	// global modules
	var _          = env.lodash;
	var Promise    = env.promise;
	var util       = env.util;
	var objectType = env.schema.utils.objectType;
	var specUtil   = env.specUtil;

	// pointer to client object
	var _client    = c._client;

	// constants
	var STATUS     = env.statics.status;


	/**
	 * retrieve objects
	 *
	 * @param {Object} args - Arguments hash
	 * @param {string} args.type - Type of object to retrieve
	 * @param {(string|string[])} [args.id] - id or array of ids to search for
	 * @param {ManagedObjectReference} [args.container=rootFolder] - Container to start search from
	 * @param {boolean} [recursive=true] - Recursive search
	 * @param {string|string[]} [properties] - Array of properties to retrieve. If string value of all, all properties will be retrieved
	 * @param {Object} [options] - Options Hash
	 * @param {number} [options.maxObjects] - Max objects to retrieve
	 */
	return function(args, options) {

		// make args an array
		args    = Array.isArray(args) ? args : [args];
		options = options || {};

		// get a new propertySpec
		return _client.propertySpec([{
      all: false,
      type: 'VirtualMachine',
      properties: ['name', 'guest']
    }]).then(function(specSet) {

			// set the method and params
			var method  = 'RetrievePropertiesEx';
			var params  = {
				_this: _client._sc.propertyCollector,
				specSet: specSet
			};

			// retrieve the properties using the appropriate function
			if (util.versionCmp(_client.apiVersion, '4.1') === 'lt') {
				method = 'RetrieveProperties';
			}
			else {
				params.options = _.pick(options, ['maxObjects']);
			}

			// retrieve the results
			return _client.method(method, params).then(function(result) {
				return new Promise(function(resolve, reject) {
          var vms = _.map(result, function(vm) {
            return {
              id: vm.obj.$value,
              name: _.find(vm.propSet, function(prop) {
                return prop.name === 'name';
              }).val.$value,
              guest: _.find(vm.propSet, function(prop) {
                return prop.name === 'guest';
              }).val
            };
          });
          resolve(vms);
        });
			});
		}).catch(function(err) {
      return new Promise(function(resolve, reject) {
        reject(err);
      });
    });
	};
};
