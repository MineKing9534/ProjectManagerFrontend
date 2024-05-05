export type ErrorResponseType =
	"UNKNOWN" |
	"TIMEOUT" |

	"INVALID_REQUEST" |

	"MISSING_TOKEN" |
	"INVALID_TOKEN" |
	"TOKEN_EXPIRED" |
	"MISSING_ACCESS"

export interface ErrorResponse {
	status: number,
	type: ErrorResponseType
}