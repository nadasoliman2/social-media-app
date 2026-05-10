import { ApplicationException } from "./application.exception.js";
import { GraphQLError } from "graphql";

export const MapGraphQLError = (error: ApplicationException) => {
    // التصحيح هنا: استخدمنا () بدل {} بعد كلمة GraphQLError
    throw new GraphQLError(
        error.message || 'internalServerError',
        {
            extensions: {
                statusCode: error.statusCode || 500,
                cause: error.cause
            }
        }
    );
}

export class BadRequestException extends ApplicationException {
    constructor(message: string = "BadRequest", cause?: unknown) {
        super(message, 400, cause);
    }
}

export class ConfilctException extends ApplicationException {
    constructor(message: string = "Conflict", cause?: unknown) {
        super(message, 409, cause);
    }
}

export class NotFoundException extends ApplicationException {
    constructor(message: string = "Not Found", cause?: unknown) {
        super(message, 404, cause);
    }
}

export class UnauthorizedException extends ApplicationException {
    constructor(message: string = "Unauthorized", cause?: unknown) {
        super(message, 401, cause);
    }
}

export class ForbiddenException extends ApplicationException {
    constructor(message: string = "Forbidden", cause?: unknown) {
        super(message, 403, cause);
    }
}