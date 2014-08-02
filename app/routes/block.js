import Ember from 'ember';
import DS from 'ember';

export default Ember.Route.extend({
    model: function() {
        this.store.push('block',{id:1,url:'www.google.com',paid:'99'})
        this.store.push('block',{id:2,url:'www.bbc.co.uk',paid:'50'})
        return this.store.all('block');
    }
});
