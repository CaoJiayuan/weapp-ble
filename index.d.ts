
import BaseBuffer from './buffer'

interface MsgResult {
    code: int;
    errMsg: string;
}

interface ResultPromise extends Promise<MsgResult> {

}
interface Service {
    id: string;
    deviceId : string;
    getCharateristics(): Promise<Charateristic[]>
}

interface Charateristic {
    uuid: string;
    serviceId: string;
    properties: {
        read: boolean,
        write: boolean,
        indicate: boolean,
        notify: boolean
    };
}

interface CharValue {
    value : ArrayBuffer;
    charateristicId: string
}

interface Device {
    id: string;
    name: string;
    connect() : ResultPromise;
    getServices(): Promise<Service[]>;
    getBandServices(): Promise<Service[]>;
    getWriteCharateristic(): Promise<Charateristic>;
    getNotifyCharateristic(): Promise<Charateristic>;
    notifying(): ResultPromise;
    notifyingFrom(char : Charateristic): ResultPromise;
    characteristicChanging(cb : (res: CharValue) => void): void;
    write(buffer : ArrayBuffer): ResultPromise;
    writeTo(char: Charateristic, buffer : ArrayBuffer): ResultPromise;
    readFrom(char: Charateristic): Promise<CharValue>
}

export interface Manager {
    open(onWaitingDevice ?: () => void, onReopen ?: () => void) : ResultPromise;
    close() : ResultPromise;
    discover(delay ?: int): ResultPromise;
    getDevices(): Promise<Device[]>;
}

export interface Buffer extends BaseBuffer {

}

export function ab2hex(buffer: ArrayBuffer) : string