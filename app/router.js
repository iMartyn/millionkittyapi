import Ember from 'ember';

var Router = Ember.Router.extend({
  location: MillionkittyapiENV.locationType
});

Router.map(function() {
    this.route('block', {path: '/block/:block_id'});
});

export default Router;
