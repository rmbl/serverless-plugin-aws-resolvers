'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/**
 * @param key the name of the ElastiCache cluster to resolve
 * @param awsParameters parameters to pass to the AWS.ElastiCache constructor
 * @returns {Promise<AWS.ElastiCache.CacheCluster>}
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ElastiCache.html#describeCacheClusters-property
 */
let getECSValue = (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* (key, awsParameters) {
    _winston2.default.debug(`Resolving ElastiCache cluster with name ${key}`);
    const ecs = new _awsSdk2.default.ElastiCache((0, _assign2.default)({}, awsParameters, { apiVersion: '2015-02-02' }));
    const result = yield ecs.describeCacheClusters({ CacheClusterId: key, ShowCacheNodeInfo: true }).promise();
    if (!result || !result.CacheClusters.length) {
      throw new Error(`Could not find ElastiCache cluster with name ${key}`);
    }

    return result.CacheClusters[0];
  });

  return function getECSValue(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @param key the name of the ElasticSearch cluster to resolve
 * @param awsParameters parameters to pass to the AWS.ES constructor
 * @returns {Promise<AWS.ES.ElasticsearchDomainStatus>}
 * @see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ES.html#describeElasticsearchDomain-property
 */


let getESSValue = (() => {
  var _ref2 = (0, _asyncToGenerator3.default)(function* (key, awsParameters) {
    _winston2.default.debug(`Resolving ElasticSearch cluster with name ${key}`);
    const ess = new _awsSdk2.default.ES((0, _assign2.default)({}, awsParameters, { apiVersion: '2015-01-01' }));
    const result = yield ess.describeElasticsearchDomain({ DomainName: key }).promise();
    if (!result || !result.DomainStatus) {
      throw new Error(`Could not find ElasticSearch cluster with name ${key}`);
    }

    return result.DomainStatus;
  });

  return function getESSValue(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * @param key the name of the security group to resolve
 * @param awsParameters parameters to pass to the AWS.EC2 constructor
 * @returns {Promise<AWS.EC2.SecurityGroup>}
 * @see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeSecurityGroups-property
 */


let getEC2Value = (() => {
  var _ref3 = (0, _asyncToGenerator3.default)(function* (key, awsParameters) {
    const ec2 = new _awsSdk2.default.EC2((0, _assign2.default)({}, awsParameters, { apiVersion: '2015-01-01' }));

    const values = key.split(':');

    if (values[0] === 'vpc') {
      return getVPCValue(values[1], awsParameters);
    } else if (values[0] === 'subnet') {
      return getSubnetValue(values[1], awsParameters);
    } else if (values[0] === 'securityGroup') {
      const groupValues = values[1].split('-');
      const vpc = yield getVPCValue(groupValues[0], awsParameters);
      const result = yield ec2.describeSecurityGroups({
        Filters: [{ Name: 'group-name', Values: [groupValues[1]] }, { Name: 'vpc-id', Values: [vpc.VpcId] }]
      }).promise();

      if (!result || !result.SecurityGroups.length) {
        throw new Error(`Could not find security group with name ${groupValues[1]} in ${vpc.VpcId}`);
      }
      return result.SecurityGroups[0];
    }
    throw new Error(`Unsupported EC2 value. ${values[0]}`);
  });

  return function getEC2Value(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * @param key the name of the VPC to resolve
 * @param awsParameters parameters to pass to the AWS.EC2 constructor
 * @returns {Promise<AWS.EC2.DescribeVpcs>}
 * @see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeVpcs-property
 */


let getVPCValue = (() => {
  var _ref4 = (0, _asyncToGenerator3.default)(function* (key, awsParameters) {
    _winston2.default.debug(`Resolving vpc with name ${key}`);
    const ec2 = new _awsSdk2.default.EC2((0, _assign2.default)({}, awsParameters, { apiVersion: '2015-01-01' }));
    const result = yield ec2.describeVpcs({ Filters: [{ Name: 'tag-value', Values: [key] }] }).promise();

    if (!result || !result.Vpcs.length) {
      throw new Error(`Could not find vpc with name ${key}`);
    }

    return result.Vpcs[0];
  });

  return function getVPCValue(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
})();

/**
 * @param key the name of the subnet to resolve
 * @param awsParameters parameters to pass to the AWS.EC2 constructor
 * @returns {Promise<AWS.EC2.DescribeSubnets>}
 * @see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeSubnets-property
 */


let getSubnetValue = (() => {
  var _ref5 = (0, _asyncToGenerator3.default)(function* (key, awsParameters) {
    _winston2.default.debug(`Resolving subnet with name ${key}`);
    const ec2 = new _awsSdk2.default.EC2((0, _assign2.default)({}, awsParameters, { apiVersion: '2015-01-01' }));
    const result = yield ec2.describeSubnets({ Filters: [{ Name: 'tag-value', Values: [key] }] }).promise();

    if (!result || !result.Subnets.length) {
      throw new Error(`Could not find subnet with name ${key}`);
    }

    return result.Subnets[0];
  });

  return function getSubnetValue(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
})();

/**
 * @param key the name of the Kinesis stream to resolve
 * @param awsParameters parameters to pass to the AWS.Kinesis constructor
 * @returns {Promise<AWS.Kinesis.StreamDescription>}
 * @see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Kinesis.html#describeStream-property
 */


let getKinesisValue = (() => {
  var _ref6 = (0, _asyncToGenerator3.default)(function* (key, awsParameters) {
    _winston2.default.debug(`Resolving Kinesis stream with name ${key}`);
    const kinesis = new _awsSdk2.default.Kinesis((0, _assign2.default)({}, awsParameters, { apiVersion: '2013-12-02' }));
    const result = yield kinesis.describeStream({ StreamName: key }).promise();
    return result.StreamDescription;
  });

  return function getKinesisValue(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
})();

/**
 * @param key the name of the DynamoDb table to resolve
 * @param awsParameters parameters to pass to the AWS.DynamoDB constructor
 * @returns {Promise<AWS.DynamoDB.Table>}
 * @see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeTable-property
 */


let getDynamoDbValue = (() => {
  var _ref7 = (0, _asyncToGenerator3.default)(function* (key, awsParameters) {
    _winston2.default.debug(`Resolving DynamoDB stream with name ${key}`);
    const dynamodb = new _awsSdk2.default.DynamoDB((0, _assign2.default)({}, awsParameters, { apiVersion: '2012-08-10' }));
    const result = yield dynamodb.describeTable({ TableName: key }).promise();
    return result.Table;
  });

  return function getDynamoDbValue(_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
})();

/**
 * @param key the name of the RDS instance to resolve
 * @param awsParameters parameters to pass to the AWS.RDS constructor
 * @returns {Promise.<AWS.RDS.DBInstance>}
 * @see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/RDS.html#describeDBInstances-property
 */


let getRDSValue = (() => {
  var _ref8 = (0, _asyncToGenerator3.default)(function* (key, awsParameters) {
    _winston2.default.debug(`Resolving RDS database with name ${key}`);
    const rds = new _awsSdk2.default.RDS((0, _assign2.default)({}, awsParameters, { apiVersion: '2014-10-31' }));
    const result = yield rds.describeDBInstances({ DBInstanceIdentifier: key }).promise();
    if (!result) {
      throw new Error(`Could not find any databases with identifier ${key}`);
    }
    // Parse out the instances
    const instances = result.DBInstances;

    if (instances.length !== 1) {
      throw new Error(`Expected exactly one DB instance for key ${key}. Got ${(0, _keys2.default)(instances)}`);
    }

    return instances[0];
  });

  return function getRDSValue(_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
})();

/**
 * @param variableString the variable to resolve
 * @param region the AWS region to use
 * @param strictMode throw errors if aws can't find value or allow overwrite
 * @returns {Promise.<String>} a promise for the resolved variable
 * @example const myResolvedVariable = await getValueFromAws('aws:kinesis:my-stream:StreamARN', 'us-east-1')
 */
let getValueFromAws = (() => {
  var _ref9 = (0, _asyncToGenerator3.default)(function* (variableString, region, strictMode) {
    // The format is aws:${service}:${key}:${request} or aws:${service}:${subService}:${key}:${request}.
    // eg.: aws:kinesis:stream-name:StreamARN
    // Validate the input format
    if (!variableString.match(DEFAULT_AWS_PATTERN) && !variableString.match(SUB_SERVICE_AWS_PATTERN)) {
      throw new Error(`Invalid AWS format for variable ${variableString}`);
    }

    const rest = variableString.split(`${AWS_PREFIX}:`)[1];
    for (const service of (0, _keys2.default)(AWS_HANDLERS)) {
      if (rest.startsWith(`${service}:`)) {
        const commonParameters = {};
        if (region) {
          commonParameters.region = region;
        }

        // Parse out the key and request
        let subKey = rest.split(`${service}:`)[1];

        let request = '';
        let key = '';
        // We are dealing with a subService instead of a standard service
        if (variableString.match(SUB_SERVICE_AWS_PATTERN)) {
          request = subKey.split(':')[2];
          key = subKey.split(':').slice(0, 2).join(':');
        } else {
          request = subKey.split(':')[1];
          key = subKey.split(':')[0];
        }

        let description;
        try {
          description = yield AWS_HANDLERS[service](key, commonParameters); // eslint-disable-line no-await-in-loop, max-len
        } catch (e) {
          if (strictMode) {
            throw e;
          }

          _winston2.default.debug(`Error while resolving ${variableString}: ${e.message}`);
          return null;
        }

        // Validate that the desired property exists
        if (!_lodash2.default.has(description, request)) {
          throw new Error(`Error resolving ${variableString}. Key '${request}' not found. Candidates are ${(0, _keys2.default)(description)}`);
        }

        return _lodash2.default.get(description, request);
      }
    }

    throw new TypeError(`Cannot parse AWS type from ${rest}`);
  });

  return function getValueFromAws(_x17, _x18, _x19) {
    return _ref9.apply(this, arguments);
  };
})();

/**
 * A plugin for the serverless framework that allows resolution of deployed AWS services into variable names
 */


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const AWS_PREFIX = 'aws';

const AWS_HANDLERS = {
  ecs: getECSValue,
  ess: getESSValue,
  kinesis: getKinesisValue,
  dynamodb: getDynamoDbValue,
  rds: getRDSValue,
  ec2: getEC2Value
};

const DEFAULT_AWS_PATTERN = /^aws:\w+:[\w-.]+:[\w.\[\]]+$/;
const SUB_SERVICE_AWS_PATTERN = /^aws:\w+:\w+:[\w-.]+:[\w.\[\]]+$/;class ServerlessAWSResolvers {
  constructor(serverless, options) {
    this.provider = 'aws';

    this.commands = {
      resolveAwsKey: {
        usage: `Resolves an AWS key (Supported prefixes: ${(0, _keys2.default)(AWS_HANDLERS)})`,
        lifecycleEvents: ['run'],
        options: {
          key: {
            usage: 'The key to resolve',
            shortcut: 'k'
          }
        }
      }
    };

    this.hooks = {
      'resolveAwsKey:run': () => getValueFromAws(options.key, serverless.service.provider.region).then(_stringify2.default).then(_lodash2.default.bind(serverless.cli.log, serverless.cli))
    };

    const delegate = _lodash2.default.bind(serverless.variables.getValueFromSource, serverless.variables);
    serverless.variables.getValueFromSource = function getValueFromSource(variableString) {
      // eslint-disable-line no-param-reassign, max-len
      const region = serverless.service.provider.region;
      const strictMode = _lodash2.default.get(serverless.service.custom, 'awsResolvers.strict', true);
      if (!region) {
        throw new Error('Cannot hydrate AWS variables without a region');
      }
      if (variableString.startsWith(`${AWS_PREFIX}:`)) {
        return getValueFromAws(variableString, region, strictMode);
      }

      return delegate(variableString);
    };
  }
}

module.exports = ServerlessAWSResolvers;
