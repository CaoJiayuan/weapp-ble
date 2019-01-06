
interface MsgResult {
    code: int,
    errMsg: string
}

interface ResultPromise extends Promise<MsgResult> {

}
interface Service {
    id: string
    deviceId : string
}

interface Device {
    id: string
    name: string
    connect() : ResultPromise
    getServices(): Promise<Service[]>
}

export interface Manager {
    open(onWaitingDevice ?: () => void, onReopen ?: () => void) : ResultPromise
    close() : ResultPromise
    discover(delay ?: int): ResultPromise
    getDevices(): Promise<Device[]>
}