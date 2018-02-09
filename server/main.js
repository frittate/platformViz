import { Meteor } from 'meteor/meteor';
import {Mongo} from 'meteor/mongo'
import {Configuration} from '../imports/api/configuration';

Meteor.startup(() => {

});

Meteor.methods({
  "clearDB": function(){
    Configuration.remove({});
    console.log(Configuration.find().fetch());
  },
});
