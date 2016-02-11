/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	// global variables
	var util      = env.util;
	var _self     = env._self;

	/**
	 * Rename entity
	 * 
	 * @param {Object} args - Arguments hash
	 * @param {string} args.type - Object type
	 * @param {string} args.id - Object ID
	 * @param {string} args.name - New name
	 * @param {boolean} [args.async=false] - Whether to monitor the task created by the destroy method
	 * @param {number} [args.delay=250] - Delay in milliseconds between task status polling
	 * @param {number} [args.timeout=0] - Time in milliseconds to allow the monitor to run without a success or error result. If 0 no timeout will occur
	 */
	return function(args) {
		
		var method = 'Rename_Task';
		
		// check for required arguments
		if (!args || !args.type || !args.id) {
			return util.newError({
				code: 400,
				message: 'Required parameters were not provided'
			});
		}
		
		// verify that the method can be executed
		else if (!util.hasMethod(_self.apiVersion, args.type, method)) {
			return util.newError({
				code: 405,
				message: 'The method ' + method + ' is not allowed on this object type'
			});
		}
		
		// execute the method
		return _self.method(method, {
			_this: util.moRef(args.type, args.id),
			newName: args.name
		})
		.then(function(result) {
			
			// determine if the task should be monitored or reference returned
			return _self.monitor.taskAsync(args, result);
		});
	};
};