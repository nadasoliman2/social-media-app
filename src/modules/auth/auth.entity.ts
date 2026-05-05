export interface ILoginResponse {
    email: string,
    password: string
}
export interface ISignupResponse extends ILoginResponse{

username:string
}

export interface IConfirmEmailResponse {
    email: string,
    otp: string
}
export interface IResendConfirmEmailResponse {
    email: string
}
export interface IResetForgotPasswordResponse {
    email: string,
    password: string,
    confirm_password: string,
    otp: string
}