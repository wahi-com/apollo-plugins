"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatadogNestPlugin = void 0;
const tslib_1 = require("tslib");
const express_http_context_1 = tslib_1.__importDefault(require("express-http-context"));
const hot_shots_1 = require("hot-shots");
const winston_1 = tslib_1.__importDefault(require("winston"));
const apollo_1 = require("@nestjs/apollo");
const getExtractedInformationFromContext_utils_1 = require("../utils/getExtractedInformationFromContext.utils");
const statsD = new hot_shots_1.StatsD({
    globalTags: { env: process.env.APP_ENVIRONMENT ?? 'unknown' },
});
const SLOW_THRESHOLD = 1000;
const DatadogPlugin = {
    async requestDidStart() {
        return {
            async executionDidStart(requestContext) {
                express_http_context_1.default.set('requestStartTimestamp', Date.now());
                const { datadogPrefix, tags } = (0, getExtractedInformationFromContext_utils_1.getExtractedInformationFromContext)(requestContext);
                statsD.increment(`${datadogPrefix}requests.count`, 1, 1, tags);
            },
            async didEncounterErrors(requestContext) {
                const { datadogPrefix, tags } = (0, getExtractedInformationFromContext_utils_1.getExtractedInformationFromContext)(requestContext);
                statsD.increment(`${datadogPrefix}errors.count`, 1, 1, tags);
            },
            async willSendResponse(requestContext) {
                const requestDuration = Date.now() - express_http_context_1.default.get('requestStartTimestamp');
                const { datadogPrefix, tags, variables, userAgent, operationName, operationType } = (0, getExtractedInformationFromContext_utils_1.getExtractedInformationFromContext)(requestContext);
                statsD.timing(`${datadogPrefix}requests.duration`, requestDuration, tags);
                if (requestDuration >= SLOW_THRESHOLD) {
                    winston_1.default.child({ loggerName: 'slowGraphQL' }).info('GraphQL %s %s took %s ms. Variables %j , user-agent %s', operationType, operationName, requestDuration, variables, userAgent);
                }
            },
        };
    },
};
let DatadogNestPlugin = class DatadogNestPlugin {
    async requestDidStart(requestContext) {
        const listener = await DatadogPlugin.requestDidStart(requestContext);
        return listener;
    }
};
DatadogNestPlugin = tslib_1.__decorate([
    (0, apollo_1.Plugin)()
], DatadogNestPlugin);
exports.DatadogNestPlugin = DatadogNestPlugin;
exports.default = DatadogPlugin;
//# sourceMappingURL=datadog.plugin.js.map