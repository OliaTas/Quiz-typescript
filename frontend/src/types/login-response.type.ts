export type LoginResponseType = {
    error: false,
    accessToken?: string,
    refreshToken?: string,
    fullName?: string,
    userId?: number,
    message: string
}