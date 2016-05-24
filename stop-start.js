'use strict';
console.log('Loading function');
var AWS = require('aws-sdk');
AWS.config.region = 'ap-southeast-2';
var credentials = new AWS.SharedIniFileCredentials({profile: 'm.kempster'});
AWS.config.credentials = credentials;

var autoscaling = new AWS.AutoScaling(); 
var ec2 = new AWS.EC2();
var stopStart = 'start';

const ZERO = 0;
const ONE = 1;
const TWO = 2;

// Keeps track of all instances in ASGs
var asgInstances = [];

// Launch or terminate the ASG instances by altering the group size
autoscaling.describeAutoScalingGroups({}, function(err, data) {
  if (err) {
    console.log(err, err.stack);
  } else {
    console.log(data.AutoScalingGroups[0].Instances);
    if (stopStart === 'stop') {
      data.AutoScalingGroups.forEach(downsizeGroupSize);
    } else if (stopStart === 'start') {
      data.AutoScalingGroups.forEach(upsizeGroupSize);
    } else {
      console.log('Error: please choose either start or stop as the action to perform');
    }
  }
});

// Start or stop any standalone instances not covered by the ASGs
ec2.describeInstances({}, function(err, data) {
  if (err) {
    console.log(err, err.stack);
  } else {
    console.log(data);
    data.Reservations.forEach(list);

    function list(res) {
      console.log(res.Instances);
    }
  }
});

function downsizeGroupSize(group) {
  var updateParams = {
    AutoScalingGroupName: group.AutoScalingGroupName,
    MaxSize: ZERO,
    MinSize: ZERO
  }
  recordAsgInstances(group);
  autoscaling.updateAutoScalingGroup(updateParams, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      console.log(data);
      console.log(asgInstances);
    }
  });
}

function upsizeGroupSize(group) {
  var updateParams = {
    AutoScalingGroupName: group.AutoScalingGroupName,
    MaxSize: TWO,
    MinSize: TWO
  }
  recordAsgInstances(group);
  autoscaling.updateAutoScalingGroup(updateParams, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      console.log(data);
      console.log(asgInstances);
    }
  });
}

// Stash the ASG instance IDs for later use
function recordAsgInstances(group) {
  for (var i = 0; i < group.Instances.length; i++) {
    asgInstances.push(group.Instances[i].InstanceId);
  }
}


































