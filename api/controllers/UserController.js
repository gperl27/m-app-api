var _ = require('@sailshq/lodash');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var formatUsageError = require('sails/lib/hooks/blueprints/formatUsageError');
/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    findWithSelectedDate: function (req, res) {
        console.log(req.params.id, req.body.date);

        User.findOne({ id: req.params.id })
            .populate('events')
            .populate('todolists', {
                where: {
                    date: req.body.date
                }
            })
            .exec(function found(err, matchingRecord) {
                if (err) {
                    // If this is a usage error coming back from Waterline,
                    // (e.g. a bad criteria), then respond w/ a 400 status code.
                    // Otherwise, it's something unexpected, so use 500.
                    switch (err.name) {
                        case 'UsageError': return res.badRequest(formatUsageError(err, req));
                        default: return res.serverError(err);
                    }
                }//-•

                if (!matchingRecord) {
                    req._sails.log.verbose('In `findOne` blueprint action: No record found with the specified id (`' + queryOptions.criteria.where[User.primaryKey] + '`).');
                    return res.notFound();
                }

                if (req._sails.hooks.pubsub && req.isSocket) {
                    User.subscribe(req, [matchingRecord[User.primaryKey]]);
                    actionUtil.subscribeDeep(req, matchingRecord);
                }

                return res.ok(matchingRecord);

            });//</ .find().exec() >

    }
};

