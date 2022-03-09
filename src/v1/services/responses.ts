export class ServerMessage {
    message: string

    constructor(message: string) {
        this.message = message
    }
}

export const BadRequestError = new ServerMessage(
    'A parameter or request body was formatted improperly'
)
export const UnauthorizedError = new ServerMessage(
    'You are not authorized to use this interface'
)
export const InternalServerError = new ServerMessage(
    'An internal server error occurred. Please try again later.'
)

export const ForbiddenError = new ServerMessage(
    'You are not authorized to perform this action'
)
