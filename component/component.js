/*!!!!!!!!!!!Do not change anything between here (the DRIVERNAME placeholder will be automatically replaced at buildtime)!!!!!!!!!!!*/
import NodeDriver from 'shared/mixins/node-driver';

// import uiConstants from 'ui/utils/constants'

// do not remove LAYOUT, it is replaced at build time with a base64 representation of the template of the hbs template
// we do this to avoid converting template to a js file that returns a string and the cors issues that would come along with that
const LAYOUT;
/*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/


/*!!!!!!!!!!!GLOBAL CONST START!!!!!!!!!!!*/
// EMBER API Access - if you need access to any of the Ember API's add them here in the same manner rather then import them via modules, since the dependencies exist in rancher we dont want to expor the modules in the amd def
const computed = Ember.computed;
const get = Ember.get;
const set = Ember.set;
const alias = Ember.computed.alias;
const service = Ember.inject.service;

/*!!!!!!!!!!!GLOBAL CONST END!!!!!!!!!!!*/



/*!!!!!!!!!!!DO NOT CHANGE START!!!!!!!!!!!*/
export default Ember.Component.extend(NodeDriver, {
  driverName: '%%DRIVERNAME%%',
  needAPIToken: true,
  config: alias('model.%%DRIVERNAME%%Config'),
  app: service(),

  init() {
    // This does on the fly template compiling, if you mess with this :cry:
    const decodedLayout = window.atob(LAYOUT);
    const template = Ember.HTMLBars.compile(decodedLayout, {
      moduleName: 'nodes/components/driver-%%DRIVERNAME%%/template'
    });
    set(this, 'layout', template);

    this._super(...arguments);

  },
  /*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/

  // Write your component here, starting with setting 'model' to a machine with your config populated
  bootstrap: function () {
    // bootstrap is called by rancher ui on 'init', you're better off doing your setup here rather then the init function to ensure everything is setup correctly
    let config = get(this, 'globalStore').createRecord({
      type: '%%DRIVERNAME%%Config',
      serverFlavor: 'ar-2-1-15',
      region: 'nl-ams-su1', // Serverius/ Amsterdam-Netherlands
      image: ''
    });

    set(this, 'model.%%DRIVERNAME%%Config', config);
  },

  // Add custom validation beyond what can be done from the config API schema
  validate() {
    // Get generic API validation errors
    this._super();


    var errors = get(this, 'errors') || [];
    if (!get(this, 'model.name')) {
      errors.push('Name is required');
    }

    if (!this.get('model.%%DRIVERNAME%%Config.serverFlavor')) {
      errors.push('%%DRIVERNAME%% Region is required');
    }

    if (!this.get('model.%%DRIVERNAME%%Config.region')) {
      errors.push('%%DRIVERNAME%% Region is required');
    }

    if (!this.get('model.%%DRIVERNAME%%Config.image')) {
      errors.push('%%DRIVERNAME%% Image is required');
    }
    

    // Set the array of errors for display,
    // and return true if saving should continue.
    if (get(errors, 'length')) {
      set(this, 'errors', errors);
      return false;
    } else {
      set(this, 'errors', null);
      return true;
    }
  },
  actions: {
    getRegions() {
      this.set('gettingRegions', true);
      let that = this;
      Promise.all([this.apiRequest('/regions')]).then(function (responses) {
        that.setProperties({
          errors: [],
          needAPIToken: false,
          gettingRegions: false,
          regions: responses[0].data,
        });
      }).catch(function (err) {
        err.then(function (msg) {
          that.setProperties({
            errors: ['Error received from ArvanCloud: ' + msg.error.message],
            gettingRegions: false
          })
        })
      })
    },

    getData() {
      this.set('gettingData', true);
      let that = this;
      Promise.all([this.apiRequest('/regions/' + this.get('model.%%DRIVERNAME%%Config.region') + '/options')]).then(function (responses) {
        let images = [];
        let flavors = [];

        responses[0].data.distributions.forEach(function(dist) {
          dist.images.forEach(function(image) {
            images.push({id: image.id, distribution_name: image.distribution_name, name: image.name})
          })
        })

        responses[0].data.sizes.forEach(function(flavor) {
          flavors.push({id: flavor.id, name: flavor.name})
        })

        that.setProperties({
          errors: [],
          needAPIToken: false,
          gettingData: false,
          images: images,
          flavors: flavors,
        });
      }).catch(function (err) {
        err.then(function (msg) {
          that.setProperties({
            errors: ['Error received from ArvanCloud: ' + msg.error.message],
            gettingData: false
          })
        })
      })
    },
  },
  apiRequest(path) {
    return fetch('https://napi.arvancloud.com/ecc/v1' + path, {
      headers: {
        'authorization': 'Apikey ' + this.get('model.%%DRIVERNAME%%Config.apiToken'),
      },
    }).then(res => res.ok ? res.json() : Promise.reject(res.json()));
  }
});