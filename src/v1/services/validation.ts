export function validateReqParam(param: any): boolean{
    for(const i in param){
        if(!param[i]){
            return false
        }
    }

    return true
}

export function validateInt(param: string): boolean {
    const pattern = new RegExp(/^[0-9]+$/)
    return pattern.test(param)
}

export function validateDate(param: string): boolean {
    const pattern = new RegExp(/^[0-9]{8}$/)
    return pattern.test(param)
}